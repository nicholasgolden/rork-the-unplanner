import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { CheckCircle2, ChevronLeft, Clock, Briefcase, Home } from 'lucide-react-native';
import { router } from 'expo-router';
import { useApp, Task } from '@/contexts/AppContext';

type TimeBlock = 'morning' | 'afternoon' | 'evening';

function isTodayIso(iso?: string) {
  if (!iso) return false;
  const todayKey = new Date().toISOString().split('T')[0];
  return iso.startsWith(todayKey);
}

export default function CompletedTasksScreen() {
  const { colors, userData, tasks } = useApp();

  const todayCompleted = useMemo(() => {
    const all: { timeBlock: TimeBlock; task: Task }[] = [];
    (['morning', 'afternoon', 'evening'] as TimeBlock[]).forEach((tb) => {
      (tasks[tb] ?? []).forEach((t) => {
        if (t.completed && isTodayIso(t.completedAt)) {
          all.push({ timeBlock: tb, task: t });
        }
      });
    });

    all.sort((a, b) => {
      const at = a.task.completedAt ?? a.task.createdAt;
      const bt = b.task.completedAt ?? b.task.createdAt;
      return bt.localeCompare(at);
    });

    return all;
  }, [tasks]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    gradient: { flex: 1 },
    header: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.glass.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    titleWrap: { flex: 1 },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: -0.4,
    },
    subtitle: {
      marginTop: 3,
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    card: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.glass.background,
    },
    cardInner: {
      padding: 16,
      gap: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    rowLast: { borderBottomWidth: 0 },
    taskText: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '700' },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.glass.tertiary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metaText: { color: colors.textSecondary, fontSize: 12, fontWeight: '800' },
    empty: {
      marginTop: 28,
      marginHorizontal: 16,
      padding: 18,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.glass.background,
      alignItems: 'center',
      gap: 10,
    },
    emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
    emptyText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  }), [colors]);

  const content = (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={styles.backButton}
          testID="completed-back"
        >
          <ChevronLeft size={20} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>Completed</Text>
          <Text style={styles.subtitle}>Today • {userData.name || 'You'}</Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      {todayCompleted.length === 0 ? (
        <View style={styles.empty} testID="completed-empty">
          <CheckCircle2 size={26} color={colors.success} strokeWidth={2.5} />
          <Text style={styles.emptyTitle}>No completed tasks yet</Text>
          <Text style={styles.emptyText}>When you check off tasks, they’ll show up here for today.</Text>
        </View>
      ) : (
        <View style={styles.card} testID="completed-card">
          {Platform.OS === 'ios' ? (
            <BlurView intensity={30} tint={userData.theme === 'dark' ? 'systemUltraThinMaterialDark' : 'systemUltraThinMaterialLight'}>
              <View style={styles.cardInner}>
                {todayCompleted.map((item, idx) => {
                  const isLast = idx === todayCompleted.length - 1;
                  return (
                    <View key={item.task.id} style={[styles.row, isLast && styles.rowLast]}>
                      <CheckCircle2 size={18} color={colors.success} strokeWidth={2.5} />
                      <Text style={styles.taskText}>{item.task.text}</Text>
                      <View style={styles.meta}>
                        <View style={styles.metaChip}>
                          {item.task.category === 'work' ? (
                            <Briefcase size={12} color={colors.primary} strokeWidth={2.2} />
                          ) : (
                            <Home size={12} color={colors.secondary} strokeWidth={2.2} />
                          )}
                          <Text style={styles.metaText}>{item.timeBlock}</Text>
                        </View>
                        <View style={styles.metaChip}>
                          <Clock size={12} color={colors.textSecondary} strokeWidth={2.2} />
                          <Text style={styles.metaText}>{item.task.estimated}m</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </BlurView>
          ) : (
            <View style={styles.cardInner}>
              {todayCompleted.map((item, idx) => {
                const isLast = idx === todayCompleted.length - 1;
                return (
                  <View key={item.task.id} style={[styles.row, isLast && styles.rowLast]}>
                    <CheckCircle2 size={18} color={colors.success} />
                    <Text style={styles.taskText}>{item.task.text}</Text>
                    <View style={styles.meta}>
                      <View style={styles.metaChip}>
                        {item.task.category === 'work' ? (
                          <Briefcase size={12} color={colors.primary} />
                        ) : (
                          <Home size={12} color={colors.secondary} />
                        )}
                        <Text style={styles.metaText}>{item.timeBlock}</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Clock size={12} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{item.task.estimated}m</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      <View style={{ height: 22 }} />
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={[colors.background, colors.backgroundSecondary]} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {content}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
