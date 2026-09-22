import { ApiResponse } from './api';
import {
  User,
  Task,
  RoutineItem,
  Activity,
  Meal,
  WaterData,
  SleepEntry,
  Habit,
  Goal,
  DashboardData,
  WeeklyReport,
  UserSettings,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'ls_app_users',
  CURRENT_USER: 'ls_app_current_user',
  TASKS: 'ls_app_tasks',
  ROUTINES: 'ls_app_routines',
  ACTIVITIES: 'ls_app_activities',
  MEALS: 'ls_app_meals',
  WATER: 'ls_app_water',
  SLEEP: 'ls_app_sleep',
  HABITS: 'ls_app_habits',
  GOALS: 'ls_app_goals',
  SETTINGS: 'ls_app_settings',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

// Seed initial data if first time
function ensureInitialSeed() {
  const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
  if (users.length === 0) {
    const defaultUser: User = {
      _id: 'local_user_1',
      name: 'Alex Rivera',
      email: 'alex@lifestyle.com',
      age: 26,
      lifestyle_goal: 'Healthy Sleep & Balanced Routine',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.USERS, [defaultUser]);
  }

  const routines = getItem<RoutineItem[]>(STORAGE_KEYS.ROUTINES, []);
  if (routines.length === 0) {
    const today = new Date().toISOString().slice(0, 10);
    setItem(STORAGE_KEYS.ROUTINES, [
      {
        _id: 'r_1',
        user_id: 'local_user_1',
        title: 'Morning Sunlight & 15m Walk',
        category: 'Morning',
        time: '07:30',
        priority: 'High',
        completed: true,
        date: today,
        created_at: new Date().toISOString(),
      },
      {
        _id: 'r_2',
        user_id: 'local_user_1',
        title: 'Drink 500ml Mineral Water',
        category: 'Morning',
        time: '08:00',
        priority: 'Medium',
        completed: true,
        date: today,
        created_at: new Date().toISOString(),
      },
      {
        _id: 'r_3',
        user_id: 'local_user_1',
        title: 'Deep Focused Work Session',
        category: 'Work',
        time: '10:00',
        priority: 'High',
        completed: false,
        date: today,
        created_at: new Date().toISOString(),
      },
      {
        _id: 'r_4',
        user_id: 'local_user_1',
        title: 'Evening Digital Wind Down',
        category: 'Night',
        time: '21:30',
        priority: 'Medium',
        completed: false,
        date: today,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS, []);
  if (tasks.length === 0) {
    const today = new Date().toISOString().slice(0, 10);
    setItem(STORAGE_KEYS.TASKS, [
      {
        _id: 't_1',
        user_id: 'local_user_1',
        title: 'Review weekly wellness goals',
        category: 'Health',
        priority: 'High',
        due_date: today,
        completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        _id: 't_2',
        user_id: 'local_user_1',
        title: 'Meal prep high-protein dinners for 3 days',
        category: 'Fitness',
        priority: 'Medium',
        due_date: today,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        _id: 't_3',
        user_id: 'local_user_1',
        title: 'Read 20 pages of Atomic Habits',
        category: 'Personal',
        priority: 'Low',
        due_date: today,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }

  const habits = getItem<Habit[]>(STORAGE_KEYS.HABITS, []);
  if (habits.length === 0) {
    const today = new Date().toISOString().slice(0, 10);
    setItem(STORAGE_KEYS.HABITS, [
      {
        _id: 'h_1',
        user_id: 'local_user_1',
        name: 'Drink 8 Glasses of Water',
        category: 'Health',
        completedToday: true,
        current_streak: 5,
        longest_streak: 12,
        completed_dates: [today],
        created_at: new Date().toISOString(),
      },
      {
        _id: 'h_2',
        user_id: 'local_user_1',
        name: '30 Minutes Outdoor Walk',
        category: 'Fitness',
        completedToday: true,
        current_streak: 3,
        longest_streak: 9,
        completed_dates: [today],
        created_at: new Date().toISOString(),
      },
    ]);
  }

  const goals = getItem<Goal[]>(STORAGE_KEYS.GOALS, []);
  if (goals.length === 0) {
    setItem(STORAGE_KEYS.GOALS, [
      {
        _id: 'g_1',
        user_id: 'local_user_1',
        title: 'Reach 8 Hours of Consistent Sleep',
        description: 'Establish wind-down routine by 10:30 PM',
        category: 'Health',
        target_date: '2026-12-31',
        progress: 80,
        status: 'In Progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        _id: 'g_2',
        user_id: 'local_user_1',
        title: 'Walk 10,000 steps daily',
        description: 'Track daily steps and outdoor activity',
        category: 'Fitness',
        target_date: '2026-12-31',
        progress: 65,
        status: 'In Progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }
}

ensureInitialSeed();

export class LocalFallbackEngine {
  public static handleRequest<T>(method: string, endpoint: string, body?: any): ApiResponse<T> {
    ensureInitialSeed();
    const cleanEndpoint = endpoint.split('?')[0].replace(/^\/api/, '');
    const today = new Date().toISOString().slice(0, 10);

    // Auth endpoints
    if (cleanEndpoint === '/auth/login' && method === 'POST') {
      const email = body?.email || 'alex@lifestyle.com';
      const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
      let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = {
          _id: `user_${Date.now()}`,
          name: email.split('@')[0],
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setItem(STORAGE_KEYS.USERS, [...users, user]);
      }
      setItem(STORAGE_KEYS.CURRENT_USER, user);
      return {
        success: true,
        data: {
          token: `offline_token_${user._id}`,
          user,
        } as any,
      };
    }

    if (cleanEndpoint === '/auth/register' && method === 'POST') {
      const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
      const newUser: User = {
        _id: `user_${Date.now()}`,
        name: body?.name || 'New User',
        email: body?.email || 'user@example.com',
        age: body?.age,
        lifestyle_goal: body?.lifestyle_goal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setItem(STORAGE_KEYS.USERS, [...users, newUser]);
      setItem(STORAGE_KEYS.CURRENT_USER, newUser);
      return {
        success: true,
        data: {
          token: `offline_token_${newUser._id}`,
          user: newUser,
        } as any,
      };
    }

    if (cleanEndpoint === '/auth/me') {
      const current = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
      if (current) {
        return { success: true, data: current as any };
      }
      const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
      return { success: true, data: (users[0] || null) as any };
    }

    if (cleanEndpoint === '/auth/logout') {
      setItem(STORAGE_KEYS.CURRENT_USER, null);
      return { success: true, message: 'Logged out' } as any;
    }

    if (cleanEndpoint === '/users/me' && method === 'PUT') {
      const current = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
      if (current) {
        const updated = { ...current, ...body, updated_at: new Date().toISOString() };
        setItem(STORAGE_KEYS.CURRENT_USER, updated);
        const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
        setItem(STORAGE_KEYS.USERS, users.map(u => (u._id === updated._id ? updated : u)));
        return { success: true, data: updated as any };
      }
    }

    // Dashboard Overview
    if (cleanEndpoint === '/dashboard/overview') {
      const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS, []);
      const routines = getItem<RoutineItem[]>(STORAGE_KEYS.ROUTINES, []);
      const water = getItem<WaterData[]>(STORAGE_KEYS.WATER, []);
      const activities = getItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
      const sleep = getItem<SleepEntry[]>(STORAGE_KEYS.SLEEP, []);
      const habits = getItem<Habit[]>(STORAGE_KEYS.HABITS, []);

      const todayWater = water.find(w => w.date === today)?.glasses || 6;
      const todaySleepMinutes = sleep.find(s => s.date === today)?.duration || 450;
      const todayActivities = activities.filter(a => a.date === today);
      const todayActivityMins = todayActivities.reduce((acc, a) => acc + (a.duration || 0), 45);

      const tasksCompleted = tasks.filter(t => t.completed).length;
      const routineCompleted = routines.filter(r => r.completed).length;
      const habitsCompleted = habits.filter(h => h.completedToday).length;

      const score = Math.min(
        100,
        Math.round(
          (tasksCompleted > 0 ? 25 : 10) +
          (routineCompleted > 0 ? 25 : 10) +
          (todayWater >= 6 ? 25 : 15) +
          (todaySleepMinutes >= 420 ? 25 : 15)
        )
      );

      const overview: DashboardData = {
        lifestyle_score: score,
        score_breakdown: {
          productivity: Math.min(20, tasksCompleted * 7),
          fitness: Math.min(20, Math.round(todayActivityMins / 3)),
          hydration: Math.min(15, todayWater * 2),
          sleep: Math.min(15, Math.round(todaySleepMinutes / 30)),
          habits: Math.min(15, habitsCompleted * 5),
          goals: 12,
        },
        tasks_completed: tasksCompleted,
        tasks_total: tasks.length,
        routine_completed: routineCompleted,
        routine_total: routines.length,
        water_current: todayWater,
        water_goal: 8,
        sleep_duration: `${Math.floor(todaySleepMinutes / 60)}h ${todaySleepMinutes % 60}m`,
        sleep_minutes: todaySleepMinutes,
        activity_minutes: todayActivityMins,
        habit_completion: habits.length > 0 ? `${Math.round((habitsCompleted / habits.length) * 100)}%` : '100%',
        habit_completed_count: habitsCompleted,
        habits_total_count: habits.length,
        focus_minutes: 0,
      };

      return { success: true, data: overview as any };
    }

    // Tasks
    if (cleanEndpoint === '/tasks') {
      const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS, []);
      if (method === 'GET') {
        return { success: true, data: tasks as any };
      }
      if (method === 'POST') {
        const newTask: Task = {
          _id: `t_${Date.now()}`,
          user_id: 'local_user',
          title: body?.title || 'New Task',
          description: body?.description,
          category: body?.category || 'Personal',
          priority: body?.priority || 'Medium',
          due_date: body?.due_date || today,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setItem(STORAGE_KEYS.TASKS, [newTask, ...tasks]);
        return { success: true, data: newTask as any };
      }
    }

    if (cleanEndpoint.startsWith('/tasks/')) {
      const id = cleanEndpoint.replace('/tasks/', '');
      const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS, []);
      if (method === 'PUT') {
        const updated = tasks.map(t => (t._id === id ? { ...t, ...body, updated_at: new Date().toISOString() } : t));
        setItem(STORAGE_KEYS.TASKS, updated);
        const match = updated.find(t => t._id === id);
        return { success: true, data: match as any };
      }
      if (method === 'DELETE') {
        setItem(STORAGE_KEYS.TASKS, tasks.filter(t => t._id !== id));
        return { success: true } as any;
      }
    }

    // Routine
    if (cleanEndpoint === '/routine') {
      const routines = getItem<RoutineItem[]>(STORAGE_KEYS.ROUTINES, []);
      if (method === 'GET') {
        return { success: true, data: routines as any };
      }
      if (method === 'POST') {
        const newRoutine: RoutineItem = {
          _id: `r_${Date.now()}`,
          user_id: 'local_user',
          title: body?.title || 'New Routine Item',
          category: body?.category || 'General',
          time: body?.time || '09:00',
          priority: body?.priority || 'Medium',
          completed: false,
          date: body?.date || today,
          created_at: new Date().toISOString(),
        };
        setItem(STORAGE_KEYS.ROUTINES, [...routines, newRoutine]);
        return { success: true, data: newRoutine as any };
      }
    }

    if (cleanEndpoint.startsWith('/routine/')) {
      const id = cleanEndpoint.replace('/routine/', '');
      const routines = getItem<RoutineItem[]>(STORAGE_KEYS.ROUTINES, []);
      if (method === 'PUT') {
        const updated = routines.map(r => (r._id === id ? { ...r, ...body } : r));
        setItem(STORAGE_KEYS.ROUTINES, updated);
        return { success: true, data: updated.find(r => r._id === id) as any };
      }
      if (method === 'DELETE') {
        setItem(STORAGE_KEYS.ROUTINES, routines.filter(r => r._id !== id));
        return { success: true } as any;
      }
    }

    // Activities
    if (cleanEndpoint === '/activities') {
      const activities = getItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
      if (method === 'GET') {
        return { success: true, data: activities as any };
      }
      if (method === 'POST') {
        const newAct: Activity = {
          _id: `act_${Date.now()}`,
          user_id: 'local_user',
          activity_type: body?.activity_type || 'Workout',
          duration: Number(body?.duration) || 30,
          steps: Number(body?.steps) || 0,
          calories: Number(body?.calories) || 0,
          date: body?.date || today,
          notes: body?.notes,
          created_at: new Date().toISOString(),
        };
        setItem(STORAGE_KEYS.ACTIVITIES, [newAct, ...activities]);
        return { success: true, data: newAct as any };
      }
    }

    if (cleanEndpoint.startsWith('/activities/')) {
      const id = cleanEndpoint.replace('/activities/', '');
      const activities = getItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
      if (method === 'DELETE') {
        setItem(STORAGE_KEYS.ACTIVITIES, activities.filter(a => a._id !== id));
        return { success: true } as any;
      }
    }

    // Meals
    if (cleanEndpoint === '/meals') {
      const meals = getItem<Meal[]>(STORAGE_KEYS.MEALS, []);
      if (method === 'GET') {
        return { success: true, data: meals as any };
      }
      if (method === 'POST') {
        const newMeal: Meal = {
          _id: `m_${Date.now()}`,
          user_id: 'local_user',
          meal_type: body?.meal_type || 'Lunch',
          food_name: body?.food_name || 'Healthy Dish',
          quantity: body?.quantity || '1 serving',
          calories: Number(body?.calories) || 0,
          notes: body?.notes,
          date: body?.date || today,
          created_at: new Date().toISOString(),
        };
        setItem(STORAGE_KEYS.MEALS, [newMeal, ...meals]);
        return { success: true, data: newMeal as any };
      }
    }

    if (cleanEndpoint.startsWith('/meals/')) {
      const id = cleanEndpoint.replace('/meals/', '');
      const meals = getItem<Meal[]>(STORAGE_KEYS.MEALS, []);
      if (method === 'DELETE') {
        setItem(STORAGE_KEYS.MEALS, meals.filter(m => m._id !== id));
        return { success: true } as any;
      }
    }

    // Water
    if (cleanEndpoint === '/water') {
      const waterList = getItem<WaterData[]>(STORAGE_KEYS.WATER, []);
      if (method === 'GET') {
        const current = waterList.find(w => w.date === today) || {
          _id: 'w_today',
          user_id: 'local_user',
          glasses: 6,
          daily_goal: 8,
          date: today,
          updated_at: new Date().toISOString(),
        };
        return { success: true, data: current as any };
      }
      if (method === 'POST') {
        const glasses = Number(body?.glasses) || 1;
        const daily_goal = Number(body?.daily_goal || body?.goal) || 8;
        const filtered = waterList.filter(w => w.date !== today);
        const updated: WaterData = {
          _id: `w_${today}`,
          user_id: 'local_user',
          glasses,
          daily_goal,
          date: today,
          updated_at: new Date().toISOString(),
        };
        setItem(STORAGE_KEYS.WATER, [...filtered, updated]);
        return { success: true, data: updated as any };
      }
    }

    // Sleep
    if (cleanEndpoint === '/sleep') {
      const sleepList = getItem<SleepEntry[]>(STORAGE_KEYS.SLEEP, []);
      if (method === 'GET') {
        return { success: true, data: sleepList as any };
      }
      if (method === 'POST') {
        const durationMins = Number(body?.duration) || (Number(body?.hours) ? Number(body?.hours) * 60 : 450);
        const newSleep: SleepEntry = {
          _id: `s_${Date.now()}`,
          user_id: 'local_user',
          bedtime: body?.bedtime || '23:00',
          wake_time: body?.wake_time || '07:00',
          duration: durationMins,
          quality: body?.quality || 'Good',
          date: body?.date || today,
          notes: body?.notes,
          created_at: new Date().toISOString(),
        };
        setItem(STORAGE_KEYS.SLEEP, [newSleep, ...sleepList]);
        return { success: true, data: newSleep as any };
      }
    }

    // Habits
    if (cleanEndpoint === '/habits') {
      const habits = getItem<Habit[]>(STORAGE_KEYS.HABITS, []);
      if (method === 'GET') {
        return { success: true, data: habits as any };
      }
      if (method === 'POST') {
        const newHabit: Habit = {
          _id: `h_${Date.now()}`,
          user_id: 'local_user',
          name: body?.name || body?.title || 'New Habit',
          category: body?.category || 'Wellness',
          completedToday: false,
          current_streak: 1,
          longest_streak: 1,
          completed_dates: [],
          created_at: new Date().toISOString(),
        };
        setItem(STORAGE_KEYS.HABITS, [...habits, newHabit]);
        return { success: true, data: newHabit as any };
      }
    }

    if (cleanEndpoint.includes('/habits/') && cleanEndpoint.endsWith('/toggle')) {
      const id = cleanEndpoint.replace('/habits/', '').replace('/toggle', '');
      const habits = getItem<Habit[]>(STORAGE_KEYS.HABITS, []);
      const updated = habits.map(h => {
        if (h._id !== id) return h;
        const completed = !h.completedToday;
        const dates = h.completed_dates || [];
        const newDates = completed ? [...dates, today] : dates.filter(d => d !== today);
        return {
          ...h,
          completedToday: completed,
          current_streak: completed ? (h.current_streak || 0) + 1 : Math.max(0, (h.current_streak || 1) - 1),
          completed_dates: newDates,
        };
      });
      setItem(STORAGE_KEYS.HABITS, updated);
      return { success: true, data: updated.find(h => h._id === id) as any };
    }

    if (cleanEndpoint.startsWith('/habits/')) {
      const id = cleanEndpoint.replace('/habits/', '');
      const habits = getItem<Habit[]>(STORAGE_KEYS.HABITS, []);
      if (method === 'DELETE') {
        setItem(STORAGE_KEYS.HABITS, habits.filter(h => h._id !== id));
        return { success: true } as any;
      }
    }

    // Goals
    if (cleanEndpoint === '/goals') {
      const goals = getItem<Goal[]>(STORAGE_KEYS.GOALS, []);
      if (method === 'GET') {
        return { success: true, data: goals as any };
      }
      if (method === 'POST') {
        const newGoal: Goal = {
          _id: `g_${Date.now()}`,
          user_id: 'local_user',
          title: body?.title || 'New Goal',
          description: body?.description,
          category: body?.category || 'Personal',
          target_date: body?.target_date || '2026-12-31',
          progress: Number(body?.progress) || 0,
          status: body?.status || 'In Progress',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setItem(STORAGE_KEYS.GOALS, [...goals, newGoal]);
        return { success: true, data: newGoal as any };
      }
    }

    if (cleanEndpoint.startsWith('/goals/')) {
      const id = cleanEndpoint.replace('/goals/', '');
      const goals = getItem<Goal[]>(STORAGE_KEYS.GOALS, []);
      if (method === 'PUT') {
        const updated = goals.map(g => (g._id === id ? { ...g, ...body, updated_at: new Date().toISOString() } : g));
        setItem(STORAGE_KEYS.GOALS, updated);
        return { success: true, data: updated.find(g => g._id === id) as any };
      }
      if (method === 'DELETE') {
        setItem(STORAGE_KEYS.GOALS, goals.filter(g => g._id !== id));
        return { success: true } as any;
      }
    }

    // Reports
    if (cleanEndpoint === '/reports') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const report: WeeklyReport = {
        tasks_by_day: days.map((_d, i) => ({
          date: `2026-09-${16 + i}`,
          completed: 3 + (i % 3),
          total: 5,
        })),
        focus_by_day: days.map((_d, i) => ({
          date: `2026-09-${16 + i}`,
          minutes: 0,
        })),
        sleep_by_day: days.map((_d, i) => ({
          date: `2026-09-${16 + i}`,
          hours: 7 + ((i * 3) % 4) * 0.4,
        })),
        water_by_day: days.map((_d, i) => ({
          date: `2026-09-${16 + i}`,
          glasses: 6 + (i % 3),
        })),
        activity_by_day: days.map((_d, i) => ({
          date: `2026-09-${16 + i}`,
          minutes: 25 + i * 5,
        })),
      };
      return { success: true, data: report as any };
    }

    // Settings
    if (cleanEndpoint === '/settings') {
      const current = getItem<UserSettings>(STORAGE_KEYS.SETTINGS, {
        _id: 'settings_local',
        user_id: 'local_user_1',
        theme: 'system',
        daily_water_goal: 8,
        notifications: {
          daily_reminders: true,
          water_reminders: true,
        },
        updated_at: new Date().toISOString(),
      });
      if (method === 'GET') {
        return { success: true, data: current as any };
      }
      if (method === 'PUT') {
        const updated = { ...current, ...body, updated_at: new Date().toISOString() };
        setItem(STORAGE_KEYS.SETTINGS, updated);
        return { success: true, data: updated as any };
      }
    }

    return { success: true, data: {} as any };
  }
}
