/**
 * Player Screen - Fullscreen anime video player
 * Features advanced video controls, subtitle support, and quality selection
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Slider,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VideoQuality {
  label: string;
  value: string;
  resolution: string;
}

const PlayerScreen: React.FC = () => {
  const { colors } = useTheme();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1800); // 30 minutes in seconds
  const [volume, setVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedSelector, setShowSpeedSelector] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const videoQualities: VideoQuality[] = [
    { label: '4K', value: '2160p', resolution: '3840×2160' },
    { label: 'Full HD', value: '1080p', resolution: '1920×1080' },
    { label: 'HD', value: '720p', resolution: '1280×720' },
    { label: 'SD', value: '480p', resolution: '854×480' },
    { label: 'Auto', value: 'auto', resolution: 'Adaptive' },
  ];

  const playbackSpeeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  useEffect(() => {
    // Handle hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Navigate back to previous screen
      return true;
    });

    // Auto-hide controls
    resetControlsTimeout();

    return () => {
      backHandler.remove();
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Simulate video progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, playbackSpeed]);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  };

  const handleScreenTouch = () => {
    if (showControls) {
      setShowControls(false);
    } else {
      resetControlsTimeout();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const seekTo = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, duration)));
    resetControlsTimeout();
  };

  const skip = (seconds: number) => {
    seekTo(currentTime + seconds);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    videoContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000000',
    },
    videoPlaceholder: {
      width: screenWidth,
      height: screenHeight,
      backgroundColor: '#1a1a1a',
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoPlaceholderText: {
      color: '#ffffff',
      fontSize: 18,
      marginTop: 16,
    },
    controlsOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    topControls: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: 40,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
    },
    topControlsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    episodeInfo: {
      flex: 1,
      marginHorizontal: 16,
    },
    episodeTitle: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    episodeSubtitle: {
      color: '#cccccc',
      fontSize: 14,
    },
    centerControls: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -100 }, { translateY: -50 }],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: 200,
    },
    centerButton: {
      padding: 20,
      marginHorizontal: 20,
    },
    playButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 40,
      padding: 20,
    },
    bottomControls: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingBottom: 40,
      paddingTop: 20,
      backgroundColor: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
    },
    progressContainer: {
      marginBottom: 20,
    },
    progressBar: {
      marginBottom: 8,
    },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timeText: {
      color: '#ffffff',
      fontSize: 12,
    },
    bottomControlsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    leftControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rightControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    controlButton: {
      padding: 12,
      marginHorizontal: 4,
    },
    volumeContainer: {
      position: 'absolute',
      bottom: 80,
      left: 80,
      height: 150,
      width: 40,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    verticalSlider: {
      height: 120,
      width: 20,
    },
    qualitySelector: {
      position: 'absolute',
      bottom: 80,
      right: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderRadius: 8,
      paddingVertical: 8,
      minWidth: 150,
    },
    qualityOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectedQuality: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    qualityLabel: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '500',
    },
    qualityResolution: {
      color: '#cccccc',
      fontSize: 12,
    },
    speedSelector: {
      position: 'absolute',
      bottom: 80,
      right: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderRadius: 8,
      paddingVertical: 8,
      minWidth: 100,
    },
    speedOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    selectedSpeed: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    speedLabel: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    subtitleIndicator: {
      position: 'absolute',
      bottom: 120,
      alignSelf: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 4,
    },
    subtitleText: {
      color: '#ffffff',
      fontSize: 16,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Video Container */}
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={handleScreenTouch}
      >
        <View style={styles.videoPlaceholder}>
          <Icon name="play-circle-outline" size={80} color="#ffffff" />
          <Text style={styles.videoPlaceholderText}>
            Jujutsu Kaisen S3 EP8
          </Text>
        </View>
      </TouchableOpacity>

      {/* Subtitles */}
      {subtitlesEnabled && (
        <View style={styles.subtitleIndicator}>
          <Text style={styles.subtitleText}>
            This is a sample subtitle text that appears at the bottom of the video.
          </Text>
        </View>
      )}

      {/* Controls Overlay */}
      {showControls && (
        <View style={styles.controlsOverlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <View style={styles.topControlsRow}>
              <TouchableOpacity style={styles.controlButton}>
                <Icon name="arrow-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              
              <View style={styles.episodeInfo}>
                <Text style={styles.episodeTitle}>Jujutsu Kaisen Season 3</Text>
                <Text style={styles.episodeSubtitle}>Episode 8 - The Shibuya Incident</Text>
              </View>
              
              <TouchableOpacity style={styles.controlButton}>
                <Icon name="cast" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Center Play/Pause Controls */}
          <View style={styles.centerControls}>
            <TouchableOpacity
              style={styles.centerButton}
              onPress={() => skip(-10)}
            >
              <Icon name="replay-10" size={36} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
            >
              <Icon
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={48}
                color="#ffffff"
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.centerButton}
              onPress={() => skip(10)}
            >
              <Icon name="forward-10" size={36} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Slider
                style={styles.progressBar}
                value={currentTime}
                maximumValue={duration}
                minimumValue={0}
                onValueChange={seekTo}
                thumbStyle={{ backgroundColor: colors.primary }}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              />
              <View style={styles.progressLabels}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>

            {/* Control Buttons */}
            <View style={styles.bottomControlsRow}>
              <View style={styles.leftControls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => setShowVolumeSlider(!showVolumeSlider)}
                >
                  <Icon 
                    name={volume === 0 ? 'volume-off' : volume < 0.5 ? 'volume-down' : 'volume-up'} 
                    size={24} 
                    color="#ffffff" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => setSubtitlesEnabled(!subtitlesEnabled)}
                >
                  <Icon 
                    name="closed-caption" 
                    size={24} 
                    color={subtitlesEnabled ? colors.primary : "#ffffff"} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.rightControls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => setShowSpeedSelector(!showSpeedSelector)}
                >
                  <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>
                    {playbackSpeed}x
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => setShowQualitySelector(!showQualitySelector)}
                >
                  <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>
                    {selectedQuality}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlButton}>
                  <Icon name="fullscreen" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Volume Slider */}
      {showVolumeSlider && (
        <View style={styles.volumeContainer}>
          <Slider
            style={styles.verticalSlider}
            value={volume}
            onValueChange={setVolume}
            minimumValue={0}
            maximumValue={1}
            thumbStyle={{ backgroundColor: colors.primary }}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
            vertical
          />
        </View>
      )}

      {/* Quality Selector */}
      {showQualitySelector && (
        <View style={styles.qualitySelector}>
          {videoQualities.map((quality) => (
            <TouchableOpacity
              key={quality.value}
              style={[
                styles.qualityOption,
                selectedQuality === quality.value && styles.selectedQuality,
              ]}
              onPress={() => {
                setSelectedQuality(quality.value);
                setShowQualitySelector(false);
              }}
            >
              <Text style={styles.qualityLabel}>{quality.label}</Text>
              <Text style={styles.qualityResolution}>{quality.resolution}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Speed Selector */}
      {showSpeedSelector && (
        <View style={styles.speedSelector}>
          {playbackSpeeds.map((speed) => (
            <TouchableOpacity
              key={speed}
              style={[
                styles.speedOption,
                playbackSpeed === speed && styles.selectedSpeed,
              ]}
              onPress={() => {
                setPlaybackSpeed(speed);
                setShowSpeedSelector(false);
              }}
            >
              <Text style={styles.speedLabel}>{speed}x</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default PlayerScreen;