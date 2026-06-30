import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-9xl font-extrabold text-slate-300 tracking-widest">404</h1>
      <div className="bg-blue-600 text-white px-2 text-sm rounded rotate-12 absolute">
        Page Not Found
      </div>
      <p className="text-slate-600 mt-5 text-lg">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
      >
        Go Home
      </Link>
    </div>
  );
}
