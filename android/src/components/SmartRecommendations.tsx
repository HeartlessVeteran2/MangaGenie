/**
 * Smart Recommendations Component
 * Features: AI-powered recommendations, mood-based filtering, creator discovery
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';

interface RecommendationItem {
  id: string;
  title: string;
  type: 'manga' | 'anime';
  coverUrl: string;
  genres: string[];
  rating: number;
  year: number;
  status: string;
  description: string;
  source: string;
  reasonType: 'similar_genre' | 'same_author' | 'mood_match' | 'completion_rate';
  reason: string;
  confidence: number;
}

interface MoodFilter {
  id: string;
  name: string;
  description: string;
  icon: string;
  genres: string[];
  themes: string[];
  demographics: string[];
}

interface SmartRecommendationsProps {
  userLibrary?: any[];
  recentActivity?: any[];
  onItemSelect: (item: RecommendationItem) => void;
}

const moodFilters: MoodFilter[] = [
  {
    id: 'action_adventure',
    name: 'Action & Adventure',
    description: 'High-energy stories with thrilling battles',
    icon: 'local-fire-department',
    genres: ['Action', 'Adventure', 'Shounen'],
    themes: ['battles', 'journey', 'power'],
    demographics: ['shounen'],
  },
  {
    id: 'romance_drama',
    name: 'Romance & Drama',
    description: 'Emotional stories about relationships',
    icon: 'favorite',
    genres: ['Romance', 'Drama', 'Josei'],
    themes: ['love', 'relationships', 'emotions'],
    demographics: ['josei', 'shoujo'],
  },
  {
    id: 'mystery_thriller',
    name: 'Mystery & Thriller',
    description: 'Suspenseful stories that keep you guessing',
    icon: 'search',
    genres: ['Mystery', 'Thriller', 'Psychological'],
    themes: ['investigation', 'suspense', 'mind games'],
    demographics: ['seinen'],
  },
  {
    id: 'slice_of_life',
    name: 'Slice of Life',
    description: 'Relaxing stories about everyday moments',
    icon: 'home',
    genres: ['Slice of Life', 'Comedy', 'School'],
    themes: ['daily life', 'friendship', 'growth'],
    demographics: ['seinen', 'shoujo'],
  },
  {
    id: 'fantasy_supernatural',
    name: 'Fantasy & Supernatural',
    description: 'Magical worlds and extraordinary powers',
    icon: 'auto-fix-high',
    genres: ['Fantasy', 'Supernatural', 'Magic'],
    themes: ['magic', 'otherworld', 'powers'],
    demographics: ['shounen', 'seinen'],
  },
  {
    id: 'dark_mature',
    name: 'Dark & Mature',
    description: 'Complex stories with mature themes',
    icon: 'nightlight',
    genres: ['Mature', 'Psychological', 'Tragedy'],
    themes: ['dark', 'complex', 'adult'],
    demographics: ['seinen', 'josei'],
  },
];

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  userLibrary = [],
  recentActivity = [],
  onItemSelect,
}) => {
  const { colors } = useTheme();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [selectedMood, userLibrary, recentActivity]);

  const generateRecommendations = () => {
    setIsLoading(true);
    
    // Simulate AI recommendation generation
    setTimeout(() => {
      const mockRecommendations: RecommendationItem[] = [
        {
          id: '1',
          title: 'Chainsaw Man',
          type: 'manga',
          coverUrl: 'https://via.placeholder.com/150x200',
          genres: ['Action', 'Supernatural', 'Dark Fantasy'],
          rating: 9.1,
          year: 2018,
          status: 'Ongoing',
          description: 'A young devil hunter fights supernatural creatures in a dark urban setting.',
          source: 'MangaDex',
          reasonType: 'similar_genre',
          reason: 'Based on your interest in dark action series like Attack on Titan',
          confidence: 0.92,
        },
        {
          id: '2',
          title: 'Spy x Family',
          type: 'anime',
          coverUrl: 'https://via.placeholder.com/150x200',
          genres: ['Comedy', 'Action', 'Family'],
          rating: 8.8,
          year: 2022,
          status: 'Ongoing',
          description: 'A spy must create a fake family for a mission, leading to hilarious situations.',
          source: 'Crunchyroll',
          reasonType: 'mood_match',
          reason: 'Perfect for your current mood: light-hearted with action elements',
          confidence: 0.87,
        },
        {
          id: '3',
          title: 'Blue Lock',
          type: 'manga',
          coverUrl: 'https://via.placeholder.com/150x200',
          genres: ['Sports', 'Shounen', 'Psychological'],
          rating: 8.6,
          year: 2018,
          status: 'Ongoing',
          description: 'A revolutionary football training program to create Japan\'s greatest striker.',
          source: 'MangaSee',
          reasonType: 'completion_rate',
          reason: 'High completion rate among users with similar reading patterns',
          confidence: 0.84,
        },
      ];

      // Filter based on selected mood if any
      let filtered = mockRecommendations;
      if (selectedMood) {
        const mood = moodFilters.find(m => m.id === selectedMood);
        if (mood) {
          filtered = mockRecommendations.filter(item => 
            item.genres.some(genre => mood.genres.includes(genre))
          );
        }
      }

      setRecommendations(filtered);
      setIsLoading(false);
    }, 1500);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return colors.success;
    if (confidence >= 0.8) return colors.warning;
    return colors.error;
  };

  const getReasonIcon = (reasonType: RecommendationItem['reasonType']) => {
    switch (reasonType) {
      case 'similar_genre':
        return 'category';
      case 'same_author':
        return 'person';
      case 'mood_match':
        return 'psychology';
      case 'completion_rate':
        return 'trending-up';
      default:
        return 'recommend';
    }
  };

  const renderMoodFilter = ({ item }: { item: MoodFilter }) => (
    <TouchableOpacity
      style={[
        styles.moodCard,
        { backgroundColor: colors.surface },
        selectedMood === item.id && { 
          backgroundColor: colors.primaryContainer,
          borderColor: colors.primary,
          borderWidth: 2,
        }
      ]}
      onPress={() => setSelectedMood(selectedMood === item.id ? null : item.id)}
    >
      <View style={[
        styles.moodIcon,
        { backgroundColor: selectedMood === item.id ? colors.primary : colors.surfaceVariant }
      ]}>
        <Icon 
          name={item.icon} 
          size={24} 
          color={selectedMood === item.id ? colors.onPrimary : colors.onSurfaceVariant} 
        />
      </View>
      
      <Text style={[
        styles.moodTitle,
        { color: selectedMood === item.id ? colors.onPrimaryContainer : colors.onSurface }
      ]}>
        {item.name}
      </Text>
      
      <Text style={[
        styles.moodDescription,
        { color: selectedMood === item.id ? colors.onPrimaryContainer : colors.onSurfaceVariant }
      ]} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  const renderRecommendation = ({ item }: { item: RecommendationItem }) => (
    <TouchableOpacity
      style={[styles.recommendationCard, { backgroundColor: colors.surface }]}
      onPress={() => onItemSelect(item)}
    >
      <View style={[styles.coverContainer, { backgroundColor: colors.surfaceVariant }]}>
        <Icon 
          name={item.type === 'manga' ? 'menu-book' : 'play-circle-outline'} 
          size={32} 
          color={colors.onSurfaceVariant} 
        />
      </View>
      
      <View style={styles.recommendationInfo}>
        <View style={styles.recommendationHeader}>
          <Text style={[styles.recommendationTitle, { color: colors.onSurface }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color={colors.warning} />
            <Text style={[styles.ratingText, { color: colors.onSurfaceVariant }]}>
              {item.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.recommendationMeta}>
          <View style={[
            styles.typeBadge,
            { backgroundColor: item.type === 'manga' ? colors.manga + '20' : colors.anime + '20' }
          ]}>
            <Text style={[
              styles.typeBadgeText,
              { color: item.type === 'manga' ? colors.manga : colors.anime }
            ]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          
          <Text style={[styles.yearText, { color: colors.onSurfaceVariant }]}>
            {item.year} • {item.status}
          </Text>
        </View>
        
        <Text style={[styles.genresText, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
          {item.genres.join(', ')}
        </Text>
        
        <Text style={[styles.descriptionText, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.reasonContainer}>
          <Icon 
            name={getReasonIcon(item.reasonType)} 
            size={14} 
            color={colors.primary} 
          />
          <Text style={[styles.reasonText, { color: colors.primary }]} numberOfLines={1}>
            {item.reason}
          </Text>
          <View style={[
            styles.confidenceBadge,
            { backgroundColor: getConfidenceColor(item.confidence) + '20' }
          ]}>
            <Text style={[
              styles.confidenceText,
              { color: getConfidenceColor(item.confidence) }
            ]}>
              {Math.round(item.confidence * 100)}%
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
          Discover by Mood
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant }]}>
          Find content that matches how you're feeling
        </Text>
      </View>
      
      <FlatList
        data={moodFilters}
        renderItem={renderMoodFilter}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moodsList}
      />
      
      <View style={styles.recommendationsHeader}>
        <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
          {selectedMood ? 'Mood-Based Recommendations' : 'Smart Recommendations'}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant }]}>
          {isLoading ? 'Analyzing your preferences...' : 'Personalized suggestions based on your activity'}
        </Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Icon name="psychology" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
            AI is analyzing your preferences...
          </Text>
        </View>
      ) : (
        <FlatList
          data={recommendations}
          renderItem={renderRecommendation}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.recommendationsList}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  moodsList: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  moodCard: {
    width: 140,
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  moodDescription: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  recommendationsHeader: {
    paddingVertical: 20,
    paddingTop: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  recommendationsList: {
    paddingBottom: 100,
  },
  recommendationCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverContainer: {
    width: 80,
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 2,
    fontWeight: '600',
  },
  recommendationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  yearText: {
    fontSize: 12,
  },
  genresText: {
    fontSize: 12,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
    marginRight: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default SmartRecommendations;