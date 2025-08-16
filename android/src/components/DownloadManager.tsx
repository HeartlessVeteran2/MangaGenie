/**
 * Advanced Download Manager Component
 * Features: Queue management, progress tracking, storage optimization
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  ProgressBarAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';

import { useTheme } from '../contexts/ThemeContext';

interface DownloadItem {
  id: string;
  type: 'manga' | 'anime';
  title: string;
  coverUrl: string;
  totalChapters: number;
  downloadedChapters: number;
  status: 'queued' | 'downloading' | 'completed' | 'paused' | 'failed';
  progress: number;
  downloadSpeed: string;
  estimatedTime: string;
  fileSize: string;
  downloadedSize: string;
  quality: string;
  source: string;
  downloadDate: Date;
  chapters: ChapterDownload[];
}

interface ChapterDownload {
  id: string;
  number: string;
  title: string;
  status: 'queued' | 'downloading' | 'completed' | 'failed';
  progress: number;
  pages?: number;
  downloadedPages?: number;
}

interface DownloadManagerProps {
  visible: boolean;
  onClose: () => void;
}

const DownloadManager: React.FC<DownloadManagerProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'downloading' | 'completed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'progress' | 'name'>('date');
  const [showSettings, setShowSettings] = useState(false);
  const [storageInfo, setStorageInfo] = useState({
    total: '0 GB',
    used: '0 GB',
    available: '0 GB',
    downloadUsage: '0 GB',
  });
  
  // Download settings
  const [settings, setSettings] = useState({
    maxConcurrentDownloads: 3,
    wifiOnly: true,
    autoRetry: true,
    deleteAfterReading: false,
    downloadLocation: 'internal',
    imageQuality: 'original',
  });

  useEffect(() => {
    loadDownloads();
    updateStorageInfo();
  }, []);

  const loadDownloads = () => {
    // Mock download data - in real app, this would come from storage
    const mockDownloads: DownloadItem[] = [
      {
        id: '1',
        type: 'manga',
        title: 'One Piece',
        coverUrl: 'https://via.placeholder.com/150x200',
        totalChapters: 1070,
        downloadedChapters: 856,
        status: 'downloading',
        progress: 0.8,
        downloadSpeed: '2.4 MB/s',
        estimatedTime: '5m 32s',
        fileSize: '2.1 GB',
        downloadedSize: '1.7 GB',
        quality: 'High',
        source: 'MangaDex',
        downloadDate: new Date('2024-01-15'),
        chapters: [
          {
            id: '1-857',
            number: '857',
            title: 'Barto Club',
            status: 'downloading',
            progress: 0.6,
            pages: 19,
            downloadedPages: 12,
          },
          {
            id: '1-858',
            number: '858',
            title: 'Dog End',
            status: 'queued',
            progress: 0,
          },
        ],
      },
      {
        id: '2',
        type: 'anime',
        title: 'Attack on Titan',
        coverUrl: 'https://via.placeholder.com/150x200',
        totalChapters: 87,
        downloadedChapters: 87,
        status: 'completed',
        progress: 1.0,
        downloadSpeed: '0 MB/s',
        estimatedTime: 'Completed',
        fileSize: '15.6 GB',
        downloadedSize: '15.6 GB',
        quality: '1080p',
        source: 'Crunchyroll',
        downloadDate: new Date('2024-01-10'),
        chapters: [],
      },
      {
        id: '3',
        type: 'manga',
        title: 'Demon Slayer',
        coverUrl: 'https://via.placeholder.com/150x200',
        totalChapters: 205,
        downloadedChapters: 0,
        status: 'failed',
        progress: 0.1,
        downloadSpeed: '0 MB/s',
        estimatedTime: 'Failed',
        fileSize: '1.2 GB',
        downloadedSize: '120 MB',
        quality: 'High',
        source: 'MangaSee',
        downloadDate: new Date('2024-01-12'),
        chapters: [],
      },
    ];

    setDownloads(mockDownloads);
  };

  const updateStorageInfo = async () => {
    try {
      const fsInfo = await RNFS.getFSInfo();
      const totalGB = (fsInfo.totalSpace / (1024 * 1024 * 1024)).toFixed(1);
      const freeGB = (fsInfo.freeSpace / (1024 * 1024 * 1024)).toFixed(1);
      const usedGB = ((fsInfo.totalSpace - fsInfo.freeSpace) / (1024 * 1024 * 1024)).toFixed(1);
      
      setStorageInfo({
        total: `${totalGB} GB`,
        used: `${usedGB} GB`,
        available: `${freeGB} GB`,
        downloadUsage: '2.8 GB', // Mock download usage
      });
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }
  };

  const filteredDownloads = downloads.filter(download => {
    if (filter === 'all') return true;
    return download.status === filter;
  });

  const sortedDownloads = filteredDownloads.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'progress':
        return b.progress - a.progress;
      case 'date':
      default:
        return b.downloadDate.getTime() - a.downloadDate.getTime();
    }
  });

  const pauseDownload = (id: string) => {
    setDownloads(prev => prev.map(download => 
      download.id === id 
        ? { ...download, status: 'paused' as const }
        : download
    ));
  };

  const resumeDownload = (id: string) => {
    setDownloads(prev => prev.map(download => 
      download.id === id 
        ? { ...download, status: 'downloading' as const }
        : download
    ));
  };

  const retryDownload = (id: string) => {
    setDownloads(prev => prev.map(download => 
      download.id === id 
        ? { ...download, status: 'downloading' as const, progress: 0 }
        : download
    ));
  };

  const deleteDownload = (id: string) => {
    const download = downloads.find(d => d.id === id);
    if (!download) return;

    Alert.alert(
      'Delete Download',
      `Delete "${download.title}"? This will remove all downloaded content.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDownloads(prev => prev.filter(d => d.id !== id));
          },
        },
      ]
    );
  };

  const clearCompleted = () => {
    Alert.alert(
      'Clear Completed',
      'Remove all completed downloads from the list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            setDownloads(prev => prev.filter(d => d.status !== 'completed'));
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: DownloadItem['status']) => {
    switch (status) {
      case 'downloading':
        return 'download';
      case 'completed':
        return 'check-circle';
      case 'paused':
        return 'pause-circle-filled';
      case 'failed':
        return 'error';
      case 'queued':
      default:
        return 'schedule';
    }
  };

  const getStatusColor = (status: DownloadItem['status']) => {
    switch (status) {
      case 'downloading':
        return colors.primary;
      case 'completed':
        return colors.success;
      case 'paused':
        return colors.warning;
      case 'failed':
        return colors.error;
      case 'queued':
      default:
        return colors.onSurfaceVariant;
    }
  };

  const renderDownloadItem = ({ item }: { item: DownloadItem }) => (
    <View style={[styles.downloadCard, { backgroundColor: colors.surface }]}>
      <View style={styles.downloadHeader}>
        <View style={[styles.coverContainer, { backgroundColor: colors.surfaceVariant }]}>
          <Icon 
            name={item.type === 'manga' ? 'menu-book' : 'play-circle-outline'} 
            size={24} 
            color={colors.onSurfaceVariant} 
          />
        </View>
        
        <View style={styles.downloadInfo}>
          <Text style={[styles.downloadTitle, { color: colors.onSurface }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.downloadSource, { color: colors.onSurfaceVariant }]}>
            {item.source} • {item.quality}
          </Text>
          
          <View style={styles.downloadStats}>
            <Text style={[styles.downloadStat, { color: colors.onSurfaceVariant }]}>
              {item.downloadedChapters}/{item.totalChapters} chapters
            </Text>
            <Text style={[styles.downloadStat, { color: colors.onSurfaceVariant }]}>
              {item.downloadedSize} / {item.fileSize}
            </Text>
          </View>
        </View>
        
        <View style={styles.downloadActions}>
          <Icon 
            name={getStatusIcon(item.status)} 
            size={20} 
            color={getStatusColor(item.status)} 
          />
          <TouchableOpacity
            onPress={() => deleteDownload(item.id)}
            style={styles.actionButton}
          >
            <Icon name="delete" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.status === 'downloading' && (
        <View style={styles.progressContainer}>
          <ProgressBarAndroid
            styleAttr="Horizontal"
            indeterminate={false}
            progress={item.progress}
            color={colors.primary}
          />
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: colors.onSurfaceVariant }]}>
              {Math.round(item.progress * 100)}%
            </Text>
            <Text style={[styles.speedText, { color: colors.onSurfaceVariant }]}>
              {item.downloadSpeed} • {item.estimatedTime}
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.downloadControls}>
        {item.status === 'downloading' && (
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.warning + '20' }]}
            onPress={() => pauseDownload(item.id)}
          >
            <Icon name="pause" size={16} color={colors.warning} />
            <Text style={[styles.controlButtonText, { color: colors.warning }]}>
              Pause
            </Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'paused' && (
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => resumeDownload(item.id)}
          >
            <Icon name="play-arrow" size={16} color={colors.primary} />
            <Text style={[styles.controlButtonText, { color: colors.primary }]}>
              Resume
            </Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'failed' && (
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.error + '20' }]}
            onPress={() => retryDownload(item.id)}
          >
            <Icon name="refresh" size={16} color={colors.error} />
            <Text style={[styles.controlButtonText, { color: colors.error }]}>
              Retry
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderStorageInfo = () => (
    <View style={[styles.storageCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.storageTitle, { color: colors.onSurface }]}>
        Storage Usage
      </Text>
      
      <View style={styles.storageStats}>
        <View style={styles.storageStat}>
          <Text style={[styles.storageLabel, { color: colors.onSurfaceVariant }]}>
            Downloads
          </Text>
          <Text style={[styles.storageValue, { color: colors.primary }]}>
            {storageInfo.downloadUsage}
          </Text>
        </View>
        
        <View style={styles.storageStat}>
          <Text style={[styles.storageLabel, { color: colors.onSurfaceVariant }]}>
            Available
          </Text>
          <Text style={[styles.storageValue, { color: colors.success }]}>
            {storageInfo.available}
          </Text>
        </View>
        
        <View style={styles.storageStat}>
          <Text style={[styles.storageLabel, { color: colors.onSurfaceVariant }]}>
            Total
          </Text>
          <Text style={[styles.storageValue, { color: colors.onSurface }]}>
            {storageInfo.total}
          </Text>
        </View>
      </View>
    </View>
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
        <View style={[styles.header, { borderBottomColor: colors.outline }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Icon name="arrow-back" size={24} color={colors.onBackground} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
            Downloads
          </Text>
          
          <TouchableOpacity 
            onPress={() => setShowSettings(true)} 
            style={styles.headerButton}
          >
            <Icon name="settings" size={24} color={colors.onBackground} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {renderStorageInfo()}
          
          <View style={[styles.filterContainer, { backgroundColor: colors.surface }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterButtons}>
                {(['all', 'downloading', 'completed', 'failed'] as const).map(filterType => (
                  <TouchableOpacity
                    key={filterType}
                    style={[
                      styles.filterButton,
                      filter === filterType && { backgroundColor: colors.primary },
                      { borderColor: colors.outline }
                    ]}
                    onPress={() => setFilter(filterType)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      filter === filterType 
                        ? { color: colors.onPrimary }
                        : { color: colors.onSurface }
                    ]}>
                      {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <TouchableOpacity onPress={clearCompleted} style={styles.clearButton}>
              <Icon name="clear-all" size={16} color={colors.error} />
              <Text style={[styles.clearButtonText, { color: colors.error }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={sortedDownloads}
            keyExtractor={(item) => item.id}
            renderItem={renderDownloadItem}
            contentContainerStyle={styles.downloadsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="cloud-download" size={64} color={colors.onSurfaceVariant} />
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                  No downloads found
                </Text>
              </View>
            }
          />
        </ScrollView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  storageCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  storageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  storageStat: {
    alignItems: 'center',
  },
  storageLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  storageValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  downloadsList: {
    paddingBottom: 100,
  },
  downloadCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  coverContainer: {
    width: 48,
    height: 64,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  downloadInfo: {
    flex: 1,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  downloadSource: {
    fontSize: 12,
    marginBottom: 8,
  },
  downloadStats: {
    gap: 2,
  },
  downloadStat: {
    fontSize: 12,
  },
  downloadActions: {
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  speedText: {
    fontSize: 12,
  },
  downloadControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  controlButtonText: {
    fontSize: 12,
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
});

export default DownloadManager;