import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";

// ── Lazy-load every page ──────────────────────────────────────────────────────
// Each page becomes its own JS chunk downloaded only when first visited.
// This cuts initial bundle from ~1 MB to ~150 kB.
const Landing     = lazy(() => import("./pages/Landing"));
const Login       = lazy(() => import("./pages/Login"));
const Dashboard   = lazy(() => import("./pages/Dashboard"));
const ReportIssue = lazy(() => import("./pages/ReportIssue"));
const MapPage     = lazy(() => import("./pages/MapPage"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile     = lazy(() => import("./pages/Profile"));
const NotFound    = lazy(() => import("./pages/NotFound"));

// ── Shared page-transition loading fallback ──────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg gap-4">
      <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-brand-muted text-sm font-medium tracking-wide">Loading…</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/"      element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected App Routes wrapped in Shared Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/report"     element={<ReportIssue />} />
            <Route path="/map"        element={<MapPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile"    element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}