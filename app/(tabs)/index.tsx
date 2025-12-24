import React, { useCallback, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Plus,
  Coffee,
  Sun,
  Moon,
  CheckCircle2,
  Circle,
  Zap,
  Battery,
  BatteryLow,
  Clock,
  Briefcase,
  Home,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

type TimeBlock = 'morning' | 'afternoon' | 'evening';

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { userData, tasks, addTask, toggleTaskComplete, updateTask, deleteTask, taskSuggestions, isWorkTime, colors, dismissSuggestionForToday, effectiveTheme } = useApp();
  const [newTaskInputs, setNewTaskInputs] = useState<{ morning: string; afternoon: string; evening: string }>({ morning: '', afternoon: '', evening: '' });
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({});
  const [expandedCompleted, setExpandedCompleted] = useState<Record<TimeBlock, boolean>>({
    morning: false,
    afternoon: false,
    evening: false,
  });
  const scrollRef = useRef<ScrollView | null>(null);
  const morningRef = useRef<View | null>(null);
  const afternoonRef = useRef<View | null>(null);
  const eveningRef = useRef<View | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [blockPositions, setBlockPositions] = useState<{ morning: number; afternoon: number; evening: number }>({ morning: 0, afternoon: 0, evening: 0 });

  const isLightTheme = effectiveTheme === 'light';
  const tabBarHeight = useMemo(() => 84 + insets.bottom, [insets.bottom]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradient: {
      flex: 1,
    },
    header: {
      padding: 20,
      paddingBottom: 10,
    },
    greeting: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 20,
      letterSpacing: -0.5,
      ...(effectiveTheme === 'light' ? {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      } : {}),
    },
    progressOverview: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.glass.background,
      borderRadius: 20,
      padding: 20,
      borderWidth: Platform.OS === 'ios' ? 0 : 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...(effectiveTheme === 'light' && Platform.OS === 'ios' ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      } : {}),
    },
    progressCircle: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.glass.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 20,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    progressPercent: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.primary,
    },
    progressInfo: {
      flex: 1,
    },
    progressTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
      letterSpacing: -0.3,
      ...(effectiveTheme === 'light' ? {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      } : {}),
    },
    progressSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    suggestionsContainer: {
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.glass.background,
      borderRadius: 20,
      padding: Platform.OS === 'ios' ? 20 : 16,
      borderWidth: Platform.OS === 'ios' ? 0 : 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...(effectiveTheme === 'light' && Platform.OS === 'ios' ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      } : {}),
    },
    suggestionsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    suggestionsTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginLeft: 12,
      flex: 1,
      letterSpacing: -0.3,
      ...(effectiveTheme === 'light' ? {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      } : {}),
    },
    suggestionsHide: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    suggestionCard: {
      backgroundColor: Platform.OS === 'ios' ? colors.glass.tertiary : colors.glass.background,
      borderRadius: 16,
      padding: 16,
      marginRight: 12,
      width: 220,
      borderWidth: 1,
      borderColor: colors.border,
      ...(effectiveTheme === 'light' ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      } : {}),
    },
    suggestionText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    suggestionReason: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 12,
      fontWeight: '500',
    },
    suggestionMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    suggestionBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    suggestionBadgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    tasksContainer: {
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    taskBlock: {
      marginBottom: 24,
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.glass.background,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: Platform.OS === 'ios' ? 0 : 1,
      borderColor: colors.border,
      ...(effectiveTheme === 'light' && Platform.OS === 'ios' ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      } : {}),
    },
    taskBlockHeader: {
      padding: 20,
      position: 'relative',
    },
    taskBlockHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1,
    },
    taskBlockTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.white,
      marginLeft: 16,
      flex: 1,
      letterSpacing: -0.4,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    progressContainer: {
      alignItems: 'flex-end',
    },
    progressText: {
      fontSize: 13,
      color: colors.white,
      marginBottom: 6,
      fontWeight: '600',
    },
    progressBar: {
      width: 70,
      height: 6,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 3,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.white,
      borderRadius: 3,
    },
    taskList: {
      padding: 16,
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.glass.tertiary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      ...(effectiveTheme === 'light' ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      } : {}),
    },
    taskItemExpanded: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      marginBottom: 0,
    },
    taskItemGlass: {
      borderRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      ...(effectiveTheme === 'light' ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      } : {}),
    },
    taskItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    checkbox: {
      marginRight: 16,
    },
    taskText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    taskTextCompleted: {
      textDecorationLine: 'line-through',
      opacity: 0.5,
    },
    taskMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginRight: 12,
    },
    taskTime: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    taskTimeText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    taskExpanded: {
      backgroundColor: colors.glass.tertiary,
      borderWidth: 1,
      borderColor: colors.border,
      borderTopWidth: 0,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    taskExpandedGlass: {
      borderWidth: 1,
      borderColor: colors.border,
      borderTopWidth: 0,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
    },
    taskExpandedContent: {
      padding: 16,
    },
    taskOptions: {
      marginBottom: 16,
    },
    optionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    energyOptions: {
      flexDirection: 'row',
      gap: 10,
    },
    energyOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      gap: 6,
    },
    energyOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    energyOptionText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    energyOptionTextActive: {
      color: colors.white,
    },
    categoryOptions: {
      flexDirection: 'row',
      gap: 10,
    },
    categoryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      gap: 6,
    },
    categoryOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryOptionText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    categoryOptionTextActive: {
      color: colors.white,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: `${colors.error}15`,
      borderWidth: 1,
      borderColor: `${colors.error}30`,
    },
    deleteButtonText: {
      fontSize: 15,
      color: colors.error,
      fontWeight: '700',
    },
    addTaskContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    addTaskInput: {
      flex: 1,
      backgroundColor: Platform.OS === 'ios' ? colors.glass.tertiary : colors.glass.background,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      fontWeight: '500',
      ...(effectiveTheme === 'light' ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      } : {}),
    },
    addTaskButton: {
      width: 52,
      height: 52,
      backgroundColor: colors.primary,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    // Glass morphism styles
    glassOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 20,
    },
  });

  const energyConfig = {
    low: { icon: BatteryLow, color: colors.success, label: 'Low' },
    medium: { icon: Battery, color: colors.warning, label: 'Medium' },
    high: { icon: Zap, color: colors.error, label: 'High' }
  };

  const timeBlockConfig = {
    morning: { 
      icon: Coffee, 
      gradient: [colors.systemOrange, colors.systemYellow] as const, 
      title: 'Morning Flow',
      glassColor: colors.glass.primary
    },
    afternoon: { 
      icon: Sun, 
      gradient: [colors.systemBlue, colors.systemTeal] as const, 
      title: 'Afternoon Focus',
      glassColor: colors.glass.secondary
    },
    evening: { 
      icon: Moon, 
      gradient: [colors.systemPurple, colors.systemIndigo] as const, 
      title: 'Evening Ease',
      glassColor: colors.glass.tertiary
    }
  };

  const getCompletedCount = () => {
    return Object.values(tasks).flat().filter(task => task.completed).length;
  };

  const getTotalCount = () => {
    return Object.values(tasks).flat().length;
  };

  const handleAddTask = (timeBlock: TimeBlock) => {
    const text = newTaskInputs[timeBlock];
    if (text.trim()) {
      addTask(timeBlock, text);
      setNewTaskInputs(prev => ({ ...prev, [timeBlock]: '' }));
    }
  };

  const scrollToTimeBlock = useCallback((timeBlock: TimeBlock) => {
    if (!scrollRef.current) return;

    const y = blockPositions[timeBlock];
    if (y > 0) {
      console.log('scrollToTimeBlock', { timeBlock, y });
      scrollRef.current.scrollTo({ y: Math.max(0, y - 16), animated: true });
    }
  }, [blockPositions]);

  const handleAddSuggestion = useCallback(async (suggestion: { timeBlock: string; text: string }) => {
    const timeBlock = (suggestion.timeBlock === 'any' ? 'afternoon' : suggestion.timeBlock) as TimeBlock;
    addTask(timeBlock, suggestion.text, suggestion as any);
    await dismissSuggestionForToday(suggestion.text);

    setTimeout(() => {
      scrollToTimeBlock(timeBlock);
    }, 80);
  }, [addTask, dismissSuggestionForToday, scrollToTimeBlock]);

  const handleDeleteTask = (timeBlock: TimeBlock, taskId: number) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTask(timeBlock, taskId) }
      ]
    );
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const isTodayIso = useCallback((iso?: string) => {
    if (!iso) return false;
    const todayKey = new Date().toISOString().split('T')[0];
    return iso.startsWith(todayKey);
  }, []);

  const renderTaskBlock = (timeBlock: TimeBlock) => {
    const config = timeBlockConfig[timeBlock];
    const blockTasks = tasks[timeBlock] || [];
    const incompleteTasks = blockTasks.filter(t => !t.completed);
    const completedTodayTasks = blockTasks.filter(t => t.completed && isTodayIso(t.completedAt));

    const completedCount = blockTasks.filter(t => t.completed).length;
    const progress = blockTasks.length > 0 ? (completedCount / blockTasks.length) * 100 : 0;

    return (
      <View
        style={styles.taskBlock}
        key={timeBlock}
        ref={timeBlock === 'morning' ? morningRef : timeBlock === 'afternoon' ? afternoonRef : eveningRef}
        onLayout={(event) => {
          const { y } = event.nativeEvent.layout;
          setBlockPositions(prev => ({ ...prev, [timeBlock]: y }));
        }}
        testID={`task-block-${timeBlock}`}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={60}
            tint={isLightTheme ? 'systemUltraThinMaterialLight' : 'systemUltraThinMaterialDark'}
            style={styles.taskBlockHeader}
          >
            <LinearGradient
              colors={[config.glassColor, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glassOverlay}
            >
              <View style={styles.taskBlockHeaderContent}>
                <config.icon size={26} color={colors.white} strokeWidth={2.5} />
                <Text style={styles.taskBlockTitle}>{config.title}</Text>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>{completedCount}/{blockTasks.length}</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        ) : (
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.taskBlockHeader}
          >
            <View style={styles.taskBlockHeaderContent}>
              <config.icon size={24} color="white" />
              <Text style={styles.taskBlockTitle}>{config.title}</Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{completedCount}/{blockTasks.length}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
              </View>
            </View>
          </LinearGradient>
        )}

        <View style={styles.taskList}>
          {incompleteTasks.map(task => {
            const EnergyIcon = energyConfig[task.energy].icon;
            const isExpanded = expandedTasks[task.id];

            return (
              <View key={task.id}>
                {Platform.OS === 'ios' ? (
                  <BlurView
                    intensity={40}
                    tint={isLightTheme ? 'systemUltraThinMaterialLight' : 'systemUltraThinMaterialDark'}
                    style={[styles.taskItemGlass, isExpanded && styles.taskItemExpanded]}
                  >
                    <TouchableOpacity
                      style={styles.taskItemContent}
                      onPress={() => setExpandedTasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                      activeOpacity={0.7}
                    >
                      <TouchableOpacity
                        onPress={() => toggleTaskComplete(timeBlock, task.id)}
                        style={styles.checkbox}
                      >
                        {task.completed ? (
                          <CheckCircle2 size={22} color={colors.success} strokeWidth={2.5} />
                        ) : (
                          <Circle size={22} color={colors.textSecondary} strokeWidth={2} />
                        )}
                      </TouchableOpacity>

                      <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                        {task.text}
                      </Text>

                      <View style={styles.taskMeta}>
                        {task.category === 'work' ? (
                          <Briefcase size={14} color={colors.primary} strokeWidth={2} />
                        ) : (
                          <Home size={14} color={colors.secondary} strokeWidth={2} />
                        )}
                        <EnergyIcon size={14} color={energyConfig[task.energy].color} strokeWidth={2} />
                        <View style={styles.taskTime}>
                          <Clock size={12} color={colors.textSecondary} strokeWidth={2} />
                          <Text style={styles.taskTimeText}>{task.estimated}m</Text>
                        </View>
                      </View>

                      {isExpanded ? (
                        <ChevronUp size={18} color={colors.textSecondary} strokeWidth={2} />
                      ) : (
                        <ChevronDown size={18} color={colors.textSecondary} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  </BlurView>
                ) : (
                  <TouchableOpacity
                    style={[styles.taskItem, isExpanded && styles.taskItemExpanded]}
                    onPress={() => setExpandedTasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                    activeOpacity={0.7}
                  >
                    <TouchableOpacity
                      onPress={() => toggleTaskComplete(timeBlock, task.id)}
                      style={styles.checkbox}
                    >
                      {task.completed ? (
                        <CheckCircle2 size={22} color={colors.success} />
                      ) : (
                        <Circle size={22} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>

                    <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                      {task.text}
                    </Text>

                    <View style={styles.taskMeta}>
                      {task.category === 'work' ? (
                        <Briefcase size={14} color={colors.primary} />
                      ) : (
                        <Home size={14} color={colors.secondary} />
                      )}
                      <EnergyIcon size={14} color={energyConfig[task.energy].color} />
                      <View style={styles.taskTime}>
                        <Clock size={12} color={colors.textSecondary} />
                        <Text style={styles.taskTimeText}>{task.estimated}m</Text>
                      </View>
                    </View>

                    {isExpanded ? (
                      <ChevronUp size={18} color={colors.textSecondary} />
                    ) : (
                      <ChevronDown size={18} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                )}

                {isExpanded && (
                  Platform.OS === 'ios' ? (
                    <BlurView
                      intensity={30}
                      tint={isLightTheme ? 'systemUltraThinMaterialLight' : 'systemUltraThinMaterialDark'}
                      style={styles.taskExpandedGlass}
                    >
                      <View style={styles.taskExpandedContent}>
                        <View style={styles.taskOptions}>
                          <Text style={styles.optionLabel}>Energy Level</Text>
                          <View style={styles.energyOptions}>
                            {(['low', 'medium', 'high'] as const).map(level => {
                              const Icon = energyConfig[level].icon;
                              return (
                                <TouchableOpacity
                                  key={level}
                                  style={[
                                    styles.energyOption,
                                    task.energy === level && styles.energyOptionActive
                                  ]}
                                  onPress={() => updateTask(timeBlock, task.id, { energy: level })}
                                >
                                  <Icon size={16} color={task.energy === level ? colors.white : energyConfig[level].color} />
                                  <Text style={[
                                    styles.energyOptionText,
                                    task.energy === level && styles.energyOptionTextActive
                                  ]}>
                                    {energyConfig[level].label}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>

                        <View style={styles.taskOptions}>
                          <Text style={styles.optionLabel}>Category</Text>
                          <View style={styles.categoryOptions}>
                            <TouchableOpacity
                              style={[
                                styles.categoryOption,
                                task.category === 'work' && styles.categoryOptionActive
                              ]}
                              onPress={() => updateTask(timeBlock, task.id, { category: 'work' })}
                            >
                              <Briefcase size={16} color={task.category === 'work' ? colors.white : colors.primary} />
                              <Text style={[
                                styles.categoryOptionText,
                                task.category === 'work' && styles.categoryOptionTextActive
                              ]}>Work</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.categoryOption,
                                task.category === 'personal' && styles.categoryOptionActive
                              ]}
                              onPress={() => updateTask(timeBlock, task.id, { category: 'personal' })}
                            >
                              <Home size={16} color={task.category === 'personal' ? colors.white : colors.secondary} />
                              <Text style={[
                                styles.categoryOptionText,
                                task.category === 'personal' && styles.categoryOptionTextActive
                              ]}>Personal</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteTask(timeBlock, task.id)}
                        >
                          <Trash2 size={18} color={colors.error} />
                          <Text style={styles.deleteButtonText}>Delete Task</Text>
                        </TouchableOpacity>
                      </View>
                    </BlurView>
                  ) : (
                    <View style={styles.taskExpanded}>
                      <View style={styles.taskOptions}>
                        <Text style={styles.optionLabel}>Energy Level</Text>
                        <View style={styles.energyOptions}>
                          {(['low', 'medium', 'high'] as const).map(level => {
                            const Icon = energyConfig[level].icon;
                            return (
                              <TouchableOpacity
                                key={level}
                                style={[
                                  styles.energyOption,
                                  task.energy === level && styles.energyOptionActive
                                ]}
                                onPress={() => updateTask(timeBlock, task.id, { energy: level })}
                              >
                                <Icon size={16} color={task.energy === level ? colors.white : energyConfig[level].color} />
                                <Text style={[
                                  styles.energyOptionText,
                                  task.energy === level && styles.energyOptionTextActive
                                ]}>
                                  {energyConfig[level].label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      <View style={styles.taskOptions}>
                        <Text style={styles.optionLabel}>Category</Text>
                        <View style={styles.categoryOptions}>
                          <TouchableOpacity
                            style={[
                              styles.categoryOption,
                              task.category === 'work' && styles.categoryOptionActive
                            ]}
                            onPress={() => updateTask(timeBlock, task.id, { category: 'work' })}
                          >
                            <Briefcase size={16} color={task.category === 'work' ? colors.white : colors.primary} />
                            <Text style={[
                              styles.categoryOptionText,
                              task.category === 'work' && styles.categoryOptionTextActive
                            ]}>Work</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.categoryOption,
                              task.category === 'personal' && styles.categoryOptionActive
                            ]}
                            onPress={() => updateTask(timeBlock, task.id, { category: 'personal' })}
                          >
                            <Home size={16} color={task.category === 'personal' ? colors.white : colors.secondary} />
                            <Text style={[
                              styles.categoryOptionText,
                              task.category === 'personal' && styles.categoryOptionTextActive
                            ]}>Personal</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTask(timeBlock, task.id)}
                      >
                        <Trash2 size={18} color={colors.error} />
                        <Text style={styles.deleteButtonText}>Delete Task</Text>
                      </TouchableOpacity>
                    </View>
                  )
                )}
              </View>
            );
          })}

          {completedTodayTasks.length > 0 && (
            <View style={{ marginTop: 6 }}>
              <TouchableOpacity
                onPress={() => setExpandedCompleted(prev => ({ ...prev, [timeBlock]: !prev[timeBlock] }))}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.glass.background,
                  marginBottom: 12,
                }}
                testID={`completed-toggle-${timeBlock}`}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={18} color={colors.success} strokeWidth={2.5} />
                  <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14 }}>Completed</Text>
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 999,
                    backgroundColor: `${colors.success}18`,
                    borderWidth: 1,
                    borderColor: `${colors.success}28`,
                  }}>
                    <Text style={{ color: colors.success, fontWeight: '800', fontSize: 12 }}>{completedTodayTasks.length}</Text>
                  </View>
                </View>
                {expandedCompleted[timeBlock] ? (
                  <ChevronUp size={18} color={colors.textSecondary} strokeWidth={2} />
                ) : (
                  <ChevronDown size={18} color={colors.textSecondary} strokeWidth={2} />
                )}
              </TouchableOpacity>

              {expandedCompleted[timeBlock] && (
                <View testID={`completed-list-${timeBlock}`}>
                  {completedTodayTasks.map(task => {
                    const EnergyIcon = energyConfig[task.energy].icon;
                    const isExpanded = expandedTasks[task.id];
                    return (
                      <View key={task.id} style={{ opacity: 0.92 }}>
                        {Platform.OS === 'ios' ? (
                          <BlurView
                            intensity={26}
                            tint={isLightTheme ? 'systemUltraThinMaterialLight' : 'systemUltraThinMaterialDark'}
                            style={[styles.taskItemGlass, isExpanded && styles.taskItemExpanded]}
                          >
                            <TouchableOpacity
                              style={styles.taskItemContent}
                              onPress={() => setExpandedTasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                              activeOpacity={0.7}
                              testID={`task-item-${task.id}`}
                            >
                              <TouchableOpacity
                                onPress={() => toggleTaskComplete(timeBlock, task.id)}
                                style={styles.checkbox}
                                testID={`task-checkbox-${task.id}`}
                              >
                                <CheckCircle2 size={22} color={colors.success} strokeWidth={2.5} />
                              </TouchableOpacity>

                              <Text style={[styles.taskText, styles.taskTextCompleted]}>{task.text}</Text>

                              <View style={styles.taskMeta}>
                                {task.category === 'work' ? (
                                  <Briefcase size={14} color={colors.primary} strokeWidth={2} />
                                ) : (
                                  <Home size={14} color={colors.secondary} strokeWidth={2} />
                                )}
                                <EnergyIcon size={14} color={energyConfig[task.energy].color} strokeWidth={2} />
                                <View style={styles.taskTime}>
                                  <Clock size={12} color={colors.textSecondary} strokeWidth={2} />
                                  <Text style={styles.taskTimeText}>{task.estimated}m</Text>
                                </View>
                              </View>

                              {isExpanded ? (
                                <ChevronUp size={18} color={colors.textSecondary} strokeWidth={2} />
                              ) : (
                                <ChevronDown size={18} color={colors.textSecondary} strokeWidth={2} />
                              )}
                            </TouchableOpacity>
                          </BlurView>
                        ) : (
                          <TouchableOpacity
                            style={[styles.taskItem, isExpanded && styles.taskItemExpanded]}
                            onPress={() => setExpandedTasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                            activeOpacity={0.7}
                            testID={`task-item-${task.id}`}
                          >
                            <TouchableOpacity
                              onPress={() => toggleTaskComplete(timeBlock, task.id)}
                              style={styles.checkbox}
                              testID={`task-checkbox-${task.id}`}
                            >
                              <CheckCircle2 size={22} color={colors.success} />
                            </TouchableOpacity>

                            <Text style={[styles.taskText, styles.taskTextCompleted]}>{task.text}</Text>

                            <View style={styles.taskMeta}>
                              {task.category === 'work' ? (
                                <Briefcase size={14} color={colors.primary} />
                              ) : (
                                <Home size={14} color={colors.secondary} />
                              )}
                              <EnergyIcon size={14} color={energyConfig[task.energy].color} />
                              <View style={styles.taskTime}>
                                <Clock size={12} color={colors.textSecondary} />
                                <Text style={styles.taskTimeText}>{task.estimated}m</Text>
                              </View>
                            </View>

                            {isExpanded ? (
                              <ChevronUp size={18} color={colors.textSecondary} />
                            ) : (
                              <ChevronDown size={18} color={colors.textSecondary} />
                            )}
                          </TouchableOpacity>
                        )}

                        {isExpanded && (
                          Platform.OS === 'ios' ? (
                            <BlurView
                              intensity={22}
                              tint={isLightTheme ? 'systemUltraThinMaterialLight' : 'systemUltraThinMaterialDark'}
                              style={styles.taskExpandedGlass}
                            >
                              <View style={styles.taskExpandedContent}>
                                <TouchableOpacity
                                  style={styles.deleteButton}
                                  onPress={() => handleDeleteTask(timeBlock, task.id)}
                                  testID={`task-delete-${task.id}`}
                                >
                                  <Trash2 size={18} color={colors.error} />
                                  <Text style={styles.deleteButtonText}>Delete Task</Text>
                                </TouchableOpacity>
                              </View>
                            </BlurView>
                          ) : (
                            <View style={styles.taskExpanded}>
                              <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteTask(timeBlock, task.id)}
                                testID={`task-delete-${task.id}`}
                              >
                                <Trash2 size={18} color={colors.error} />
                                <Text style={styles.deleteButtonText}>Delete Task</Text>
                              </TouchableOpacity>
                            </View>
                          )
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          <View style={styles.addTaskContainer}>
            <TextInput
              style={styles.addTaskInput}
              placeholder={isWorkTime && userData.appUsage !== 'personal' ? "What work needs focus?" : "What would you like to focus on?"}
              placeholderTextColor={colors.textTertiary}
              value={newTaskInputs[timeBlock]}
              onChangeText={(text) => setNewTaskInputs(prev => ({ ...prev, [timeBlock]: text }))}
              onSubmitEditing={() => handleAddTask(timeBlock)}
            />
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => handleAddTask(timeBlock)}
            >
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <ScrollView
          ref={(r) => {
            scrollRef.current = r;
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: tabBarHeight + 28 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <Text style={[styles.greeting, { flex: 1 }]}>Welcome back, {userData.name || 'Friend'}</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('open completed-tasks');
                  router.push('/completed-tasks' as any);
                }}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 14,
                  backgroundColor: colors.glass.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                testID="open-completed-tasks"
              >
                <CheckCircle2 size={18} color={colors.success} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={60}
                tint={isLightTheme ? 'systemUltraThinMaterialLight' : 'systemUltraThinMaterialDark'}
                style={styles.progressOverview}
              >
                <View style={styles.progressCircle}>
                  <Text style={styles.progressPercent}>
                    {getTotalCount() > 0 ? Math.round((getCompletedCount() / getTotalCount()) * 100) : 0}%
                  </Text>
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle}>Daily Progress</Text>
                  <Text style={styles.progressSubtitle}>
                    {getCompletedCount()} of {getTotalCount()} tasks complete
                  </Text>
                </View>
              </BlurView>
            ) : (
              <View style={styles.progressOverview}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressPercent}>
                    {getTotalCount() > 0 ? Math.round((getCompletedCount() / getTotalCount()) * 100) : 0}%
                  </Text>
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle}>Daily Progress</Text>
                  <Text style={styles.progressSubtitle}>
                    {getCompletedCount()} of {getTotalCount()} tasks complete
                  </Text>
                </View>
              </View>
            )}
          </View>

          {showSuggestions && taskSuggestions.length > 0 && (
            Platform.OS === 'ios' ? (
              <BlurView
                intensity={40}
                tint={isLightTheme ? 'systemUltraThinMaterialLight' : 'systemUltraThinMaterialDark'}
                style={styles.suggestionsContainer}
              >
                <View style={styles.suggestionsHeader}>
                  <Sparkles size={20} color={colors.primary} strokeWidth={2.5} />
                  <Text style={styles.suggestionsTitle}>Smart Suggestions</Text>
                  <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                    <Text style={styles.suggestionsHide}>Hide</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {taskSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionCard}
                      onPress={() => handleAddSuggestion(suggestion)}
                      testID={`suggestion-${index}`}
                    >
                      <Text style={styles.suggestionText}>{suggestion.text}</Text>
                      <Text style={styles.suggestionReason}>{suggestion.reason}</Text>
                      <View style={styles.suggestionMeta}>
                        <View style={[styles.suggestionBadge, { backgroundColor: energyConfig[suggestion.energy].color + '20' }]}>
                          <Text style={[styles.suggestionBadgeText, { color: energyConfig[suggestion.energy].color }]}>
                            {suggestion.energy}
                          </Text>
                        </View>
                        <Plus size={16} color={colors.primary} strokeWidth={2} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </BlurView>
            ) : (
              <View style={styles.suggestionsContainer}>
                <View style={styles.suggestionsHeader}>
                  <Sparkles size={20} color={colors.primary} />
                  <Text style={styles.suggestionsTitle}>Smart Suggestions</Text>
                  <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                    <Text style={styles.suggestionsHide}>Hide</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {taskSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionCard}
                      onPress={() => handleAddSuggestion(suggestion)}
                      testID={`suggestion-${index}`}
                    >
                      <Text style={styles.suggestionText}>{suggestion.text}</Text>
                      <Text style={styles.suggestionReason}>{suggestion.reason}</Text>
                      <View style={styles.suggestionMeta}>
                        <View style={[styles.suggestionBadge, { backgroundColor: energyConfig[suggestion.energy].color + '20' }]}>
                          <Text style={[styles.suggestionBadgeText, { color: energyConfig[suggestion.energy].color }]}>
                            {suggestion.energy}
                          </Text>
                        </View>
                        <Plus size={16} color={colors.primary} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.tasksContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          >
            {(['morning', 'afternoon', 'evening'] as TimeBlock[]).map(renderTaskBlock)}
          </KeyboardAvoidingView>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

