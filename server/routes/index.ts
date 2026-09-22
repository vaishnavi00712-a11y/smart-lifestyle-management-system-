import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authMiddleware, generateToken, AuthenticatedRequest } from '../auth.js';

export const apiRouter = Router();

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------
const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, lifestyle_goal } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const newUser = await db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      age: age ? Number(age) : undefined,
      lifestyle_goal: lifestyle_goal || 'Improve health and daily productivity',
      profile_image: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    });

    const token = generateToken(newUser);
    const safeUser = { ...newUser, password_hash: undefined };

    return res.status(201).json({
      success: true,
      data: { token, user: safeUser },
      message: 'Account registered successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const safeUser = { ...user, password_hash: undefined };

    return res.json({
      success: true,
      data: { token, user: safeUser },
      message: 'Welcome back!',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Login error. Please try again.' });
  }
});

authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    success: true,
    data: { ...user, password_hash: undefined },
    message: 'Current user profile loaded.',
  });
});

authRouter.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.use('/auth', authRouter);

// ----------------------------------------------------
// USERS ROUTES
// ----------------------------------------------------
const usersRouter = Router();
usersRouter.use(authMiddleware);

usersRouter.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({ success: true, data: { ...user, password_hash: undefined } });
});

usersRouter.put('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { name, age, lifestyle_goal, profile_image } = req.body;
    const updated = await db.updateUser(user._id, {
      ...(name ? { name: name.trim() } : {}),
      ...(age !== undefined ? { age: Number(age) } : {}),
      ...(lifestyle_goal ? { lifestyle_goal: lifestyle_goal.trim() } : {}),
      ...(profile_image ? { profile_image } : {}),
    });
    return res.json({
      success: true,
      data: { ...updated, password_hash: undefined },
      message: 'Profile updated successfully.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

apiRouter.use('/users', usersRouter);

// ----------------------------------------------------
// TASKS ROUTES
// ----------------------------------------------------
const tasksRouter = Router();
tasksRouter.use(authMiddleware);

tasksRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const tasks = await db.getTasks(req.user!._id);
  return res.json({ success: true, data: tasks });
});

tasksRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, priority, due_date } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const newTask = await db.createTask({
      user_id: req.user!._id,
      title: title.trim(),
      description: description?.trim() || '',
      category: category || 'Personal',
      priority: priority || 'Medium',
      due_date: due_date || new Date().toISOString().split('T')[0],
      completed: false,
    });

    return res.status(201).json({
      success: true,
      data: newTask,
      message: 'Task added successfully.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Unable to save task.' });
  }
});

tasksRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const task = await db.getTaskById(req.params.id, req.user!._id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
  }
  return res.json({ success: true, data: task });
});

tasksRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await db.updateTask(req.params.id, req.user!._id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized.' });
    }
    return res.json({
      success: true,
      data: updated,
      message: 'Task updated successfully.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Unable to update task.' });
  }
});

tasksRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const deleted = await db.deleteTask(req.params.id, req.user!._id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Task not found or unauthorized.' });
  }
  return res.json({ success: true, message: 'Task deleted successfully.' });
});

apiRouter.use('/tasks', tasksRouter);

// ----------------------------------------------------
// ROUTINE ROUTES
// ----------------------------------------------------
const routineRouter = Router();
routineRouter.use(authMiddleware);

routineRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const date = req.query.date as string | undefined;
  const items = await db.getRoutine(req.user!._id, date);
  return res.json({ success: true, data: items });
});

routineRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, time, priority, date } = req.body;
    if (!title || !time) {
      return res.status(400).json({ success: false, message: 'Title and scheduled time are required.' });
    }

    const item = await db.createRoutine({
      user_id: req.user!._id,
      title: title.trim(),
      category: category || 'General',
      time,
      priority: priority || 'Medium',
      completed: false,
      date: date || new Date().toISOString().split('T')[0],
    });

    return res.status(201).json({
      success: true,
      data: item,
      message: 'Routine item added.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Unable to add routine item.' });
  }
});

routineRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const updated = await db.updateRoutine(req.params.id, req.user!._id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Routine item not found or unauthorized.' });
  }
  return res.json({ success: true, data: updated, message: 'Routine item updated.' });
});

routineRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const deleted = await db.deleteRoutine(req.params.id, req.user!._id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Routine item not found or unauthorized.' });
  }
  return res.json({ success: true, message: 'Routine item removed.' });
});

apiRouter.use('/routine', routineRouter);

// ----------------------------------------------------
// FITNESS / ACTIVITIES
// ----------------------------------------------------
const fitnessRouter = Router();
fitnessRouter.use(authMiddleware);

fitnessRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const activities = await db.getActivities(req.user!._id);
  return res.json({ success: true, data: activities });
});

fitnessRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { activity_type, duration, steps, calories, date, notes } = req.body;
    if (!activity_type || !duration) {
      return res.status(400).json({ success: false, message: 'Activity type and duration (minutes) are required.' });
    }

    const act = await db.createActivity({
      user_id: req.user!._id,
      activity_type: activity_type.trim(),
      duration: Number(duration),
      steps: steps ? Number(steps) : 0,
      calories: calories ? Number(calories) : Math.round(Number(duration) * 7.5),
      date: date || new Date().toISOString().split('T')[0],
      notes: notes?.trim() || '',
    });

    return res.status(201).json({ success: true, data: act, message: 'Activity logged successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Unable to record fitness activity.' });
  }
});

fitnessRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const updated = await db.updateActivity(req.params.id, req.user!._id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Activity not found or unauthorized.' });
  }
  return res.json({ success: true, data: updated, message: 'Activity updated.' });
});

fitnessRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const deleted = await db.deleteActivity(req.params.id, req.user!._id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Activity not found or unauthorized.' });
  }
  return res.json({ success: true, message: 'Activity deleted successfully.' });
});

apiRouter.use('/activities', fitnessRouter);

// ----------------------------------------------------
// NUTRITION / MEALS
// ----------------------------------------------------
const mealsRouter = Router();
mealsRouter.use(authMiddleware);

mealsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const date = req.query.date as string | undefined;
  const meals = await db.getMeals(req.user!._id, date);
  return res.json({ success: true, data: meals });
});

mealsRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { meal_type, food_name, quantity, calories, notes, date } = req.body;
    if (!meal_type || !food_name) {
      return res.status(400).json({ success: false, message: 'Meal type and food description are required.' });
    }

    const meal = await db.createMeal({
      user_id: req.user!._id,
      meal_type: meal_type as any,
      food_name: food_name.trim(),
      quantity: quantity || '1 serving',
      calories: calories ? Number(calories) : undefined,
      notes: notes?.trim() || '',
      date: date || new Date().toISOString().split('T')[0],
    });

    return res.status(201).json({ success: true, data: meal, message: 'Meal logged successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Unable to log meal.' });
  }
});

mealsRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const updated = await db.updateMeal(req.params.id, req.user!._id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Meal record not found or unauthorized.' });
  }
  return res.json({ success: true, data: updated, message: 'Meal updated.' });
});

mealsRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const deleted = await db.deleteMeal(req.params.id, req.user!._id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Meal record not found or unauthorized.' });
  }
  return res.json({ success: true, message: 'Meal removed.' });
});

apiRouter.use('/meals', mealsRouter);

// ----------------------------------------------------
// WATER TRACKER
// ----------------------------------------------------
const waterRouter = Router();
waterRouter.use(authMiddleware);

waterRouter.get('/today', async (req: AuthenticatedRequest, res: Response) => {
  const today = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const data = await db.getWaterToday(req.user!._id, today);
  return res.json({ success: true, data });
});

waterRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const today = req.body.date || new Date().toISOString().split('T')[0];
  const glasses = Number(req.body.glasses ?? 0);
  const daily_goal = req.body.daily_goal !== undefined ? Number(req.body.daily_goal) : undefined;

  const data = await db.updateWater(req.user!._id, today, glasses, daily_goal);
  return res.json({ success: true, data, message: 'Water intake updated.' });
});

