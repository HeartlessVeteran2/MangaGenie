/**
 * Downloads Screen - Offline content management
 * Features download queue, storage management, and offline reading/viewing
 */

import React, { useState } from 'react';
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
  ProgressBarAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';

interface DownloadItem {
  id: string;
  title: string;
  type: 'manga' | 'anime';
  coverUrl: string;
  status: 'downloading' | 'completed' | 'paused' | 'error';
  progress: number;
  size: string;
  downloadedSize: string;
  chapters?: number;
  episodes?: number;
  quality?: string;
}

const DownloadsScreen: React.FC = () => {
  const { colors, theme } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'downloading' | 'completed'>('all');

  // Mock downloads data
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      id: '1',
      title: 'One Piece Chapter 1100-1110',
      type: 'manga',
      coverUrl: 'https://via.placeholder.com/60x80',
      status: 'downloading',
      progress: 65,
      size: '125 MB',
      downloadedSize: '81 MB',
      chapters: 11,
    },
    {
      id: '2',
      title: 'Jujutsu Kaisen Episode 1-24',
      type: 'anime',
      coverUrl: 'https://via.placeholder.com/60x80',
      status: 'completed',
      progress: 100,
      size: '8.5 GB',
      downloadedSize: '8.5 GB',
      episodes: 24,
      quality: '1080p',
    },
    {
      id: '3',
      title: 'Attack on Titan Final Season',
      type: 'anime',
      coverUrl: 'https://via.placeholder.com/60x80',
      status: 'paused',
      progress: 30,
      size: '6.2 GB',
      downloadedSize: '1.9 GB',
      episodes: 12,
      quality: '720p',
    },
    {
      id: '4',
      title: 'Chainsaw Man Chapter 120-130',
      type: 'manga',
      coverUrl: 'https://via.placeholder.com/60x80',
      status: 'error',
      progress: 15,
      size: '95 MB',
      downloadedSize: '14 MB',
      chapters: 11,
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePauseResume = (id: string) => {
    setDownloads(items =>
      items.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: item.status === 'downloading' ? 'paused' : 'downloading' as const,
          };
        }
        return item;
      })
    );
  };

  const handleRetry = (id: string) => {
    setDownloads(items =>
      items.map(item =>
        item.id === id ? { ...item, status: 'downloading' as const } : item
      )
    );
  };

  const handleDelete = (item: DownloadItem) => {
    Alert.alert(
      'Delete Download',
      `Are you sure you want to delete "${item.title}"? This will remove all downloaded content.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDownloads(items => items.filter(i => i.id !== item.id));
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'downloading':
        return 'download';
      case 'completed':
        return 'check-circle';
      case 'paused':
        return 'pause-circle-filled';
      case 'error':
        return 'error';
      default:
        return 'download';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'downloading':
        return colors.primary;
      case 'completed':
        return colors.success;
      case 'paused':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.onSurfaceVariant;
    }
  };

  const getFilteredDownloads = () => {
    switch (selectedTab) {
      case 'downloading':
        return downloads.filter(item => item.status === 'downloading' || item.status === 'paused');
      case 'completed':
        return downloads.filter(item => item.status === 'completed');
      default:
        return downloads;
    }
  };

  const renderDownloadItem = ({ item }: { item: DownloadItem }) => (
    <View style={[styles.downloadItem, { backgroundColor: colors.surface }]}>
      <Image source={{ uri: item.coverUrl }} style={styles.itemCover} />
      
      <View style={styles.itemInfo}>
        <Text style={[styles.itemTitle, { color: colors.onSurface }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.itemMeta}>
          <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
            {item.type === 'manga' ? `${item.chapters} chapters` : `${item.episodes} episodes`}
            {item.quality && ` • ${item.quality}`}
          </Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={[styles.sizeText, { color: colors.onSurfaceVariant }]}>
              {item.downloadedSize} / {item.size}
            </Text>
            <Text style={[styles.percentText, { color: colors.onSurfaceVariant }]}>
              {item.progress}%
            </Text>
          </View>
          
          {item.status === 'completed' ? (
            <View style={[styles.completedBar, { backgroundColor: colors.success }]} />
          ) : (
            <View style={[styles.progressBar, { backgroundColor: colors.surfaceVariant }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: getStatusColor(item.status),
                    width: `${item.progress}%`,
                  }
                ]}
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (item.status === 'error') {
              handleRetry(item.id);
            } else if (item.status === 'completed') {
              console.log('Open content:', item.title);
            } else {
              handlePauseResume(item.id);
            }
          }}
        >
          <Icon
            name={item.status === 'completed' ? 'play-arrow' : getStatusIcon(item.status)}
            size={24}
            color={getStatusColor(item.status)}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Icon name="delete" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredDownloads = getFilteredDownloads();
  const totalSize = downloads.reduce((acc, item) => acc + parseFloat(item.size), 0);
  const completedCount = downloads.filter(item => item.status === 'completed').length;

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
    headerStats: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 12,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    inactiveTab: {
      backgroundColor: colors.surfaceVariant,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
    },
    activeTabText: {
      color: colors.onPrimary,
    },
    inactiveTabText: {
      color: colors.onSurfaceVariant,
    },
    downloadItem: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
      alignItems: 'center',
    },
    itemCover: {
      width: 60,
      height: 80,
      borderRadius: 6,
      backgroundColor: colors.surfaceVariant,
      marginRight: 16,
    },
    itemInfo: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    itemMeta: {
      marginBottom: 8,
    },
    metaText: {
      fontSize: 12,
    },
    progressSection: {
      marginTop: 4,
    },
    progressInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    sizeText: {
      fontSize: 12,
    },
    percentText: {
      fontSize: 12,
      fontWeight: '500',
    },
    progressBar: {
      height: 4,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
    },
    completedBar: {
      height: 4,
      borderRadius: 2,
    },
    itemActions: {
      flexDirection: 'column',
      alignItems: 'center',
      marginLeft: 12,
    },
    actionButton: {
      padding: 8,
      marginBottom: 4,
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
    storageInfo: {
      backgroundColor: colors.surface,
      padding: 16,
      margin: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    storageTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    storageStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    storageText: {
      fontSize: 14,
    },
    storageBar: {
      height: 6,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 3,
      overflow: 'hidden',
    },
    storageUsed: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
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
        <Text style={styles.headerTitle}>Downloads</Text>
        <Text style={styles.headerStats}>
          {downloads.length} items • {completedCount} completed • {totalSize.toFixed(1)} GB total
        </Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        {[
          { key: 'all' as const, label: 'All' },
          { key: 'downloading' as const, label: 'In Progress' },
          { key: 'completed' as const, label: 'Completed' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.key ? styles.activeTabText : styles.inactiveTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredDownloads.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="download" size={64} color={colors.onSurfaceVariant} />
          <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
            {selectedTab === 'all' ? 'No downloads' : selectedTab === 'downloading' ? 'Nothing downloading' : 'No completed downloads'}
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.onSurfaceVariant }]}>
            {selectedTab === 'all' 
              ? 'Start downloading manga or anime to read and watch offline.'
              : selectedTab === 'downloading'
              ? 'No active downloads. Start downloading content from your library.'
              : 'Complete some downloads to see them here.'
            }
          </Text>
        </View>
      ) : (
        <>
          {/* Storage Info */}
          <View style={styles.storageInfo}>
            <Text style={[styles.storageTitle, { color: colors.onSurface }]}>
              Storage Usage
            </Text>
            <View style={styles.storageStats}>
              <Text style={[styles.storageText, { color: colors.onSurfaceVariant }]}>
                Used: {totalSize.toFixed(1)} GB
              </Text>
              <Text style={[styles.storageText, { color: colors.onSurfaceVariant }]}>
                Available: 12.3 GB
              </Text>
            </View>
            <View style={styles.storageBar}>
              <View 
                style={[styles.storageUsed, { width: `${(totalSize / 32) * 100}%` }]} 
              />
            </View>
          </View>

          <FlatList
            data={filteredDownloads}
            renderItem={renderDownloadItem}
            keyExtractor={item => item.id}
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
        </>
      )}
    </SafeAreaView>
  );
};

export default DownloadsScreen;