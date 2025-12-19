import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Platform, Appearance, ColorSchemeName } from 'react-native';
import { darkColors, lightColors } from '@/constants/colors';

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  energy: 'low' | 'medium' | 'high';
  estimated: number;
  category: 'work' | 'personal';
  createdAt: string;
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
  preferences: {
    notifications: boolean;
    autoSave: boolean;
    energyReminders: boolean;
    focusMode: boolean;
    workLifeSeparation: boolean;
    smartScheduling: boolean;
  };
}

export interface Tasks {
  morning: Task[];
  afternoon: Task[];
  evening: Task[];
}

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
  preferences: {
    notifications: true,
    autoSave: true,
    energyReminders: true,
    focusMode: false,
    workLifeSeparation: false,
    smartScheduling: true
  }
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [tasks, setTasks] = useState<Tasks>({
    morning: [],
    afternoon: [],
    evening: []
  });
  const [brainDump, setBrainDump] = useState("");
  const [isWorkTime, setIsWorkTime] = useState(false);
  const [workTimeRemaining, setWorkTimeRemaining] = useState<string | null>(null);
  const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestion[]>([]);
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

      if (savedUserData) {
        const parsed: UserData & Partial<{ themeMode: 'system' | 'light' | 'dark' }> = JSON.parse(savedUserData);
        if (!parsed.themeMode) {
          parsed.themeMode = 'system';
        }
        if (parsed.themeMode === 'system') {
          parsed.theme = (Appearance.getColorScheme() as 'light' | 'dark') ?? 'light';
        }
        setUserData(parsed as UserData);

        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }

        // Load today's brain dump
        const todayKey = new Date().toISOString().split('T')[0];
        if (parsed.brainDumpHistory && parsed.brainDumpHistory[todayKey]) {
          setBrainDump(parsed.brainDumpHistory[todayKey]);
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

      setTaskSuggestions(suggestions.slice(0, 4));
    };

    if (userData.name) {
      generateSuggestions();
    }
  }, [userData, isWorkTime]);

  // Add task
  const addTask = useCallback((timeBlock: keyof Tasks, text: string, suggestion?: TaskSuggestion) => {
    const newTask: Task = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      energy: suggestion?.energy || 'medium',
      estimated: 30,
      category: suggestion?.category === 'work' ? 'work' : (isWorkTime ? 'work' : 'personal'),
      createdAt: new Date().toISOString()
    };

    const newTasks = {
      ...tasks,
      [timeBlock]: [...tasks[timeBlock], newTask]
    };
    saveTasks(newTasks);
  }, [tasks, saveTasks, isWorkTime]);

  // Toggle task completion
  const toggleTaskComplete = useCallback((timeBlock: keyof Tasks, taskId: number) => {
    const newTasks = {
      ...tasks,
      [timeBlock]: tasks[timeBlock].map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    };
    saveTasks(newTasks);
  }, [tasks, saveTasks]);

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

  return useMemo(() => ({
    userData,
    tasks,
    brainDump,
    isWorkTime,
    workTimeRemaining,
    taskSuggestions,
    isLoading,
    colors,
    saveUserData,
    saveTasks,
    saveBrainDump,
    addTask,
    toggleTaskComplete,
    updateTask,
    deleteTask,
    setMood,
    loadData
  }), [
    userData,
    tasks,
    brainDump,
    isWorkTime,
    workTimeRemaining,
    taskSuggestions,
    isLoading,
    colors,
    saveUserData,
    saveTasks,
    saveBrainDump,
    addTask,
    toggleTaskComplete,
    updateTask,
    deleteTask,
    setMood,
    loadData
  ]);
});