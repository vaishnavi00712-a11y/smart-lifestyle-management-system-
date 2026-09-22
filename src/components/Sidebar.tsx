import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Activity,
  Utensils,
  Droplets,
  Moon,
  Sparkles,
  Target,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/routine', label: 'Daily Routine', icon: CalendarDays },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/fitness', label: 'Fitness & Activity', icon: Activity },
  { path: '/nutrition', label: 'Nutrition', icon: Utensils },
  { path: '/water', label: 'Water Tracker', icon: Droplets },
  { path: '/sleep', label: 'Sleep Tracker', icon: Moon },
  { path: '/habits', label: 'Habit Tracker', icon: Sparkles },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: UserCircle },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">Smart Lifestyle</span>
              <span className="text-[10px] text-slate-400 font-medium block">Full-Stack Platform</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Current User Footprint */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={user.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
                />
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs transition-colors"
            >
              Sign In
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
};