waterRouter.put('/', async (req: AuthenticatedRequest, res: Response) => {
  const today = req.body.date || new Date().toISOString().split('T')[0];
  const glasses = Number(req.body.glasses ?? 0);
  const daily_goal = req.body.daily_goal !== undefined ? Number(req.body.daily_goal) : undefined;

  const data = await db.updateWater(req.user!._id, today, glasses, daily_goal);
  return res.json({ success: true, data, message: 'Water goal updated.' });
});

apiRouter.use('/water', waterRouter);

// ----------------------------------------------------
// SLEEP TRACKER
// ----------------------------------------------------
const sleepRouter = Router();
sleepRouter.use(authMiddleware);

sleepRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const logs = await db.getSleep(req.user!._id);
  return res.json({ success: true, data: logs });
});

sleepRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bedtime, wake_time, quality, date, notes } = req.body;
    if (!bedtime || !wake_time) {
      return res.status(400).json({ success: false, message: 'Bedtime and wake time are required.' });
    }

    // Calculate duration in minutes accurately
    const [bH, bM] = bedtime.split(':').map(Number);
    const [wH, wM] = wake_time.split(':').map(Number);

    let startMinutes = bH * 60 + bM;
    let endMinutes = wH * 60 + wM;
    if (endMinutes <= startMinutes) {
      // Crossed midnight
      endMinutes += 24 * 60;
    }
    const duration = endMinutes - startMinutes;

    const entry = await db.createSleep({
      user_id: req.user!._id,
      bedtime,
      wake_time,
      duration,
      quality: quality || 'Good',
      date: date || new Date().toISOString().split('T')[0],
      notes: notes?.trim() || '',
    });

    return res.status(201).json({ success: true, data: entry, message: 'Sleep record saved.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Unable to save sleep record.' });
  }
});

sleepRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const updated = await db.updateSleep(req.params.id, req.user!._id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Sleep record not found or unauthorized.' });
  }
  return res.json({ success: true, data: updated, message: 'Sleep record updated.' });
});

sleepRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const deleted = await db.deleteSleep(req.params.id, req.user!._id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Sleep record not found or unauthorized.' });
  }
  return res.json({ success: true, message: 'Sleep record deleted.' });
});

apiRouter.use('/sleep', sleepRouter);

// ----------------------------------------------------
// HABITS
// ----------------------------------------------------
const habitsRouter = Router();
habitsRouter.use(authMiddleware);

habitsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const habits = await db.getHabits(userId);
  const logs = await db.getHabitLogs(userId);

  const todayStr = new Date().toISOString().split('T')[0];

  // Enrich each habit with streak and today's status
  const enriched = habits.map(h => {
    const habitLogs = logs.filter(l => l.habit_id === h._id && l.completed);
    const completedDates = habitLogs.map(l => l.date).sort();
    const streakInfo = db.calculateStreak(completedDates);
    const completedToday = habitLogs.some(l => l.date === todayStr);

    return {
      ...h,
      completedToday,
      currentStreak: streakInfo.current,
      longestStreak: streakInfo.longest,
      totalCompletions: habitLogs.length,
    };
  });

  return res.json({ success: true, data: enriched });
});

habitsRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Habit name is required.' });
    }

    const habit = await db.createHabit({
      user_id: req.user!._id,
      name: name.trim(),
      category: category || 'Lifestyle',
    });

    return res.status(201).json({
      success: true,
      data: { ...habit, completedToday: false, currentStreak: 0, longestStreak: 0, totalCompletions: 0 },
      message: 'Habit created successfully.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Unable to create habit.' });
  }
});

habitsRouter.post('/:id/complete', async (req: AuthenticatedRequest, res: Response) => {
  const habitId = req.params.id;
  const todayStr = (req.body.date as string) || new Date().toISOString().split('T')[0];
  const completed = req.body.completed !== undefined ? Boolean(req.body.completed) : undefined;

  const result = await db.toggleHabitLog(req.user!._id, habitId, todayStr, completed);
  return res.json({
    success: true,
    data: result,
    message: result.completed ? 'Habit completed for today!' : 'Habit uncompleted.',
  });
});

habitsRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const deleted = await db.deleteHabit(req.params.id, req.user!._id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Habit not found or unauthorized.' });
  }
  return res.json({ success: true, message: 'Habit removed.' });
});

apiRouter.use('/habits', habitsRouter);

// ----------------------------------------------------
// GOALS
// ----------------------------------------------------
const goalsRouter = Router();
goalsRouter.use(authMiddleware);

goalsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const goals = await db.getGoals(req.user!._id);
  return res.json({ success: true, data: goals });
});

goalsRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, target_date, progress } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Goal title is required.' });
    }

    const goal = await db.createGoal({
      user_id: req.user!._id,
      title: title.trim(),
      description: description?.trim() || '',
      category: category || 'Personal',
      target_date: target_date || new Date().toISOString().split('T')[0],
      progress: progress !== undefined ? Number(progress) : 0,
      status: 'Not Started',
    });

    return res.status(201).json({ success: true, data: goal, message: 'Goal created successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Unable to save goal.' });
  }
});

goalsRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const updated = await db.updateGoal(req.params.id, req.user!._id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Goal not found or unauthorized.' });
  }
  return res.json({ success: true, data: updated, message: 'Goal updated.' });
});

goalsRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const deleted = await db.deleteGoal(req.params.id, req.user!._id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Goal not found or unauthorized.' });
  }
  return res.json({ success: true, message: 'Goal removed.' });
});

apiRouter.use('/goals', goalsRouter);

// ----------------------------------------------------
// PRODUCTIVITY / FOCUS SESSIONS
// ----------------------------------------------------
const productivityRouter = Router();
productivityRouter.use(authMiddleware);

productivityRouter.get('/focus-sessions', async (req: AuthenticatedRequest, res: Response) => {
  const sessions = await db.getFocusSessions(req.user!._id);
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  // Weekly focus minutes (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekSessions = sessions.filter(s => new Date(s.date) >= oneWeekAgo);
  const weeklyMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);

  return res.json({
    success: true,
    data: {
      sessions,
      todaySessionsCount: todaySessions.length,
      todayMinutes,
      weeklyMinutes,
      totalSessionsCount: sessions.length,
    },
  });
});

productivityRouter.post('/focus-sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { duration, tag } = req.body;
    const session = await db.createFocusSession({
      user_id: req.user!._id,
      duration: duration ? Number(duration) : 25,
      completed: true,
      date: new Date().toISOString().split('T')[0],
      tag: tag || 'Focus',
    });

    return res.status(201).json({
      success: true,
      data: session,
      message: 'Focus session recorded in database.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record focus session.' });
  }
});

apiRouter.use('/', productivityRouter);

