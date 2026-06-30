import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { FaUserCircle, FaAward, FaSignOutAlt, FaTasks, FaCheckCircle, FaSpinner } from 'react-icons/fa';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [userIssues, setUserIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUserData() {
      if (!currentUser) return;
      try {
        setLoading(true);
        // 1. Fetch user profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setProfileData(userDocSnap.data());
        } else {
          // Fallback structure
          setProfileData({
            displayName: currentUser.email.split('@')[0],
            points: 100,
            rank: 'Bronze Citizen',
          });
        }

        // 2. Fetch issues reported by this user
        const issuesQuery = query(
          collection(db, 'issues'),
          where('creatorUid', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(issuesQuery);
        const issues = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserIssues(issues);
      } catch (err) {
        console.error("Error fetching profile details:", err);
        setError("Could not load profile statistics.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [currentUser]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError("Failed to sign out.");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FaSpinner className="animate-spin text-4xl text-brand-primary mb-4" />
        <p className="text-brand-muted text-sm">Loading your profile...</p>
      </div>
    );
  }

  const resolvedCount = userIssues.filter(i => i.status === 'resolved').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="text-slate-300 text-6xl flex-shrink-0">
            <FaUserCircle className="text-brand-primary/80" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brand-dark">{profileData?.displayName || 'User'}</h2>
            <p className="text-brand-muted text-sm">{currentUser?.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-brand-primary-dark border border-emerald-100">
                <FaAward /> {profileData?.rank || 'Bronze Citizen'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-brand-dark border border-slate-200">
                Points: {profileData?.points || 0}
              </span>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          className="self-start sm:self-center border-slate-200 hover:bg-rose-50 hover:border-rose-100 hover:text-brand-danger gap-1.5 text-sm"
        >
          <FaSignOutAlt /> Sign Out
        </Button>
      </div>

      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-brand-primary-dark flex items-center justify-center text-xl">
            <FaTasks />
          </div>
          <div>
            <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">Reported Issues</p>
            <p className="text-2xl font-bold text-brand-dark mt-0.5">{userIssues.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl">
            <FaCheckCircle />
          </div>
          <div>
            <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">Resolved Issues</p>
            <p className="text-2xl font-bold text-brand-dark mt-0.5">{resolvedCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-brand-warning flex items-center justify-center text-xl">
            <FaAward />
          </div>
          <div>
            <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">Reputation Points</p>
            <p className="text-2xl font-bold text-brand-dark mt-0.5">{profileData?.points || 0}</p>
          </div>
        </div>
      </div>

      {/* Issue History Table / List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-brand-dark">My Reports</h3>
          <p className="text-xs text-brand-muted mt-1">Review the status of issues you have submitted.</p>
        </div>

        {userIssues.length === 0 ? (
          <div className="p-12 text-center text-brand-muted">
            <p className="font-medium mb-1">No reports submitted yet.</p>
            <p className="text-xs">Any community issues you report will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userIssues.map((issue) => (
              <div key={issue.id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-brand-dark">{issue.title}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      issue.severity === 'Critical' || issue.severity === 'High'
                        ? 'bg-rose-50 text-brand-danger'
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {issue.severity || 'Medium'}
                    </span>
                  </div>
                  <p className="text-sm text-brand-muted line-clamp-1">{issue.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Reported on {new Date(issue.createdAt).toLocaleDateString()} &bull; {issue.category}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    issue.status === 'resolved' 
                      ? 'bg-teal-50 text-teal-700' 
                      : issue.status === 'in-progress' 
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {issue.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

