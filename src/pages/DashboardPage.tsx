import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Droplets,
  Moon,
  Activity,
  Sparkles,
  CalendarDays,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Circle,
  Award,
  Zap,
} from 'lucide-react';
import { dashboardService, waterService, routineService } from '../services/lifestyleServices';
import { DashboardData, RoutineItem } from '../types';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [todayRoutine, setTodayRoutine] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingWater, setAddingWater] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const loadDashboardData = async () => {
    try {
      const [dashRes, routineRes] = await Promise.all([
        dashboardService.getDashboard(),
        routineService.getRoutine(new Date().toISOString().split('T')[0]),
      ]);

      if (dashRes.success && dashRes.data) {
        setData(dashRes.data);
      }
      if (routineRes.success && routineRes.data) {
        setTodayRoutine(routineRes.data);
      }
    } catch (err) {
      showToast('Unable to load dashboard data from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickAddWater = async () => {
    if (!data) return;
    setAddingWater(true);
    const newGlasses = data.water_current + 1;
    const res = await waterService.updateWater(newGlasses, data.water_goal);
    setAddingWater(false);

    if (res.success && res.data) {
      showToast('Hydration logged! +1 glass saved to database.', 'success');
      loadDashboardData();
    } else {
      showToast('Failed to update water intake.', 'error');
    }
  };

  const toggleRoutineItem = async (item: RoutineItem) => {
    const updated = await routineService.updateRoutine(item._id, { completed: !item.completed });
    if (updated.success) {
      setTodayRoutine(prev =>
        prev.map(r => (r._id === item._id ? { ...r, completed: !item.completed } : r))
      );
      loadDashboardData();
      showToast(item.completed ? 'Marked incomplete' : 'Routine step completed!', 'success');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Could not retrieve dashboard data.</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const score = data.lifestyle_score || 0;
  const breakdown = data.score_breakdown || {
    productivity: 0,
    fitness: 0,
    hydration: 0,
    sleep: 0,
    habits: 0,
    goals: 0,
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner & Lifestyle Progress Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Active Session
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Explorer'}!
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              {user?.lifestyle_goal || 'Stay consistent and build steady momentum across your daily routine, hydration, and deep work.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-800">
            <div>
              <p className="text-xs text-slate-400">Tasks Today</p>
              <p className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                {data.tasks_completed} / {data.tasks_total}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Hydration</p>
              <p className="text-lg sm:text-xl font-extrabold text-sky-400 mt-0.5">
                {data.water_current} / {data.water_goal} <span className="text-xs font-normal">gl</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Routine</p>
              <p className="text-lg sm:text-xl font-extrabold text-indigo-300 mt-0.5">
                {data.routine_completed} / {data.routine_total}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic 100-Point Lifestyle Progress Score */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Lifestyle Progress Score
            </h3>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Dynamic 100 pt</span>
          </div>

          <div className="my-5 flex items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-sky-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${score}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{score}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">/ 100</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Productivity (max 20)</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{breakdown.productivity} pt</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Fitness (max 20)</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{breakdown.fitness} pt</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Hydration (max 15)</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{breakdown.hydration} pt</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Sleep (max 15)</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{breakdown.sleep} pt</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Habits & Goals (max 30)</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{breakdown.habits + breakdown.goals} pt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Dynamic Metric Cards (Real DB values) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Tasks */}
        <Link
          to="/tasks"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-400 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tasks</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {data.tasks_completed} / {data.tasks_total}
          </p>
        </Link>

        {/* Water */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                <Droplets className="w-4 h-4" />
              </div>
              <button
                onClick={handleQuickAddWater}
                disabled={addingWater}
                className="p-1 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors"
                title="Quick Add 1 Glass"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Water</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {data.water_current} / {data.water_goal}
            </p>
          </div>
        </div>

        {/* Sleep */}
        <Link
          to="/sleep"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Moon className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sleep</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {data.sleep_duration}
          </p>
        </Link>

        {/* Activity */}
        <Link
          to="/fitness"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Activity</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {data.activity_minutes} <span className="text-xs font-normal">min</span>
          </p>
        </Link>

        {/* Habits */}
        <Link
          to="/habits"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Habits</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {data.habit_completion}
          </p>
        </Link>

        {/* Daily Routine */}
        <Link
          to="/routine"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-400 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <CalendarDays className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Routine</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {data.routine_completed} / {data.routine_total}
          </p>
        </Link>
      </div>

      {/* Routine & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Routine Items */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Today's Routine</h3>
            </div>
            <Link
              to="/routine"
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              Manage Routine <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {todayRoutine.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No routine items scheduled for today yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {todayRoutine.map(item => (
                <div
                  key={item._id}
                  onClick={() => toggleRoutineItem(item)}
                  className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          item.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {item.time} • {item.category}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.priority === 'High'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        : item.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launch Cards */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-500" />
            Quick Access
          </h3>

          <div className="space-y-2.5">
            <Link
              to="/routine"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 hover:border-indigo-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Daily Routine Rituals</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Check off daily agenda</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-indigo-500" />
            </Link>

            <Link
              to="/water"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/50 dark:border-cyan-800/40 hover:border-cyan-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Hydration Station</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Track & set daily goal</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-cyan-500" />
            </Link>

            <Link
              to="/reports"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">View Analytics</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Weekly & monthly trends</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