// ----------------------------------------------------
// DASHBOARD & LIFESTYLE PROGRESS SCORE
// ----------------------------------------------------
apiRouter.get('/dashboard', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch real data from all user collections
  const [tasks, water, sleepLogs, activities, habits, habitLogs, goals, focusSessions, routine] = await Promise.all([
    db.getTasks(userId),
    db.getWaterToday(userId, todayStr),
    db.getSleep(userId),
    db.getActivities(userId),
    db.getHabits(userId),
    db.getHabitLogs(userId),
    db.getGoals(userId),
    db.getFocusSessions(userId),
    db.getRoutine(userId, todayStr),
  ]);

  // Calculations
  const tasks_completed = tasks.filter(t => t.completed).length;
  const tasks_total = tasks.length;

  const water_current = water.glasses;
  const water_goal = water.daily_goal;

  // Most recent sleep or today's sleep
  const todaySleep = sleepLogs.find(s => s.date === todayStr) || sleepLogs[0];
  const sleepMinutes = todaySleep ? todaySleep.duration : 0;
  const sleep_hours = Math.floor(sleepMinutes / 60);
  const sleep_mins = sleepMinutes % 60;
  const sleep_duration = todaySleep ? `${sleep_hours}h ${sleep_mins}m` : '0h 0m';

  // Activity today
  const todayActivities = activities.filter(a => a.date === todayStr);
  const activity_minutes = todayActivities.reduce((sum, a) => sum + a.duration, 0);

  // Focus sessions today
  const todayFocus = focusSessions.filter(f => f.date === todayStr);
  const focus_minutes = todayFocus.reduce((sum, f) => sum + f.duration, 0);

  // Habits today
  const todayCompletedHabits = habits.filter(h =>
    habitLogs.some(l => l.habit_id === h._id && l.date === todayStr && l.completed)
  ).length;
  const habit_completion = habits.length > 0
    ? `${todayCompletedHabits} / ${habits.length}`
    : '0 / 0';

  // Routine today
  const routine_completed = routine.filter(r => r.completed).length;
  const routine_total = routine.length;

  // LIFESTYLE PROGRESS SCORE (Transparent calculation up to 100 points)
  // Productivity: 20 points max (tasks completion + focus sessions)
  let prodScore = 0;
  if (tasks_total > 0) {
    prodScore += (tasks_completed / tasks_total) * 12;
  } else {
    prodScore += 6; // neutral if no tasks yet
  }
  prodScore += Math.min(8, (focus_minutes / 50) * 8);

  // Fitness: 20 points max (target: 30-45 mins of activity)
  const fitScore = Math.min(20, (activity_minutes / 40) * 20);

  // Hydration: 15 points max (water intake vs daily goal)
  const hydScore = water_goal > 0 ? Math.min(15, (water_current / water_goal) * 15) : 0;

  // Sleep: 15 points max (ideal: 7-9 hours, i.e. 420-540 mins)
  let sleepScore = 0;
  if (sleepMinutes >= 420 && sleepMinutes <= 540) {
    sleepScore = 15;
  } else if (sleepMinutes > 0) {
    sleepScore = Math.min(15, (sleepMinutes / 420) * 15);
  }

  // Habits: 15 points max (daily completed habits)
  const habScore = habits.length > 0 ? (todayCompletedHabits / habits.length) * 15 : 7.5;

  // Goals: 15 points max (average progress across active goals)
  let goalScore = 0;
  if (goals.length > 0) {
    const avgProg = goals.reduce((sum, g) => sum + g.progress, 0) / goals.length;
    goalScore = (avgProg / 100) * 15;
  } else {
    goalScore = 7.5;
  }

  const lifestyle_score = Math.min(100, Math.round(prodScore + fitScore + hydScore + sleepScore + habScore + goalScore));

  return res.json({
    success: true,
    data: {
      tasks_completed,
      tasks_total,
      water_current,
      water_goal,
      sleep_duration,
      sleep_minutes: sleepMinutes,
      activity_minutes,
      habit_completion,
      habit_completed_count: todayCompletedHabits,
      habits_total_count: habits.length,
      focus_minutes,
      routine_completed,
      routine_total,
      lifestyle_score,
      score_breakdown: {
        productivity: Math.round(prodScore),
        fitness: Math.round(fitScore),
        hydration: Math.round(hydScore),
        sleep: Math.round(sleepScore),
        habits: Math.round(habScore),
        goals: Math.round(goalScore),
      }
    }
  });
});

// ----------------------------------------------------
// REPORTS & ANALYTICS
// ----------------------------------------------------
const reportsRouter = Router();
reportsRouter.use(authMiddleware);

