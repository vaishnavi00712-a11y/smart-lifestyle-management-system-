import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Circle,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { goalService } from '../services/lifestyleServices';
import { Goal } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Career');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [initialProgress, setInitialProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchGoals = async () => {
    try {
      const res = await goalService.getGoals();
      if (res.success && res.data) {
        setGoals(res.data);
      }
    } catch {
      showToast('Unable to load goals.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    const res = await goalService.createGoal({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      target_date: targetDate,
      progress: initialProgress,
    });
    setSubmitting(false);

    if (res.success && res.data) {
      setGoals(prev => [res.data!, ...prev]);
      setShowModal(false);
      setTitle('');
      setDescription('');
      showToast('Goal established!', 'success');
    } else {
      showToast('Failed to save goal.', 'error');
    }
  };

  const handleUpdateProgress = async (goal: Goal, newProgress: number) => {
    const clamped = Math.max(0, Math.min(100, newProgress));

    // Optimistic UI update
    setGoals(prev =>
      prev.map(g => {
        if (g._id === goal._id) {
          const newStatus: Goal['status'] =
            clamped === 100 ? 'Completed' : clamped === 0 ? 'Not Started' : 'In Progress';
          return { ...g, progress: clamped, status: newStatus };
        }
        return g;
      })
    );

    const res = await goalService.updateGoal(goal._id, { progress: clamped });
    if (res.success && res.data) {
      setGoals(prev => prev.map(g => (g._id === goal._id ? res.data! : g)));
      if (clamped === 100) {
        showToast(`🎉 Congratulations! Goal "${goal.title}" Completed!`, 'success');
      } else {
        showToast(`Goal progress updated to ${clamped}%`, 'info');
      }
    } else {
      setGoals(prev => prev.map(g => (g._id === goal._id ? goal : g)));
      showToast('Failed to update progress.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await goalService.deleteGoal(id);
    if (res.success) {
      setGoals(prev => prev.filter(g => g._id !== id));
      showToast('Goal removed.', 'success');
    } else {
      showToast('Failed to delete goal.', 'error');
    }
  };

  const completedCount = goals.filter(g => g.status === 'Completed').length;
  const inProgressCount = goals.filter(g => g.status === 'In Progress').length;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Target Goals & Milestones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track measurable outcomes with automated state transitions (0%: Not Started • 1-99%: In Progress • 100%: Completed).
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Goal
        </button>
      </div>

      {/* Goal Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Goals</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{goals.length}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">In Progress</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{inProgressCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completed</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Goal Cards */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-28" />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals formulated yet"
          description="Define a 30-day or quarterly milestone to focus your daily actions."
          actionText="Create First Goal"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-4">
          {goals.map(goal => (
            <div
              key={goal._id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{goal.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        goal.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : goal.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>
                  {goal.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{goal.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Target: {goal.target_date}
                  </span>
                  <button
                    onClick={() => handleDelete(goal._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-2"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Numerical Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Completion Progress</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{goal.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      goal.progress === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {/* Quick Increment Controls */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-medium text-slate-400">{goal.category}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateProgress(goal, goal.progress + 10)}
                    disabled={goal.progress >= 100}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 transition-colors disabled:opacity-40"
                  >
                    +10%
                  </button>
                  <button
                    onClick={() => handleUpdateProgress(goal, goal.progress + 25)}
                    disabled={goal.progress >= 100}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 transition-colors disabled:opacity-40"
                  >
                    +25%
                  </button>
                  {goal.progress < 100 ? (
                    <button
                      onClick={() => handleUpdateProgress(goal, 100)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                    >
                      Complete (100%)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateProgress(goal, 0)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Reset (0%)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Target Goal</h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Full-Stack Architecture"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Milestones or definition of done..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Career, Health, Finance"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Progress: {initialProgress}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={initialProgress}
                  onChange={e => setInitialProgress(Number(e.target.value))}
                  className="w-full"
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
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Establish Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
