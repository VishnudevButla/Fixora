import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FaMapMarkedAlt, FaPlusCircle, FaTrophy, FaShieldAlt } from 'react-icons/fa';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { currentUser } = useAuth();

  // Already logged in? Send straight to dashboard
  if (currentUser) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      {/* Header/Hero Section */}
      <header className="relative overflow-hidden py-20 px-6 sm:px-12 lg:px-24">
        {/* Decorative background shape */}
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-emerald-50/50 blur-3xl" />
        <div className="absolute top-1/2 left-0 -z-10 h-[300px] w-[300px] rounded-full bg-green-50/30 blur-2xl" />

        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/60 text-brand-primary-dark mb-6">
            <FaShieldAlt /> Empowering Your Neighborhood
          </span>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-brand-dark tracking-tight leading-none mb-6">
            Snap. Report.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary-dark to-brand-primary">
              Transform Your City.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-brand-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Fixora is the community-driven platform for reporting potholes, broken streetlights, and neighborhood issues. Work together with local authorities to keep your city clean and safe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                Launch Dashboard
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-16 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-brand-dark">How Fixora Works</h2>
          <p className="text-brand-muted mt-2">Making civic engagement simple, visual, and rewarding.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition hover:shadow-md">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-brand-primary-dark flex items-center justify-center text-xl mb-6">
              <FaPlusCircle />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-2">1. Snap & Report</h3>
            <p className="text-brand-muted leading-relaxed">
              Take a photo of any issue, categorise it, and pinpoint its location. Our AI tool will assist in assessing the report.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition hover:shadow-md">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-brand-primary-dark flex items-center justify-center text-xl mb-6">
              <FaMapMarkedAlt />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-2">2. Track on Map</h3>
            <p className="text-brand-muted leading-relaxed">
              Watch issues change status in real-time. Upvote neighbor reports to emphasize high-priority problems.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition hover:shadow-md">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-brand-primary-dark flex items-center justify-center text-xl mb-6">
              <FaTrophy />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-2">3. Gain Reputation</h3>
            <p className="text-brand-muted leading-relaxed">
              Earn community points for verified reports and resolutions. Climb the leaderboard and show your civic pride!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100 py-8 text-center text-sm text-brand-muted">
        <p>&copy; {new Date().getFullYear()} Fixora. All rights reserved.</p>
      </footer>
    </div>
  );
}
