import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Platform, Appearance, ColorSchemeName } from 'react-native';
import { darkColors, lightColors } from '@/constants/colors';

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon: 'work' | 'personal' | 'health' | 'shopping' | 'finance' | 'social' | 'learning' | 'other';
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'none';
  daysOfWeek?: number[];
  interval?: number;
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  completedAt?: string;
  energy: 'low' | 'medium' | 'high';
  estimated: number;
  category: string;
  createdAt: string;
  recurrence?: RecurrencePattern;
  parentTaskId?: number;
}

export interface TaskSuggestion {
  text: string;
  energy: 'low' | 'medium' | 'high';
  timeBlock: 'morning' | 'afternoon' | 'evening' | 'any';
  reason: string;
  category?: 'work' | 'personal' | 'both';
}

export interface WorkDay {
  enabled: boolean;
  start: string;
  end: string;
}

export interface UserData {
  name: string;
  appUsage: 'personal' | 'work' | 'both' | '';
  workSchedule: {
    enabled: boolean;
    days: {
      monday: WorkDay;
      tuesday: WorkDay;
      wednesday: WorkDay;
      thursday: WorkDay;
      friday: WorkDay;
      saturday: WorkDay;
      sunday: WorkDay;
    };
    timezone: string;
  };
  muteAfterWork: boolean;
  muteDuringWork: boolean;
  goals: string[];
  goalSteps: Record<string, string[]>;
  todaysMood: string | null;
  energyLevel: 'low' | 'medium' | 'high';
  importantTasks: string[];
  theme: 'light' | 'dark';
  themeMode: 'system' | 'light' | 'dark';
  bodyDoublingActive: boolean;
  brainDumpHistory: Record<string, string>;
  brainDumpTitleHistory: Record<string, string>;
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastCompletionDate: string | null;
    completionHistory: Record<string, number>;
  };
  preferences: {
    notifications: boolean;
    autoSave: boolean;
    energyReminders: boolean;
    focusMode: boolean;
    workLifeSeparation: boolean;
    smartScheduling: boolean;
  };
  customCategories: TaskCategory[];
}

export interface Tasks {
  morning: Task[];
  afternoon: Task[];
  evening: Task[];
}

const defaultCategories: TaskCategory[] = [
  { id: 'work', name: 'Work', color: '#007AFF', icon: 'work' },
  { id: 'personal', name: 'Personal', color: '#34C759', icon: 'personal' },
  { id: 'health', name: 'Health', color: '#FF3B30', icon: 'health' },
  { id: 'shopping', name: 'Shopping', color: '#FF9500', icon: 'shopping' },
  { id: 'finance', name: 'Finance', color: '#5856D6', icon: 'finance' },
  { id: 'social', name: 'Social', color: '#FF2D55', icon: 'social' },
  { id: 'learning', name: 'Learning', color: '#AF52DE', icon: 'learning' },
];

