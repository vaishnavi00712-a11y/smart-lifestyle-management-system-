export interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  lifestyle_goal?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  _id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'Study' | 'Work' | 'Fitness' | 'Personal' | 'Health';
  priority: 'Low' | 'Medium' | 'High';
  due_date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineItem {
  _id: string;
  user_id: string;
  title: string;
  category: string;
  time: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  date: string;
  created_at: string;
}

export interface Activity {
  _id: string;
  user_id: string;
  activity_type: string;
  duration: number; // minutes
  steps?: number;
  calories?: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface Meal {
  _id: string;
  user_id: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  food_name: string;
  quantity: string;
  calories?: number;
  notes?: string;
  date: string;
  created_at: string;
}

export interface WaterData {
  _id: string;
  user_id: string;
  glasses: number;
  daily_goal: number;
  date: string;
  updated_at: string;
}

export interface SleepEntry {
  _id: string;
  user_id: string;
  bedtime: string;
  wake_time: string;
  duration: number; // minutes
  quality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  date: string;
  notes?: string;
  created_at: string;
}

export interface Habit {
  _id: string;
  user_id: string;
  name: string;
  category: string;
  created_at: string;
  completedToday?: boolean;
  currentStreak?: number;
  longestStreak?: number;
  current_streak?: number;
  longest_streak?: number;
  totalCompletions?: number;
  completed_dates?: string[];
}

export interface Goal {
  _id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  target_date: string;
  progress: number; // 0 to 100
  status: 'Not Started' | 'In Progress' | 'Completed';
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  _id: string;
  user_id: string;
  duration: number;
  completed?: boolean;
  status?: string;
  completed_at?: string;
  date: string;
  tag?: string;
  created_at: string;
}

export interface ProductivityStats {
  today_minutes: number;
  today_sessions: number;
  weekly_minutes: number;
  total_sessions: number;
}

export interface ScoreBreakdown {
  productivity: number; // max 20
  fitness: number;      // max 20
  hydration: number;    // max 15
  sleep: number;        // max 15
  habits: number;       // max 15
  goals: number;        // max 15
}

export interface DashboardData {
  tasks_completed: number;
  tasks_total: number;
  water_current: number;
  water_goal: number;
  sleep_duration: string;
  sleep_minutes: number;
  activity_minutes: number;
  habit_completion: string;
  habit_completed_count: number;
  habits_total_count: number;
  focus_minutes: number;
  routine_completed: number;
  routine_total: number;
  lifestyle_score: number;
  score_breakdown: ScoreBreakdown;
}

export interface DayTaskReport {
  date: string;
  completed: number;
  total: number;
}
export interface DayFocusReport {
  date: string;
  minutes: number;
}
export interface DaySleepReport {
  date: string;
  hours: number;
}
export interface DayWaterReport {
  date: string;
  glasses: number;
}
export interface DayActivityReport {
  date: string;
  minutes: number;
}

export interface WeeklyReport {
  tasks_by_day: DayTaskReport[];
  focus_by_day: DayFocusReport[];
  sleep_by_day: DaySleepReport[];
  water_by_day: DayWaterReport[];
  activity_by_day: DayActivityReport[];
}

export interface DayReport {
  date: string;
  day: string;
  tasks: number;
  water: number;
  sleepHours: number;
  activityMins: number;
  focusMins: number;
}

export interface WeeklyReportData {
  hasData: boolean;
  days: DayReport[];
  summary: {
    totalTasksCompleted: number;
    totalActivityMinutes: number;
    totalFocusMinutes: number;
    avgSleepHours: number;
  };
}

export interface UserSettings {
  _id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  water_goal?: number;
  daily_water_goal?: number;
  pomodoro_focus?: number;
  pomodoro_break?: number;
  notifications_enabled?: boolean;
  notifications?: {
    daily_reminders?: boolean;
    water_reminders?: boolean;
  };
  updated_at: string;
}
