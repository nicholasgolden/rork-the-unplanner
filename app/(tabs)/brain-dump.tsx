import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Brain, Mic, MicOff, Volume2, Calendar, Save } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function BrainDumpScreen() {
  const { userData, brainDump, saveBrainDump, colors } = useApp();
  const [localBrainDump, setLocalBrainDump] = useState(brainDump);
  const [isRecording, setIsRecording] = useState(false);

  const handleSave = () => {
    saveBrainDump(localBrainDump);
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradient: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      marginBottom: 20,
    },
    headerGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 24,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      position: 'relative',
      overflow: 'hidden',
    },
    headerText: {
      marginLeft: 20,
      zIndex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.white,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 4,
      fontWeight: '500',
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.cardBg.replace('0.1)', '0.08)'), // More transparent
      borderWidth: Platform.OS === 'ios' ? 0 : 1,
      borderColor: colors.border.replace('0.1)', '0.06)'), // More transparent border
      overflow: 'hidden',
    },
    dateText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: 12,
      fontWeight: '600',
    },
    content: {
      paddingHorizontal: 20,
    },
    toolBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    toolButton: {
      width: 52,
      height: 52,
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.cardBg.replace('0.1)', '0.08)'), // More transparent
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: Platform.OS === 'ios' ? 0 : 1,
      borderColor: colors.border.replace('0.1)', '0.06)'), // More transparent border
      overflow: 'hidden',
    },
    toolButtonActive: {
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.error.replace('1)', '0.15)'), // More muted
      borderColor: colors.error.replace('1)', '0.8)'), // Muted error color
    },
    characterCount: {
      flex: 1,
      alignItems: 'flex-end',
    },
    characterCountText: {
      fontSize: 14,
      color: colors.textTertiary,
      fontWeight: '600',
    },
    textArea: {
      backgroundColor: colors.cardBg.replace('0.1)', '0.08)'), // More transparent
      borderRadius: 20,
      padding: 20,
      minHeight: 320,
      fontSize: 17,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border.replace('0.1)', '0.06)'), // More transparent border
      fontWeight: '500',
      lineHeight: 24,
    },
    promptsContainer: {
      marginTop: 24,
    },
    promptsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    promptCard: {
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.cardBg.replace('0.1)', '0.08)'), // More transparent
      borderRadius: 16,
      padding: Platform.OS === 'ios' ? 0 : 16,
      marginRight: 12,
      borderWidth: Platform.OS === 'ios' ? 0 : 1,
      borderColor: colors.border.replace('0.1)', '0.05)'), // More transparent border
      overflow: 'hidden',
    },
    promptText: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '600',
    },
    historyContainer: {
      marginTop: 24,
      marginBottom: 40, // Reduced since we have better scrolling padding
    },
    historyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    historyCard: {
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.cardBg.replace('0.1)', '0.08)'), // More transparent
      borderRadius: 16,
      padding: Platform.OS === 'ios' ? 0 : 16,
      marginBottom: 12,
      borderWidth: Platform.OS === 'ios' ? 0 : 1,
      borderColor: colors.border.replace('0.1)', '0.05)'), // More transparent border
      overflow: 'hidden',
    },
    historyDate: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 6,
    },
    historyContent: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      fontWeight: '500',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      paddingBottom: 34,
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background + 'F0',
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      gap: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    saveButtonText: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.white,
    },
    // Glass morphism styles
    glassOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 24,
      flexDirection: 'row',
      alignItems: 'center',
    },
    toolButtonContent: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textAreaContainer: {
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border.replace('0.1)', '0.04)'), // More transparent border
    },
    textAreaGlass: {
      backgroundColor: 'transparent',
      padding: 20,
      minHeight: 320,
      fontSize: 17,
      color: colors.text,
      fontWeight: '500',
      lineHeight: 24,
    },
    promptCardContent: {
      padding: 16,
    },
    historyCardContent: {
      padding: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }} // Better scrolling
          >
            <View style={styles.header}>
              {Platform.OS === 'ios' ? (
                <BlurView
                  intensity={60}
                  tint="systemUltraThinMaterialDark"
                  style={styles.headerGradient}
                >
                  <LinearGradient
                    colors={[colors.glass.secondary, 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.glassOverlay}
                  >
                    <Brain size={36} color={colors.white} strokeWidth={2.5} />
                    <View style={styles.headerText}>
                      <Text style={styles.title}>Thought Capture</Text>
                      <Text style={styles.subtitle}>Let it flow freely</Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              ) : (
                <LinearGradient
                  colors={[colors.systemPurple, colors.systemIndigo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.headerGradient}
                >
                  <Brain size={32} color={colors.white} />
                  <View style={styles.headerText}>
                    <Text style={styles.title}>Thought Capture</Text>
                    <Text style={styles.subtitle}>Let it flow freely</Text>
                  </View>
                </LinearGradient>
              )}
            </View>

            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={40}
                tint="systemUltraThinMaterialDark"
                style={styles.dateContainer}
              >
                <Calendar size={18} color={colors.textSecondary} strokeWidth={2} />
                <Text style={styles.dateText}>{dateString}</Text>
              </BlurView>
            ) : (
              <View style={styles.dateContainer}>
                <Calendar size={16} color={colors.textSecondary} />
                <Text style={styles.dateText}>{dateString}</Text>
              </View>
            )}

            <View style={styles.content}>
              <View style={styles.toolBar}>
                {Platform.OS === 'ios' ? (
                  <>
                    <BlurView
                      intensity={40}
                      tint="systemUltraThinMaterialDark"
                      style={[styles.toolButton, isRecording && styles.toolButtonActive]}
                    >
                      <TouchableOpacity
                        style={styles.toolButtonContent}
                        onPress={() => setIsRecording(!isRecording)}
                      >
                        {isRecording ? (
                          <MicOff size={22} color={colors.error} strokeWidth={2.5} />
                        ) : (
                          <Mic size={22} color={colors.textSecondary} strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                    </BlurView>
                    <BlurView
                      intensity={40}
                      tint="systemUltraThinMaterialDark"
                      style={styles.toolButton}
                    >
                      <TouchableOpacity style={styles.toolButtonContent}>
                        <Volume2 size={22} color={colors.textSecondary} strokeWidth={2} />
                      </TouchableOpacity>
                    </BlurView>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.toolButton, isRecording && styles.toolButtonActive]}
                      onPress={() => setIsRecording(!isRecording)}
                    >
                      {isRecording ? (
                        <MicOff size={20} color={colors.error} />
                      ) : (
                        <Mic size={20} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton}>
                      <Volume2 size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </>
                )}
                <View style={styles.characterCount}>
                  <Text style={styles.characterCountText}>{localBrainDump.length} characters</Text>
                </View>
              </View>

              {Platform.OS === 'ios' ? (
                <BlurView
                  intensity={30}
                  tint="systemUltraThinMaterialDark"
                  style={styles.textAreaContainer}
                >
                  <TextInput
                    style={styles.textAreaGlass}
                    multiline
                    placeholder="Stream of consciousness welcome here... no organizing needed"
                    placeholderTextColor={colors.textTertiary}
                    value={localBrainDump}
                    onChangeText={setLocalBrainDump}
                    onBlur={handleSave}
                    textAlignVertical="top"
                  />
                </BlurView>
              ) : (
                <TextInput
                  style={styles.textArea}
                  multiline
                  placeholder="Stream of consciousness welcome here... no organizing needed"
                  placeholderTextColor={colors.textTertiary}
                  value={localBrainDump}
                  onChangeText={setLocalBrainDump}
                  onBlur={handleSave}
                  textAlignVertical="top"
                />
              )}

              <View style={styles.promptsContainer}>
                <Text style={styles.promptsTitle}>Feeling stuck? Try these prompts:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[
                    "What's on my mind right now?",
                    "What am I avoiding?",
                    "What would make today better?",
                    "What's exciting me?",
                    "What needs my attention?"
                  ].map((prompt, index) => (
                    Platform.OS === 'ios' ? (
                      <BlurView
                        key={index}
                        intensity={30}
                        tint="systemUltraThinMaterialDark"
                        style={styles.promptCard}
                      >
                        <TouchableOpacity
                          style={styles.promptCardContent}
                          onPress={() => setLocalBrainDump(prev => prev + (prev ? '\n\n' : '') + prompt + '\n')}
                        >
                          <Text style={styles.promptText}>{prompt}</Text>
                        </TouchableOpacity>
                      </BlurView>
                    ) : (
                      <TouchableOpacity
                        key={index}
                        style={styles.promptCard}
                        onPress={() => setLocalBrainDump(prev => prev + (prev ? '\n\n' : '') + prompt + '\n')}
                      >
                        <Text style={styles.promptText}>{prompt}</Text>
                      </TouchableOpacity>
                    )
                  ))}
                </ScrollView>
              </View>

              <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Recent Entries</Text>
                {Object.entries(userData.brainDumpHistory || {})
                  .slice(-3)
                  .reverse()
                  .map(([date, content]) => (
                    Platform.OS === 'ios' ? (
                      <BlurView
                        key={date}
                        intensity={30}
                        tint="systemUltraThinMaterialDark"
                        style={styles.historyCard}
                      >
                        <TouchableOpacity style={styles.historyCardContent}>
                          <Text style={styles.historyDate}>
                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Text>
                          <Text style={styles.historyContent} numberOfLines={2}>
                            {content}
                          </Text>
                        </TouchableOpacity>
                      </BlurView>
                    ) : (
                      <TouchableOpacity key={date} style={styles.historyCard}>
                        <Text style={styles.historyDate}>
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                        <Text style={styles.historyContent} numberOfLines={2}>
                          {content}
                        </Text>
                      </TouchableOpacity>
                    )
                  ))}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={80}
            tint="systemUltraThinMaterialDark"
            style={styles.footer}
          >
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={22} color={colors.white} strokeWidth={2.5} />
              <Text style={styles.saveButtonText}>Save Entry</Text>
            </TouchableOpacity>
          </BlurView>
        ) : (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={20} color={colors.white} />
              <Text style={styles.saveButtonText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

