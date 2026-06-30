import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaMapMarkedAlt,
  FaPlusCircle,
  FaTrophy,
  FaChartLine,
  FaBars,
  FaTimes,
  FaSignOutAlt
} from 'react-icons/fa';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <FaChartLine className="mr-2" /> },
    { to: '/map', label: 'Map', icon: <FaMapMarkedAlt className="mr-2" /> },
    { to: '/report', label: 'Report Issue', icon: <FaPlusCircle className="mr-2" /> },
    { to: '/leaderboard', label: 'Leaderboard', icon: <FaTrophy className="mr-2" /> },
  ];

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const initials = currentUser?.displayName
    ? currentUser.displayName.slice(0, 2).toUpperCase()
    : currentUser?.email?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-brand-primary-dark to-brand-primary bg-clip-text text-transparent">
                Fixora
              </span>
              <span className="text-xl">🚀</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'bg-emerald-50 text-brand-primary-dark shadow-sm'
                      : 'text-brand-muted hover:bg-slate-50 hover:text-brand-dark'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                      isActive
                        ? 'bg-emerald-50 text-brand-primary-dark'
                        : 'text-brand-muted hover:bg-slate-50 hover:text-brand-dark'
                    }`
                  }
                >
                  <div className="h-7 w-7 rounded-full bg-brand-primary-dark text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <span className="max-w-[100px] truncate">
                    {currentUser.displayName || currentUser.email.split('@')[0]}
                  </span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand-muted hover:text-brand-danger hover:bg-rose-50 px-3 py-2 rounded-lg transition"
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-brand-primary-dark hover:bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-brand-muted hover:bg-slate-50 focus:outline-none"
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-2 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg text-base font-semibold transition ${
                  isActive
                    ? 'bg-emerald-50 text-brand-primary-dark'
                    : 'text-brand-muted hover:bg-slate-50'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}

          <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between px-4">
            {currentUser ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-brand-muted font-semibold"
                >
                  <div className="h-7 w-7 rounded-full bg-brand-primary-dark text-white flex items-center justify-center text-xs font-bold">
                    {initials}
                  </div>
                  <span className="truncate max-w-[120px]">
                    {currentUser.displayName || currentUser.email.split('@')[0]}
                  </span>
                </NavLink>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="flex items-center gap-1.5 text-brand-muted hover:text-brand-danger font-semibold text-sm transition"
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="bg-brand-primary-dark hover:bg-brand-primary text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
