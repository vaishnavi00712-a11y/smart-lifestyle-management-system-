import React from 'react';
import { Menu, Calendar, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
  pageTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, pageTitle = 'Dashboard' }) => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/60 dark:border-slate-700/60">
          <Calendar className="w-3.5 h-3.5 text-sky-500" />
          <span>{today}</span>
        </div>

        {/* Database Live Persistence Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden md:inline">Live DB</span>
        </div>

        {/* User Mini Profile */}
        {user ? (
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={user.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200 hidden md:inline">
              {user.name}
            </span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
