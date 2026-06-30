import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Button from '../components/common/Button';
import { FaShieldAlt } from 'react-icons/fa';


export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup, currentUser, loading } = useAuth();
  const navigate = useNavigate();

  // While Firebase resolves auth, show a spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Already logged in — redirect straight to dashboard
  if (currentUser) return <Navigate to="/dashboard" replace />;


  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      return setError('Please fill in all fields');
    }
    
    if (isSignUp && !displayName) {
      return setError('Please enter a display name');
    }

    try {
      setIsLoading(true);
      if (isSignUp) {
        // Sign Up
        const userCredential = await signup(email, password);
        const user = userCredential.user;
        
        // Initialize user document in Firestore with starting points & level
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          points: 100, // Welcome gift points
          rank: 'Bronze Citizen',
          createdAt: new Date().toISOString()
        });
      } else {
        // Sign In
        const userCredential = await login(email, password);
        const user = userCredential.user;
        
        // Double check if user document exists, create if missing
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: email.split('@')[0],
            points: 100,
            rank: 'Bronze Citizen',
            createdAt: new Date().toISOString()
          });
        }
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('That email address is already in use.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Failed to log in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <Link to="/" className="flex items-center justify-center space-x-2 text-3xl font-extrabold text-brand-dark mb-2">
          <span className="bg-gradient-to-r from-brand-primary-dark to-brand-primary bg-clip-text text-transparent">
            Fixora
          </span>
          <span className="text-2xl">🚀</span>
        </Link>
        <p className="text-brand-muted text-sm flex items-center justify-center gap-1.5">
          <FaShieldAlt className="text-brand-primary" /> Hyperlocal Problem Solver
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm max-w-md w-full">
        <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center">
          {isSignUp ? 'Create your Account' : 'Sign In to Fixora'}
        </h2>
        
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-brand-danger text-sm p-4 rounded-xl mb-4 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your username"
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-primary-dark focus:ring-1 focus:ring-brand-primary-dark outline-none transition"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-primary-dark focus:ring-1 focus:ring-brand-primary-dark outline-none transition"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-primary-dark focus:ring-1 focus:ring-brand-primary-dark outline-none transition"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            isLoading={isLoading}
          >
            {isSignUp ? 'Register & Join' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-brand-muted">
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-brand-primary-dark hover:text-brand-primary font-bold underline transition"
              disabled={isLoading}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

