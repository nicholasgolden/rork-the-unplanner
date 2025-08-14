import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  Heart,
  Brain,
  Search,
  ChevronRight,
  Clock,
  Zap,
  Shield,
  Users,
  Target,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Battery,
  Headphones,
  Calendar,
  Play,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

type ResourceCategory = 'focus' | 'emotional' | 'organization' | 'social' | 'physical' | 'all';

interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  icon: any;
  description: string;
  symptoms: string[];
  effects: string[];
  strategies: string[];
  encouragement: string;
  color: string;
}

const resources: Resource[] = [
  {
    id: 'hyperfocus',
    title: 'Hyperfocus',
    category: 'focus',
    icon: Target,
    description: 'The ability to become completely absorbed in activities that interest you, often losing track of time and surroundings.',
    symptoms: [
      'Losing track of time during interesting activities',
      'Difficulty switching between tasks',
      'Forgetting to eat, drink, or take breaks',
      'Intense concentration on preferred activities'
    ],
    effects: [
      'Can lead to exceptional productivity and creativity',
      'May cause neglect of other important tasks',
      'Can result in physical discomfort from not moving',
      'Might disrupt sleep or meal schedules'
    ],
    strategies: [
      'Set timers to remind yourself to take breaks',
      'Use body doubling to have someone check on you',
      'Schedule hyperfocus sessions for important tasks',
      'Keep water and snacks nearby during focus sessions',
      'Use the Pomodoro technique to build in breaks'
    ],
    encouragement: 'Your ability to hyperfocus is actually a superpower! When channeled correctly, it can lead to incredible achievements and deep satisfaction. The key is learning to harness it intentionally.',
    color: '#3b82f6'
  },
  {
    id: 'rejection-sensitivity',
    title: 'Rejection Sensitive Dysphoria',
    category: 'emotional',
    icon: Heart,
    description: 'Intense emotional pain triggered by perceived rejection, criticism, or failure, even when none was intended.',
    symptoms: [
      'Overwhelming emotional reactions to criticism',
      'Fear of disappointing others',
      'Avoiding situations where rejection is possible',
      'Interpreting neutral comments as negative'
    ],
    effects: [
      'Can limit personal and professional growth',
      'May lead to people-pleasing behaviors',
      'Can cause anxiety in social situations',
      'Might result in avoiding new opportunities'
    ],
    strategies: [
      'Practice self-compassion and positive self-talk',
      'Challenge negative interpretations of interactions',
      'Build a support network of understanding people',
      'Consider therapy to develop coping strategies',
      'Remember that not all feedback is personal criticism'
    ],
    encouragement: 'Your sensitivity means you care deeply about relationships and doing well. This emotional depth, while sometimes painful, also allows you to be incredibly empathetic and connected to others.',
    color: '#ec4899'
  },
  {
    id: 'executive-dysfunction',
    title: 'Executive Dysfunction',
    category: 'organization',
    icon: Brain,
    description: 'Difficulty with planning, organizing, time management, and completing tasks due to challenges with executive functions.',
    symptoms: [
      'Trouble starting or finishing tasks',
      'Difficulty prioritizing activities',
      'Problems with time estimation',
      'Struggling to organize thoughts or materials'
    ],
    effects: [
      'Can impact work and academic performance',
      'May lead to feelings of frustration or inadequacy',
      'Can affect daily life management',
      'Might cause stress in relationships'
    ],
    strategies: [
      'Break large tasks into smaller, manageable steps',
      'Use external tools like calendars and reminders',
      'Create routines and stick to them',
      'Practice the "two-minute rule" for quick tasks',
      'Use body doubling for accountability'
    ],
    encouragement: 'Executive dysfunction doesn\'t reflect your intelligence or worth. With the right tools and strategies, you can work with your brain to accomplish amazing things. Progress, not perfection, is the goal.',
    color: '#8b5cf6'
  },
  {
    id: 'time-blindness',
    title: 'Time Blindness',
    category: 'organization',
    icon: Clock,
    description: 'Difficulty perceiving the passage of time, estimating how long tasks will take, or being aware of deadlines.',
    symptoms: [
      'Consistently underestimating task duration',
      'Losing track of time during activities',
      'Difficulty arriving on time',
      'Struggling with deadline awareness'
    ],
    effects: [
      'Can lead to chronic lateness',
      'May cause stress and anxiety about time',
      'Can impact professional relationships',
      'Might result in rushed or incomplete work'
    ],
    strategies: [
      'Use multiple alarms and timers throughout the day',
      'Build buffer time into your schedule',
      'Track how long tasks actually take',
      'Use visual time management tools',
      'Set preparation reminders before events'
    ],
    encouragement: 'Time blindness is a real neurological difference, not a character flaw. With external supports and awareness, you can develop systems that work with your unique time perception.',
    color: '#f59e0b'
  },
  {
    id: 'sensory-overload',
    title: 'Sensory Overload',
    category: 'physical',
    icon: Headphones,
    description: 'Feeling overwhelmed when one or more senses are overstimulated by environmental factors.',
    symptoms: [
      'Feeling overwhelmed in crowded or noisy places',
      'Sensitivity to bright lights or certain textures',
      'Difficulty concentrating with background noise',
      'Physical discomfort from sensory input'
    ],
    effects: [
      'Can cause anxiety and stress',
      'May lead to avoidance of certain environments',
      'Can impact focus and productivity',
      'Might result in physical exhaustion'
    ],
    strategies: [
      'Use noise-canceling headphones in loud environments',
      'Take regular breaks in quiet spaces',
      'Adjust lighting to comfortable levels',
      'Identify and avoid specific triggers when possible',
      'Practice grounding techniques during overload'
    ],
    encouragement: 'Your sensory sensitivity isn\'t weakness—it\'s often paired with creativity and deep appreciation for beauty. Learning to manage your environment helps you thrive.',
    color: '#10b981'
  },
  {
    id: 'social-challenges',
    title: 'Social Challenges',
    category: 'social',
    icon: Users,
    description: 'Difficulties with social cues, maintaining friendships, or feeling different from neurotypical peers.',
    symptoms: [
      'Missing social cues or nonverbal communication',
      'Interrupting conversations or talking too much',
      'Difficulty maintaining long-term friendships',
      'Feeling like an outsider in social groups'
    ],
    effects: [
      'Can lead to loneliness and isolation',
      'May impact professional networking',
      'Can cause anxiety in social situations',
      'Might result in masking authentic personality'
    ],
    strategies: [
      'Practice active listening techniques',
      'Find communities with shared interests',
      'Be open about your ADHD with trusted friends',
      'Use social scripts for common situations',
      'Focus on quality over quantity in relationships'
    ],
    encouragement: 'Your unique perspective and authenticity are gifts to the right people. The friends who truly understand you will appreciate your genuine, enthusiastic nature.',
    color: '#06b6d4'
  },
  {
    id: 'emotional-regulation',
    title: 'Emotional Regulation',
    category: 'emotional',
    icon: Zap,
    description: 'Difficulty managing intense emotions, mood swings, or emotional responses that feel disproportionate to situations.',
    symptoms: [
      'Intense emotional reactions to minor events',
      'Difficulty calming down once upset',
      'Mood swings throughout the day',
      'Feeling emotions more intensely than others'
    ],
    effects: [
      'Can strain personal relationships',
      'May impact decision-making abilities',
      'Can cause embarrassment or regret',
      'Might lead to avoiding emotional situations'
    ],
    strategies: [
      'Practice mindfulness and breathing exercises',
      'Use the STOP technique (Stop, Take a breath, Observe, Proceed)',
      'Identify emotional triggers and patterns',
      'Develop a toolkit of calming activities',
      'Consider therapy for additional support'
    ],
    encouragement: 'Your emotional intensity is part of what makes you passionate and caring. Learning to channel these feelings constructively can become one of your greatest strengths.',
    color: '#ef4444'
  },
  {
    id: 'working-memory',
    title: 'Working Memory Issues',
    category: 'focus',
    icon: Battery,
    description: 'Difficulty holding and manipulating information in your mind while completing tasks.',
    symptoms: [
      'Forgetting instructions while following them',
      'Losing track of what you were doing',
      'Difficulty with mental math or complex tasks',
      'Trouble following multi-step directions'
    ],
    effects: [
      'Can impact academic and work performance',
      'May lead to frustration with simple tasks',
      'Can cause anxiety about memory abilities',
      'Might result in avoiding complex activities'
    ],
    strategies: [
      'Write down important information immediately',
      'Break complex tasks into smaller steps',
      'Use external memory aids like apps and lists',
      'Repeat information back to confirm understanding',
      'Practice working memory exercises'
    ],
    encouragement: 'Working memory challenges don\'t define your intelligence. With the right external supports, you can accomplish complex tasks and achieve your goals.',
    color: '#6366f1'
  }
];

