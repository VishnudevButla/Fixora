import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { FaTrophy, FaMedal, FaSpinner, FaCrown } from 'react-icons/fa';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('points', 'desc'),
      limit(15)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setUsers(items);
      setLoading(false);
    }, (err) => {
      console.error("Leaderboard loading error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRankBadgeClass = (index) => {
    if (index === 0) return 'bg-amber-100 text-amber-700 border-amber-200'; // Gold
    if (index === 1) return 'bg-slate-100 text-slate-700 border-slate-200'; // Silver
    if (index === 2) return 'bg-amber-50 text-amber-900 border-amber-100'; // Bronze
    return 'bg-slate-50 text-brand-muted border-slate-100';
  };

  const getRankTitle = (points) => {
    if (points >= 1000) return 'Legendary Guardian';
    if (points >= 500) return 'Platinum Protector';
    if (points >= 300) return 'Gold Guardian';
    if (points >= 200) return 'Silver Savior';
    return 'Bronze Citizen';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <FaSpinner className="animate-spin text-4xl text-brand-primary mb-4" />
        <p className="text-brand-muted text-sm font-semibold">Loading top heroes...</p>
      </div>
    );
  }

  // Split top 3 and others
  const topThree = users.slice(0, 3);
  const regularUsers = users.slice(3);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight flex items-center gap-2">
          <FaTrophy className="text-amber-500" /> Civic Leaderboard
        </h1>
        <p className="text-brand-muted text-sm mt-1">
          Top neighborhood problem solvers ranked by community points. Gain points by filing reports (+50 XP) and getting upvoted.
        </p>
      </div>

      {/* Top 3 Podiums */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
          {/* Second Place */}
          {topThree[1] && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center order-2 md:order-1 h-[210px] justify-center relative">
              <span className="absolute -top-3 h-8 w-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                2
              </span>
              <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-2xl mb-3 border border-slate-200">
                <FaMedal />
              </div>
              <h4 className="font-bold text-brand-dark truncate w-full">{topThree[1].displayName}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{getRankTitle(topThree[1].points)}</p>
              <p className="text-lg font-extrabold text-brand-primary-dark mt-2">{topThree[1].points} XP</p>
            </div>
          )}

          {/* First Place */}
          {topThree[0] && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-amber-300 shadow-md flex flex-col items-center text-center order-1 md:order-2 h-[240px] justify-center relative scale-105 md:-translate-y-2">
              <span className="absolute -top-4 h-10 w-10 rounded-full bg-amber-400 border-2 border-white text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                <FaCrown />
              </span>
              <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 text-4xl mb-3 border border-amber-200">
                <FaTrophy />
              </div>
              <h4 className="font-extrabold text-brand-dark truncate w-full text-lg">{topThree[0].displayName}</h4>
              <p className="text-xs text-amber-600 font-bold mt-0.5">{getRankTitle(topThree[0].points)}</p>
              <p className="text-2xl font-extrabold text-brand-primary-dark mt-3">{topThree[0].points} XP</p>
            </div>
          )}

          {/* Third Place */}
          {topThree[2] && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center order-3 md:order-3 h-[190px] justify-center relative">
              <span className="absolute -top-3 h-8 w-8 rounded-full bg-amber-50 border border-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                3
              </span>
              <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 text-2xl mb-3 border border-amber-100">
                <FaMedal />
              </div>
              <h4 className="font-bold text-brand-dark truncate w-full">{topThree[2].displayName}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{getRankTitle(topThree[2].points)}</p>
              <p className="text-lg font-extrabold text-brand-primary-dark mt-2">{topThree[2].points} XP</p>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard List Table */}
      {regularUsers.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {regularUsers.map((user, idx) => {
              const overallRank = idx + 4;
              return (
                <div key={user.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-4">
                    <span className="w-6 font-bold text-sm text-brand-muted text-center">{overallRank}</span>
                    <div>
                      <h4 className="font-bold text-brand-dark text-sm sm:text-base">{user.displayName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">
                        {getRankTitle(user.points)}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-brand-primary-dark text-sm sm:text-base">
                    {user.points} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

