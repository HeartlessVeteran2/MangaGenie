/**
 * Home Screen - Main dashboard with trending content and quick access
 * Features modern UI following Material Design 3 principles
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface TrendingItem {
  id: string;
  title: string;
  coverUrl: string;
  type: 'manga' | 'anime';
  rating: number;
  status: string;
}

const HomeScreen: React.FC = () => {
  const { colors, theme } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Mock trending data
  const trendingManga: TrendingItem[] = [
    {
      id: '1',
      title: 'One Piece',
      coverUrl: 'https://via.placeholder.com/150x200',
      type: 'manga',
      rating: 9.2,
      status: 'Ongoing',
    },
    {
      id: '2',
      title: 'Attack on Titan',
      coverUrl: 'https://via.placeholder.com/150x200',
      type: 'manga',
      rating: 9.0,
      status: 'Completed',
    },
    {
      id: '3',
      title: 'Demon Slayer',
      coverUrl: 'https://via.placeholder.com/150x200',
      type: 'manga',
      rating: 8.8,
      status: 'Completed',
    },
  ];

  const trendingAnime: TrendingItem[] = [
    {
      id: '1',
      title: 'Jujutsu Kaisen',
      coverUrl: 'https://via.placeholder.com/150x200',
      type: 'anime',
      rating: 9.1,
      status: 'Ongoing',
    },
    {
      id: '2',
      title: 'Chainsaw Man',
      coverUrl: 'https://via.placeholder.com/150x200',
      type: 'anime',
      rating: 8.9,
      status: 'Ongoing',
    },
    {
      id: '3',
      title: 'Spy x Family',
      coverUrl: 'https://via.placeholder.com/150x200',
      type: 'anime',
      rating: 8.7,
      status: 'Ongoing',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderTrendingSection = (title: string, items: TrendingItem[], color: string) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>{title}</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color }]}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {items.map((item) => (
          <TouchableOpacity key={item.id} style={styles.trendingItem}>
            <Image source={{ uri: item.coverUrl }} style={styles.coverImage} />
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: colors.onSurface }]} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.itemMeta}>
                <Icon name="star" size={14} color={colors.warning} />
                <Text style={[styles.rating, { color: colors.onSurfaceVariant }]}>
                  {item.rating}
                </Text>
              </View>
              <Text style={[styles.status, { color: colors.onSurfaceVariant }]}>
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.onSurface,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.onSurfaceVariant,
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      justifyContent: 'space-around',
    },
    quickAction: {
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.surfaceVariant,
      minWidth: 80,
    },
    quickActionText: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: '500',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    section: {
      marginVertical: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    viewAll: {
      fontSize: 14,
      fontWeight: '500',
    },
    horizontalScroll: {
      paddingLeft: 20,
    },
    trendingItem: {
      marginRight: 16,
      width: 120,
    },
    coverImage: {
      width: 120,
      height: 160,
      borderRadius: 8,
      backgroundColor: colors.surfaceVariant,
    },
    itemInfo: {
      marginTop: 8,
    },
    itemTitle: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
    },
    itemMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    rating: {
      fontSize: 12,
      marginLeft: 4,
    },
    status: {
      fontSize: 12,
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
        <Text style={styles.greeting}>
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
        </Text>
        <Text style={styles.subtitle}>
          Discover new manga and anime
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="search" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="history" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Continue Reading</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="bookmark" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Bookmarks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="download" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Downloads</Text>
          </TouchableOpacity>
        </View>

        {/* Trending Manga */}
        {renderTrendingSection('Trending Manga', trendingManga, colors.manga)}

        {/* Trending Anime */}
        {renderTrendingSection('Popular Anime', trendingAnime, colors.anime)}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;