/**
 * Advanced Settings Component
 * Features: User preferences, reading settings, app configuration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  Slider,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';

interface SettingsProps {
  visible: boolean;
  onClose: () => void;
}

interface ReadingSettings {
  readingMode: 'paged' | 'continuous' | 'webtoon';
  readingDirection: 'ltr' | 'rtl' | 'vertical';
  doublePage: boolean;
  fullscreen: boolean;
  keepScreenOn: boolean;
  backgroundColor: string;
  pageSpacing: number;
  zoomStartPosition: 'automatic' | 'left' | 'right' | 'center';
  tapNavigation: boolean;
  volumeKeyNavigation: boolean;
}

interface TranslationSettings {
  enabled: boolean;
  sourceLanguage: 'auto' | 'japanese' | 'korean' | 'chinese';
  targetLanguage: 'english' | 'spanish' | 'french' | 'german';
  quality: 'fast' | 'balanced' | 'premium';
  showOriginal: boolean;
  overlay: boolean;
  fontSize: number;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  nsfwContent: boolean;
  downloadOnlyWifi: boolean;
  autoBackup: boolean;
  crashReports: boolean;
  analytics: boolean;
  notifications: boolean;
  backgroundUpdates: boolean;
}

const AdvancedSettings: React.FC<SettingsProps> = ({ visible, onClose }) => {
  const { colors, theme, toggleTheme } = useTheme();
  
  const [activeSection, setActiveSection] = useState<'reading' | 'translation' | 'app'>('reading');
  
  const [readingSettings, setReadingSettings] = useState<ReadingSettings>({
    readingMode: 'paged',
    readingDirection: 'ltr',
    doublePage: false,
    fullscreen: true,
    keepScreenOn: true,
    backgroundColor: '#000000',
    pageSpacing: 10,
    zoomStartPosition: 'automatic',
    tapNavigation: true,
    volumeKeyNavigation: false,
  });

  const [translationSettings, setTranslationSettings] = useState<TranslationSettings>({
    enabled: true,
    sourceLanguage: 'auto',
    targetLanguage: 'english',
    quality: 'balanced',
    showOriginal: false,
    overlay: true,
    fontSize: 14,
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: 'auto',
    nsfwContent: false,
    downloadOnlyWifi: true,
    autoBackup: true,
    crashReports: true,
    analytics: false,
    notifications: true,
    backgroundUpdates: false,
  });

  const updateReadingSetting = <K extends keyof ReadingSettings>(
    key: K,
    value: ReadingSettings[K]
  ) => {
    setReadingSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateTranslationSetting = <K extends keyof TranslationSettings>(
    key: K,
    value: TranslationSettings[K]
  ) => {
    setTranslationSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateAppSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setAppSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Reset to default values
            setReadingSettings({
              readingMode: 'paged',
              readingDirection: 'ltr',
              doublePage: false,
              fullscreen: true,
              keepScreenOn: true,
              backgroundColor: '#000000',
              pageSpacing: 10,
              zoomStartPosition: 'automatic',
              tapNavigation: true,
              volumeKeyNavigation: false,
            });
            setTranslationSettings({
              enabled: true,
              sourceLanguage: 'auto',
              targetLanguage: 'english',
              quality: 'balanced',
              showOriginal: false,
              overlay: true,
              fontSize: 14,
            });
            setAppSettings({
              theme: 'auto',
              nsfwContent: false,
              downloadOnlyWifi: true,
              autoBackup: true,
              crashReports: true,
              analytics: false,
              notifications: true,
              backgroundUpdates: false,
            });
          },
        },
      ]
    );
  };

  const renderSectionHeader = (
    title: string,
    section: 'reading' | 'translation' | 'app',
    icon: string
  ) => (
    <TouchableOpacity
      style={[
        styles.sectionHeader,
        activeSection === section && { backgroundColor: colors.primaryContainer },
        { borderBottomColor: colors.outline }
      ]}
      onPress={() => setActiveSection(section)}
    >
      <Icon 
        name={icon} 
        size={24} 
        color={activeSection === section ? colors.onPrimaryContainer : colors.onSurface} 
      />
      <Text style={[
        styles.sectionTitle,
        { color: activeSection === section ? colors.onPrimaryContainer : colors.onSurface }
      ]}>
        {title}
      </Text>
      <Icon 
        name="chevron-right" 
        size={20} 
        color={activeSection === section ? colors.onPrimaryContainer : colors.onSurfaceVariant} 
      />
    </TouchableOpacity>
  );

  const renderSettingRow = (
    title: string,
    subtitle: string,
    rightComponent: React.ReactNode
  ) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.outline }]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
          {title}
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      </View>
      {rightComponent}
    </View>
  );

  const renderReadingSettings = () => (
    <ScrollView style={styles.settingsContent}>
      {renderSettingRow(
        'Reading Mode',
        'How pages are displayed',
        <TouchableOpacity style={[styles.selectButton, { borderColor: colors.outline }]}>
          <Text style={[styles.selectButtonText, { color: colors.onSurface }]}>
            {readingSettings.readingMode.charAt(0).toUpperCase() + readingSettings.readingMode.slice(1)}
          </Text>
          <Icon name="expand-more" size={20} color={colors.onSurface} />
        </TouchableOpacity>
      )}

      {renderSettingRow(
        'Reading Direction',
        'Page navigation direction',
        <TouchableOpacity style={[styles.selectButton, { borderColor: colors.outline }]}>
          <Text style={[styles.selectButtonText, { color: colors.onSurface }]}>
            {readingSettings.readingDirection.toUpperCase()}
          </Text>
          <Icon name="expand-more" size={20} color={colors.onSurface} />
        </TouchableOpacity>
      )}

      {renderSettingRow(
        'Double Page Spread',
        'Show two pages side by side in landscape',
        <Switch
          value={readingSettings.doublePage}
          onValueChange={(value) => updateReadingSetting('doublePage', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      {renderSettingRow(
        'Fullscreen',
        'Hide system UI while reading',
        <Switch
          value={readingSettings.fullscreen}
          onValueChange={(value) => updateReadingSetting('fullscreen', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      {renderSettingRow(
        'Keep Screen On',
        'Prevent screen from turning off',
        <Switch
          value={readingSettings.keepScreenOn}
          onValueChange={(value) => updateReadingSetting('keepScreenOn', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      <View style={[styles.settingRow, { borderBottomColor: colors.outline }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
            Page Spacing
          </Text>
          <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>
            Space between pages: {readingSettings.pageSpacing}px
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={50}
          value={readingSettings.pageSpacing}
          onValueChange={(value) => updateReadingSetting('pageSpacing', Math.round(value))}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.outline}
          thumbStyle={{ backgroundColor: colors.primary }}
        />
      </View>

      {renderSettingRow(
        'Tap Navigation',
        'Navigate by tapping screen edges',
        <Switch
          value={readingSettings.tapNavigation}
          onValueChange={(value) => updateReadingSetting('tapNavigation', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      {renderSettingRow(
        'Volume Key Navigation',
        'Use volume keys to navigate pages',
        <Switch
          value={readingSettings.volumeKeyNavigation}
          onValueChange={(value) => updateReadingSetting('volumeKeyNavigation', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}
    </ScrollView>
  );

  const renderTranslationSettings = () => (
    <ScrollView style={styles.settingsContent}>
      {renderSettingRow(
        'AI Translation',
        'Enable automatic translation',
        <Switch
          value={translationSettings.enabled}
          onValueChange={(value) => updateTranslationSetting('enabled', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      {renderSettingRow(
        'Source Language',
        'Language to translate from',
        <TouchableOpacity style={[styles.selectButton, { borderColor: colors.outline }]}>
          <Text style={[styles.selectButtonText, { color: colors.onSurface }]}>
            {translationSettings.sourceLanguage.charAt(0).toUpperCase() + translationSettings.sourceLanguage.slice(1)}
          </Text>
          <Icon name="expand-more" size={20} color={colors.onSurface} />
        </TouchableOpacity>
      )}

      {renderSettingRow(
        'Target Language',
        'Language to translate to',
        <TouchableOpacity style={[styles.selectButton, { borderColor: colors.outline }]}>
          <Text style={[styles.selectButtonText, { color: colors.onSurface }]}>
            {translationSettings.targetLanguage.charAt(0).toUpperCase() + translationSettings.targetLanguage.slice(1)}
          </Text>
          <Icon name="expand-more" size={20} color={colors.onSurface} />
        </TouchableOpacity>
      )}

      {renderSettingRow(
        'Translation Quality',
        'Balance between speed and accuracy',
        <TouchableOpacity style={[styles.selectButton, { borderColor: colors.outline }]}>
          <Text style={[styles.selectButtonText, { color: colors.onSurface }]}>
            {translationSettings.quality.charAt(0).toUpperCase() + translationSettings.quality.slice(1)}
          </Text>
          <Icon name="expand-more" size={20} color={colors.onSurface} />
        </TouchableOpacity>
      )}

      {renderSettingRow(
        'Show Original Text',
        'Display original text alongside translation',
        <Switch
          value={translationSettings.showOriginal}
          onValueChange={(value) => updateTranslationSetting('showOriginal', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      {renderSettingRow(
        'Translation Overlay',
        'Show translations as overlay bubbles',
        <Switch
          value={translationSettings.overlay}
          onValueChange={(value) => updateTranslationSetting('overlay', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      <View style={[styles.settingRow, { borderBottomColor: colors.outline }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
            Translation Font Size
          </Text>
          <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>
            Size: {translationSettings.fontSize}px
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={24}
          value={translationSettings.fontSize}
          onValueChange={(value) => updateTranslationSetting('fontSize', Math.round(value))}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.outline}
          thumbStyle={{ backgroundColor: colors.primary }}
        />
      </View>
    </ScrollView>
  );

  const renderAppSettings = () => (
    <ScrollView style={styles.settingsContent}>
      {renderSettingRow(
        'Theme',
        'App appearance',
        <TouchableOpacity 
          style={[styles.selectButton, { borderColor: colors.outline }]}
          onPress={toggleTheme}
        >
          <Text style={[styles.selectButtonText, { color: colors.onSurface }]}>
            {appSettings.theme.charAt(0).toUpperCase() + appSettings.theme.slice(1)}
          </Text>
          <Icon name="expand-more" size={20} color={colors.onSurface} />
        </TouchableOpacity>
      )}

      {renderSettingRow(
        'NSFW Content',
        'Allow adult content',
        <Switch
          value={appSettings.nsfwContent}
          onValueChange={(value) => updateAppSetting('nsfwContent', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      {renderSettingRow(
        'Download Only on WiFi',
        'Prevent mobile data usage for downloads',
        <Switch
          value={appSettings.downloadOnlyWifi}
          onValueChange={(value) => updateAppSetting('downloadOnlyWifi', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      {renderSettingRow(
        'Auto Backup',
        'Backup reading progress and settings',
        <Switch
          value={appSettings.autoBackup}
          onValueChange={(value) => updateAppSetting('autoBackup', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      {renderSettingRow(
        'Crash Reports',
        'Send crash reports to improve the app',
        <Switch
          value={appSettings.crashReports}
          onValueChange={(value) => updateAppSetting('crashReports', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      {renderSettingRow(
        'Analytics',
        'Help improve the app with usage data',
        <Switch
          value={appSettings.analytics}
          onValueChange={(value) => updateAppSetting('analytics', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      {renderSettingRow(
        'Notifications',
        'Show app notifications',
        <Switch
          value={appSettings.notifications}
          onValueChange={(value) => updateAppSetting('notifications', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      {renderSettingRow(
        'Background Updates',
        'Check for new chapters in background',
        <Switch
          value={appSettings.backgroundUpdates}
          onValueChange={(value) => updateAppSetting('backgroundUpdates', value)}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      )}

      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: colors.errorContainer }]}
        onPress={resetSettings}
      >
        <Icon name="restore" size={20} color={colors.onErrorContainer} />
        <Text style={[styles.resetButtonText, { color: colors.onErrorContainer }]}>
          Reset All Settings
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
            Settings
          </Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.content}>
          <View style={[styles.sidebar, { backgroundColor: colors.surfaceVariant }]}>
            {renderSectionHeader('Reading', 'reading', 'menu-book')}
            {renderSectionHeader('Translation', 'translation', 'translate')}
            {renderSectionHeader('App', 'app', 'settings')}
          </View>

          <View style={styles.mainContent}>
            {activeSection === 'reading' && renderReadingSettings()}
            {activeSection === 'translation' && renderTranslationSettings()}
            {activeSection === 'app' && renderAppSettings()}
          </View>
        </View>
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
    flexDirection: 'row',
  },
  sidebar: {
    width: 120,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  mainContent: {
    flex: 1,
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 100,
  },
  selectButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  slider: {
    width: 120,
    height: 40,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdvancedSettings;