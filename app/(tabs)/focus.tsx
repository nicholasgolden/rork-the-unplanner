import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Video, Phone, Play, Pause, RotateCcw } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function FocusScreen() {
  const { userData, saveUserData, colors } = useApp();
  const [isBodyDoubling, setIsBodyDoubling] = useState(userData.bodyDoublingActive);
  const [sessionTime] = useState(25 * 60); // 25 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(sessionTime);
  const [isRunning, setIsRunning] = useState(false);
  const [connectedUsers] = useState([
    { id: 1, name: 'Sarah', avatar: 'S', status: 'focusing' },
    { id: 2, name: 'Mike', avatar: 'M', status: 'break' },
  ]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(sessionTime);
  };

  const startBodyDoubling = () => {
    setIsBodyDoubling(true);
    saveUserData({ bodyDoublingActive: true });
  };

  const endBodyDoubling = () => {
    setIsBodyDoubling(false);
    saveUserData({ bodyDoublingActive: false });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Focus Session</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Deep work, together</Text>
          </View>

          <View style={styles.timerContainer}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.timerGradient}
            >
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              <View style={styles.timerControls}>
                <TouchableOpacity style={styles.timerButton} onPress={toggleTimer}>
                  {isRunning ? (
                    <Pause size={24} color={colors.white} />
                  ) : (
                    <Play size={24} color={colors.white} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.timerButton} onPress={resetTimer}>
                  <RotateCcw size={24} color={colors.white} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.bodyDoublingContainer}>
            <View style={styles.sectionHeader}>
              <Users size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Body Doubling</Text>
            </View>

            {!isBodyDoubling ? (
              <View style={[styles.startContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  Work alongside others virtually. Stay focused together.
                </Text>
                <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.primary }]} onPress={startBodyDoubling}>
                  <Text style={[styles.startButtonText, { color: colors.white }]}>Start Session</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.activeSession, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={styles.sessionStatus}>
                  <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
                  <Text style={[styles.statusText, { color: colors.success }]}>Session Active</Text>
                  <TouchableOpacity onPress={endBodyDoubling}>
                    <Text style={[styles.endText, { color: colors.error }]}>End</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.participants}>
                  <Text style={[styles.participantsTitle, { color: colors.textSecondary }]}>Connected ({connectedUsers.length + 1})</Text>
                  <View style={styles.avatarRow}>
                    <View style={[styles.avatar, styles.avatarSelf, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.avatarText, { color: colors.white }]}>
                        {userData.name?.[0]?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                    {connectedUsers.map(user => (
                      <View key={user.id} style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.avatarText, { color: colors.white }]}>{user.avatar}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.sessionActions}>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                    <Video size={20} color={colors.primary} />
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>Video</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                    <Phone size={20} color={colors.primary} />
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>Audio</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View style={styles.tipsContainer}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>Focus Tips</Text>
            {[
              'Put your phone on silent',
              'Close unnecessary tabs',
              'Have water nearby',
              'Take breaks every 25 minutes',
              'One task at a time'
            ].map((tip, index) => (
              <View key={index} style={[styles.tipCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={[styles.tipNumber, { backgroundColor: colors.primary + '33' }]}>
                  <Text style={[styles.tipNumberText, { color: colors.primary }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  timerContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  timerGradient: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 20,
  },
  timerButton: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyDoublingContainer: {
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
  startContainer: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    opacity: 0.95,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  startButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeSession: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    opacity: 0.95,
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  endText: {
    fontSize: 14,
  },
  participants: {
    marginBottom: 20,
  },
  participantsTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSelf: {
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    opacity: 0.95,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tipsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    opacity: 0.95,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
});