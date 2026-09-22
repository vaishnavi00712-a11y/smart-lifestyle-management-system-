import React, { useState, useEffect } from 'react';
import {
  Moon,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { sleepService } from '../services/lifestyleServices';
import { SleepEntry } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const SleepPage: React.FC = () => {
  const [sleepLogs, setSleepLogs] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:15');
  const [quality, setQuality] = useState<SleepEntry['quality']>('Good');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchSleep = async () => {
    try {
      const res = await sleepService.getSleep();
      if (res.success && res.data) {
        setSleepLogs(res.data);
      }
    } catch {
      showToast('Unable to load sleep logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSleep();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedtime || !wakeTime) return;

    setSubmitting(true);
    const res = await sleepService.createSleep({
      bedtime,
      wake_time: wakeTime,
      quality,
      date,
      notes: notes.trim(),
    });
    setSubmitting(false);

    if (res.success && res.data) {
      setSleepLogs(prev => [res.data!, ...prev]);
      setShowModal(false);
      setNotes('');
      showToast('Sleep log saved to database.', 'success');
    } else {
      showToast('Failed to save sleep log.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await sleepService.deleteSleep(id);
    if (res.success) {
      setSleepLogs(prev => prev.filter(s => s._id !== id));
      showToast('Sleep log removed.', 'success');
    } else {
      showToast('Failed to delete sleep log.', 'error');
    }
  };

  // Chart data
  const chartData = sleepLogs
    .slice(0, 7)
    .reverse()
    .map(s => ({
      date: s.date.slice(5),
      hours: +(s.duration / 60).toFixed(1),
      quality: s.quality,
    }));

  const avgMinutes =
    sleepLogs.length > 0
      ? Math.round(sleepLogs.reduce((sum, s) => sum + s.duration, 0) / sleepLogs.length)
      : 0;

  const avgHours = Math.floor(avgMinutes / 60);
  const avgMins = avgMinutes % 60;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sleep Tracker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor bedtime consistency, sleep duration, and restfulness quality.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Sleep
        </button>
      </div>

      {/* Sleep Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Sleep Duration</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {avgHours}h {avgMins}m
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Recorded Nights</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{sleepLogs.length} nights</p>
          </div>
        </div>
      </div>

      {/* Sleep Duration Trend Chart */}
      {chartData.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            Sleep Duration Trend (Hours)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} fill="url(#sleepGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sleep Logs List */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-20" />
      ) : sleepLogs.length === 0 ? (
        <EmptyState
          icon={Moon}
          title="No sleep records logged"
          description="Log your sleep tonight to analyze duration and optimize recovery."
          actionText="Log Sleep"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {sleepLogs.map(log => {
            const h = Math.floor(log.duration / 60);
            const m = log.duration % 60;
            return (
              <div
                key={log._id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {h}h {m}m
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          log.quality === 'Excellent'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : log.quality === 'Good'
                            ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
                            : log.quality === 'Fair'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}
                      >
                        {log.quality} Quality
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {log.bedtime} → {log.wake_time}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {log.date}
                      </span>
                    </div>
                    {log.notes && <p className="text-xs text-slate-400 mt-1 italic">"{log.notes}"</p>}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(log._id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete sleep record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Sleep Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Sleep</h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bedtime
                  </label>
                  <input
                    type="time"
                    required
                    value={bedtime}
                    onChange={e => setBedtime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Wake Time
                  </label>
                  <input
                    type="time"
                    required
                    value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rest Quality
                  </label>
                  <select
                    value={quality}
                    onChange={e => setQuality(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Slept through the night, dark and cool room"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Calculating...' : 'Save Sleep'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
