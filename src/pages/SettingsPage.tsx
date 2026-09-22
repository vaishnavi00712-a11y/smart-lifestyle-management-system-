import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Droplets,
  Bell,
  Save,
  Check,
} from 'lucide-react';
import { settingsService } from '../services/lifestyleServices';
import { UserSettings } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [waterGoal, setWaterGoal] = useState('8');
  const [dailyReminders, setDailyReminders] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await settingsService.getSettings();
      if (res.success && res.data) {
        const s = res.data;
        setSettings(s);
        setTheme(s.theme || 'system');
        setWaterGoal(String(s.daily_water_goal || 8));
        setDailyReminders(s.notifications?.daily_reminders ?? true);
        setWaterReminders(s.notifications?.water_reminders ?? true);
      }
    } catch {
      showToast('Unable to load settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updatedPayload: Partial<UserSettings> = {
      theme,
      daily_water_goal: Number(waterGoal) || 8,
      notifications: {
        daily_reminders: dailyReminders,
        water_reminders: waterReminders,
      },
    };

    const res = await settingsService.updateSettings(updatedPayload);
    setSaving(false);

    if (res.success && res.data) {
      setSettings(res.data);
      // Apply theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      showToast('Preferences saved to database.', 'success');
    } else {
      showToast('Failed to save settings.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 space-y-6 max-w-3xl mx-auto">
        <LoadingSkeleton count={3} height="h-32" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Application Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Settings are stored in the database and linked to your authenticated user profile.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Theme Preference */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            Appearance & Interface Theme
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'light'
                  ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="text-xs font-semibold">Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="text-xs font-semibold">Dark</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'system'
                  ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <Laptop className="w-5 h-5" />
              <span className="text-xs font-semibold">System</span>
            </button>
          </div>
        </div>

        {/* Tracking Defaults */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-500" />
            Daily Hydration Target
          </h3>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Water Goal (Glasses per day)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={waterGoal}
              onChange={e => setWaterGoal(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-sky-500" />
            Reminders & Alerts
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Daily Planning Prompt</p>
                <p className="text-[11px] text-slate-400">Receive morning routine reminders</p>
              </div>
              <input
                type="checkbox"
                checked={dailyReminders}
                onChange={e => setDailyReminders(e.target.checked)}
                className="w-4 h-4 text-sky-500 rounded-md"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Hydration Interval Alerts</p>
                <p className="text-[11px] text-slate-400">Drink water reminder every 90 minutes</p>
              </div>
              <input
                type="checkbox"
                checked={waterReminders}
                onChange={e => setWaterReminders(e.target.checked)}
                className="w-4 h-4 text-sky-500 rounded-md"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
};
