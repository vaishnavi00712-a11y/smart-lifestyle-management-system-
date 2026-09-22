import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Coffee,
  Sun,
  Moon as MoonIcon,
  Cookie,
  Flame,
  Calendar,
} from 'lucide-react';
import { nutritionService } from '../services/lifestyleServices';
import { Meal } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const NutritionPage: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [mealType, setMealType] = useState<Meal['meal_type']>('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('1 serving');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchMeals = async () => {
    try {
      const res = await nutritionService.getMeals();
      if (res.success && res.data) {
        setMeals(res.data);
      }
    } catch {
      showToast('Unable to load nutrition records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    setSubmitting(true);
    const res = await nutritionService.createMeal({
      meal_type: mealType,
      food_name: foodName.trim(),
      quantity: quantity.trim(),
      calories: calories ? Number(calories) : undefined,
      notes: notes.trim(),
      date,
    });
    setSubmitting(false);

    if (res.success && res.data) {
      setMeals(prev => [res.data!, ...prev]);
      setShowModal(false);
      setFoodName('');
      setNotes('');
      showToast('Meal logged to database.', 'success');
    } else {
      showToast('Failed to log meal.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await nutritionService.deleteMeal(id);
    if (res.success) {
      setMeals(prev => prev.filter(m => m._id !== id));
      showToast('Meal removed.', 'success');
    } else {
      showToast('Failed to delete meal.', 'error');
    }
  };

  const getMealIcon = (type: Meal['meal_type']) => {
    switch (type) {
      case 'Breakfast':
        return <Coffee className="w-4 h-4 text-amber-500" />;
      case 'Lunch':
        return <Sun className="w-4 h-4 text-orange-500" />;
      case 'Dinner':
        return <MoonIcon className="w-4 h-4 text-indigo-500" />;
      case 'Snack':
        return <Cookie className="w-4 h-4 text-emerald-500" />;
    }
  };

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Nutrition & Meals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log breakfast, lunch, dinner, and wholesome snacks.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Meal
        </button>
      </div>

      {/* Summary Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Recorded Intake</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalCalories} kcal</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Meals Logged</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">{meals.length}</p>
        </div>
      </div>

      {/* Meal Items */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-20" />
      ) : meals.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No meals logged"
          description="Keep a mindful record of what nourishes your body and brain."
          actionText="Log First Meal"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {meals.map(meal => (
            <div
              key={meal._id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0">
                  {getMealIcon(meal.meal_type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {meal.meal_type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{meal.food_name}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>{meal.quantity}</span>
                    {meal.calories && (
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {meal.calories} kcal
                      </span>
                    )}
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {meal.date}
                    </span>
                  </div>
                  {meal.notes && <p className="text-xs text-slate-400 mt-1 italic">"{meal.notes}"</p>}
                </div>
              </div>

              <button
                onClick={() => handleDelete(meal._id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Delete meal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Meal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Meal</h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meal Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as Meal['meal_type'][]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMealType(t)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                        mealType === t
                          ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Food Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grilled Chicken Salad with Olive Oil"
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Portion / Quantity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 bowl, 200g"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Calories
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 450"
                    value={calories}
                    onChange={e => setCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Low sodium, fresh greens"
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
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
