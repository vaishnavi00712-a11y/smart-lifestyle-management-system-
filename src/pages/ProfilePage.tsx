import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Target,
  Sparkles,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [goal, setGoal] = useState(user?.lifestyle_goal || '');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const res = await authService.updateProfile({
      name: name.trim(),
      age: age ? Number(age) : undefined,
      lifestyle_goal: goal.trim(),
    });
    setSaving(false);

    if (res.success) {
      await refreshUser();
      showToast('Profile updated successfully in database.', 'success');
    } else {
      showToast('Failed to update profile.', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal identity, biometric parameters, and lifestyle mission.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Authenticated via JWT
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Read-Only)
              </label>
              <div className="relative rounded-xl opacity-75">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="e.g. 28"
                className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Lifestyle Goal / North Star
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Target className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g. Optimize focus blocks, maintain 8 hours sleep, and hydrate"
                className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving changes...' : 'Save Profile'}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'recent'}</span>
        </div>
      </div>
    </div>
  );
};
