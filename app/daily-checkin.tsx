import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Zap, BatteryLow, Battery, Target, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DailyCheckinScreen() {
  const { userData, setMood, addTask, colors } = useApp();
  const [showGoalSelection, setShowGoalSelection] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodSelection = async (mood: string) => {
    setSelectedMood(mood);
    await setMood(mood);
    await AsyncStorage.setItem('last-checkin-date', new Date().toDateString());
    
    // Check if user has goals and mood is calm or neutral
    const hasGoals = userData.goals.some(goal => goal.trim() !== '');
    if (hasGoals && (mood === 'Calm' || mood === 'Neutral')) {
      setShowGoalSelection(true);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleGoalStepSelection = (goalTitle: string, step: string, timeBlock: 'morning' | 'afternoon' | 'evening' = 'morning') => {
    addTask(timeBlock, step);
    router.replace('/(tabs)');
  };

  const skipGoalSelection = () => {
    router.replace('/(tabs)');
  };

  const moods: {
    mood: string;
    icon: any;
    gradient: [string, string];
    description: string;
  }[] = [
    { mood: 'Calm', icon: Heart, gradient: ['#10b981', '#059669'] as const, description: 'Ready and centered' },
    { mood: 'Overwhelmed', icon: Zap, gradient: ['#ef4444', '#dc2626'] as const, description: 'Too much at once' },
    { mood: 'Underwhelmed', icon: BatteryLow, gradient: ['#eab308', '#ca8a04'] as const, description: 'Need more energy' },
    { mood: 'Neutral', icon: Battery, gradient: ['#3b82f6', '#2563eb'] as const, description: 'Just okay' }
  ];

  if (showGoalSelection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.background, colors.backgroundSecondary]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.goalHeader}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.goalIcon}
              >
                <Target size={24} color={colors.white} />
              </LinearGradient>
              <Text style={[styles.goalTitle, { color: colors.text }]}>Work on a Goal Today?</Text>
              <Text style={[styles.goalSubtitle, { color: colors.textSecondary }]}>Since you&apos;re feeling {selectedMood?.toLowerCase()}, would you like to make progress on one of your goals?</Text>
            </View>
            
            <ScrollView style={styles.goalsContainer} showsVerticalScrollIndicator={false}>
              {userData.goals.filter(goal => goal.trim() !== '').map((goal, goalIndex) => {
                const steps = userData.goalSteps[goal] || [];
                return (
                  <View key={goalIndex} style={[styles.goalCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    <Text style={[styles.goalCardTitle, { color: colors.text }]}>{goal}</Text>
                    <Text style={[styles.goalCardSubtitle, { color: colors.textSecondary }]}>Choose a step to work on:</Text>
                    
                    {steps.map((step, stepIndex) => (
                      <TouchableOpacity
                        key={stepIndex}
                        style={[styles.stepOption, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                        onPress={() => handleGoalStepSelection(goal, step)}
                      >
                        <CheckCircle2 size={20} color={colors.primary} />
                        <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
                        <ArrowRight size={16} color={colors.textTertiary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
            
            <TouchableOpacity style={[styles.skipButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onPress={skipGoalSelection}>
              <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={[styles.greeting, { color: colors.text }]}>Good morning, {userData.name || 'Friend'}</Text>
          <Text style={[styles.question, { color: colors.textSecondary }]}>How are you feeling about today?</Text>
          
          <View style={styles.moodsGrid}>
            {moods.map(({ mood, icon: Icon, gradient, description }) => (
              <TouchableOpacity
                key={mood}
                style={styles.moodCard}
                onPress={() => handleMoodSelection(mood)}
              >
                <LinearGradient
                  colors={gradient}
                  style={styles.moodGradient}
                >
                  <Icon size={32} color={colors.white} />
                  <Text style={styles.moodText}>{mood}</Text>
                  <Text style={styles.moodDescription}>{description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  question: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 48,
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  moodCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  moodGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  moodText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
  },
  moodDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  goalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  goalIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  goalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  goalsContainer: {
    flex: 1,
    marginBottom: 24,
  },
  goalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    opacity: 0.95,
  },
  goalCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  goalCardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  stepOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
    opacity: 0.95,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  skipButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    opacity: 0.95,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});