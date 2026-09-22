import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Activity,
  Droplets,
  Moon,
  Sparkles,
  Target,
  Timer,
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { LandingCarousel } from '../components/LandingCarousel';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              Smart Lifestyle
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-16 w-full">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Integrated Full-Stack Architecture & Real Database
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Take Full Command of Your Habits, Wellness & Productivity
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A cohesive lifestyle operating system connecting your daily routine, task manager, fitness logs, nutrition, hydration, sleep telemetry, and goal milestones into a dynamic 100-point score.
          </p>
        </div>

        {/* 6-Second Auto-Transition Navigation Carousel */}
        <section aria-label="Interactive Overview">
          <LandingCarousel />
        </section>

        {/* Feature Grid */}
        <section className="space-y-8 pt-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Every Pillar of Balanced Living
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Synchronized with MongoDB database storage and individual user isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200/50 dark:border-sky-800/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Task Management</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Prioritized tasks categorized by Study, Work, Fitness, Health, and Personal with due dates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Hydration Tracker</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Instant glass logging with persistent target calculations and real-time database updates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Sleep Telemetry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Bedtime and wake-time duration calculations with quality ratings and circadian rhythm analytics.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/50 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Habit Streaks</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Build compounding momentum with unbroken daily streaks and historical completion logs.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Smart Lifestyle Management System • Full-Stack Architecture • Real Database Persistence
      </footer>
    </div>
  );
};
