import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { createIssue } from '../services/issueService';
import { analyzeIssueImage } from '../services/gemini';
import { doc, setDoc, getDoc, increment } from 'firebase/firestore';
import Button from '../components/common/Button';
import { FaCamera, FaMapMarkerAlt, FaMagic, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';


const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

async function uploadImageToImgBB(file) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    { method: 'POST', body: formData }
  );
  const data = await response.json();
  if (!data.success) throw new Error('ImgBB upload failed: ' + data.error?.message);
  return data.data.url; // permanent direct image URL
}

export default function ReportIssue() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pothole / Road Damage');
  const [severity, setSeverity] = useState('Medium');
  
  // Image & Geolocation states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  
  // Loading & Error states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, fetching, success, error
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submittedIssue, setSubmittedIssue] = useState(null); // holds confirmed issue for success screen


  // Fetch location on load
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = () => {
    setLocationStatus('fetching');
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationStatus('success');
      },
      (err) => {
        console.error("Location error:", err);
        setLocationStatus('error');
        setError('Location access denied. Using fallback coordinates.');
        // Fallback to center coordinates
        setCoords({
          latitude: 37.7749,
          longitude: -122.4194
        });
      }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      triggerAIAnalysis(file);
    }
  };

  const triggerAIAnalysis = (file) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1];
      const mimeType = file.type;

      try {
        setIsAnalyzing(true);
        setError('');
        setSuccessMsg('');
        
        const analysis = await analyzeIssueImage(base64String, mimeType);
        
        // Auto-fill fields if returned from Gemini
        if (analysis) {
          setTitle(analysis.title || '');
          setDescription(analysis.description || '');
          setCategory(analysis.category || 'Pothole / Road Damage');
          setSeverity(analysis.severity || 'Medium');
          setSuccessMsg('Gemini AI has successfully analyzed and filled your report!');
        }
      } catch (err) {
        console.error("Gemini failed to analyze image:", err);
        setError("Gemini AI was unable to classify the image. You can still complete the report manually.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description) {
      return setError('Please provide a title and description.');
    }

    // Location is optional — we'll save null if not captured

    try {
      setIsSubmitting(true);

      // 1. Get or default display name
      let displayName = currentUser.displayName || currentUser.email.split('@')[0];
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().displayName) {
          displayName = userDoc.data().displayName;
        }
      } catch (_) { /* non-critical, continue */ }

      // 2. Upload image (optional — skip if no image selected)
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile);
      }

      // 3. Save issue document to Firestore
      await createIssue({
        title,
        description,
        category,
        severity,
        imageUrl,
        latitude: coords.latitude,
        longitude: coords.longitude,
        creatorUid: currentUser.uid,
        creatorName: displayName,
      });

      // 4. Award +50 XP — use setDoc merge so it works even if user doc is missing
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { points: increment(50) },
        { merge: true }
      );

      // 5. Show confirmation screen instead of navigating immediately
      setSubmittedIssue({ title, description, category, severity, imageUrl, coords });

    } catch (err) {
      console.error('Submission failed:', err);
      // Show the real Firebase/network error so we can debug
      setError(`Submission failed: ${err.message || 'Unknown error. Check console.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  // ── Confirmation Screen ───────────────────────────────────────────────────
  if (submittedIssue) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Green success header */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Issue Reported!</h2>
            <p className="text-emerald-100 text-sm mt-1">+50 XP awarded to your account</p>
          </div>

          {/* Issue summary */}
          <div className="p-6 space-y-4">
            {submittedIssue.imageUrl && (
              <img
                src={submittedIssue.imageUrl}
                alt={submittedIssue.title}
                className="w-full h-40 object-cover rounded-xl"
              />
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-primary-dark uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {submittedIssue.category}
                </span>
                <span className="text-xs font-bold text-brand-muted uppercase">
                  {submittedIssue.severity} Severity
                </span>
              </div>
              <h3 className="text-lg font-bold text-brand-dark">{submittedIssue.title}</h3>
              <p className="text-sm text-brand-muted leading-relaxed">{submittedIssue.description}</p>
            </div>

            {submittedIssue.coords.latitude && submittedIssue.coords.longitude && (
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 text-xs text-slate-500 font-medium">
                <FaMapMarkerAlt className="text-brand-primary flex-shrink-0" />
                <span>
                  Pinned at {submittedIssue.coords.latitude?.toFixed(5)}, {submittedIssue.coords.longitude?.toFixed(5)}
                </span>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/map')}
              >
                <FaMapMarkerAlt className="mr-2" /> View on Map
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">Report a New Issue</h1>
        <p className="text-brand-muted text-sm mt-1">
          Upload an image, and Fixora's AI will automatically categorize and describe the problem.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-brand-danger text-sm p-4 rounded-xl flex items-start gap-2.5 font-medium">
          <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-brand-primary-dark text-sm p-4 rounded-xl flex items-start gap-2.5 font-medium">
          <FaMagic className="mt-0.5 flex-shrink-0 text-brand-primary" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        {/* Image Upload Area */}
        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-2">Upload Photo <span className="text-brand-muted font-normal">(optional — AI will auto-fill fields)</span></label>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition cursor-pointer relative min-h-[220px]">
            {imagePreview ? (
              <div className="w-full relative rounded-xl overflow-hidden max-h-[300px]">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                <label className="absolute bottom-4 right-4 bg-brand-dark/85 hover:bg-brand-dark text-white p-2.5 rounded-full cursor-pointer shadow-md transition text-sm">
                  <FaCamera />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer py-10">
                <FaCamera className="text-slate-400 text-4xl mb-3" />
                <span className="text-sm font-semibold text-brand-dark">Snap or Select Image</span>
                <span className="text-xs text-brand-muted mt-1">Supports PNG, JPG, JPEG</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center space-y-3 z-10">
                <FaMagic className="animate-bounce text-3xl text-brand-primary" />
                <p className="text-sm font-bold text-brand-dark">Gemini AI is scanning the image...</p>
                <p className="text-xs text-brand-muted">Autofilling titles, severity, and categories.</p>
              </div>
            )}
          </div>
        </div>

        {/* Location Section — optional */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg ${
              locationStatus === 'success' ? 'bg-emerald-100 text-brand-primary-dark' : 'bg-slate-200 text-slate-500'
            }`}>
              <FaMapMarkerAlt />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-dark">
                Report Location <span className="text-brand-muted font-normal">(optional)</span>
              </p>
              <p className="text-xs text-brand-muted mt-0.5">
                {coords.latitude && coords.longitude
                  ? `📍 ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
                  : 'Click "Locate Me" to pin this issue on the map'}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchLocation}
            isLoading={locationStatus === 'fetching'}
            className="text-xs font-bold"
          >
            Locate Me
          </Button>
        </div>


        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">Issue Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-primary-dark focus:ring-1 focus:ring-brand-primary-dark outline-none transition"
            placeholder="e.g., Deep Pothole near Central Park"
            required
            disabled={isSubmitting || isAnalyzing}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-primary-dark focus:ring-1 focus:ring-brand-primary-dark outline-none transition"
            rows={4}
            placeholder="Describe the issue in detail. What needs to be fixed?"
            required
            disabled={isSubmitting || isAnalyzing}
          />
        </div>

        {/* Category & Severity Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-primary-dark focus:ring-1 focus:ring-brand-primary-dark outline-none bg-white transition"
              disabled={isSubmitting || isAnalyzing}
            >
              <option value="Pothole / Road Damage">Pothole / Road Damage</option>
              <option value="Streetlight Out">Streetlight Out</option>
              <option value="Graffiti / Vandalism">Graffiti / Vandalism</option>
              <option value="Trash / Illegal Dumping">Trash / Illegal Dumping</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1">Severity Assessment</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-primary-dark focus:ring-1 focus:ring-brand-primary-dark outline-none bg-white transition"
              disabled={isSubmitting || isAnalyzing}
            >
              <option value="Low">Low (Minor nuisance)</option>
              <option value="Medium">Medium (Needs attention)</option>
              <option value="High">High (Safety risk)</option>
              <option value="Critical">Critical (Immediate danger)</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            isDisabled={isSubmitting || isAnalyzing}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            isDisabled={isAnalyzing}
            rightIcon={<FaInfoCircle />}
          >
            File Report (+50 XP)
          </Button>
        </div>
      </form>
    </div>
  );
}

