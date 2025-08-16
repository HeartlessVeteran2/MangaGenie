/**
 * Library Screen - User's manga and anime collection
 * Features grid/list view, sorting, filtering, and collection management
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface MediaItem {
  id: string;
  title: string;
  coverUrl: string;
  type: 'manga' | 'anime';
  progress: number;
  totalChapters?: number;
  totalEpisodes?: number;
  status: 'reading' | 'watching' | 'completed' | 'planned' | 'dropped';
  rating?: number;
  lastRead?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'title' | 'dateAdded' | 'progress' | 'rating';
type FilterBy = 'all' | 'manga' | 'anime' | 'reading' | 'completed';

const LibraryScreen: React.FC = () => {
  const { colors, theme } = useTheme();
  const { user } = useAuth();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('dateAdded');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock library data
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([
    {
      id: '1',
      title: 'One Piece',
      coverUrl: 'https://via.placeholder.com/150x200',
      type: 'manga',
      progress: 75,
      totalChapters: 1100,
      status: 'reading',
      rating: 9.2,
      lastRead: '2024-08-15',
    },
    {
      id: '2',
      title: 'Attack on Titan',
      coverUrl: 'https://via.placeholder.com/150x200',
      type: 'manga',
      progress: 100,
      totalChapters: 139,
      status: 'completed',
      rating: 9.0,
      lastRead: '2024-08-10',
    },
    {
      id: '3',
      title: 'Jujutsu Kaisen',
      coverUrl: 'https://via.placeholder.com/150x200',
      type: 'anime',
      progress: 60,
      totalEpisodes: 24,
      status: 'watching',
      rating: 8.8,
      lastRead: '2024-08-14',
    },
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleItemPress = (item: MediaItem) => {
    if (item.type === 'manga') {
      // Navigate to reader
      console.log('Navigate to reader:', item.title);
    } else {
      // Navigate to player
      console.log('Navigate to player:', item.title);
    }
  };

  const handleItemLongPress = (item: MediaItem) => {
    Alert.alert(
      item.title,
      'Choose an action',
      [
        { text: 'Mark as Completed', onPress: () => markAsCompleted(item.id) },
        { text: 'Remove from Library', onPress: () => removeFromLibrary(item.id), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const markAsCompleted = (id: string) => {
    setLibraryItems(items =>
      items.map(item =>
        item.id === id ? { ...item, status: 'completed' as const, progress: 100 } : item
      )
    );
  };

  const removeFromLibrary = (id: string) => {
    setLibraryItems(items => items.filter(item => item.id !== id));
  };

  const getFilteredAndSortedItems = () => {
    let filtered = libraryItems;

    // Apply filter
    if (filterBy !== 'all') {
      if (filterBy === 'manga' || filterBy === 'anime') {
        filtered = filtered.filter(item => item.type === filterBy);
      } else {
        filtered = filtered.filter(item => item.status === filterBy);
      }
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'progress':
          return b.progress - a.progress;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'dateAdded':
        default:
          return new Date(b.lastRead || '').getTime() - new Date(a.lastRead || '').getTime();
      }
    });

    return filtered;
  };

  const renderGridItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      style={[styles.gridItem, { backgroundColor: colors.surface }]}
      onPress={() => handleItemPress(item)}
      onLongPress={() => handleItemLongPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.coverUrl }} style={styles.gridCover} />
      <View style={styles.gridItemInfo}>
        <Text style={[styles.gridTitle, { color: colors.onSurface }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.surfaceVariant }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: item.type === 'manga' ? colors.manga : colors.anime,
                  width: `${item.progress}%`,
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.onSurfaceVariant }]}>
            {item.progress}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}
      onPress={() => handleItemPress(item)}
      onLongPress={() => handleItemLongPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.coverUrl }} style={styles.listCover} />
      <View style={styles.listItemInfo}>
        <Text style={[styles.listTitle, { color: colors.onSurface }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.listMeta, { color: colors.onSurfaceVariant }]}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {item.status}
        </Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.surfaceVariant }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: item.type === 'manga' ? colors.manga : colors.anime,
                  width: `${item.progress}%`,
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.onSurfaceVariant }]}>
            {item.progress}%
          </Text>
        </View>
      </View>
      {item.rating && (
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color={colors.warning} />
          <Text style={[styles.ratingText, { color: colors.onSurfaceVariant }]}>
            {item.rating}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const filteredItems = getFilteredAndSortedItems();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.onSurface,
      marginBottom: 8,
    },
    headerStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statsText: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    controlButton: {
      padding: 8,
      marginLeft: 8,
      borderRadius: 8,
      backgroundColor: colors.surfaceVariant,
    },
    gridContainer: {
      padding: 16,
    },
    gridItem: {
      flex: 1,
      margin: 8,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    gridCover: {
      width: '100%',
      height: 160,
      backgroundColor: colors.surfaceVariant,
    },
    gridItemInfo: {
      padding: 12,
    },
    gridTitle: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    },
    listItem: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      alignItems: 'center',
    },
    listCover: {
      width: 60,
      height: 80,
      borderRadius: 6,
      backgroundColor: colors.surfaceVariant,
      marginRight: 16,
    },
    listItemInfo: {
      flex: 1,
    },
    listTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    listMeta: {
      fontSize: 12,
      marginBottom: 8,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    progressBar: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      marginRight: 8,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
    },
    progressText: {
      fontSize: 12,
      minWidth: 35,
      textAlign: 'right',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: 12,
      marginLeft: 2,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyMessage: {
      textAlign: 'center',
      lineHeight: 22,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={colors.surface}
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>
            {filteredItems.length} items • {libraryItems.filter(i => i.status === 'reading' || i.status === 'watching').length} in progress
          </Text>
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Icon
                name={viewMode === 'grid' ? 'view-list' : 'view-module'}
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="library-books" size={64} color={colors.onSurfaceVariant} />
          <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
            Your library is empty
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.onSurfaceVariant }]}>
            Start reading manga or watching anime to build your collection.
            Your progress will be saved automatically.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          key={viewMode}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={viewMode === 'grid' ? styles.gridContainer : undefined}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default LibraryScreen;