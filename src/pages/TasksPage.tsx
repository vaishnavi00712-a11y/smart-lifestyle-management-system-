import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Filter,
  CheckCircle2,
  Circle,
  Tag,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { taskService } from '../services/lifestyleServices';
import { Task } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Task['category']>('Personal');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await taskService.getTasks();
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch {
      showToast('Unable to load tasks from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    const res = await taskService.createTask({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      due_date: dueDate,
    });
    setSubmitting(false);

    if (res.success && res.data) {
      setTasks(prev => [res.data!, ...prev]);
      setTitle('');
      setDescription('');
      setShowAddModal(false);
      showToast('Task added successfully.', 'success');
    } else {
      showToast(res.message || 'Unable to save your task. Please try again.', 'error');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const updatedStatus = !task.completed;
    // Optimistic UI update
    setTasks(prev =>
      prev.map(t => (t._id === task._id ? { ...t, completed: updatedStatus } : t))
    );

    const res = await taskService.updateTask(task._id, { completed: updatedStatus });
    if (res.success) {
      showToast(updatedStatus ? 'Task completed!' : 'Task marked active.', 'success');
    } else {
      // Revert if error
      setTasks(prev =>
        prev.map(t => (t._id === task._id ? { ...t, completed: task.completed } : t))
      );
      showToast('Unable to update task.', 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    const res = await taskService.deleteTask(id);
    if (res.success) {
      setTasks(prev => prev.filter(t => t._id !== id));
      showToast('Task deleted successfully.', 'success');
    } else {
      showToast('Unable to delete task.', 'error');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && t.priority !== selectedPriority) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Task Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize, prioritize, and achieve your daily objectives.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 min-w-[200px]"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Category:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Categories</option>
            <option value="Study">Study</option>
            <option value="Work">Work</option>
            <option value="Fitness">Fitness</option>
            <option value="Personal">Personal</option>
            <option value="Health">Health</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Priority:</span>
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-20" />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create your first task to organize your day."
          actionText="Add a Task"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <div
              key={task._id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                task.completed
                  ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="mt-0.5 text-slate-400 hover:text-sky-500 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      task.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {task.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        task.priority === 'High'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          : task.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    {task.due_date && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {task.due_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteTask(task._id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete data model integration"
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
                  placeholder="Additional details or notes..."
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
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                  </select>
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
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