const getCategoriesWithColors = (colors: any) => [
  { id: 'all', label: 'All', icon: BookOpen, color: colors.primary },
  { id: 'focus', label: 'Focus', icon: Target, color: colors.systemBlue },
  { id: 'emotional', label: 'Emotional', icon: Heart, color: colors.systemPink },
  { id: 'organization', label: 'Organization', icon: Calendar, color: colors.systemPurple },
  { id: 'social', label: 'Social', icon: Users, color: colors.systemTeal },
  { id: 'physical', label: 'Physical', icon: Shield, color: colors.systemGreen },
];

export default function ResourcesScreen() {
  const { colors, userData } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  
  const categories = getCategoriesWithColors(colors);

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openYouTubeVideo = (searchTerm: string) => {
    const query = encodeURIComponent(`ADHD ${searchTerm}`);
    const youtubeUrl = `https://www.youtube.com/results?search_query=${query}&sp=CAMSAhAB`; // sp=CAMSAhAB sorts by view count
    Linking.openURL(youtubeUrl).catch(err => console.error('Error opening YouTube:', err));
  };

  const renderResourceCard = (resource: Resource) => {
    const isExpanded = expandedResource === resource.id;
    const IconComponent = resource.icon;

    return (
      <View key={resource.id} style={[styles.resourceCard, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 } : {}) }]}>
        <TouchableOpacity
          style={styles.resourceHeader}
          onPress={() => setExpandedResource(isExpanded ? null : resource.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.resourceIcon, { backgroundColor: resource.color + '20' }]}>
            <IconComponent size={24} color={resource.color} />
          </View>
          <View style={styles.resourceHeaderText}>
            <View style={styles.titleRow}>
              <Text style={[styles.resourceTitle, { color: colors.text }]}>{resource.title}</Text>
              <TouchableOpacity 
                style={[styles.playButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => openYouTubeVideo(resource.title)}
                activeOpacity={0.7}
              >
                <Play size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.resourceDescription, { color: colors.textSecondary }]} numberOfLines={isExpanded ? undefined : 2}>
              {resource.description}
            </Text>
          </View>
          <ChevronRight 
            size={20} 
            color={colors.textSecondary} 
            style={[styles.chevron, isExpanded && styles.chevronExpanded]}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.resourceContent}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Common Signs</Text>
              {resource.symptoms.map((symptom, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={[styles.bullet, { backgroundColor: resource.color }]} />
                  <Text style={[styles.listText, { color: colors.textSecondary }]}>{symptom}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>How It Affects You</Text>
              {resource.effects.map((effect, index) => (
                <View key={index} style={styles.listItem}>
                  <AlertCircle size={12} color={colors.warning} style={styles.listIcon} />
                  <Text style={[styles.listText, { color: colors.textSecondary }]}>{effect}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Helpful Strategies</Text>
              {resource.strategies.map((strategy, index) => (
                <View key={index} style={styles.listItem}>
                  <CheckCircle2 size={12} color={colors.success} style={styles.listIcon} />
                  <Text style={[styles.listText, { color: colors.textSecondary }]}>{strategy}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.encouragementSection, { backgroundColor: resource.color + '10' }]}>
              <View style={styles.encouragementHeader}>
                <Sparkles size={16} color={resource.color} />
                <Text style={[styles.encouragementTitle, { color: resource.color }]}>Remember</Text>
              </View>
              <Text style={[styles.encouragementText, { color: colors.text }]}>{resource.encouragement}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>ADHD Resources</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Understanding and managing common ADHD experiences</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 } : {}) }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search resources..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map(category => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.glass.background, borderColor: colors.border, ...(userData.theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 } : {}) },
                  isSelected && { backgroundColor: category.color + '20', borderColor: category.color }
                ]}
                onPress={() => setSelectedCategory(category.id as ResourceCategory)}
              >
                <IconComponent 
                  size={14} 
                  color={isSelected ? category.color : colors.textSecondary} 
                />
                <Text style={[
                  styles.categoryText,
                  { color: colors.textSecondary },
                  isSelected && { color: category.color }
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView 
          style={styles.resourcesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.resourcesContent, { paddingBottom: 100 }]}
        >
          {filteredResources.length > 0 ? (
            filteredResources.map(renderResourceCard)
          ) : (
            <View style={styles.emptyState}>
              <BookOpen size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyStateTitle, { color: colors.textSecondary }]}>No resources found</Text>
              <Text style={[styles.emptyStateText, { color: colors.textTertiary }]}>
                Try adjusting your search or category filter
              </Text>
            </View>
          )}
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
    paddingBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 12,

  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
    height: 32,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  resourcesList: {
    flex: 1,
  },
  resourcesContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  resourceCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',

  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceHeaderText: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  playButton: {
    padding: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  resourceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  chevron: {
    marginTop: 4,
  },
  chevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  resourceContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 8,
  },

  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 12,
  },
  listIcon: {
    marginTop: 4,
    marginRight: 8,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  encouragementSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  encouragementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  encouragementTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  encouragementText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});