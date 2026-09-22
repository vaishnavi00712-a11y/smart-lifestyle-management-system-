import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Plus,
  Minus,
  RotateCcw,
  Target,
  Sparkles,
  Award,
  Calendar,
} from 'lucide-react';
import { waterService } from '../services/lifestyleServices';
import { WaterData } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

export const WaterPage: React.FC = () => {
  const [waterData, setWaterData] = useState<WaterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState('8');
  const { showToast } = useToast();

  const fetchWater = async () => {
    try {
      const res = await waterService.getTodayWater();
      if (res.success && res.data) {
        setWaterData(res.data);
        setNewGoal(String(res.data.daily_goal));
      }
    } catch {
      showToast('Unable to load water intake.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWater();
  }, []);

  const changeGlasses = async (delta: number) => {
    if (!waterData || updating) return;
    const targetGlasses = Math.max(0, waterData.glasses + delta);

    // Optimistic
    setWaterData({ ...waterData, glasses: targetGlasses });
    setUpdating(true);

    const res = await waterService.updateWater(targetGlasses, waterData.daily_goal);
    setUpdating(false);

    if (res.success && res.data) {
      setWaterData(res.data);
      if (delta > 0) {
        if (targetGlasses >= waterData.daily_goal) {
          showToast('Daily hydration target reached! Outstanding work!', 'success');
        } else {
          showToast(`+1 Glass logged to database (${targetGlasses}/${waterData.daily_goal})`, 'success');
        }
      } else {
        showToast('Water intake adjusted in database.', 'info');
      }
    } else {
      // Revert
      setWaterData(waterData);
      showToast('Failed to sync water intake with database.', 'error');
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseInt(newGoal);
    if (isNaN(g) || g <= 0) return;

    const res = await waterService.updateGoal(g);
    if (res.success && res.data) {
      setWaterData(res.data);
      setShowGoalModal(false);
      showToast(`Daily water target updated to ${g} glasses.`, 'success');
    } else {
      showToast('Failed to update water goal.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <LoadingSkeleton count={3} height="h-28" />
      </div>
    );
  }

  const glasses = waterData?.glasses || 0;
  const goal = waterData?.daily_goal || 8;
  const percentage = Math.min(100, Math.round((glasses / goal) * 100));

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hydration Tracker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Persisted in MongoDB: log each glass to sustain cellular energy and cognitive performance.
          </p>
        </div>
        <button
          onClick={() => setShowGoalModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
        >
          <Target className="w-4 h-4 text-sky-500" />
          Edit Goal ({goal})
        </button>
      </div>

      {/* Main Hydration Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle Water Shimmer Background */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-sky-500/10 dark:bg-sky-500/15 transition-all duration-700 ease-out pointer-events-none"
          style={{ height: `${percentage}%` }}
        />

        <div className="relative z-10 w-full flex flex-col items-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-500 shadow-sm">
            <Droplets className="w-8 h-8 animate-bounce" />
          </div>

          <div>
            <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              {glasses}
            </span>
            <span className="text-2xl sm:text-3xl text-slate-400 font-bold ml-2">/ {goal}</span>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
              glasses completed today (~{(glasses * 250).toLocaleString()} ml)
            </p>
          </div>

          {/* Visual Glass Grid */}
          <div className="flex flex-wrap justify-center gap-2 max-w-md py-2">
            {Array.from({ length: goal }).map((_, idx) => (
              <div
                key={idx}
                className={`w-8 h-10 rounded-lg flex items-center justify-center transition-all ${
                  idx < glasses
                    ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/30 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <Droplets className="w-4 h-4" />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => changeGlasses(-1)}
              disabled={glasses === 0 || updating}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
              title="Remove glass"
            >
              <Minus className="w-5 h-5" />
            </button>

            <button
              onClick={() => changeGlasses(1)}
              disabled={updating}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all active:scale-98"
            >
              <Plus className="w-5 h-5" />
              Add Glass (+250ml)
            </button>

            <button
              onClick={() => changeGlasses(-glasses)}
              disabled={glasses === 0 || updating}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
              title="Reset today's water"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Status Note */}
          <div className="pt-4 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            {percentage >= 100 ? (
              <>
                <Award className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Target Achieved! Optimal hydration sustained.
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>Drink regularly throughout the day for steady mental clarity.</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Water Goal</h3>
            <form onSubmit={handleUpdateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Glasses per Day
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  required
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Standard recommended intake is 8 glasses (approx. 2 liters).
                </span>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-md"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
