/**
 * Settings Screen - App configuration and preferences
 * Features theme settings, reading preferences, and account management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface SettingItem {
  title: string;
  subtitle?: string;
  icon: string;
  type: 'switch' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

const SettingsScreen: React.FC = () => {
  const { colors, theme, themeMode, setThemeMode } = useTheme();
  const { user, logout } = useAuth();

  const [settings, setSettings] = useState({
    autoTranslate: true,
    downloadOnWifi: true,
    nsfw: false,
    notifications: true,
    autoDownload: false,
    highQuality: true,
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const settingSections = [
    {
      title: 'Appearance',
      items: [
        {
          title: 'Theme',
          subtitle: themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light',
          icon: 'palette',
          type: 'navigation' as const,
          onPress: () => {
            Alert.alert(
              'Choose Theme',
              'Select your preferred theme',
              [
                { text: 'System', onPress: () => setThemeMode('system') },
                { text: 'Light', onPress: () => setThemeMode('light') },
                { text: 'Dark', onPress: () => setThemeMode('dark') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          },
        },
      ],
    },
    {
      title: 'Reading',
      items: [
        {
          title: 'Auto-translate',
          subtitle: 'Automatically translate manga text',
          icon: 'translate',
          type: 'switch' as const,
          value: settings.autoTranslate,
          onToggle: (value) => updateSetting('autoTranslate', value),
        },
        {
          title: 'High Quality Images',
          subtitle: 'Use higher quality images when available',
          icon: 'high-quality',
          type: 'switch' as const,
          value: settings.highQuality,
          onToggle: (value) => updateSetting('highQuality', value),
        },
      ],
    },
    {
      title: 'Downloads',
      items: [
        {
          title: 'Wi-Fi Only',
          subtitle: 'Only download over Wi-Fi connection',
          icon: 'wifi',
          type: 'switch' as const,
          value: settings.downloadOnWifi,
          onToggle: (value) => updateSetting('downloadOnWifi', value),
        },
        {
          title: 'Auto-download',
          subtitle: 'Automatically download new chapters/episodes',
          icon: 'download',
          type: 'switch' as const,
          value: settings.autoDownload,
          onToggle: (value) => updateSetting('autoDownload', value),
        },
      ],
    },
    {
      title: 'Content',
      items: [
        {
          title: 'NSFW Content',
          subtitle: 'Show adult content sources',
          icon: 'shield',
          type: 'switch' as const,
          value: settings.nsfw,
          onToggle: (value) => updateSetting('nsfw', value),
        },
        {
          title: 'Notifications',
          subtitle: 'New chapters and episodes',
          icon: 'notifications',
          type: 'switch' as const,
          value: settings.notifications,
          onToggle: (value) => updateSetting('notifications', value),
        },
      ],
    },
    {
      title: 'Storage',
      items: [
        {
          title: 'Clear Cache',
          subtitle: 'Free up space by clearing cached data',
          icon: 'clear',
          type: 'action' as const,
          onPress: () => {
            Alert.alert(
              'Clear Cache',
              'This will clear all cached images and data. Downloaded content will not be affected.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared successfully') },
              ]
            );
          },
        },
        {
          title: 'Manage Downloads',
          subtitle: 'View and manage downloaded content',
          icon: 'folder',
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to download management'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          title: 'Version',
          subtitle: '1.0.0 (Beta)',
          icon: 'info',
          type: 'navigation' as const,
        },
        {
          title: 'Privacy Policy',
          subtitle: 'How we handle your data',
          icon: 'privacy-tip',
          type: 'navigation' as const,
        },
        {
          title: 'Terms of Service',
          subtitle: 'Our terms and conditions',
          icon: 'article',
          type: 'navigation' as const,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.settingItem, { borderBottomColor: colors.outline }]}
      onPress={item.onPress}
      disabled={item.type === 'switch'}
      activeOpacity={item.type === 'switch' ? 1 : 0.7}
    >
      <View style={styles.settingContent}>
        <Icon name={item.icon} size={24} color={colors.onSurfaceVariant} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      
      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: colors.surfaceVariant, true: colors.primary + '60' }}
          thumbColor={item.value ? colors.primary : colors.onSurfaceVariant}
        />
      ) : item.type === 'navigation' ? (
        <Icon name="chevron-right" size={24} color={colors.onSurfaceVariant} />
      ) : null}
    </TouchableOpacity>
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
    },
    userSection: {
      padding: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    avatarText: {
      color: colors.onPrimary,
      fontSize: 20,
      fontWeight: 'bold',
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.onSurface,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error + '20',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    signOutText: {
      color: colors.error,
      fontWeight: '500',
      marginLeft: 6,
    },
    scrollContent: {
      flex: 1,
    },
    section: {
      marginVertical: 8,
    },
    sectionHeader: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.surfaceVariant,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
    },
    settingContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingText: {
      marginLeft: 16,
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 14,
      lineHeight: 20,
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
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* User Section */}
      {user && (
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
              </Text>
              <Text style={styles.userEmail}>
                {user.email || 'No email provided'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
            <Icon name="logout" size={16} color={colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map(renderSettingItem)}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;