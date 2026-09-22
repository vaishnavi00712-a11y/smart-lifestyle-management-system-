import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { MongoClient, Db } from 'mongodb';

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  password_hash: string;
  age?: number;
  lifestyle_goal?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskDoc {
  _id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'Study' | 'Work' | 'Fitness' | 'Personal' | 'Health';
  priority: 'Low' | 'Medium' | 'High';
  due_date?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineDoc {
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

export interface ActivityDoc {
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

export interface MealDoc {
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

export interface WaterDoc {
  _id: string;
  user_id: string;
  glasses: number;
  daily_goal: number;
  date: string;
  updated_at: string;
}

export interface SleepDoc {
  _id: string;
  user_id: string;
  bedtime: string;
  wake_time: string;
  duration: number; // minutes or hours
  quality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  date: string;
  notes?: string;
  created_at: string;
}

export interface HabitDoc {
  _id: string;
  user_id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface HabitLogDoc {
  _id: string;
  user_id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

export interface GoalDoc {
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

export interface FocusSessionDoc {
  _id: string;
  user_id: string;
  duration: number; // in minutes
  completed: boolean;
  date: string;
  tag?: string;
  created_at: string;
}

export interface UserSettingsDoc {
  _id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  water_goal: number;
  pomodoro_focus: number;
  pomodoro_break: number;
  notifications_enabled: boolean;
  updated_at: string;
}

interface DatabaseSchema {
  users: UserDoc[];
  tasks: TaskDoc[];
  routine: RoutineDoc[];
  activities: ActivityDoc[];
  meals: MealDoc[];
  water: WaterDoc[];
  sleep: SleepDoc[];
  habits: HabitDoc[];
  habit_logs: HabitLogDoc[];
  goals: GoalDoc[];
  focus_sessions: FocusSessionDoc[];
  settings: UserSettingsDoc[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'lifestyle_db.json');

class DatabaseManager {
  private data: DatabaseSchema = {
    users: [],
    tasks: [],
    routine: [],
    activities: [],
    meals: [],
    water: [],
    sleep: [],
    habits: [],
    habit_logs: [],
    goals: [],
    focus_sessions: [],
    settings: [],
  };

  private mongoClient: MongoClient | null = null;
  private mongoDb: Db | null = null;
  private isMongoConnected = false;

  constructor() {
    this.initLocalStore();
    this.initMongoOptional();
  }

  private initLocalStore() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...this.data, ...JSON.parse(raw) };
      } catch (err) {
        console.error('Failed to load local DB file, re-initializing seed data', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private async initMongoOptional() {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri && !mongoUri.includes('localhost:27017')) {
      try {
        this.mongoClient = new MongoClient(mongoUri);
        await this.mongoClient.connect();
        const dbName = process.env.DATABASE_NAME || 'smart_lifestyle_db';
        this.mongoDb = this.mongoClient.db(dbName);
        this.isMongoConnected = true;
        console.log(`Connected to external MongoDB database: ${dbName}`);
      } catch (err) {
        console.warn('MongoDB connection failed, continuing with durable persistent local store:', err);
        this.isMongoConnected = false;
      }
    }
  }

  private saveLocal() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to DB_FILE', err);
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('password123', salt);
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    const userA: UserDoc = {
      _id: 'user_alex_1',
      name: 'Alex Morgan',
      email: 'demo@lifestyle.com',
      password_hash: hash,
      age: 28,
      lifestyle_goal: 'Peak Productivity & Balanced Wellness',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: now,
      updated_at: now,
    };

    const userB: UserDoc = {
      _id: 'user_jordan_2',
      name: 'Jordan Lee',
      email: 'userb@lifestyle.com',
      password_hash: hash,
      age: 32,
      lifestyle_goal: 'Athletic Endurance & Mindfulness',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      created_at: now,
      updated_at: now,
    };

    this.data.users = [userA, userB];

    // User A tasks
    this.data.tasks = [
      {
        _id: 'task_1',
        user_id: userA._id,
        title: 'Review System Architecture Design',
        description: 'Ensure API middleware and database schema match specifications.',
        category: 'Work',
        priority: 'High',
        due_date: today,
        completed: true,
        created_at: now,
        updated_at: now,
      },
      {
        _id: 'task_2',
        user_id: userA._id,
        title: 'Complete 30-min HIIT cardio',
        description: 'Morning interval run with warm-up stretches.',
        category: 'Fitness',
        priority: 'Medium',
        due_date: today,
        completed: true,
        created_at: now,
        updated_at: now,
      },
      {
        _id: 'task_3',
        user_id: userA._id,
        title: 'Read 20 pages of Deep Work',
        description: 'Focus on time blocking and habit design chapter.',
        category: 'Personal',
        priority: 'Medium',
        due_date: today,
        completed: false,
        created_at: now,
        updated_at: now,
      },
      {
        _id: 'task_4',
        user_id: userA._id,
        title: 'Prepare healthy balanced dinner',
        description: 'Grilled salmon with asparagus and quinoa bowl.',
        category: 'Health',
        priority: 'Low',
        due_date: today,
        completed: false,
        created_at: now,
        updated_at: now,
      },
      // User B task
      {
        _id: 'task_b1',
        user_id: userB._id,
        title: 'Jordan Marathon Prep Running Plan',
        description: 'Long distance run (12km) at pace 5:10 min/km',
        category: 'Fitness',
        priority: 'High',
        due_date: today,
        completed: true,
        created_at: now,
        updated_at: now,
      }
    ];

    // Routine
    this.data.routine = [
      {
        _id: 'routine_1',
        user_id: userA._id,
        title: 'Morning Hydration & Sunlight',
        category: 'Health',
        time: '07:00',
        priority: 'High',
        completed: true,
        date: today,
        created_at: now,
      },
      {
        _id: 'routine_2',
        user_id: userA._id,
        title: 'Focused Sprint 1',
        category: 'Work',
        time: '09:00',
        priority: 'High',
        completed: true,
        date: today,
        created_at: now,
      },
      {
        _id: 'routine_3',
        user_id: userA._id,
        title: 'Nutritious Lunch & Walk',
        category: 'Health',
        time: '12:30',
        priority: 'Medium',
        completed: true,
        date: today,
        created_at: now,
      },
      {
        _id: 'routine_4',
        user_id: userA._id,
        title: 'Evening Digital Sunset & Wind Down',
        category: 'Personal',
        time: '21:30',
        priority: 'Medium',
        completed: false,
        date: today,
        created_at: now,
      }
    ];

    // Activities
    this.data.activities = [
      {
        _id: 'act_1',
        user_id: userA._id,
        activity_type: 'Running / Jogging',
        duration: 35,
        steps: 4200,
        calories: 340,
        date: today,
        notes: 'Felt energetic along the riverside trail',
        created_at: now,
      },
      {
        _id: 'act_2',
        user_id: userA._id,
        activity_type: 'Strength Training',
        duration: 40,
        steps: 1200,
        calories: 260,
        date: today,
        notes: 'Upper body push session',
        created_at: now,
      }
    ];

    // Meals
    this.data.meals = [
      {
        _id: 'meal_1',
        user_id: userA._id,
        meal_type: 'Breakfast',
        food_name: 'Avocado Toast & 2 Poached Eggs',
        quantity: '1 plate',
        calories: 420,
        notes: 'Sprinkled with chia seeds and chili flakes',
        date: today,
        created_at: now,
      },
      {
        _id: 'meal_2',
        user_id: userA._id,
        meal_type: 'Lunch',
        food_name: 'Mediterranean Quinoa Salad with Chicken',
        quantity: '1 large bowl',
        calories: 550,
        notes: 'Olive oil and lemon vinaigrette',
        date: today,
        created_at: now,
      }
    ];

    // Water
    this.data.water = [
      {
        _id: 'water_1',
        user_id: userA._id,
        glasses: 6,
        daily_goal: 8,
        date: today,
        updated_at: now,
      },
      {
        _id: 'water_b',
        user_id: userB._id,
        glasses: 3,
        daily_goal: 10,
        date: today,
        updated_at: now,
      }
    ];

    // Sleep
    this.data.sleep = [
      {
        _id: 'sleep_1',
        user_id: userA._id,
        bedtime: '22:45',
        wake_time: '06:30',
        duration: 465, // 7h 45m in minutes
        quality: 'Good',
        date: today,
        notes: 'Woke up refreshed with minimal interruptions',
        created_at: now,
      }
    ];

    // Habits
    const habit1Id = 'habit_1';
    const habit2Id = 'habit_2';
    const habit3Id = 'habit_3';

    this.data.habits = [
      {
        _id: habit1Id,
        user_id: userA._id,
        name: 'Morning Hydration (500ml)',
        category: 'Health',
        created_at: now,
      },
      {
        _id: habit2Id,
        user_id: userA._id,
        name: '30-Min Workout or Walk',
        category: 'Fitness',
        created_at: now,
      },
      {
        _id: habit3Id,
        user_id: userA._id,
        name: 'Daily 25m Focus Block',
        category: 'Productivity',
        created_at: now,
      }
    ];

    this.data.habit_logs = [
      { _id: 'hl_1', user_id: userA._id, habit_id: habit1Id, date: today, completed: true },
      { _id: 'hl_2', user_id: userA._id, habit_id: habit2Id, date: today, completed: true },
      { _id: 'hl_3', user_id: userA._id, habit_id: habit3Id, date: today, completed: false }
    ];

    // Goals
    this.data.goals = [
      {
        _id: 'goal_1',
        user_id: userA._id,
        title: 'Run 50km this month',
        description: 'Improve aerobic capacity and cardio health',
        category: 'Fitness',
        target_date: '2026-10-31',
        progress: 60,
        status: 'In Progress',
        created_at: now,
        updated_at: now,
      },
      {
        _id: 'goal_2',
        user_id: userA._id,
        title: 'Read 2 Books on Lifestyle Design',
        description: 'Atomic Habits and Why We Sleep',
        category: 'Personal',
        target_date: '2026-10-15',
        progress: 100,
        status: 'Completed',
        created_at: now,
        updated_at: now,
      },
      {
        _id: 'goal_3',
        user_id: userA._id,
        title: 'Maintain 8h sleep average for 14 days',
        description: 'Regulate circadian rhythm with fixed bedtime',
        category: 'Health',
        target_date: '2026-11-01',
        progress: 25,
        status: 'In Progress',
        created_at: now,
        updated_at: now,
      }
    ];

    // Focus Sessions
    this.data.focus_sessions = [
      {
        _id: 'fs_1',
        user_id: userA._id,
        duration: 25,
        completed: true,
        date: today,
        tag: 'Architecture & Coding',
        created_at: now,
      },
      {
        _id: 'fs_2',
        user_id: userA._id,
        duration: 25,
        completed: true,
        date: today,
        tag: 'API Integration',
        created_at: now,
      }
    ];

    // Settings
    this.data.settings = [
      {
        _id: 'set_1',
        user_id: userA._id,
        theme: 'light',
        water_goal: 8,
        pomodoro_focus: 25,
        pomodoro_break: 5,
        notifications_enabled: true,
        updated_at: now,
      }
    ];

    this.saveLocal();
  }

  // Generic helpers
  public generateId(prefix = 'doc'): string {
    return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
  }

  // Users collection
  public async findUserByEmail(email: string): Promise<UserDoc | null> {
    const cleanEmail = email.toLowerCase().trim();
    return this.data.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  public async findUserById(userId: string): Promise<UserDoc | null> {
    return this.data.users.find(u => u._id === userId) || null;
  }

  public async createUser(userData: Omit<UserDoc, '_id' | 'created_at' | 'updated_at'>): Promise<UserDoc> {
    const now = new Date().toISOString();
    const newUser: UserDoc = {
      _id: this.generateId('user'),
      ...userData,
      email: userData.email.toLowerCase().trim(),
      created_at: now,
      updated_at: now,
    };
    this.data.users.push(newUser);
    this.saveLocal();
    return newUser;
  }

  public async updateUser(userId: string, updates: Partial<UserDoc>): Promise<UserDoc | null> {
    const idx = this.data.users.findIndex(u => u._id === userId);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveLocal();
    return this.data.users[idx];
  }

  // Tasks
  public async getTasks(userId: string): Promise<TaskDoc[]> {
    return this.data.tasks.filter(t => t.user_id === userId);
  }

  public async createTask(task: Omit<TaskDoc, '_id' | 'created_at' | 'updated_at'>): Promise<TaskDoc> {
    const now = new Date().toISOString();
    const doc: TaskDoc = {
      _id: this.generateId('task'),
      ...task,
      created_at: now,
      updated_at: now,
    };
    this.data.tasks.unshift(doc);
    this.saveLocal();
    return doc;
  }

  public async getTaskById(taskId: string, userId: string): Promise<TaskDoc | null> {
    const task = this.data.tasks.find(t => t._id === taskId && t.user_id === userId);
    return task || null;
  }

  public async updateTask(taskId: string, userId: string, updates: Partial<TaskDoc>): Promise<TaskDoc | null> {
    const idx = this.data.tasks.findIndex(t => t._id === taskId && t.user_id === userId);
    if (idx === -1) return null;
    this.data.tasks[idx] = {
      ...this.data.tasks[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveLocal();
    return this.data.tasks[idx];
  }

  public async deleteTask(taskId: string, userId: string): Promise<boolean> {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(t => !(t._id === taskId && t.user_id === userId));
    const deleted = this.data.tasks.length < initialLen;
    if (deleted) this.saveLocal();
    return deleted;
  }

  // Routine
  public async getRoutine(userId: string, date?: string): Promise<RoutineDoc[]> {
    return this.data.routine.filter(r => {
      if (r.user_id !== userId) return false;
      if (date && r.date !== date) return false;
      return true;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }

  public async createRoutine(item: Omit<RoutineDoc, '_id' | 'created_at'>): Promise<RoutineDoc> {
    const doc: RoutineDoc = {
      _id: this.generateId('routine'),
      ...item,
      created_at: new Date().toISOString(),
    };
    this.data.routine.push(doc);
    this.saveLocal();
    return doc;
  }

  public async updateRoutine(id: string, userId: string, updates: Partial<RoutineDoc>): Promise<RoutineDoc | null> {
    const idx = this.data.routine.findIndex(r => r._id === id && r.user_id === userId);
    if (idx === -1) return null;
    this.data.routine[idx] = { ...this.data.routine[idx], ...updates };
    this.saveLocal();
    return this.data.routine[idx];
  }

  public async deleteRoutine(id: string, userId: string): Promise<boolean> {
    const initialLen = this.data.routine.length;
    this.data.routine = this.data.routine.filter(r => !(r._id === id && r.user_id === userId));
    const deleted = this.data.routine.length < initialLen;
    if (deleted) this.saveLocal();
    return deleted;
  }

  // Fitness / Activities
  public async getActivities(userId: string): Promise<ActivityDoc[]> {
    return this.data.activities.filter(a => a.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async createActivity(act: Omit<ActivityDoc, '_id' | 'created_at'>): Promise<ActivityDoc> {
    const doc: ActivityDoc = {
      _id: this.generateId('act'),
      ...act,
      created_at: new Date().toISOString(),
    };
    this.data.activities.unshift(doc);
    this.saveLocal();
    return doc;
  }

  public async updateActivity(id: string, userId: string, updates: Partial<ActivityDoc>): Promise<ActivityDoc | null> {
    const idx = this.data.activities.findIndex(a => a._id === id && a.user_id === userId);
    if (idx === -1) return null;
    this.data.activities[idx] = { ...this.data.activities[idx], ...updates };
    this.saveLocal();
    return this.data.activities[idx];
  }

  public async deleteActivity(id: string, userId: string): Promise<boolean> {
    const initialLen = this.data.activities.length;
    this.data.activities = this.data.activities.filter(a => !(a._id === id && a.user_id === userId));
    const deleted = this.data.activities.length < initialLen;
    if (deleted) this.saveLocal();
    return deleted;
  }

  // Nutrition / Meals
  public async getMeals(userId: string, date?: string): Promise<MealDoc[]> {
    return this.data.meals.filter(m => {
      if (m.user_id !== userId) return false;
      if (date && m.date !== date) return false;
      return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async createMeal(meal: Omit<MealDoc, '_id' | 'created_at'>): Promise<MealDoc> {
    const doc: MealDoc = {
      _id: this.generateId('meal'),
      ...meal,
      created_at: new Date().toISOString(),
    };
    this.data.meals.unshift(doc);
    this.saveLocal();
    return doc;
  }

  public async updateMeal(id: string, userId: string, updates: Partial<MealDoc>): Promise<MealDoc | null> {
    const idx = this.data.meals.findIndex(m => m._id === id && m.user_id === userId);
    if (idx === -1) return null;
    this.data.meals[idx] = { ...this.data.meals[idx], ...updates };
    this.saveLocal();
    return this.data.meals[idx];
  }

  public async deleteMeal(id: string, userId: string): Promise<boolean> {
    const initialLen = this.data.meals.length;
    this.data.meals = this.data.meals.filter(m => !(m._id === id && m.user_id === userId));
    const deleted = this.data.meals.length < initialLen;
    if (deleted) this.saveLocal();
    return deleted;
  }

  // Water
  public async getWaterToday(userId: string, date: string): Promise<WaterDoc> {
    let rec = this.data.water.find(w => w.user_id === userId && w.date === date);
    if (!rec) {
      rec = {
        _id: this.generateId('water'),
        user_id: userId,
        glasses: 0,
        daily_goal: 8,
        date,
        updated_at: new Date().toISOString(),
      };
      this.data.water.push(rec);
      this.saveLocal();
    }
    return rec;
  }

  public async updateWater(userId: string, date: string, glasses: number, daily_goal?: number): Promise<WaterDoc> {
    let rec = this.data.water.find(w => w.user_id === userId && w.date === date);
    const now = new Date().toISOString();
    if (!rec) {
      rec = {
        _id: this.generateId('water'),
        user_id: userId,
        glasses: Math.max(0, glasses),
        daily_goal: daily_goal && daily_goal > 0 ? daily_goal : 8,
        date,
        updated_at: now,
      };
      this.data.water.push(rec);
    } else {
      rec.glasses = Math.max(0, glasses);
      if (daily_goal !== undefined && daily_goal > 0) {
        rec.daily_goal = daily_goal;
      }
      rec.updated_at = now;
    }
    this.saveLocal();
    return rec;
  }

  // Sleep
  public async getSleep(userId: string): Promise<SleepDoc[]> {
    return this.data.sleep.filter(s => s.user_id === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  public async createSleep(sleep: Omit<SleepDoc, '_id' | 'created_at'>): Promise<SleepDoc> {
    const doc: SleepDoc = {
      _id: this.generateId('sleep'),
      ...sleep,
      created_at: new Date().toISOString(),
    };
    this.data.sleep.unshift(doc);
    this.saveLocal();
    return doc;
  }

  public async updateSleep(id: string, userId: string, updates: Partial<SleepDoc>): Promise<SleepDoc | null> {
    const idx = this.data.sleep.findIndex(s => s._id === id && s.user_id === userId);
    if (idx === -1) return null;
    this.data.sleep[idx] = { ...this.data.sleep[idx], ...updates };
    this.saveLocal();
    return this.data.sleep[idx];
  }

  public async deleteSleep(id: string, userId: string): Promise<boolean> {
    const initialLen = this.data.sleep.length;
    this.data.sleep = this.data.sleep.filter(s => !(s._id === id && s.user_id === userId));
    const deleted = this.data.sleep.length < initialLen;
    if (deleted) this.saveLocal();
    return deleted;
  }

  // Habits
  public async getHabits(userId: string): Promise<HabitDoc[]> {
    return this.data.habits.filter(h => h.user_id === userId);
  }

  public async getHabitLogs(userId: string): Promise<HabitLogDoc[]> {
    return this.data.habit_logs.filter(l => l.user_id === userId);
  }

  public async createHabit(habit: Omit<HabitDoc, '_id' | 'created_at'>): Promise<HabitDoc> {
    const doc: HabitDoc = {
      _id: this.generateId('habit'),
      ...habit,
      created_at: new Date().toISOString(),
    };
    this.data.habits.push(doc);
    this.saveLocal();
    return doc;
  }

  public async deleteHabit(id: string, userId: string): Promise<boolean> {
    const initialLen = this.data.habits.length;
    this.data.habits = this.data.habits.filter(h => !(h._id === id && h.user_id === userId));
    this.data.habit_logs = this.data.habit_logs.filter(l => !(l.habit_id === id && l.user_id === userId));
    const deleted = this.data.habits.length < initialLen;
    if (deleted) this.saveLocal();
    return deleted;
  }

  public async toggleHabitLog(userId: string, habitId: string, date: string, completed?: boolean): Promise<{ completed: boolean; streak: number; longestStreak: number }> {
    let log = this.data.habit_logs.find(l => l.user_id === userId && l.habit_id === habitId && l.date === date);
    if (!log) {
      log = {
        _id: this.generateId('hl'),
        user_id: userId,
        habit_id: habitId,
        date,
        completed: completed !== undefined ? completed : true,
      };
      this.data.habit_logs.push(log);
    } else {
      log.completed = completed !== undefined ? completed : !log.completed;
    }
    this.saveLocal();

    // Calculate streaks
    const allLogs = this.data.habit_logs
      .filter(l => l.user_id === userId && l.habit_id === habitId && l.completed)
      .map(l => l.date)
      .sort();

    const streakStats = this.calculateStreak(allLogs);
    return {
      completed: log.completed,
      streak: streakStats.current,
      longestStreak: streakStats.longest,
    };
  }

  public calculateStreak(sortedAscDates: string[]): { current: number; longest: number } {
    if (!sortedAscDates.length) return { current: 0, longest: 0 };
    const dateSet = new Set(sortedAscDates);
    
    // Check consecutive days ending today or yesterday
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    let currentStreak = 0;
    let checkDate = new Date(todayStr);

    // If today is completed, start from today, else start from yesterday
    if (!dateSet.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (dateSet.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Longest streak
    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedAscDates) {
      const curr = new Date(dStr);
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      prevDate = curr;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    }

    return { current: currentStreak, longest: Math.max(maxStreak, currentStreak) };
  }

  // Goals
  public async getGoals(userId: string): Promise<GoalDoc[]> {
    return this.data.goals.filter(g => g.user_id === userId);
  }

  public async createGoal(goal: Omit<GoalDoc, '_id' | 'created_at' | 'updated_at'>): Promise<GoalDoc> {
    const now = new Date().toISOString();
    const progress = Math.min(100, Math.max(0, goal.progress || 0));
    let status: GoalDoc['status'] = 'Not Started';
    if (progress === 100) status = 'Completed';
    else if (progress > 0) status = 'In Progress';

    const doc: GoalDoc = {
      _id: this.generateId('goal'),
      ...goal,
      progress,
      status,
      created_at: now,
      updated_at: now,
    };
    this.data.goals.push(doc);
    this.saveLocal();
    return doc;
  }

  public async updateGoal(id: string, userId: string, updates: Partial<GoalDoc>): Promise<GoalDoc | null> {
    const idx = this.data.goals.findIndex(g => g._id === id && g.user_id === userId);
    if (idx === -1) return null;

    let progress = updates.progress !== undefined ? updates.progress : this.data.goals[idx].progress;
    progress = Math.min(100, Math.max(0, progress));

    let status = this.data.goals[idx].status;
    if (updates.status) {
      status = updates.status;
    } else if (updates.progress !== undefined) {
      if (progress === 100) status = 'Completed';
      else if (progress > 0) status = 'In Progress';
      else status = 'Not Started';
    }

    this.data.goals[idx] = {
      ...this.data.goals[idx],
      ...updates,
      progress,
      status,
      updated_at: new Date().toISOString(),
    };
    this.saveLocal();
    return this.data.goals[idx];
  }

  public async deleteGoal(id: string, userId: string): Promise<boolean> {
    const initialLen = this.data.goals.length;
    this.data.goals = this.data.goals.filter(g => !(g._id === id && g.user_id === userId));
    const deleted = this.data.goals.length < initialLen;
    if (deleted) this.saveLocal();
    return deleted;
  }

  // Focus Sessions (Pomodoro)
  public async getFocusSessions(userId: string): Promise<FocusSessionDoc[]> {
    return this.data.focus_sessions.filter(f => f.user_id === userId);
  }

  public async createFocusSession(session: Omit<FocusSessionDoc, '_id' | 'created_at'>): Promise<FocusSessionDoc> {
    const doc: FocusSessionDoc = {
      _id: this.generateId('fs'),
      ...session,
      created_at: new Date().toISOString(),
    };
    this.data.focus_sessions.unshift(doc);
    this.saveLocal();
    return doc;
  }

  // Settings
  public async getSettings(userId: string): Promise<UserSettingsDoc> {
    let setting = this.data.settings.find(s => s.user_id === userId);
    if (!setting) {
      setting = {
        _id: this.generateId('set'),
        user_id: userId,
        theme: 'light',
        water_goal: 8,
        pomodoro_focus: 25,
        pomodoro_break: 5,
        notifications_enabled: true,
        updated_at: new Date().toISOString(),
      };
      this.data.settings.push(setting);
      this.saveLocal();
    }
    return setting;
  }

  public async updateSettings(userId: string, updates: Partial<UserSettingsDoc>): Promise<UserSettingsDoc> {
    let setting = this.data.settings.find(s => s.user_id === userId);
    const now = new Date().toISOString();
    if (!setting) {
      setting = {
        _id: this.generateId('set'),
        user_id: userId,
        theme: 'light',
        water_goal: 8,
        pomodoro_focus: 25,
        pomodoro_break: 5,
        notifications_enabled: true,
        ...updates,
        updated_at: now,
      };
      this.data.settings.push(setting);
    } else {
      Object.assign(setting, updates, { updated_at: now });
    }
    this.saveLocal();
    return setting;
  }
}

export const db = new DatabaseManager();
