/**
 * Advanced Search and Filter Component
 * Features: Multi-source search, advanced filters, content discovery
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { useRepository } from '../contexts/RepositoryContext';

interface SearchFilter {
  genres: string[];
  status: string[];
  contentType: 'manga' | 'anime' | 'both';
  language: string[];
  nsfw: boolean;
  year: { min: number; max: number };
  rating: { min: number; max: number };
  sortBy: 'relevance' | 'title' | 'updated' | 'rating' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  id: string;
  title: string;
  coverUrl: string;
  type: 'manga' | 'anime';
  status: string;
  rating: number;
  year: number;
  genres: string[];
  description: string;
  source: string;
  nsfw: boolean;
}

interface AdvancedSearchProps {
  visible: boolean;
  onClose: () => void;
  onResultSelect: (result: SearchResult) => void;
  initialQuery?: string;
  contentType?: 'manga' | 'anime' | 'both';
}

const defaultFilters: SearchFilter = {
  genres: [],
  status: [],
  contentType: 'both',
  language: [],
  nsfw: false,
  year: { min: 1900, max: new Date().getFullYear() },
  rating: { min: 0, max: 10 },
  sortBy: 'relevance',
  sortOrder: 'desc',
};

const availableGenres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller', 'Yaoi', 'Yuri'
];

const availableStatus = [
  'Ongoing', 'Completed', 'Hiatus', 'Cancelled', 'Not yet aired'
];

const availableLanguages = [
  'Japanese', 'Korean', 'Chinese', 'English', 'Spanish', 'French'
];

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  visible,
  onClose,
  onResultSelect,
  initialQuery = '',
  contentType = 'both',
}) => {
  const { colors } = useTheme();
  const { repositories, searchContent } = useRepository();
  
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilter>({
    ...defaultFilters,
    contentType,
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const enabledRepositories = repositories.filter(repo => repo.isEnabled);

  useEffect(() => {
    if (visible) {
      setSelectedSources(enabledRepositories.map(repo => repo.id));
    }
  }, [visible, enabledRepositories]);

  const performSearch = useCallback(async () => {
    if (!query.trim() && filters.genres.length === 0) {
      Alert.alert('Search Required', 'Please enter a search query or select filters');
      return;
    }

    setIsLoading(true);
    try {
      // Mock search results - in real app, this would query enabled repositories
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Attack on Titan',
          coverUrl: 'https://via.placeholder.com/150x200',
          type: 'manga',
          status: 'Completed',
          rating: 9.0,
          year: 2009,
          genres: ['Action', 'Drama', 'Fantasy'],
          description: 'Humanity fights for survival against giant humanoid Titans.',
          source: 'MangaDex',
          nsfw: false,
        },
        {
          id: '2',
          title: 'One Piece',
          coverUrl: 'https://via.placeholder.com/150x200',
          type: 'manga',
          status: 'Ongoing',
          rating: 9.2,
          year: 1997,
          genres: ['Action', 'Adventure', 'Comedy'],
          description: 'Monkey D. Luffy explores the Grand Line to find the legendary treasure One Piece.',
          source: 'MangaSee',
          nsfw: false,
        },
        {
          id: '3',
          title: 'Death Note',
          coverUrl: 'https://via.placeholder.com/150x200',
          type: 'anime',
          status: 'Completed',
          rating: 9.1,
          year: 2006,
          genres: ['Mystery', 'Supernatural', 'Thriller'],
          description: 'A high school student discovers a supernatural notebook.',
          source: 'Crunchyroll',
          nsfw: false,
        },
      ];

      // Filter results based on current filters
      const filteredResults = mockResults.filter(result => {
        // Content type filter
        if (filters.contentType !== 'both' && result.type !== filters.contentType) {
          return false;
        }

        // NSFW filter
        if (!filters.nsfw && result.nsfw) {
          return false;
        }

        // Genre filter
        if (filters.genres.length > 0) {
          const hasGenre = filters.genres.some(genre => 
            result.genres.includes(genre)
          );
          if (!hasGenre) return false;
        }

        // Status filter
        if (filters.status.length > 0 && !filters.status.includes(result.status)) {
          return false;
        }

        // Year filter
        if (result.year < filters.year.min || result.year > filters.year.max) {
          return false;
        }

        // Rating filter
        if (result.rating < filters.rating.min || result.rating > filters.rating.max) {
          return false;
        }

        return true;
      });

      // Sort results
      filteredResults.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'rating':
            comparison = a.rating - b.rating;
            break;
          case 'year':
            comparison = a.year - b.year;
            break;
          case 'popularity':
            // Mock popularity sort
            comparison = Math.random() - 0.5;
            break;
          default:
            comparison = 0;
        }
        
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });

      setResults(filteredResults);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Search Error', 'Failed to perform search');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [query, filters, selectedSources]);

  const updateFilter = <K extends keyof SearchFilter>(
    key: K,
    value: SearchFilter[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleGenre = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    updateFilter('genres', newGenres);
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilter('status', newStatus);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.surface }]}
      onPress={() => onResultSelect(item)}
    >
      <View style={[styles.coverContainer, { backgroundColor: colors.surfaceVariant }]}>
        {/* In real app, would show actual cover image */}
        <View style={styles.coverPlaceholder}>
          <Icon 
            name={item.type === 'manga' ? 'menu-book' : 'play-circle-outline'} 
            size={40} 
            color={colors.onSurfaceVariant} 
          />
        </View>
      </View>
      
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.onSurface }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.resultMeta}>
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
            {item.year}
          </Text>
          
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color={colors.warning} />
            <Text style={[styles.ratingText, { color: colors.onSurfaceVariant }]}>
              {item.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.genresText, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
          {item.genres.join(', ')}
        </Text>
        
        <Text style={[styles.descriptionText, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <Text style={[styles.sourceText, { color: colors.primary }]}>
          {item.source}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={[styles.filtersContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.filtersHeader, { borderBottomColor: colors.outline }]}>
          <Text style={[styles.filtersTitle, { color: colors.onBackground }]}>
            Search Filters
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Icon name="close" size={24} color={colors.onBackground} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.filtersContent}>
          {/* Content Type */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterTitle, { color: colors.onBackground }]}>
              Content Type
            </Text>
            <View style={styles.contentTypeButtons}>
              {(['both', 'manga', 'anime'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.contentTypeButton,
                    filters.contentType === type && { backgroundColor: colors.primary },
                    { borderColor: colors.outline }
                  ]}
                  onPress={() => updateFilter('contentType', type)}
                >
                  <Text style={[
                    styles.contentTypeButtonText,
                    filters.contentType === type 
                      ? { color: colors.onPrimary }
                      : { color: colors.onSurface }
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Genres */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterTitle, { color: colors.onBackground }]}>
              Genres
            </Text>
            <View style={styles.genreGrid}>
              {availableGenres.map(genre => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genreChip,
                    filters.genres.includes(genre) && { backgroundColor: colors.primary },
                    { borderColor: colors.outline }
                  ]}
                  onPress={() => toggleGenre(genre)}
                >
                  <Text style={[
                    styles.genreChipText,
                    filters.genres.includes(genre)
                      ? { color: colors.onPrimary }
                      : { color: colors.onSurface }
                  ]}>
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterTitle, { color: colors.onBackground }]}>
              Status
            </Text>
            <View style={styles.statusGrid}>
              {availableStatus.map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusChip,
                    filters.status.includes(status) && { backgroundColor: colors.primary },
                    { borderColor: colors.outline }
                  ]}
                  onPress={() => toggleStatus(status)}
                >
                  <Text style={[
                    styles.statusChipText,
                    filters.status.includes(status)
                      ? { color: colors.onPrimary }
                      : { color: colors.onSurface }
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* NSFW Toggle */}
          <View style={styles.filterSection}>
            <View style={styles.switchContainer}>
              <Text style={[styles.filterTitle, { color: colors.onBackground }]}>
                Include NSFW Content
              </Text>
              <Switch
                value={filters.nsfw}
                onValueChange={(value) => updateFilter('nsfw', value)}
                trackColor={{ false: colors.outline, true: colors.primary }}
                thumbColor={colors.onPrimary}
              />
            </View>
          </View>
        </ScrollView>
        
        <View style={[styles.filtersFooter, { borderTopColor: colors.outline }]}>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: colors.outline }]}
            onPress={clearFilters}
          >
            <Text style={[styles.clearButtonText, { color: colors.onSurface }]}>
              Clear All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setShowFilters(false);
              performSearch();
            }}
          >
            <Text style={[styles.applyButtonText, { color: colors.onPrimary }]}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.outline }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Icon name="arrow-back" size={24} color={colors.onBackground} />
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                { 
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurfaceVariant 
                }
              ]}
              placeholder="Search manga and anime..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={performSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={performSearch} style={styles.searchButton}>
              <Icon name="search" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.headerButton}>
            <Icon name="filter-list" size={24} color={colors.onBackground} />
            {(filters.genres.length > 0 || filters.status.length > 0) && (
              <View style={[styles.filterBadge, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                performSearch();
              }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="search-off" size={64} color={colors.onSurfaceVariant} />
              <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                {isLoading ? 'Searching...' : 'No results found'}
              </Text>
            </View>
          }
        />

        {renderFiltersModal()}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    borderRadius: 25,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    padding: 12,
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resultsList: {
    padding: 16,
    paddingBottom: 100,
  },
  resultCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverContainer: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultMeta: {
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
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 2,
  },
  genresText: {
    fontSize: 12,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  filtersContainer: {
    flex: 1,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  filtersTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  filtersContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  contentTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contentTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  contentTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  genreChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filtersFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdvancedSearch;