import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  Briefcase,
  Shield,
  Zap,
  Home,
  Heart,
  AlertCircle,
  Sun,
  Moon,
  Edit3,
  X,
  Check,
  Clock,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function SettingsScreen() {
  const { userData, saveUserData, colors } = useApp();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(userData.workSchedule);

  const toggleWorkSchedule = () => {
    saveUserData({
      workSchedule: {
        ...userData.workSchedule,
        enabled: !userData.workSchedule.enabled
      }
    });
  };

  const toggleTheme = () => {
    const next = userData.theme === 'light' ? 'dark' : 'light';
    saveUserData({ theme: next, themeMode: 'light' === next ? 'light' : 'dark' });
  };

  const openScheduleEditor = () => {
    setEditingSchedule(userData.workSchedule);
    setShowScheduleModal(true);
  };

  const saveSchedule = () => {
    saveUserData({ workSchedule: editingSchedule });
    setShowScheduleModal(false);
  };

  const toggleDay = (day: keyof typeof editingSchedule.days) => {
    setEditingSchedule(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          enabled: !prev.days[day].enabled
        }
      }
    }));
  };

  const updateDayTime = (day: keyof typeof editingSchedule.days, field: 'start' | 'end', value: string) => {
    setEditingSchedule(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          [field]: value
        }
      }
    }));
  };

  const togglePreference = (key: keyof typeof userData.preferences) => {
    saveUserData({
      preferences: {
        ...userData.preferences,
        [key]: !userData.preferences[key]
      }
    });
  };

  const setAppUsage = (usage: 'personal' | 'work' | 'both') => {
    saveUserData({ appUsage: usage });
  };

  const ScheduleModal = () => (
    <Modal
      visible={showScheduleModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Work Schedule</Text>
          <TouchableOpacity onPress={saveSchedule}>
            <Check size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.modalContent} 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          {Object.entries(editingSchedule.days).map(([day, schedule]) => {
            const dayKey = day as keyof typeof editingSchedule.days;
            return (
              <View key={day} style={[styles.scheduleRow, { backgroundColor: colors.glass.background, borderColor: colors.border }]}>
                <View style={styles.scheduleRowHeader}>
                  <TouchableOpacity 
                    style={styles.dayToggle}
                    onPress={() => toggleDay(dayKey)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dayName, { color: schedule.enabled ? colors.text : colors.textTertiary }]}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Text>
                    <Switch
                      value={schedule.enabled}
                      onValueChange={() => toggleDay(dayKey)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.white}
                    />
                  </TouchableOpacity>
                </View>
                
                {schedule.enabled && (
                  <View style={styles.timeInputs}>
                    <View style={styles.timeInput}>
                      <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Start</Text>
                      <TextInput
                        style={[styles.timeField, { backgroundColor: colors.glass.tertiary, color: colors.text, borderColor: colors.border }]}
                        value={schedule.start}
                        onChangeText={(value) => updateDayTime(dayKey, 'start', value)}
                        placeholder="09:00"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.timeInput}>
                      <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>End</Text>
                      <TextInput
                        style={[styles.timeField, { backgroundColor: colors.glass.tertiary, color: colors.text, borderColor: colors.border }]}
                        value={schedule.end}
                        onChangeText={(value) => updateDayTime(dayKey, 'end', value)}
                        placeholder="17:00"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }} // Better scrolling
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          </View>

          {/* Appearance */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              {userData.themeMode === 'light' ? (
                <Sun size={20} color={colors.warning} />
              ) : userData.themeMode === 'dark' ? (
                <Moon size={20} color={colors.secondary} />
              ) : (
                <Zap size={20} color={colors.primary} />
              )}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
            </View>

            <View style={[styles.settingItem, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 } : {}) }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Follow system or set light/dark</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {([
                  { key: 'system', label: 'Auto' },
                  { key: 'light', label: 'Light' },
                  { key: 'dark', label: 'Dark' },
                ] as const).map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => saveUserData({ themeMode: opt.key, theme: opt.key === 'system' ? userData.theme : (opt.key as 'light' | 'dark') })}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: userData.themeMode === opt.key ? colors.primary : colors.border,
                      backgroundColor: userData.themeMode === opt.key ? colors.primary + '20' : 'transparent',
                    }}
                  >
                    <Text style={{ color: userData.themeMode === opt.key ? colors.primary : colors.textSecondary, fontWeight: '600' }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Work Schedule */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Briefcase size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Work Schedule</Text>
            </View>

            <View style={[styles.settingItem, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 } : {}) }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Enable work schedule</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Track work hours and adapt suggestions</Text>
              </View>
              <Switch
                value={userData.workSchedule?.enabled}
                onValueChange={toggleWorkSchedule}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            {userData.workSchedule?.enabled && (
              <>
                <TouchableOpacity 
                  style={[styles.settingItem, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 } : {}) }]}
                  onPress={openScheduleEditor}
                >
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Edit schedule</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Customize your work hours</Text>
                  </View>
                  <Edit3 size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <View style={[styles.scheduleDetails, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 } : {}) }]}>
                  {Object.entries(userData.workSchedule.days)
                    .filter(([_, schedule]) => schedule.enabled)
                    .map(([day, schedule]) => (
                      <View key={day} style={styles.scheduleDay}>
                        <Text style={[styles.scheduleDayName, { color: colors.text }]}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </Text>
                        <View style={styles.scheduleDayTimeContainer}>
                          <Clock size={14} color={colors.textSecondary} />
                          <Text style={[styles.scheduleDayTime, { color: colors.textSecondary }]}>
                            {schedule.start} - {schedule.end}
                          </Text>
                        </View>
                      </View>
                    ))}
                  {Object.values(userData.workSchedule.days).every(schedule => !schedule.enabled) && (
                    <Text style={[styles.noScheduleText, { color: colors.textTertiary }]}>
                      No work days configured
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Bell size={20} color={colors.secondary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
            </View>

            <View style={[styles.settingItem, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 } : {}) }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Receive helpful reminders</Text>
              </View>
              <Switch
                value={userData.preferences.notifications}
                onValueChange={() => togglePreference('notifications')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            {userData.workSchedule?.enabled && (
              <>
                <View style={[styles.settingItem, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 } : {}) }]}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Mute during work</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Focus without interruptions</Text>
                  </View>
                  <Switch
                    value={userData.muteDuringWork}
                    onValueChange={(value) => saveUserData({ muteDuringWork: value })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                </View>

                <View style={[styles.settingItem, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 } : {}) }]}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Quiet after work</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Evening wind-down mode</Text>
                  </View>
                  <Switch
                    value={userData.muteAfterWork}
                    onValueChange={(value) => saveUserData({ muteAfterWork: value })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                </View>
              </>
            )}

            <View style={[styles.settingItem, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 } : {}) }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Energy reminders</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Check in with yourself</Text>
              </View>
              <Switch
                value={userData.preferences.energyReminders}
                onValueChange={() => togglePreference('energyReminders')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          {/* App Usage */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color={colors.success} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>App Usage</Text>
            </View>

            <View style={styles.usageOptions}>
              {[
                { value: 'personal' as const, icon: Home, label: 'Personal' },
                { value: 'work' as const, icon: Briefcase, label: 'Work' },
                { value: 'both' as const, icon: Zap, label: 'Both' }
              ].map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.usageOption,
                    { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 } : {}) },
                    userData.appUsage === option.value && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setAppUsage(option.value)}
                >
                  <option.icon 
                    size={20} 
                    color={userData.appUsage === option.value ? colors.white : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.usageOptionText,
                    { color: colors.textSecondary },
                    userData.appUsage === option.value && { color: colors.white }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Other Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={20} color={colors.warning} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
            </View>

            <View style={[styles.settingItem, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 } : {}) }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Auto-save</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Automatically save your progress</Text>
              </View>
              <Switch
                value={userData.preferences.autoSave}
                onValueChange={() => togglePreference('autoSave')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={[styles.settingItem, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 } : {}) }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Smart scheduling</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>AI-powered task suggestions</Text>
              </View>
              <Switch
                value={userData.preferences.smartScheduling}
                onValueChange={() => togglePreference('smartScheduling')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <TouchableOpacity style={[styles.linkItem, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 } : {}) }]}>
              <Heart size={20} color={colors.error} />
              <Text style={[styles.linkText, { color: colors.text }]}>Support</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.linkItem, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 } : {}) }]}>
              <AlertCircle size={20} color={colors.warning} />
              <Text style={[styles.linkText, { color: colors.text }]}>About</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        <ScheduleModal />
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
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
  },
  scheduleDetails: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  scheduleDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scheduleDayName: {
    fontSize: 14,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  scheduleDayTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleDayTime: {
    fontSize: 14,
  },
  noScheduleText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
    fontStyle: 'italic',
  },
  usageOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  usageOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 8,
    opacity: 0.95, // More transparent
  },
  usageOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
    opacity: 0.95, // More transparent
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  scheduleRow: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    opacity: 0.95, // More transparent
  },
  scheduleRowHeader: {
    marginBottom: 12,
  },
  dayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeField: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
});