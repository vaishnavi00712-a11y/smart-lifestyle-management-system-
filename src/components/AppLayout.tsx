import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from './LoadingSkeleton';

const pageTitleMap: Record<string, string> = {
  '/dashboard': 'Lifestyle Dashboard',
  '/routine': 'Daily Routine Rituals',
  '/tasks': 'Task & Project Management',
  '/fitness': 'Fitness & Activity Telemetry',
  '/nutrition': 'Nutrition & Meal Logging',
  '/water': 'Hydration Tracker',
  '/sleep': 'Sleep & Circadian Rhythm',
  '/habits': 'Habit Streaks & Consistency',
  '/goals': 'Target Milestones & Goals',
  '/reports': 'Analytical Reports',
  '/profile': 'User Profile & Identity',
  '/settings': 'System Settings & Preferences',
};

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const currentTitle = pageTitleMap[location.pathname] || 'Smart Lifestyle';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          pageTitle={currentTitle}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
