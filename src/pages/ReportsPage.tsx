import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  CheckSquare,
  Timer,
  Moon,
  Activity,
  Droplets,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { reportsService } from '../services/lifestyleServices';
import { WeeklyReport } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'weekly' | 'monthly'>('weekly');
  const { showToast } = useToast();

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res =
        range === 'weekly'
          ? await reportsService.getWeeklyReport()
          : await reportsService.getMonthlyReport();

      if (res.success && res.data) {
        setReport(res.data);
      }
    } catch {
      showToast('Unable to load analytical reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [range]);

  if (loading) {
    return (
      <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
        <LoadingSkeleton count={3} height="h-64" />
      </div>
    );
  }

  // Check if database has meaningful tracking records
  const hasData =
    report &&
    ((report.tasks_by_day && report.tasks_by_day.some(d => d.completed > 0)) ||
      (report.sleep_by_day && report.sleep_by_day.some(d => d.hours > 0)) ||
      (report.water_by_day && report.water_by_day.some(d => d.glasses > 0)) ||
      (report.activity_by_day && report.activity_by_day.some(d => d.minutes > 0)));

  if (!hasData) {
    return (
      <div className="p-8 sm:p-16 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analytical Reports</h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Start tracking your lifestyle to see your progress here.
        </p>
      </div>
    );
  }

  // Tasks report
  const taskData = report.tasks_by_day.map((t) => ({
    date: t.date.slice(5),
    completed: t.completed,
    total: t.total,
  }));

  // Combine sleep & activity
  const wellnessData = report.sleep_by_day.map((s, idx) => ({
    date: s.date.slice(5),
    sleep_hours: s.hours,
    activity_mins: report.activity_by_day[idx]?.minutes || 0,
  }));

  // Water data
  const waterData = report.water_by_day.map(w => ({
    date: w.date.slice(5),
    glasses: w.glasses,
  }));

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Lifestyle Analytics & Progress Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real data-driven insights aggregated from your personal database history.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setRange('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              range === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setRange('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              range === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Chart 1: Tasks Completion */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-sky-500" />
            Daily Tasks Completed vs. Total
          </h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="completed" name="Completed" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" name="Total Tasks" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Sleep & Activity */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-500" />
            Sleep Duration (Hours) vs Physical Activity (Mins)
          </h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wellnessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line yAxisId="left" type="monotone" dataKey="sleep_hours" name="Sleep (Hours)" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="activity_mins" name="Active (Minutes)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Hydration Consistency */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-500" />
            Hydration Consistency (Daily Glasses)
          </h3>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="glasses" name="Glasses" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