const defaultUserData: UserData = {
  name: '',
  appUsage: '',
  workSchedule: {
    enabled: false,
    days: {
      monday: { enabled: false, start: '09:00', end: '17:00' },
      tuesday: { enabled: false, start: '09:00', end: '17:00' },
      wednesday: { enabled: false, start: '09:00', end: '17:00' },
      thursday: { enabled: false, start: '09:00', end: '17:00' },
      friday: { enabled: false, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' }
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  },
  muteAfterWork: false,
  muteDuringWork: false,
  goals: [''],
  goalSteps: {},
  todaysMood: null,
  energyLevel: 'medium',
  importantTasks: [],
  theme: (Appearance.getColorScheme() as 'light' | 'dark') ?? 'light',
  themeMode: 'system',
  bodyDoublingActive: false,
  brainDumpHistory: {},
  brainDumpTitleHistory: {},
  streakData: {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletionDate: null,
    completionHistory: {}
  },
  preferences: {
    notifications: true,
    autoSave: true,
    energyReminders: true,
    focusMode: false,
    workLifeSeparation: false,
    smartScheduling: true
  },
  customCategories: defaultCategories
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [tasks, setTasks] = useState<Tasks>({
    morning: [],
    afternoon: [],
    evening: []
  });
  const [brainDump, setBrainDump] = useState<string>('');
  const [brainDumpTitle, setBrainDumpTitle] = useState<string>('');
  const [isWorkTime, setIsWorkTime] = useState(false);
  const [workTimeRemaining, setWorkTimeRemaining] = useState<string | null>(null);
  const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestion[]>([]);
  const [dismissedSuggestionsByDay, setDismissedSuggestionsByDay] = useState<Record<string, string[]>>({});
  const hasGeneratedRecurringRef = useRef(false);

  const persistDismissedSuggestions = useCallback(async (value: Record<string, string[]>) => {
    try {
      await AsyncStorage.setItem('adhd-planner-dismissed-suggestions', JSON.stringify(value));
    } catch (error) {
      console.error('Save dismissed suggestions failed:', error);
    }
  }, []);

  const dismissSuggestionForToday = useCallback(async (suggestionText: string) => {
    const todayKey = new Date().toISOString().split('T')[0];
    const existing = dismissedSuggestionsByDay[todayKey] ?? [];
    if (existing.includes(suggestionText)) return;

    const next: Record<string, string[]> = {
      ...dismissedSuggestionsByDay,
      [todayKey]: [...existing, suggestionText],
    };

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const cutoffKey = cutoff.toISOString().split('T')[0];
    const cleaned: Record<string, string[]> = {};
    Object.keys(next)
      .sort()
      .forEach((k) => {
        if (k >= cutoffKey) cleaned[k] = next[k] ?? [];
      });

    console.log('dismissSuggestionForToday', { todayKey, suggestionText });
    setDismissedSuggestionsByDay(cleaned);
    await persistDismissedSuggestions(cleaned);
  }, [dismissedSuggestionsByDay, persistDismissedSuggestions]);
  const [isLoading, setIsLoading] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>((Appearance.getColorScheme() as 'light' | 'dark') ?? 'light');

  // Determine effective theme from mode + system
  const effectiveTheme: 'light' | 'dark' = userData.themeMode === 'system' ? systemScheme : userData.theme;

  // Get current theme colors with platform-specific handling
  const colors = useMemo(() => {
    const baseColors = effectiveTheme === 'light' ? lightColors : darkColors;
    if (Platform.OS !== 'web') {
      return { ...baseColors, _refresh: forceRefresh };
    }
    return baseColors;
  }, [effectiveTheme, forceRefresh]);

  const loadData = useCallback(async () => {
    try {
      const savedUserData = await AsyncStorage.getItem('adhd-planner-data');
      const savedTasks = await AsyncStorage.getItem('adhd-planner-tasks');
      const savedDismissedSuggestions = await AsyncStorage.getItem('adhd-planner-dismissed-suggestions');

      if (savedUserData) {
        const parsed: UserData & Partial<{ themeMode: 'system' | 'light' | 'dark'; streakData: any; customCategories: TaskCategory[] }> = JSON.parse(savedUserData);
        if (!parsed.themeMode) {
          parsed.themeMode = 'system';
        }
        if (parsed.themeMode === 'system') {
          parsed.theme = (Appearance.getColorScheme() as 'light' | 'dark') ?? 'light';
        }
        if (!parsed.streakData) {
          parsed.streakData = defaultUserData.streakData;
        }
        if (!parsed.customCategories) {
          parsed.customCategories = defaultCategories;
        }
        setUserData(parsed as UserData);

        if (savedTasks) {
          const loadedTasks = JSON.parse(savedTasks);
          setTasks(loadedTasks);
        }

        if (savedDismissedSuggestions) {
          try {
            const parsedDismissed: unknown = JSON.parse(savedDismissedSuggestions);
            if (parsedDismissed && typeof parsedDismissed === 'object') {
              setDismissedSuggestionsByDay(parsedDismissed as Record<string, string[]>);
            }
          } catch (e) {
            console.error('Error parsing dismissed suggestions:', e);
          }
        }

        // Load today's brain dump
        const todayKey = new Date().toISOString().split('T')[0];
        if (parsed.brainDumpHistory && parsed.brainDumpHistory[todayKey]) {
          setBrainDump(parsed.brainDumpHistory[todayKey]);
        }
        if (parsed.brainDumpTitleHistory && parsed.brainDumpTitleHistory[todayKey]) {
          setBrainDumpTitle(parsed.brainDumpTitleHistory[todayKey]);
        }

        // Check if daily check-in is needed
        const today = new Date().toDateString();
        const lastCheckin = await AsyncStorage.getItem('last-checkin-date');
        
        if (parsed.name) {
          if (lastCheckin !== today) {
            router.replace('/daily-checkin' as any);
          } else {
            router.replace('/(tabs)');
          }
        } else {
          router.replace('/onboarding' as any);
        }
      } else {
        router.replace('/onboarding' as any);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate recurring tasks on mount
  useEffect(() => {
    if (!isLoading && userData.name && !hasGeneratedRecurringRef.current && (tasks.morning.length + tasks.afternoon.length + tasks.evening.length > 0)) {
      hasGeneratedRecurringRef.current = true;
      generateRecurringTasks(tasks, userData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, userData.name]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync theme with system when in system mode
  useEffect(() => {
    if (userData.themeMode !== 'system') return;
    const listener = ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
      const scheme = (colorScheme as 'light' | 'dark') ?? 'light';
      setSystemScheme(scheme);
      setUserData(prev => ({ ...prev, theme: scheme }));
    };
    const current = Appearance.getColorScheme();
    setSystemScheme((current as 'light' | 'dark') ?? 'light');
    const sub = Appearance.addChangeListener(listener);
    return () => {
      if (sub && typeof (sub as any).remove === 'function') {
        (sub as any).remove();
      }
    };
  }, [userData.themeMode]);

  // Save user data
  const saveUserData = useCallback(async (newData: Partial<UserData>) => {
    const updated = { ...userData, ...newData } as UserData;

    // If switching to system mode, align theme immediately without persisting system changes repeatedly
    if (newData.themeMode === 'system') {
      updated.theme = systemScheme;
    }

    setUserData(updated);
    
    try {
      await AsyncStorage.setItem('adhd-planner-data', JSON.stringify(updated));
      if (Platform.OS !== 'web' && (newData.theme || newData.themeMode)) {
        setTimeout(() => {
          setForceRefresh(prev => prev + 1);
        }, 100);
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [userData, systemScheme]);

  // Save tasks
  const saveTasks = useCallback(async (newTasks: Tasks) => {
    setTasks(newTasks);
    try {
      await AsyncStorage.setItem('adhd-planner-tasks', JSON.stringify(newTasks));
    } catch (error) {
      console.error('Save tasks failed:', error);
    }
  }, []);

  // Save brain dump
  const saveBrainDump = useCallback(async (text: string) => {
    setBrainDump(text);
    const today = new Date().toISOString().split('T')[0];
    const newHistory = { ...userData.brainDumpHistory };
    newHistory[today] = text;
    await saveUserData({ brainDumpHistory: newHistory });
  }, [userData.brainDumpHistory, saveUserData]);

  const saveBrainDumpTitle = useCallback(async (title: string) => {
    setBrainDumpTitle(title);
    const today = new Date().toISOString().split('T')[0];
    const newHistory = { ...userData.brainDumpTitleHistory };
    newHistory[today] = title;
    await saveUserData({ brainDumpTitleHistory: newHistory });
  }, [userData.brainDumpTitleHistory, saveUserData]);

  // Check work time
  useEffect(() => {
    const workSchedule = userData.workSchedule;
    const checkWorkTime = () => {
      if (!workSchedule?.enabled) {
        setIsWorkTime(false);
        return;
      }

      const now = new Date();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()] as keyof typeof workSchedule.days;
      const currentDay = workSchedule.days[dayName];

      if (!currentDay?.enabled) {
        setIsWorkTime(false);
        setWorkTimeRemaining(null);
        return;
      }

      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = currentDay.start.split(':').map(Number);
      const [endHour, endMin] = currentDay.end.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      if (currentTime >= startTime && currentTime < endTime) {
        setIsWorkTime(true);
        const remaining = endTime - currentTime;
        setWorkTimeRemaining(`${Math.floor(remaining / 60)}h ${remaining % 60}m`);
      } else {
        setIsWorkTime(false);
        setWorkTimeRemaining(null);
      }
    };

    checkWorkTime();
    const interval = setInterval(checkWorkTime, 60000);
    return () => clearInterval(interval);
  }, [userData.workSchedule]);

  // Generate task suggestions
  useEffect(() => {
    const generateSuggestions = () => {
      const currentHour = new Date().getHours();
      
      let suggestions: TaskSuggestion[] = [];

      // Work-aware suggestions
      if (isWorkTime && userData.appUsage !== 'personal') {
        suggestions.push(
          { text: "Review work priorities", energy: 'medium', timeBlock: 'morning', reason: "Focus on work tasks", category: 'work' },
          { text: "Deep work session", energy: 'high', timeBlock: 'afternoon', reason: "Productive work time", category: 'work' },
          { text: "Check team messages", energy: 'low', timeBlock: 'any', reason: "Stay connected", category: 'work' }
        );
      } else if (!isWorkTime && userData.appUsage !== 'work') {
        suggestions.push(
          { text: "Personal project time", energy: 'medium', timeBlock: 'evening', reason: "Your time now", category: 'personal' },
          { text: "Self-care activity", energy: 'low', timeBlock: 'evening', reason: "Recharge yourself", category: 'personal' }
        );
      }

      // Time-based suggestions
      if (currentHour < 10) {
        suggestions.push(
          { text: "Gentle morning routine", energy: 'low', timeBlock: 'morning', reason: "Start your day softly", category: 'personal' },
          { text: "Review today's priorities", energy: 'low', timeBlock: 'morning', reason: "Set intentions", category: 'both' }
        );
      } else if (currentHour < 15) {
        suggestions.push(
          { text: "Tackle one important project", energy: 'high', timeBlock: 'afternoon', reason: "Peak focus time", category: 'both' },
          { text: "Creative work session", energy: 'medium', timeBlock: 'afternoon', reason: "Good energy for creativity", category: 'both' }
        );
      } else {
        suggestions.push(
          { text: "Wrap up loose ends", energy: 'medium', timeBlock: 'evening', reason: "Organize for tomorrow", category: 'both' },
          { text: "Gentle wind-down", energy: 'low', timeBlock: 'evening', reason: "Transition to rest", category: 'personal' }
        );
      }

      // Filter based on app usage setting
      if (userData.appUsage === 'work') {
        suggestions = suggestions.filter(s => s.category === 'work' || s.category === 'both');
      } else if (userData.appUsage === 'personal') {
        suggestions = suggestions.filter(s => s.category === 'personal' || s.category === 'both');
      }

      const todayKey = new Date().toISOString().split('T')[0];
      const dismissedToday = new Set(dismissedSuggestionsByDay[todayKey] ?? []);
      const filtered = suggestions.filter((s) => !dismissedToday.has(s.text));

      setTaskSuggestions(filtered.slice(0, 4));
    };

    if (userData.name) {
      generateSuggestions();
    }
  }, [userData, isWorkTime, dismissedSuggestionsByDay]);

  const generateRecurringTasks = useCallback(async (currentTasks: Tasks, currentUserData: UserData) => {
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const allTasks = Object.values(currentTasks).flat();
    
    const recurringTasks = allTasks.filter(t => t.recurrence && t.recurrence.type !== 'none' && !t.parentTaskId);
    
    let needsUpdate = false;
    const updatedTasks = { ...currentTasks };

    for (const recurringTask of recurringTasks) {
      const lastCreatedTasks = allTasks.filter(t => t.parentTaskId === recurringTask.id);
      const lastCreatedDate = lastCreatedTasks.length > 0 
        ? new Date(Math.max(...lastCreatedTasks.map(t => new Date(t.createdAt).getTime())))
        : new Date(recurringTask.createdAt);
      
      const shouldCreate = checkShouldCreateRecurring(recurringTask, lastCreatedDate, today);
      
      if (shouldCreate) {
        const timeBlock = findTaskTimeBlock(recurringTask.id, currentTasks);
        if (timeBlock) {
          const newTask: Task = {
            ...recurringTask,
            id: Date.now() + Math.random(),
            completed: false,
            completedAt: undefined,
            createdAt: todayKey,
            parentTaskId: recurringTask.id,
          };
          updatedTasks[timeBlock] = [...updatedTasks[timeBlock], newTask];
          needsUpdate = true;
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      }
    }

    if (needsUpdate) {
      saveTasks(updatedTasks);
    }
  }, [saveTasks]);

  const checkShouldCreateRecurring = (task: Task, lastCreatedDate: Date, today: Date): boolean => {
    if (!task.recurrence || task.recurrence.type === 'none') return false;
    
    const lastDateKey = lastCreatedDate.toISOString().split('T')[0];
    const todayKey = today.toISOString().split('T')[0];
    
    if (lastDateKey === todayKey) return false;

    const { type, daysOfWeek, interval = 1 } = task.recurrence;

    if (type === 'daily') {
      const daysDiff = Math.floor((today.getTime() - lastCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= interval;
    }

    if (type === 'weekly') {
      if (!daysOfWeek || daysOfWeek.length === 0) return false;
      const todayDayOfWeek = today.getDay();
      return daysOfWeek.includes(todayDayOfWeek);
    }

    if (type === 'monthly') {
      const lastDay = lastCreatedDate.getDate();
      const todayDay = today.getDate();
      return todayDay === lastDay && lastCreatedDate.getMonth() !== today.getMonth();
    }

    return false;
  };

  const findTaskTimeBlock = (taskId: number, currentTasks: Tasks): keyof Tasks | null => {
    for (const [block, blockTasks] of Object.entries(currentTasks)) {
      if (blockTasks.some((t: Task) => t.id === taskId)) {
        return block as keyof Tasks;
      }
    }
    return null;
  };

  // Add task
  const addTask = useCallback((timeBlock: keyof Tasks, text: string, suggestion?: TaskSuggestion, recurrence?: RecurrencePattern) => {
    const newTask: Task = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      completedAt: undefined,
      energy: suggestion?.energy || 'medium',
      estimated: 30,
      category: suggestion?.category === 'work' ? 'work' : (isWorkTime ? 'work' : 'personal'),
      createdAt: new Date().toISOString(),
      recurrence: recurrence || { type: 'none' },
    };

    const newTasks = {
      ...tasks,
      [timeBlock]: [...tasks[timeBlock], newTask]
    };
    saveTasks(newTasks);
  }, [tasks, saveTasks, isWorkTime]);

  // Toggle task completion
  const toggleTaskComplete = useCallback((timeBlock: keyof Tasks, taskId: number) => {
    const nowIso = new Date().toISOString();
    const todayKey = new Date().toISOString().split('T')[0];

    const newTasks: Tasks = {
      ...tasks,
      [timeBlock]: tasks[timeBlock].map(task => {
        if (task.id !== taskId) return task;
        const nextCompleted = !task.completed;
        return {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted ? nowIso : undefined,
        };
      })
    };

    console.log('toggleTaskComplete', { timeBlock, taskId });
    saveTasks(newTasks);

    // Update streak when completing a task
    const allTasks = Object.values(newTasks).flat();
    const todayCompleted = allTasks.filter(t => t.completed && t.completedAt?.startsWith(todayKey)).length;
    
    if (todayCompleted > 0) {
      const lastDate = userData.streakData.lastCompletionDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split('T')[0];
      
      let newStreak = userData.streakData.currentStreak;
      
      if (!lastDate || lastDate === todayKey) {
        // Same day or first time
        newStreak = lastDate === todayKey ? userData.streakData.currentStreak : 1;
      } else if (lastDate === yesterdayKey) {
        // Yesterday - continue streak
        newStreak = userData.streakData.currentStreak + 1;
      } else {
        // Broken streak
        newStreak = 1;
      }
      
      const newStreakData = {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, userData.streakData.longestStreak),
        lastCompletionDate: todayKey,
        completionHistory: {
          ...userData.streakData.completionHistory,
          [todayKey]: todayCompleted
        }
      };
      
      saveUserData({ streakData: newStreakData });
    }
  }, [tasks, saveTasks, userData.streakData, saveUserData]);

  // Update task
  const updateTask = useCallback((timeBlock: keyof Tasks, taskId: number, updates: Partial<Task>) => {
    const newTasks = {
      ...tasks,
      [timeBlock]: tasks[timeBlock].map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    };
    saveTasks(newTasks);
  }, [tasks, saveTasks]);

  // Delete task
  const deleteTask = useCallback((timeBlock: keyof Tasks, taskId: number) => {
    const newTasks = {
      ...tasks,
      [timeBlock]: tasks[timeBlock].filter(task => task.id !== taskId)
    };
    saveTasks(newTasks);
  }, [tasks, saveTasks]);

  // Set mood
  const setMood = useCallback(async (mood: string) => {
    await saveUserData({ todaysMood: mood });
    await AsyncStorage.setItem('last-checkin-date', new Date().toDateString());
  }, [saveUserData]);

  const addCategory = useCallback(async (category: TaskCategory) => {
    const updated = [...userData.customCategories, category];
    await saveUserData({ customCategories: updated });
  }, [userData.customCategories, saveUserData]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    const updated = userData.customCategories.filter(c => c.id !== categoryId);
    await saveUserData({ customCategories: updated });
  }, [userData.customCategories, saveUserData]);

  return useMemo(() => ({
    userData,
    effectiveTheme,
    tasks,
    brainDump,
    brainDumpTitle,
    isWorkTime,
    workTimeRemaining,
    taskSuggestions,
    dismissedSuggestionsByDay,
    isLoading,
    colors,
    saveUserData,
    saveTasks,
    saveBrainDump,
    saveBrainDumpTitle,
    addTask,
    toggleTaskComplete,
    updateTask,
    deleteTask,
    setMood,
    loadData,
    dismissSuggestionForToday,
    addCategory,
    deleteCategory,
    generateRecurringTasks
  }), [
    userData,
    effectiveTheme,
    tasks,
    brainDump,
    brainDumpTitle,
    isWorkTime,
    workTimeRemaining,
    taskSuggestions,
    dismissedSuggestionsByDay,
    isLoading,
    colors,
    saveUserData,
    saveTasks,
    saveBrainDump,
    saveBrainDumpTitle,
    addTask,
    toggleTaskComplete,
    updateTask,
    deleteTask,
    setMood,
    loadData,
    dismissSuggestionForToday,
    addCategory,
    deleteCategory,
    generateRecurringTasks
  ]);
});