reportsRouter.get('/weekly', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const [tasks, waterLogs, sleepLogs, activities, focusSessions, habits, habitLogs] = await Promise.all([
    db.getTasks(userId),
    db.getWaterToday(userId, new Date().toISOString().split('T')[0]),
    db.getSleep(userId),
    db.getActivities(userId),
    db.getFocusSessions(userId),
    db.getHabits(userId),
    db.getHabitLogs(userId),
  ]);

  // Construct past 7 days
  const days: { date: string; day: string; tasks: number; water: number; sleepHours: number; activityMins: number; focusMins: number }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];

    const daySleep = sleepLogs.find(s => s.date === dateStr);
    const dayActs = activities.filter(a => a.date === dateStr);
    const dayFocus = focusSessions.filter(f => f.date === dateStr);

    days.push({
      date: dateStr,
      day: dayLabel,
      tasks: tasks.filter(t => t.due_date === dateStr && t.completed).length,
      water: dateStr === waterLogs.date ? waterLogs.glasses : 0,
      sleepHours: daySleep ? +(daySleep.duration / 60).toFixed(1) : 0,
      activityMins: dayActs.reduce((sum, a) => sum + a.duration, 0),
      focusMins: dayFocus.reduce((sum, f) => sum + f.duration, 0),
    });
  }

  const hasData = days.some(d => d.tasks > 0 || d.water > 0 || d.sleepHours > 0 || d.activityMins > 0 || d.focusMins > 0);

  return res.json({
    success: true,
    data: {
      hasData,
      days,
      summary: {
        totalTasksCompleted: tasks.filter(t => t.completed).length,
        totalActivityMinutes: activities.reduce((sum, a) => sum + a.duration, 0),
        totalFocusMinutes: focusSessions.reduce((sum, f) => sum + f.duration, 0),
        avgSleepHours: sleepLogs.length > 0
          ? +(sleepLogs.reduce((sum, s) => sum + s.duration, 0) / (sleepLogs.length * 60)).toFixed(1)
          : 0,
      }
    }
  });
});

reportsRouter.get('/monthly', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const [tasks, sleepLogs, activities, focusSessions] = await Promise.all([
    db.getTasks(userId),
    db.getSleep(userId),
    db.getActivities(userId),
    db.getFocusSessions(userId),
  ]);

  // Aggregate by 4 weeks
  const weeks = [
    { week: 'Week 1', tasks: 0, activity: 0, sleepAvg: 0, focus: 0 },
    { week: 'Week 2', tasks: 0, activity: 0, sleepAvg: 0, focus: 0 },
    { week: 'Week 3', tasks: 0, activity: 0, sleepAvg: 0, focus: 0 },
    { week: 'Week 4', tasks: 0, activity: 0, sleepAvg: 0, focus: 0 },
  ];

  const now = new Date();
  for (let w = 0; w < 4; w++) {
    const endDaysAgo = (3 - w) * 7;
    const startDaysAgo = endDaysAgo + 7;

    const startDate = new Date();
    startDate.setDate(now.getDate() - startDaysAgo);
    const endDate = new Date();
    endDate.setDate(now.getDate() - endDaysAgo);

    const wTasks = tasks.filter(t => {
      const td = new Date(t.due_date || t.created_at);
      return td >= startDate && td <= endDate && t.completed;
    }).length;

    const wActs = activities.filter(a => {
      const ad = new Date(a.date);
      return ad >= startDate && ad <= endDate;
    }).reduce((sum, a) => sum + a.duration, 0);

    const wFocus = focusSessions.filter(f => {
      const fd = new Date(f.date);
      return fd >= startDate && fd <= endDate;
    }).reduce((sum, f) => sum + f.duration, 0);

    const wSleeps = sleepLogs.filter(s => {
      const sd = new Date(s.date);
      return sd >= startDate && sd <= endDate;
    });
    const avgSleep = wSleeps.length > 0 ? +(wSleeps.reduce((sum, s) => sum + s.duration, 0) / (wSleeps.length * 60)).toFixed(1) : 0;

    weeks[w].tasks = wTasks;
    weeks[w].activity = wActs;
    weeks[w].focus = wFocus;
    weeks[w].sleepAvg = avgSleep;
  }

  const hasData = weeks.some(w => w.tasks > 0 || w.activity > 0 || w.sleepAvg > 0 || w.focus > 0);

  return res.json({
    success: true,
    data: {
      hasData,
      weeks,
    }
  });
});

apiRouter.use('/reports', reportsRouter);

// ----------------------------------------------------
// SETTINGS
// ----------------------------------------------------
const settingsRouter = Router();
settingsRouter.use(authMiddleware);

settingsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const settings = await db.getSettings(req.user!._id);
  return res.json({ success: true, data: settings });
});

settingsRouter.put('/', async (req: AuthenticatedRequest, res: Response) => {
  const updated = await db.updateSettings(req.user!._id, req.body);
  return res.json({ success: true, data: updated, message: 'Settings saved successfully.' });
});

apiRouter.use('/settings', settingsRouter);
