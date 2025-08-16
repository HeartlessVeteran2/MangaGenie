/**
 * Anime Screen - Browse and discover anime content
 * Features seasonal anime, trending content, and source integration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { useRepository } from '../contexts/RepositoryContext';

interface AnimeItem {
  id: string;
  title: string;
  coverUrl: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  episode: number;
  totalEpisodes?: number;
  rating: number;
  genres: string[];
  studio: string;
  season: string;
  year: number;
  isNsfw: boolean;
}

type Season = 'winter' | 'spring' | 'summer' | 'fall';

const AnimeScreen: React.FC = () => {
  const { colors, theme } = useTheme();
  const { repositories } = useRepository();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season>('winter');
  const [selectedYear, setSelectedYear] = useState(2024);

  // Mock seasonal anime data
  const seasonalAnime: AnimeItem[] = [
    {
      id: '1',
      title: 'Jujutsu Kaisen Season 3',
      coverUrl: 'https://via.placeholder.com/150x200',
      status: 'ongoing',
      episode: 8,
      totalEpisodes: 24,
      rating: 9.1,
      genres: ['Action', 'Supernatural'],
      studio: 'MAPPA',
      season: 'winter',
      year: 2024,
      isNsfw: false,
    },
    {
      id: '2',
      title: 'Chainsaw Man Season 2',
      coverUrl: 'https://via.placeholder.com/150x200',
      status: 'ongoing',
      episode: 12,
      totalEpisodes: 12,
      rating: 8.9,
      genres: ['Action', 'Horror'],
      studio: 'MAPPA',
      season: 'winter',
      year: 2024,
      isNsfw: true,
    },
    {
      id: '3',
      title: 'Spy x Family Code: White',
      coverUrl: 'https://via.placeholder.com/150x200',
      status: 'completed',
      episode: 1,
      totalEpisodes: 1,
      rating: 8.7,
      genres: ['Comedy', 'Action'],
      studio: 'Studio Pierrot',
      season: 'winter',
      year: 2024,
      isNsfw: false,
    },
  ];

  const trendingAnime: AnimeItem[] = [
    {
      id: '4',
      title: 'Attack on Titan: Final Season',
      coverUrl: 'https://via.placeholder.com/150x200',
      status: 'completed',
      episode: 87,
      totalEpisodes: 87,
      rating: 9.4,
      genres: ['Drama', 'Action'],
      studio: 'Studio Pierrot',
      season: 'fall',
      year: 2023,
      isNsfw: false,
    },
    {
      id: '5',
      title: 'Demon Slayer: Hashira Training Arc',
      coverUrl: 'https://via.placeholder.com/150x200',
      status: 'upcoming',
      episode: 0,
      totalEpisodes: 8,
      rating: 8.8,
      genres: ['Action', 'Historical'],
      studio: 'Ufotable',
      season: 'spring',
      year: 2024,
      isNsfw: false,
    },
  ];

  const seasons: Season[] = ['winter', 'spring', 'summer', 'fall'];
  const years = [2024, 2023, 2022, 2021];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAnimePress = (anime: AnimeItem) => {
    console.log('Navigate to anime details:', anime.title);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return colors.success;
      case 'completed':
        return colors.manga;
      case 'upcoming':
        return colors.warning;
      default:
        return colors.onSurfaceVariant;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'Airing';
      case 'completed':
        return 'Finished';
      case 'upcoming':
        return 'Not Yet Aired';
      default:
        return status;
    }
  };

  const renderAnimeItem = ({ item }: { item: AnimeItem }) => (
    <TouchableOpacity
      style={[styles.animeCard, { backgroundColor: colors.surface }]}
      onPress={() => handleAnimePress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.coverUrl }} style={styles.animeCover} />
      <View style={styles.animeInfo}>
        <Text style={[styles.animeTitle, { color: colors.onSurface }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.animeMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
          {item.isNsfw && (
            <View style={[styles.nsfwBadge, { backgroundColor: colors.error + '20' }]}>
              <Icon name="shield" size={12} color={colors.error} />
              <Text style={[styles.nsfwText, { color: colors.error }]}>18+</Text>
            </View>
          )}
        </View>

        <Text style={[styles.studioText, { color: colors.onSurfaceVariant }]}>
          {item.studio}
        </Text>

        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color={colors.warning} />
          <Text style={[styles.ratingText, { color: colors.onSurfaceVariant }]}>
            {item.rating}
          </Text>
        </View>

        {item.status === 'ongoing' && item.totalEpisodes && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.surfaceVariant }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.anime,
                    width: `${(item.episode / item.totalEpisodes) * 100}%`,
                  }
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.onSurfaceVariant }]}>
              {item.episode}/{item.totalEpisodes}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSeasonSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonSelector}>
      {years.map(year => (
        <View key={year} style={styles.yearGroup}>
          <Text style={[styles.yearText, { color: colors.onSurfaceVariant }]}>{year}</Text>
          <View style={styles.seasonsRow}>
            {seasons.map(season => (
              <TouchableOpacity
                key={`${year}-${season}`}
                style={[
                  styles.seasonButton,
                  {
                    backgroundColor: selectedSeason === season && selectedYear === year
                      ? colors.primary
                      : colors.surfaceVariant,
                  }
                ]}
                onPress={() => {
                  setSelectedSeason(season);
                  setSelectedYear(year);
                }}
              >
                <Text
                  style={[
                    styles.seasonText,
                    {
                      color: selectedSeason === season && selectedYear === year
                        ? colors.onPrimary
                        : colors.onSurfaceVariant,
                    }
                  ]}
                >
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

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
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    scrollContent: {
      flex: 1,
    },
    seasonSelector: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    yearGroup: {
      marginRight: 24,
    },
    yearText: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 8,
      textAlign: 'center',
    },
    seasonsRow: {
      flexDirection: 'row',
    },
    seasonButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
    },
    seasonText: {
      fontSize: 12,
      fontWeight: '500',
    },
    section: {
      marginVertical: 16,
    },
    sectionHeader: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.onBackground,
    },
    animeList: {
      paddingHorizontal: 16,
    },
    animeCard: {
      width: 140,
      marginRight: 12,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    animeCover: {
      width: '100%',
      height: 180,
      backgroundColor: colors.surfaceVariant,
    },
    animeInfo: {
      padding: 12,
    },
    animeTitle: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
      lineHeight: 18,
    },
    animeMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 6,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginRight: 6,
      marginBottom: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    nsfwBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    nsfwText: {
      fontSize: 10,
      fontWeight: 'bold',
      marginLeft: 2,
    },
    studioText: {
      fontSize: 12,
      marginBottom: 6,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    ratingText: {
      fontSize: 12,
      marginLeft: 4,
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
      fontSize: 10,
      minWidth: 30,
      textAlign: 'right',
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

  const activeAnimeRepos = repositories.filter(r => r.isEnabled && (r.sourceType === 'anime' || r.sourceType === 'both'));
  const filteredSeasonalAnime = seasonalAnime.filter(anime => 
    anime.season === selectedSeason && anime.year === selectedYear
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={colors.surface}
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anime</Text>
        <Text style={styles.headerSubtitle}>
          {activeAnimeRepos.length} sources active • Seasonal & trending anime
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Season Selector */}
        {renderSeasonSelector()}

        {activeAnimeRepos.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="play-circle-outline" size={64} color={colors.onSurfaceVariant} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
              No anime sources available
            </Text>
            <Text style={[styles.emptyMessage, { color: colors.onSurfaceVariant }]}>
              Add anime repositories in the Sources tab to discover and stream anime content.
            </Text>
          </View>
        ) : (
          <>
            {/* Seasonal Anime */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1)} {selectedYear}
                </Text>
              </View>
              
              {filteredSeasonalAnime.length === 0 ? (
                <View style={{ paddingHorizontal: 20, paddingVertical: 40 }}>
                  <Text style={[{ color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                    No anime found for {selectedSeason} {selectedYear}
                  </Text>
                </View>
              ) : (
                <FlatList
                  horizontal
                  data={filteredSeasonalAnime}
                  renderItem={renderAnimeItem}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.animeList}
                  showsHorizontalScrollIndicator={false}
                />
              )}
            </View>

            {/* Trending Anime */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending Now</Text>
              </View>
              
              <FlatList
                horizontal
                data={trendingAnime}
                renderItem={renderAnimeItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.animeList}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnimeScreen;