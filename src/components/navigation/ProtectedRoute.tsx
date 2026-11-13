import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children, requireOnboarding = true }: { children: React.ReactNode; requireOnboarding?: boolean }) {
  const { user, loading, authReady, isDemoMode } = useAuth();
  const location = useLocation();

  if (loading || !authReady) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--accent-gold)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (
    requireOnboarding &&
    !isDemoMode &&
    !user.onboardingCompleted &&
    location.pathname !== '/app/onboarding'
  ) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return <>{children}</>;
}
