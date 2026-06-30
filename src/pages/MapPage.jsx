import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { collection, query, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../services/firebase';
import { upvoteIssue } from '../services/issueService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { FaArrowUp, FaSpinner, FaMapMarkerAlt, FaCompass } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Marker Generator to avoid Vite asset issues and provide dynamic coloring
const getCustomIcon = (category, status) => {
  let color = '#3b82f6'; // Blue fallback
  
  if (status === 'resolved') {
    color = '#10b981'; // Green resolved
  } else if (status === 'in-progress') {
    color = '#f59e0b'; // Amber in progress
  } else {
    // Color-coded by category for pending status
    switch (category) {
      case 'Pothole / Road Damage':
        color = '#ef4444'; // Red
        break;
      case 'Streetlight Out':
        color = '#eab308'; // Yellow/Amber
        break;
      case 'Trash / Illegal Dumping':
        color = '#a855f7'; // Purple
        break;
      case 'Graffiti / Vandalism':
        color = '#ec4899'; // Pink
        break;
      default:
        color = '#f97316'; // Orange
    }
  }

  return L.divIcon({
    html: `
      <div style="position: relative;">
        <span style="
          display: block; 
          width: 20px; 
          height: 20px; 
          background-color: ${color}; 
          border: 2px solid #ffffff; 
          border-radius: 50%; 
          box-shadow: 0 2px 5px rgba(0,0,0,0.4);
          transform: scale(1.1);
        "></span>
        <span style="
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translate(-50%, -2px);
          width: 0; 
          height: 0; 
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid ${color};
        "></span>
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [20, 25],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20]
  });
};

export default function MapPage() {
  const { currentUser } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // default fallback
  const [userLocation, setUserLocation] = useState(null);

  // Sync Issues from Firestore
  useEffect(() => {
    const q = query(collection(db, 'issues'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setIssues(items);
      
      // Auto-center map on average coordinates if issues exist
      if (items.length > 0) {
        const avgLat = items.reduce((sum, item) => sum + item.latitude, 0) / items.length;
        const avgLng = items.reduce((sum, item) => sum + item.longitude, 0) / items.length;
        setMapCenter([avgLat, avgLng]);
      }
      setLoading(false);
    }, (err) => {
      console.error("Map issue listener error:", err);
      setLoading(false);
    });

    // Detect browser location to center map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          setMapCenter(loc);
        },
        (err) => console.log("Geolocation error (denied or unavailable).")
      );
    }

    return () => unsubscribe();
  }, []);

  const handleUpvote = async (issueId, currentUpvotes, creatorUid) => {
    try {
      await upvoteIssue(issueId, currentUpvotes);
      
      // Reward points
      if (creatorUid) {
        await updateDoc(doc(db, 'users', creatorUid), {
          points: increment(10)
        });
      }
      if (currentUser && currentUser.uid !== creatorUid) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          points: increment(2)
        });
      }
    } catch (err) {
      console.error("Error upvoting from map:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <FaSpinner className="animate-spin text-4xl text-brand-primary mb-4" />
        <p className="text-brand-muted text-sm font-semibold">Plotting issues onto map...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight">Interactive Issues Map</h1>
          <p className="text-xs text-brand-muted mt-0.5">Explore color-coded hazard alerts logged by neighbors.</p>
        </div>
        
        {/* Map Legend */}
        <div className="hidden sm:flex items-center gap-4 bg-white px-4 py-2 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-wider text-brand-dark">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#ef4444]"></span> Road Damage</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#eab308]"></span> Streetlight</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#a855f7]"></span> Dumping</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#10b981]"></span> Resolved</span>
        </div>
      </div>

      <div className="flex-1 rounded-3xl border border-slate-200 shadow-inner overflow-hidden relative z-10">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location marker */}
          {userLocation && (
            <Marker 
              position={userLocation}
              icon={L.divIcon({
                html: `
                  <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                    <span style="display: block; width: 14px; height: 14px; background-color: #06b6d4; border: 2px solid white; border-radius: 50%;"></span>
                    <span style="position: absolute; width: 28px; height: 28px; background-color: #06b6d4; border-radius: 50%; opacity: 0.3; transform: scale(1.1); animation: ping 2s infinite;"></span>
                  </div>
                `,
                className: 'user-pulse-icon',
                iconSize: [28, 28]
              })}
            >
              <Popup>
                <div className="text-center font-bold text-xs text-cyan-600 flex items-center gap-1">
                  <FaCompass className="animate-spin" /> You are here
                </div>
              </Popup>
            </Marker>
          )}

          {/* Issue markers — only render if coords are valid numbers */}
          {issues
            .filter((issue) =>
              typeof issue.latitude === 'number' &&
              typeof issue.longitude === 'number' &&
              isFinite(issue.latitude) &&
              isFinite(issue.longitude)
            )
            .map((issue) => (
            <Marker 
              key={issue.id} 
              position={[issue.latitude, issue.longitude]}
              icon={getCustomIcon(issue.category, issue.status)}
            >
              <Popup maxWidth={280}>
                <div className="flex flex-col space-y-2 text-brand-dark p-0.5">
                  {issue.imageUrl && (
                    <div className="h-24 w-full overflow-hidden rounded-lg bg-slate-50 mb-1">
                      <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold text-brand-primary-dark uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/60">
                        {issue.category}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase ${
                        issue.status === 'resolved' ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-brand-dark mt-1 leading-tight">{issue.title}</h4>
                    <p className="text-xs text-brand-muted line-clamp-2 mt-1 leading-normal">{issue.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <FaMapMarkerAlt /> {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                    </span>
                    
                    <button
                      onClick={() => handleUpvote(issue.id, issue.upvotes, issue.creatorUid)}
                      disabled={issue.creatorUid === currentUser.uid}
                      className="bg-brand-primary-dark hover:bg-brand-primary disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-[10px] px-2.5 py-1 rounded shadow-sm hover:shadow active:scale-[0.98] transition flex items-center gap-1"
                    >
                      <FaArrowUp /> Upvote ({issue.upvotes || 0})
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

