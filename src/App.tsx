import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoutinePage } from './pages/RoutinePage';
import { TasksPage } from './pages/TasksPage';
import { FitnessPage } from './pages/FitnessPage';
import { NutritionPage } from './pages/NutritionPage';
import { WaterPage } from './pages/WaterPage';
import { SleepPage } from './pages/SleepPage';
import { HabitsPage } from './pages/HabitsPage';
import { GoalsPage } from './pages/GoalsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
    <div className="w-10 h-10 border-3 border-sky-400 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-slate-300 font-semibold text-sm">Smart Lifestyle Management</p>
    <p className="text-slate-500 text-xs mt-1">Starting up...</p>
  </div>
);

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route
                path="/login"
                element={
                  <AuthRedirect>
                    <LoginPage />
                  </AuthRedirect>
                }
              />
              <Route
                path="/register"
                element={
                  <AuthRedirect>
                    <RegisterPage />
                  </AuthRedirect>
                }
              />

              {/* Protected authenticated routes wrapped in AppLayout */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/routine" element={<RoutinePage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/fitness" element={<FitnessPage />} />
                <Route path="/nutrition" element={<NutritionPage />} />
                <Route path="/water" element={<WaterPage />} />
                <Route path="/sleep" element={<SleepPage />} />
                <Route path="/habits" element={<HabitsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}
