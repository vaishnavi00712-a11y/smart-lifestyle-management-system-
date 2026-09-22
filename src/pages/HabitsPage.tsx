import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Flame,
  CheckCircle2,
  Circle,
  Trophy,
  Award,
  Calendar,
} from 'lucide-react';
import { habitService } from '../services/lifestyleServices';
import { Habit } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const HabitsPage: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Wellness');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  const fetchHabits = async () => {
    try {
      const res = await habitService.getHabits();
      if (res.success && res.data) {
        setHabits(res.data);
      }
    } catch {
      showToast('Unable to load habits.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const res = await habitService.createHabit({
      name: name.trim(),
      category: category.trim(),
    });
    setSubmitting(false);

    if (res.success && res.data) {
      setHabits(prev => [res.data!, ...prev]);
      setShowModal(false);
      setName('');
      showToast('New habit established!', 'success');
    } else {
      showToast('Failed to create habit.', 'error');
    }
  };

  const handleToggle = async (habit: Habit) => {
    const res = await habitService.toggleHabitCompletion(habit._id);
    if (res.success && res.data) {
      setHabits(prev => prev.map(h => (h._id === habit._id ? res.data! : h)));
      const isNowCompleted = res.data.completed_dates?.includes(today);
      if (isNowCompleted) {
        showToast(`Habit completed! Streak: ${res.data.current_streak} days 🔥`, 'success');
      } else {
        showToast('Habit marked incomplete for today.', 'info');
      }
    } else {
      showToast('Failed to update habit streak.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await habitService.deleteHabit(id);
    if (res.success) {
      setHabits(prev => prev.filter(h => h._id !== id));
      showToast('Habit removed.', 'success');
    } else {
      showToast('Failed to delete habit.', 'error');
    }
  };

  const totalStreaks = habits.reduce((sum, h) => sum + h.current_streak, 0);
  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.longest_streak)) : 0;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Habit Streaks & Consistency
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build compounding identity through unbroken daily execution chains.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Habit
        </button>
      </div>

      {/* Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cumulative Active Streaks</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalStreaks} days</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">All-Time Longest Streak</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{maxStreak} days</p>
          </div>
        </div>
      </div>

      {/* Habit List */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-20" />
      ) : habits.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No habits established yet"
          description="Anchor a small daily atomic habit—reading, stretching, or 10-minute meditation."
          actionText="Create Habit"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {habits.map(habit => {
            const isCompletedToday = habit.completed_dates?.includes(today);
            return (
              <div
                key={habit._id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isCompletedToday
                    ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-800/40 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => handleToggle(habit)}
                    className="text-slate-400 hover:text-amber-500 transition-colors shrink-0"
                  >
                    {isCompletedToday ? (
                      <CheckCircle2 className="w-6 h-6 text-amber-500" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          isCompletedToday
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {habit.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {habit.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs mt-1.5">
                      <span className="flex items-center gap-1 font-extrabold text-amber-600 dark:text-amber-400">
                        <Flame className="w-4 h-4" />
                        {habit.current_streak} day streak
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        Best: {habit.longest_streak} days
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-slate-400">
                        Total completions: {habit.completed_dates?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(habit._id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete habit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Habit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Habit</h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 15 pages of non-fiction"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mindset, Health, Focus, Fitness"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
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
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Establish Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
