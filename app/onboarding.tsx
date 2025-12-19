import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, ArrowRight, Home, Briefcase, Zap, Bell, Moon, Sparkles, Target, Plus, X } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import Colors from '@/constants/colors';

type OnboardingStep = 'name' | 'usage' | 'schedule' | 'notifications' | 'goals' | 'goalSteps';

export default function OnboardingScreen() {
  const { userData, saveUserData } = useApp();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('name');
  const [localData, setLocalData] = useState(userData);
  const [currentGoal, setCurrentGoal] = useState('');
  const [goalSteps, setGoalSteps] = useState<string[]>(['']);
  const [hasGoals, setHasGoals] = useState<boolean | null>(null);

  const handleNext = async () => {
    await saveUserData(localData);
    
    switch (currentStep) {
      case 'name':
        setCurrentStep('usage');
        break;
      case 'usage':
        if (localData.appUsage === 'work' || localData.appUsage === 'both') {
          setCurrentStep('schedule');
        } else {
          setCurrentStep('notifications');
        }
        break;
      case 'schedule':
        setCurrentStep('notifications');
        break;
      case 'notifications':
        setCurrentStep('goals');
        break;
      case 'goals':
        if (hasGoals) {
          setCurrentStep('goalSteps');
        } else {
          router.replace('/daily-checkin' as any);
        }
        break;
      case 'goalSteps':
        // Save the goal and steps
        const updatedGoals = [...localData.goals.filter(g => g.trim() !== ''), currentGoal];
        const updatedGoalSteps = { ...localData.goalSteps, [currentGoal]: goalSteps.filter(s => s.trim() !== '') };
        await saveUserData({ goals: updatedGoals, goalSteps: updatedGoalSteps });
        router.replace('/daily-checkin' as any);
        break;
    }
  };

  const toggleDay = (day: keyof typeof localData.workSchedule.days) => {
    setLocalData({
      ...localData,
      workSchedule: {
        ...localData.workSchedule,
        days: {
          ...localData.workSchedule.days,
          [day]: {
            ...localData.workSchedule.days[day],
            enabled: !localData.workSchedule.days[day].enabled
          }
        }
      }
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'name':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.iconGradient}
              >
                <Brain size={32} color={Colors.white} />
              </LinearGradient>
            </View>
            
            <Text style={styles.stepTitle}>Welcome to The Unplanner</Text>
            <Text style={styles.stepSubtitle}>Let&apos;s start with something simple - what should I call you?</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Your name..."
              placeholderTextColor={Colors.textTertiary}
              value={localData.name}
              onChangeText={(text) => setLocalData({ ...localData, name: text })}
              autoFocus
            />
            
            <TouchableOpacity
              style={[styles.button, !localData.name.trim() && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={!localData.name.trim()}
            >
              <Text style={styles.buttonText}>Nice to meet you</Text>
              <ArrowRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        );

      case 'usage':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Hi {localData.name}!</Text>
            <Text style={styles.stepTitle}>How will you use The Unplanner?</Text>
            <Text style={styles.stepSubtitle}>This helps me tailor the experience for you</Text>
            
            <View style={styles.optionsContainer}>
              {[
                { value: 'personal' as const, icon: Home, title: 'Personal Life', desc: 'Managing daily tasks and personal goals' },
                { value: 'work' as const, icon: Briefcase, title: 'Work Only', desc: 'Professional tasks and productivity' },
                { value: 'both' as const, icon: Zap, title: 'Work & Personal', desc: 'Balance both in one place' }
              ].map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.optionCard, localData.appUsage === option.value && styles.optionCardActive]}
                  onPress={() => setLocalData({ ...localData, appUsage: option.value })}
                >
                  <option.icon size={24} color={localData.appUsage === option.value ? Colors.white : Colors.primary} />
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, localData.appUsage === option.value && styles.optionTitleActive]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.optionDesc, localData.appUsage === option.value && styles.optionDescActive]}>
                      {option.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={[styles.button, !localData.appUsage && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={!localData.appUsage}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <ArrowRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        );

      case 'schedule':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What&apos;s your work schedule?</Text>
            <Text style={styles.stepSubtitle}>I&apos;ll adapt to your rhythm</Text>
            
            <ScrollView style={styles.scheduleContainer} showsVerticalScrollIndicator={false}>
              {Object.entries(localData.workSchedule.days).map(([day, schedule]) => (
                <View key={day} style={styles.scheduleDay}>
                  <TouchableOpacity
                    style={styles.scheduleDayToggle}
                    onPress={() => toggleDay(day as keyof typeof localData.workSchedule.days)}
                  >
                    <Switch
                      value={schedule.enabled}
                      onValueChange={() => toggleDay(day as keyof typeof localData.workSchedule.days)}
                      trackColor={{ false: Colors.border, true: Colors.primary }}
                      thumbColor={Colors.white}
                    />
                    <Text style={styles.scheduleDayName}>{day}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setCurrentStep('notifications')}
              >
                <Text style={styles.buttonTextSecondary}>Skip for now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setLocalData({ ...localData, workSchedule: { ...localData.workSchedule, enabled: true } });
                  handleNext();
                }}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'notifications':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How should I handle notifications?</Text>
            <Text style={styles.stepSubtitle}>Let&apos;s respect your focus time</Text>
            
            <View style={styles.notificationOptions}>
              {localData.workSchedule?.enabled && (
                <>
                  <View style={styles.notificationOption}>
                    <View style={styles.notificationInfo}>
                      <Bell size={20} color={Colors.primary} />
                      <View style={styles.notificationText}>
                        <Text style={styles.notificationTitle}>Mute during work hours</Text>
                        <Text style={styles.notificationDesc}>Stay focused without interruptions</Text>
                      </View>
                    </View>
                    <Switch
                      value={localData.muteDuringWork}
                      onValueChange={(value) => setLocalData({ ...localData, muteDuringWork: value })}
                      trackColor={{ false: Colors.border, true: Colors.primary }}
                      thumbColor={Colors.white}
                    />
                  </View>
                  
                  <View style={styles.notificationOption}>
                    <View style={styles.notificationInfo}>
                      <Moon size={20} color={Colors.secondary} />
                      <View style={styles.notificationText}>
                        <Text style={styles.notificationTitle}>Quiet after work</Text>
                        <Text style={styles.notificationDesc}>Automatic evening wind-down</Text>
                      </View>
                    </View>
                    <Switch
                      value={localData.muteAfterWork}
                      onValueChange={(value) => setLocalData({ ...localData, muteAfterWork: value })}
                      trackColor={{ false: Colors.border, true: Colors.primary }}
                      thumbColor={Colors.white}
                    />
                  </View>
                </>
              )}
              
              <View style={styles.notificationOption}>
                <View style={styles.notificationInfo}>
                  <Sparkles size={20} color={Colors.warning} />
                  <View style={styles.notificationText}>
                    <Text style={styles.notificationTitle}>Energy reminders</Text>
                    <Text style={styles.notificationDesc}>Gentle prompts to check in with yourself</Text>
                  </View>
                </View>
                <Switch
                  value={localData.preferences.energyReminders}
                  onValueChange={(value) => setLocalData({
                    ...localData,
                    preferences: { ...localData.preferences, energyReminders: value }
                  })}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Continue</Text>
              <ArrowRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        );

      case 'goals':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.iconGradient}
              >
                <Target size={32} color={Colors.white} />
              </LinearGradient>
            </View>
            
            <Text style={styles.stepTitle}>Long-term Goals</Text>
            <Text style={styles.stepSubtitle}>Do you have any important goals you&apos;d like to work towards?</Text>
            
            <View style={styles.goalOptionsContainer}>
              <TouchableOpacity
                style={[styles.goalOption, hasGoals === true && styles.goalOptionActive]}
                onPress={() => setHasGoals(true)}
              >
                <Text style={[styles.goalOptionText, hasGoals === true && styles.goalOptionTextActive]}>Yes, I have goals</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.goalOption, hasGoals === false && styles.goalOptionActive]}
                onPress={() => setHasGoals(false)}
              >
                <Text style={[styles.goalOptionText, hasGoals === false && styles.goalOptionTextActive]}>Not right now</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.button, hasGoals === null && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={hasGoals === null}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <ArrowRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        );

      case 'goalSteps':
        const addStep = () => {
          setGoalSteps([...goalSteps, '']);
        };
        
        const updateStep = (index: number, value: string) => {
          const newSteps = [...goalSteps];
          newSteps[index] = value;
          setGoalSteps(newSteps);
        };
        
        const removeStep = (index: number) => {
          if (goalSteps.length > 1) {
            const newSteps = goalSteps.filter((_, i) => i !== index);
            setGoalSteps(newSteps);
          }
        };
        
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Let&apos;s break it down</Text>
            <Text style={styles.stepSubtitle}>First, what&apos;s your goal?</Text>
            
            <TextInput
              style={styles.input}
              placeholder="e.g., Learn a new language, Start a business..."
              placeholderTextColor={Colors.textTertiary}
              value={currentGoal}
              onChangeText={setCurrentGoal}
              autoFocus
            />
            
            {currentGoal.trim() && (
              <>
                <Text style={styles.stepsTitle}>What steps do you need to take?</Text>
                
                <ScrollView style={styles.stepsContainer} showsVerticalScrollIndicator={false}>
                  {goalSteps.map((step, index) => (
                    <View key={index} style={styles.stepInputContainer}>
                      <TextInput
                        style={[styles.input, styles.stepInput]}
                        placeholder={`Step ${index + 1}...`}
                        placeholderTextColor={Colors.textTertiary}
                        value={step}
                        onChangeText={(value) => updateStep(index, value)}
                      />
                      <View style={styles.stepActions}>
                        {index === goalSteps.length - 1 && (
                          <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
                            <Plus size={20} color={Colors.primary} />
                          </TouchableOpacity>
                        )}
                        {goalSteps.length > 1 && (
                          <TouchableOpacity style={styles.removeStepButton} onPress={() => removeStep(index)}>
                            <X size={16} color={Colors.textTertiary} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
            
            <TouchableOpacity
              style={[styles.button, (!currentGoal.trim() || !goalSteps.some(s => s.trim())) && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={!currentGoal.trim() || !goalSteps.some(s => s.trim())}
            >
              <Text style={styles.buttonText}>Looking forward to helping you achieve this!</Text>
              <ArrowRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.gradient}
      >
        {renderStep()}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
  },
  stepContainer: {
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  buttonSecondary: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  optionCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  optionTitleActive: {
    color: Colors.white,
  },
  optionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  optionDescActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  scheduleContainer: {
    maxHeight: 300,
    marginBottom: 24,
  },
  scheduleDay: {
    marginBottom: 12,
  },
  scheduleDayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  scheduleDayName: {
    fontSize: 16,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  notificationOptions: {
    marginBottom: 24,
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  notificationDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  goalOptionsContainer: {
    marginBottom: 24,
  },
  goalOption: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  goalOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  goalOptionTextActive: {
    color: Colors.white,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  stepsContainer: {
    maxHeight: 300,
    marginBottom: 24,
  },
  stepInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  stepInput: {
    flex: 1,
    marginBottom: 0,
  },
  stepActions: {
    flexDirection: 'row',
    gap: 4,
  },
  addStepButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  removeStepButton: {
    width: 32,
    height: 32,
    backgroundColor: Colors.cardBg,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});