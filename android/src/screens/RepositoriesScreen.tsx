/**
 * Repositories Screen - Aniyomi/Komikku compatible source management
 * Handles repository installation, source management, and compatibility
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
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { useRepository } from '../contexts/RepositoryContext';

const RepositoriesScreen: React.FC = () => {
  const { colors, theme } = useTheme();
  const { repositories, isLoading, addRepository, toggleRepository, removeRepository } = useRepository();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoName, setNewRepoName] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddRepository = async () => {
    if (!newRepoUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid repository URL');
      return;
    }

    try {
      await addRepository(newRepoUrl.trim(), newRepoName.trim() || undefined);
      setShowAddModal(false);
      setNewRepoUrl('');
      setNewRepoName('');
      Alert.alert('Success', 'Repository added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add repository');
    }
  };

  const handleToggleRepository = async (id: string, enabled: boolean) => {
    try {
      await toggleRepository(id, enabled);
    } catch (error) {
      Alert.alert('Error', 'Failed to update repository');
    }
  };

  const handleRemoveRepository = (repo: any) => {
    Alert.alert(
      'Remove Repository',
      `Are you sure you want to remove "${repo.name}"? This will disable all sources from this repository.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeRepository(repo.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove repository');
            }
          },
        },
      ]
    );
  };

  const formatInstallCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manga':
        return colors.manga;
      case 'anime':
        return colors.anime;
      case 'both':
        return colors.success;
      default:
        return colors.onSurfaceVariant;
    }
  };

  const renderRepository = (repo: any) => (
    <View key={repo.id} style={[styles.repoCard, { backgroundColor: colors.surface }]}>
      <View style={styles.repoHeader}>
        <View style={styles.repoInfo}>
          <Image
            source={{ uri: repo.iconUrl || 'https://via.placeholder.com/48x48' }}
            style={[styles.repoIcon, { backgroundColor: colors.surfaceVariant }]}
          />
          <View style={styles.repoDetails}>
            <Text style={[styles.repoName, { color: colors.onSurface }]}>{repo.name}</Text>
            <Text style={[styles.repoAuthor, { color: colors.onSurfaceVariant }]}>
              by {repo.author}
            </Text>
            <View style={styles.repoMeta}>
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(repo.sourceType) + '20' }]}>
                <Text style={[styles.typeBadgeText, { color: getTypeColor(repo.sourceType) }]}>
                  {repo.sourceType.toUpperCase()}
                </Text>
              </View>
              {repo.isNsfw && (
                <View style={[styles.nsfwBadge, { backgroundColor: colors.error + '20' }]}>
                  <Icon name="shield" size={12} color={colors.error} />
                  <Text style={[styles.nsfwText, { color: colors.error }]}>NSFW</Text>
                </View>
              )}
              {repo.hasCloudflare && (
                <View style={[styles.cloudFlareBadge, { backgroundColor: colors.warning + '20' }]}>
                  <Text style={[styles.cloudFlareText, { color: colors.warning }]}>CF</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: repo.isEnabled ? colors.primary : colors.surfaceVariant }]}
          onPress={() => handleToggleRepository(repo.id, !repo.isEnabled)}
        >
          <Icon
            name={repo.isEnabled ? 'check' : 'close'}
            size={16}
            color={repo.isEnabled ? colors.onPrimary : colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.repoDescription, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
        {repo.description}
      </Text>

      <View style={styles.repoStats}>
        <View style={styles.stat}>
          <Icon name="download" size={14} color={colors.onSurfaceVariant} />
          <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>
            {formatInstallCount(repo.installCount)} installs
          </Text>
        </View>
        <View style={styles.stat}>
          <Icon name="info-outline" size={14} color={colors.onSurfaceVariant} />
          <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>
            v{repo.version}
          </Text>
        </View>
        <View style={styles.stat}>
          <Icon name="schedule" size={14} color={colors.onSurfaceVariant} />
          <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>
            {new Date(repo.lastChecked).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {repo.isObsolete && (
        <View style={[styles.warningBanner, { backgroundColor: colors.warning + '20' }]}>
          <Icon name="warning" size={16} color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.warning }]}>
            This repository is obsolete and may be removed in the future.
          </Text>
        </View>
      )}

      <View style={styles.repoActions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}>
          <Icon name="refresh" size={16} color={colors.onSurfaceVariant} />
          <Text style={[styles.actionButtonText, { color: colors.onSurfaceVariant }]}>Update</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
          onPress={() => handleRemoveRepository(repo)}
        >
          <Icon name="delete" size={16} color={colors.error} />
          <Text style={[styles.actionButtonText, { color: colors.error }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    addButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: colors.primary,
      borderRadius: 28,
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    scrollContent: {
      padding: 16,
    },
    repoCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    repoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    repoInfo: {
      flexDirection: 'row',
      flex: 1,
    },
    repoIcon: {
      width: 48,
      height: 48,
      borderRadius: 8,
      marginRight: 12,
    },
    repoDetails: {
      flex: 1,
    },
    repoName: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    repoAuthor: {
      fontSize: 12,
      marginBottom: 6,
    },
    repoMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    typeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginRight: 6,
      marginBottom: 2,
    },
    typeBadgeText: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    nsfwBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      marginRight: 6,
    },
    nsfwText: {
      fontSize: 10,
      fontWeight: 'bold',
      marginLeft: 2,
    },
    cloudFlareBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
    },
    cloudFlareText: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    toggleButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    repoDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
    },
    repoStats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 12,
    },
    stat: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
      marginBottom: 4,
    },
    statText: {
      fontSize: 12,
      marginLeft: 4,
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 6,
      marginBottom: 12,
    },
    warningText: {
      fontSize: 12,
      marginLeft: 6,
      flex: 1,
    },
    repoActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      flex: 1,
      marginHorizontal: 4,
      justifyContent: 'center',
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      margin: 20,
      borderRadius: 12,
      padding: 20,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      marginBottom: 12,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 6,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 6,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '500',
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
        <Text style={styles.headerTitle}>Sources & Repositories</Text>
        <Text style={styles.headerSubtitle}>
          {repositories.length} repositories • {repositories.filter(r => r.isEnabled).length} active
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
        {repositories.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="source" size={64} color={colors.onSurfaceVariant} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
              No repositories added
            </Text>
            <Text style={[styles.emptyMessage, { color: colors.onSurfaceVariant }]}>
              Add repositories to access manga and anime sources.
              Compatible with Aniyomi and Komikku repositories.
            </Text>
          </View>
        ) : (
          repositories.map(renderRepository)
        )}
      </ScrollView>

      {/* Add Repository Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Icon name="add" size={28} color={colors.onPrimary} />
      </TouchableOpacity>

      {/* Add Repository Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
              Add Repository
            </Text>
            
            <Text style={[styles.inputLabel, { color: colors.onSurface }]}>
              Repository URL
            </Text>
            <TextInput
              style={[styles.input, { borderColor: colors.outline, color: colors.onSurface }]}
              placeholder="https://example.com/repository.json"
              placeholderTextColor={colors.onSurfaceVariant}
              value={newRepoUrl}
              onChangeText={setNewRepoUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            
            <Text style={[styles.inputLabel, { color: colors.onSurface }]}>
              Name (Optional)
            </Text>
            <TextInput
              style={[styles.input, { borderColor: colors.outline, color: colors.onSurface }]}
              placeholder="Custom Repository Name"
              placeholderTextColor={colors.onSurfaceVariant}
              value={newRepoName}
              onChangeText={setNewRepoName}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.onSurfaceVariant }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddRepository}
              >
                <Text style={[styles.modalButtonText, { color: colors.onPrimary }]}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RepositoriesScreen;