import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  AlertCircle,
  Edit2,
} from 'lucide-react';
import { routineService } from '../services/lifestyleServices';
import { RoutineItem } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const RoutinePage: React.FC = () => {
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RoutineItem | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Morning');
  const [time, setTime] = useState('08:00');
  const [priority, setPriority] = useState<RoutineItem['priority']>('Medium');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchRoutine = async () => {
    try {
      const res = await routineService.getRoutine();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch {
      showToast('Unable to load routine items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutine();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('Morning');
    setTime('08:00');
    setPriority('Medium');
    setShowModal(true);
  };

  const openEdit = (item: RoutineItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setTime(item.time);
    setPriority(item.priority);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time) return;

    setSubmitting(true);
    if (editingItem) {
      const res = await routineService.updateRoutine(editingItem._id, {
        title: title.trim(),
        category,
        time,
        priority,
      });
      if (res.success && res.data) {
        setItems(prev => prev.map(i => (i._id === editingItem._id ? res.data! : i)).sort((a, b) => a.time.localeCompare(b.time)));
        showToast('Routine item updated.', 'success');
        setShowModal(false);
      } else {
        showToast('Failed to update routine item.', 'error');
      }
    } else {
      const res = await routineService.createRoutine({
        title: title.trim(),
        category,
        time,
        priority,
      });
      if (res.success && res.data) {
        setItems(prev => [...prev, res.data!].sort((a, b) => a.time.localeCompare(b.time)));
        showToast('Routine step added.', 'success');
        setShowModal(false);
      } else {
        showToast('Failed to save routine step.', 'error');
      }
    }
    setSubmitting(false);
  };

  const handleToggle = async (item: RoutineItem) => {
    const newStatus = !item.completed;
    setItems(prev => prev.map(i => (i._id === item._id ? { ...i, completed: newStatus } : i)));

    const res = await routineService.updateRoutine(item._id, { completed: newStatus });
    if (res.success) {
      showToast(newStatus ? 'Completed routine step!' : 'Routine step reset.', 'success');
    } else {
      setItems(prev => prev.map(i => (i._id === item._id ? { ...i, completed: item.completed } : i)));
      showToast('Unable to update status.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await routineService.deleteRoutine(id);
    if (res.success) {
      setItems(prev => prev.filter(i => i._id !== id));
      showToast('Routine step removed.', 'success');
    } else {
      showToast('Unable to remove item.', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Daily Routine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build a consistent circadian rhythm and predictable daily flow.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Routine Step
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-16" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No routine steps scheduled"
          description="Design your daily morning, midday, and evening ritual to cultivate consistency."
          actionText="Add Routine Step"
          onAction={openAdd}
        />
      ) : (
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-6 pl-4 sm:pl-6 space-y-4">
          {items.map(item => (
            <div
              key={item._id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                item.completed
                  ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => handleToggle(item)}
                  className="text-slate-400 hover:text-sky-500 transition-colors shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200/50 dark:border-sky-800/40">
                      {item.time}
                    </span>
                    <h4
                      className={`text-sm font-semibold ${
                        item.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-300 dark:text-slate-700">•</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
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
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit item"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingItem ? 'Edit Routine Step' : 'New Routine Step'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10m Sunlight & Breathwork"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category / Block
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning, Work, Evening, Wellness"
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
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Step'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
