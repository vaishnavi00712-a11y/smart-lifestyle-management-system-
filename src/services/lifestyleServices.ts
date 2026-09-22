import { api, ApiResponse } from './api';
import {
  Task,
  RoutineItem,
  Activity,
  Meal,
  WaterData,
  SleepEntry,
  Habit,
  Goal,
  FocusSession,
  DashboardData,
  WeeklyReportData,
  UserSettings,
  User,
} from '../types';

export const taskService = {
  getTasks(): Promise<ApiResponse<Task[]>> {
    return api.get<Task[]>('/tasks');
  },
  getTaskById(id: string): Promise<ApiResponse<Task>> {
    return api.get<Task>(`/tasks/${id}`);
  },
  createTask(payload: Partial<Task>): Promise<ApiResponse<Task>> {
    return api.post<Task>('/tasks', payload);
  },
  updateTask(id: string, payload: Partial<Task>): Promise<ApiResponse<Task>> {
    return api.put<Task>(`/tasks/${id}`, payload);
  },
  deleteTask(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/tasks/${id}`);
  },
};

export const routineService = {
  getRoutine(date?: string): Promise<ApiResponse<RoutineItem[]>> {
    return api.get<RoutineItem[]>(`/routine${date ? `?date=${date}` : ''}`);
  },
  createRoutine(payload: Partial<RoutineItem>): Promise<ApiResponse<RoutineItem>> {
    return api.post<RoutineItem>('/routine', payload);
  },
  updateRoutine(id: string, payload: Partial<RoutineItem>): Promise<ApiResponse<RoutineItem>> {
    return api.put<RoutineItem>(`/routine/${id}`, payload);
  },
  deleteRoutine(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/routine/${id}`);
  },
};

export const fitnessService = {
  getActivities(): Promise<ApiResponse<Activity[]>> {
    return api.get<Activity[]>('/activities');
  },
  createActivity(payload: Partial<Activity>): Promise<ApiResponse<Activity>> {
    return api.post<Activity>('/activities', payload);
  },
  updateActivity(id: string, payload: Partial<Activity>): Promise<ApiResponse<Activity>> {
    return api.put<Activity>(`/activities/${id}`, payload);
  },
  deleteActivity(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/activities/${id}`);
  },
};

export const nutritionService = {
  getMeals(date?: string): Promise<ApiResponse<Meal[]>> {
    return api.get<Meal[]>(`/meals${date ? `?date=${date}` : ''}`);
  },
  createMeal(payload: Partial<Meal>): Promise<ApiResponse<Meal>> {
    return api.post<Meal>('/meals', payload);
  },
  updateMeal(id: string, payload: Partial<Meal>): Promise<ApiResponse<Meal>> {
    return api.put<Meal>(`/meals/${id}`, payload);
  },
  deleteMeal(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/meals/${id}`);
  },
};

export const waterService = {
  getTodayWater(date?: string): Promise<ApiResponse<WaterData>> {
    return api.get<WaterData>(`/water/today${date ? `?date=${date}` : ''}`);
  },
  updateWater(glasses: number, daily_goal?: number, date?: string): Promise<ApiResponse<WaterData>> {
    return api.post<WaterData>('/water', { glasses, daily_goal, date });
  },
  updateGoal(daily_goal: number): Promise<ApiResponse<WaterData>> {
    return api.put<WaterData>('/water', { daily_goal });
  },
};

export const sleepService = {
  getSleep(): Promise<ApiResponse<SleepEntry[]>> {
    return api.get<SleepEntry[]>('/sleep');
  },
  createSleep(payload: Partial<SleepEntry>): Promise<ApiResponse<SleepEntry>> {
    return api.post<SleepEntry>('/sleep', payload);
  },
  updateSleep(id: string, payload: Partial<SleepEntry>): Promise<ApiResponse<SleepEntry>> {
    return api.put<SleepEntry>(`/sleep/${id}`, payload);
  },
  deleteSleep(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/sleep/${id}`);
  },
};

export const habitService = {
  getHabits(): Promise<ApiResponse<Habit[]>> {
    return api.get<Habit[]>('/habits');
  },
  createHabit(payload: { name: string; category: string }): Promise<ApiResponse<Habit>> {
    return api.post<Habit>('/habits', payload);
  },
  toggleComplete(id: string, completed?: boolean, date?: string): Promise<ApiResponse<any>> {
    return api.post(`/habits/${id}/complete`, { completed, date });
  },
  toggleHabitCompletion(id: string, completed?: boolean, date?: string): Promise<ApiResponse<Habit>> {
    return api.post<Habit>(`/habits/${id}/complete`, { completed, date });
  },
  deleteHabit(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/habits/${id}`);
  },
};

export const goalService = {
  getGoals(): Promise<ApiResponse<Goal[]>> {
    return api.get<Goal[]>('/goals');
  },
  createGoal(payload: Partial<Goal>): Promise<ApiResponse<Goal>> {
    return api.post<Goal>('/goals', payload);
  },
  updateGoal(id: string, payload: Partial<Goal>): Promise<ApiResponse<Goal>> {
    return api.put<Goal>(`/goals/${id}`, payload);
  },
  deleteGoal(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/goals/${id}`);
  },
};

export const productivityService = {
  getFocusSessions(): Promise<ApiResponse<{
    sessions: FocusSession[];
    todaySessionsCount: number;
    todayMinutes: number;
    weeklyMinutes: number;
    totalSessionsCount: number;
  }>> {
    return api.get('/focus-sessions');
  },
  getSessions(): Promise<ApiResponse<FocusSession[]>> {
    return api.get<FocusSession[]>('/focus-sessions');
  },
  getStats(): Promise<ApiResponse<any>> {
    return api.get('/productivity/stats');
  },
  recordSession(duration: number, tag?: string): Promise<ApiResponse<FocusSession>> {
    return api.post<FocusSession>('/focus-sessions', { duration, tag });
  },
  logSession(duration: number, status?: string): Promise<ApiResponse<FocusSession>> {
    return api.post<FocusSession>('/focus-sessions', { duration, status });
  },
};

export const dashboardService = {
  getDashboard(): Promise<ApiResponse<DashboardData>> {
    return api.get<DashboardData>('/dashboard');
  },
};

export const reportService = {
  getWeekly(): Promise<ApiResponse<WeeklyReportData>> {
    return api.get<WeeklyReportData>('/reports/weekly');
  },
  getMonthly(): Promise<ApiResponse<{ hasData: boolean; weeks: any[] }>> {
    return api.get('/reports/monthly');
  },
  getWeeklyReport(): Promise<ApiResponse<any>> {
    return api.get('/reports/weekly');
  },
  getMonthlyReport(): Promise<ApiResponse<any>> {
    return api.get('/reports/monthly');
  },
};

export const reportsService = reportService;

export const userService = {
  getProfile(): Promise<ApiResponse<User>> {
    return api.get<User>('/users/me');
  },
  updateProfile(payload: Partial<User>): Promise<ApiResponse<User>> {
    return api.put<User>('/users/me', payload);
  },
};

export const settingsService = {
  getSettings(): Promise<ApiResponse<UserSettings>> {
    return api.get<UserSettings>('/settings');
  },
  updateSettings(payload: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    return api.put<UserSettings>('/settings', payload);
  },
};
