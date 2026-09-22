import React, { useState, useEffect } from 'react';
import {
  Activity as ActivityIcon,
  Plus,
  Trash2,
  Flame,
  Footprints,
  Clock,
  Calendar,
  BarChart2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fitnessService } from '../services/lifestyleServices';
import { Activity } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const FitnessPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [activityType, setActivityType] = useState('Running / Jogging');
  const [duration, setDuration] = useState('30');
  const [steps, setSteps] = useState('3500');
  const [calories, setCalories] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchActivities = async () => {
    try {
      const res = await fitnessService.getActivities();
      if (res.success && res.data) {
        setActivities(res.data);
      }
    } catch {
      showToast('Unable to load activities.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityType || !duration) return;

    setSubmitting(true);
    const res = await fitnessService.createActivity({
      activity_type: activityType,
      duration: Number(duration),
      steps: steps ? Number(steps) : 0,
      calories: calories ? Number(calories) : undefined,
      date,
      notes: notes.trim(),
    });
    setSubmitting(false);

    if (res.success && res.data) {
      setActivities(prev => [res.data!, ...prev]);
      setShowModal(false);
      setNotes('');
      showToast('Workout logged to database!', 'success');
    } else {
      showToast('Failed to save workout.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fitnessService.deleteActivity(id);
    if (res.success) {
      setActivities(prev => prev.filter(a => a._id !== id));
      showToast('Activity record removed.', 'success');
    } else {
      showToast('Failed to delete activity.', 'error');
    }
  };

  // Group real activities for the chart
  const chartData = activities
    .slice(0, 7)
    .reverse()
    .map(a => ({
      name: a.date.slice(5),
      duration: a.duration,
      calories: a.calories || 0,
    }));

  const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0);
  const totalCalories = activities.reduce((sum, a) => sum + (a.calories || 0), 0);
  const totalSteps = activities.reduce((sum, a) => sum + (a.steps || 0), 0);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Fitness & Physical Activity
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log cardio, resistance training, steps, and active caloric expenditure.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Workout
        </button>
      </div>

      {/* Aggregate Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Active Time</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalMinutes} min</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Burned Energy</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalCalories} kcal</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Tracked Steps</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalSteps.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {chartData.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-500" />
            Activity Duration History (Minutes)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="duration" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Activity List */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-20" />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="No fitness activities yet"
          description="Record your morning jog, gym workout, or daily walking steps."
          actionText="Log First Activity"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {activities.map(act => (
            <div
              key={act._id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ActivityIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{act.activity_type}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      {act.duration} mins
                    </span>
                    {act.calories ? (
                      <span className="flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400">
                        <Flame className="w-3.5 h-3.5" />
                        {act.calories} kcal
                      </span>
                    ) : null}
                    {act.steps ? (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Footprints className="w-3.5 h-3.5" />
                        {act.steps.toLocaleString()} steps
                      </span>
                    ) : null}
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {act.date}
                    </span>
                  </div>
                  {act.notes && (
                    <p className="text-xs text-slate-400 mt-1.5 italic">"{act.notes}"</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(act._id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Delete activity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Fitness Workout</h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Activity Type
                </label>
                <select
                  value={activityType}
                  onChange={e => setActivityType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                >
                  <option value="Running / Jogging">Running / Jogging</option>
                  <option value="Strength Training">Strength Training</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Walking / Hiking">Walking / Hiking</option>
                  <option value="Yoga / Mobility">Yoga / Mobility</option>
                  <option value="Swimming">Swimming</option>
                  <option value="HIIT Cardio">HIIT Cardio</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Burned Calories (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="Auto-calculated if blank"
                    value={calories}
                    onChange={e => setCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Steps Count (Optional)
                  </label>
                  <input
                    type="number"
                    value={steps}
                    onChange={e => setSteps(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
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
                  placeholder="e.g. Heart rate was steady, felt energized"
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
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
