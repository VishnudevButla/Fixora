import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { upvoteIssue } from '../services/issueService';
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { 
  FaArrowUp, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUser, 
  FaExclamationCircle, 
  FaFilter, 
  FaPlusCircle, 
  FaSpinner, 
  FaCheckCircle,
  FaEdit
} from 'react-icons/fa';


export default function Dashboard() {
  const { currentUser } = useAuth();
  
  // App states
  const [issues, setIssues] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!currentUser) return;

    // 1. Listen for user points updates
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserPoints(docSnap.data().points || 0);
      }
    });

    // 2. Listen for issues updates
    const issuesQuery = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
    const unsubscribeIssues = onSnapshot(issuesQuery, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setIssues(items);
      setLoading(false);
    }, (err) => {
      console.error("Error listening to issues:", err);
      setError("Failed to stream issues. Check Firebase rules.");
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
      unsubscribeIssues();
    };
  }, [currentUser]);

  // Upvote issue action
  const handleUpvote = async (issueId, currentUpvotes, creatorUid) => {
    try {
      // Prevent upvoting own issues from gaining points, but still allow upvote
      await upvoteIssue(issueId, currentUpvotes);
      
      // Award points to creator (+10 points)
      if (creatorUid) {
        await updateDoc(doc(db, 'users', creatorUid), {
          points: increment(10)
        });
      }
      
      // Award points to verifier (+2 points)
      if (currentUser && currentUser.uid !== creatorUid) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          points: increment(2)
        });
      }
    } catch (err) {
      console.error("Upvoting error:", err);
    }
  };

  // Update issue status (only the creator can do this)
  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await updateDoc(doc(db, 'issues', issueId), { status: newStatus });
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const categoryMatch = selectedCategory === 'All' || issue.category === selectedCategory;
    const statusMatch = selectedStatus === 'All' || issue.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
  const activeIssues = totalIssues - resolvedIssues;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <FaSpinner className="animate-spin text-4xl text-brand-primary mb-4" />
        <p className="text-brand-muted text-sm font-semibold">Streaming neighborhood feeds...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-primary-dark to-brand-primary rounded-3xl p-6 sm:p-8 text-white shadow-md shadow-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Active Neighborhood Dashboard</h1>
          <p className="text-emerald-50 text-sm mt-1 max-w-xl">
            Track reported hazards, vote on community alerts, and play your part in cleaning up our neighborhood!
          </p>
        </div>
        <Link to="/report">
          <Button variant="accent" className="bg-white hover:bg-slate-50 text-brand-primary-dark py-3 px-5 shadow-sm font-bold gap-2">
            <FaPlusCircle /> Report New Issue
          </Button>
        </Link>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-brand-primary-dark flex items-center justify-center text-xl">
            <FaExclamationCircle />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Active Issues</p>
            <p className="text-2xl font-bold text-brand-dark mt-0.5">{activeIssues}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl">
            <FaCheckCircle />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Resolved Issues</p>
            <p className="text-2xl font-bold text-brand-dark mt-0.5">{resolvedIssues}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-brand-warning flex items-center justify-center text-xl">
            <FaArrowUp />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">My Reputation Points</p>
            <p className="text-2xl font-bold text-brand-dark mt-0.5">{userPoints} XP</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-brand-dark font-bold text-sm">
          <FaFilter className="text-slate-400" /> Filters
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Category Selector */}
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-brand-dark bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="All">All Categories</option>
            <option value="Pothole / Road Damage">Potholes</option>
            <option value="Streetlight Out">Streetlights</option>
            <option value="Graffiti / Vandalism">Vandalism</option>
            <option value="Trash / Illegal Dumping">Dumping</option>
            <option value="Other">Other</option>
          </select>

          {/* Status Selector */}
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-brand-dark bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Issue Cards Grid */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
          <p className="font-bold text-brand-dark text-lg mb-1">No community reports match filters.</p>
          <p className="text-brand-muted text-sm">Be the first to report new issues in your district!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col h-full">
              {/* Image Preview Banner */}
              {issue.imageUrl && (
                <div className="h-48 w-full overflow-hidden bg-slate-50 relative">
                  <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
                    issue.status === 'resolved' 
                      ? 'bg-emerald-500 text-white' 
                      : issue.status === 'in-progress' 
                      ? 'bg-amber-500 text-white'
                      : 'bg-brand-dark/85 text-white'
                  }`}>
                    {issue.status}
                  </span>
                </div>
              )}

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand-primary-dark uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/60">
                      {issue.category}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase ${
                      issue.severity === 'Critical' || issue.severity === 'High'
                        ? 'text-brand-danger'
                        : 'text-brand-muted'
                    }`}>
                      {issue.severity} Severity
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-brand-dark line-clamp-1">{issue.title}</h3>
                  <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">{issue.description}</p>
                </div>

                {/* Footer Metadata */}
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 gap-2">
                  <div className="flex items-center gap-1 min-w-0">
                    <FaUser className="flex-shrink-0" />
                    <span className="truncate">{issue.creatorName || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <FaClock />
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions Block */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-dark">
                    <FaMapMarkerAlt className="text-slate-400" />
                    <span>{issue.latitude?.toFixed(4)}, {issue.longitude?.toFixed(4)}</span>
                  </div>

                  <Button
                    variant={issue.creatorUid === currentUser.uid ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => handleUpvote(issue.id, issue.upvotes, issue.creatorUid)}
                    isDisabled={issue.creatorUid === currentUser.uid}
                    title={issue.creatorUid === currentUser.uid ? "You reported this issue" : "Upvote to verify"}
                    className="gap-1 px-3 py-1.5 text-xs font-bold"
                  >
                    <FaArrowUp /> Upvote ({issue.upvotes || 0})
                  </Button>
                </div>

                {/* Status Update — only visible to the issue creator */}
                {issue.creatorUid === currentUser.uid && (
                  <div className="pt-2 flex items-center gap-2">
                    <FaEdit className="text-slate-400 flex-shrink-0 text-xs" />
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-brand-dark bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
                    >
                      <option value="pending">🕐 Pending</option>
                      <option value="in-progress">⚙️ In Progress</option>
                      <option value="resolved">✅ Resolved</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

