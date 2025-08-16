/**
 * Age Verification and NSFW Content Management
 * Features: Age verification, parental controls, content filtering
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../contexts/ThemeContext';

interface AgeVerificationProps {
  visible: boolean;
  onVerified: (verified: boolean) => void;
  onClose: () => void;
}

interface ContentFilter {
  nsfw: boolean;
  violence: boolean;
  suggestive: boolean;
  language: boolean;
  customKeywords: string[];
}

const AgeVerification: React.FC<AgeVerificationProps> = ({
  visible,
  onVerified,
  onClose,
}) => {
  const { colors } = useTheme();
  
  const [step, setStep] = useState<'warning' | 'verification' | 'settings'>('warning');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showParentalControls, setShowParentalControls] = useState(false);
  
  const [contentFilter, setContentFilter] = useState<ContentFilter>({
    nsfw: false,
    violence: false,
    suggestive: false,
    language: false,
    customKeywords: [],
  });
  
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      checkExistingVerification();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const checkExistingVerification = async () => {
    try {
      const verification = await AsyncStorage.getItem('ageVerification');
      if (verification) {
        const data = JSON.parse(verification);
        if (data.verified && data.timestamp) {
          // Check if verification is still valid (30 days)
          const timeDiff = Date.now() - data.timestamp;
          const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
          
          if (daysDiff < 30) {
            setIsVerified(true);
            onVerified(true);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Failed to check age verification:', error);
    }
  };

  const calculateAge = () => {
    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);
    
    if (!year || !month || !day) {
      return 0;
    }
    
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleVerification = async () => {
    const age = calculateAge();
    
    if (age === 0) {
      Alert.alert('Invalid Date', 'Please enter a valid birth date');
      return;
    }
    
    if (age < 13) {
      Alert.alert(
        'Age Restriction',
        'You must be at least 13 years old to use this app',
        [{ text: 'OK', onPress: onClose }]
      );
      return;
    }
    
    const verified = age >= 18;
    
    try {
      await AsyncStorage.setItem('ageVerification', JSON.stringify({
        verified,
        age,
        timestamp: Date.now(),
      }));
      
      setIsVerified(verified);
      
      if (verified) {
        setStep('settings');
      } else {
        // Minor - show parental controls
        setShowParentalControls(true);
        onVerified(false);
      }
    } catch (error) {
      console.error('Failed to save age verification:', error);
      Alert.alert('Error', 'Failed to save verification');
    }
  };

  const saveContentSettings = async () => {
    try {
      await AsyncStorage.setItem('contentFilter', JSON.stringify(contentFilter));
      onVerified(isVerified);
    } catch (error) {
      console.error('Failed to save content settings:', error);
    }
  };

  const updateContentFilter = <K extends keyof ContentFilter>(
    key: K,
    value: ContentFilter[K]
  ) => {
    setContentFilter(prev => ({ ...prev, [key]: value }));
  };

  const renderWarningScreen = () => (
    <Animated.View style={[styles.warningContainer, { opacity: fadeAnim }]}>
      <View style={[styles.warningIcon, { backgroundColor: colors.errorContainer }]}>
        <Icon name="warning" size={48} color={colors.onErrorContainer} />
      </View>
      
      <Text style={[styles.warningTitle, { color: colors.onBackground }]}>
        Age Verification Required
      </Text>
      
      <Text style={[styles.warningText, { color: colors.onSurfaceVariant }]}>
        This app may contain mature content including violence, suggestive themes, and adult material. 
        Age verification is required to ensure compliance with content guidelines.
      </Text>
      
      <View style={[styles.warningList, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.warningItem}>
          <Icon name="visibility-off" size={16} color={colors.onSurfaceVariant} />
          <Text style={[styles.warningItemText, { color: colors.onSurfaceVariant }]}>
            Sexual content and nudity
          </Text>
        </View>
        
        <View style={styles.warningItem}>
          <Icon name="local-movies" size={16} color={colors.onSurfaceVariant} />
          <Text style={[styles.warningItemText, { color: colors.onSurfaceVariant }]}>
            Violence and graphic content
          </Text>
        </View>
        
        <View style={styles.warningItem}>
          <Icon name="chat-bubble-outline" size={16} color={colors.onSurfaceVariant} />
          <Text style={[styles.warningItemText, { color: colors.onSurfaceVariant }]}>
            Strong language and themes
          </Text>
        </View>
      </View>
      
      <View style={styles.warningButtons}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.outline }]}
          onPress={onClose}
        >
          <Text style={[styles.cancelButtonText, { color: colors.onSurface }]}>
            Exit App
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={() => setStep('verification')}
        >
          <Text style={[styles.continueButtonText, { color: colors.onPrimary }]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderVerificationScreen = () => (
    <ScrollView style={styles.verificationContainer}>
      <Text style={[styles.verificationTitle, { color: colors.onBackground }]}>
        Enter Your Birth Date
      </Text>
      
      <Text style={[styles.verificationSubtitle, { color: colors.onSurfaceVariant }]}>
        This information is used only for age verification and is stored locally on your device.
      </Text>
      
      <View style={styles.dateInputContainer}>
        <View style={styles.dateInputGroup}>
          <Text style={[styles.dateInputLabel, { color: colors.onSurface }]}>
            Month
          </Text>
          <TextInput
            style={[
              styles.dateInput,
              { 
                backgroundColor: colors.surfaceVariant,
                color: colors.onSurfaceVariant,
                borderColor: colors.outline 
              }
            ]}
            placeholder="MM"
            placeholderTextColor={colors.onSurfaceVariant + '80'}
            value={birthMonth}
            onChangeText={setBirthMonth}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        
        <View style={styles.dateInputGroup}>
          <Text style={[styles.dateInputLabel, { color: colors.onSurface }]}>
            Day
          </Text>
          <TextInput
            style={[
              styles.dateInput,
              { 
                backgroundColor: colors.surfaceVariant,
                color: colors.onSurfaceVariant,
                borderColor: colors.outline 
              }
            ]}
            placeholder="DD"
            placeholderTextColor={colors.onSurfaceVariant + '80'}
            value={birthDay}
            onChangeText={setBirthDay}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        
        <View style={styles.dateInputGroup}>
          <Text style={[styles.dateInputLabel, { color: colors.onSurface }]}>
            Year
          </Text>
          <TextInput
            style={[
              styles.dateInput,
              { 
                backgroundColor: colors.surfaceVariant,
                color: colors.onSurfaceVariant,
                borderColor: colors.outline 
              }
            ]}
            placeholder="YYYY"
            placeholderTextColor={colors.onSurfaceVariant + '80'}
            value={birthYear}
            onChangeText={setBirthYear}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
      </View>
      
      <View style={[styles.privacyNotice, { backgroundColor: colors.primaryContainer }]}>
        <Icon name="security" size={20} color={colors.onPrimaryContainer} />
        <Text style={[styles.privacyText, { color: colors.onPrimaryContainer }]}>
          Your personal information is never shared and remains on your device.
        </Text>
      </View>
      
      <View style={styles.verificationButtons}>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: colors.outline }]}
          onPress={() => setStep('warning')}
        >
          <Text style={[styles.backButtonText, { color: colors.onSurface }]}>
            Back
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.verifyButton, { backgroundColor: colors.primary }]}
          onPress={handleVerification}
        >
          <Text style={[styles.verifyButtonText, { color: colors.onPrimary }]}>
            Verify Age
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSettingsScreen = () => (
    <ScrollView style={styles.settingsContainer}>
      <Text style={[styles.settingsTitle, { color: colors.onBackground }]}>
        Content Preferences
      </Text>
      
      <Text style={[styles.settingsSubtitle, { color: colors.onSurfaceVariant }]}>
        Customize what content you want to see. These settings can be changed later.
      </Text>
      
      <View style={[styles.settingsSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
          Adult Content
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
              NSFW Content
            </Text>
            <Text style={[styles.settingDescription, { color: colors.onSurfaceVariant }]}>
              Show explicit sexual content
            </Text>
          </View>
          <Switch
            value={contentFilter.nsfw}
            onValueChange={(value) => updateContentFilter('nsfw', value)}
            trackColor={{ false: colors.outline, true: colors.primary }}
            thumbColor={colors.onPrimary}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
              Violence
            </Text>
            <Text style={[styles.settingDescription, { color: colors.onSurfaceVariant }]}>
              Show graphic violence and gore
            </Text>
          </View>
          <Switch
            value={contentFilter.violence}
            onValueChange={(value) => updateContentFilter('violence', value)}
            trackColor={{ false: colors.outline, true: colors.primary }}
            thumbColor={colors.onPrimary}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
              Suggestive Content
            </Text>
            <Text style={[styles.settingDescription, { color: colors.onSurfaceVariant }]}>
              Show suggestive themes and partial nudity
            </Text>
          </View>
          <Switch
            value={contentFilter.suggestive}
            onValueChange={(value) => updateContentFilter('suggestive', value)}
            trackColor={{ false: colors.outline, true: colors.primary }}
            thumbColor={colors.onPrimary}
          />
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={saveContentSettings}
      >
        <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>
          Save Preferences
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.skipButton, { backgroundColor: colors.surfaceVariant }]}
        onPress={() => onVerified(isVerified)}
      >
        <Text style={[styles.skipButtonText, { color: colors.onSurfaceVariant }]}>
          Skip for Now
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {step === 'warning' && renderWarningScreen()}
          {step === 'verification' && renderVerificationScreen()}
          {step === 'settings' && renderSettingsScreen()}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  warningContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  warningList: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningItemText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  warningButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  verificationContainer: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  verificationSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateInput: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  privacyText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  verificationButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  settingsSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  settingsSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AgeVerification;