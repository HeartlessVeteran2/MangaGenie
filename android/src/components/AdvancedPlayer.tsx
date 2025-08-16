/**
 * Advanced Video Player Component
 * Features: Video streaming, quality selection, subtitle support, gestures
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';

import { useTheme } from '../contexts/ThemeContext';

interface VideoQuality {
  id: string;
  label: string;
  url: string;
  resolution: string;
  bandwidth?: number;
}

interface Subtitle {
  id: string;
  language: string;
  label: string;
  url: string;
}

interface AdvancedPlayerProps {
  videoUrl: string;
  title: string;
  episode: string;
  qualities: VideoQuality[];
  subtitles: Subtitle[];
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  autoPlay?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AdvancedPlayer: React.FC<AdvancedPlayerProps> = ({
  videoUrl,
  title,
  episode,
  qualities,
  subtitles,
  onClose,
  onNext,
  onPrevious,
  autoPlay = true,
}) => {
  const { colors } = useTheme();
  const videoRef = useRef<VideoRef>(null);
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(0.5);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [buffering, setBuffering] = useState(false);
  
  // Modal states
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showSubtitleModal, setShowSubtitleModal] = useState(false);
  const [showPlaybackModal, setShowPlaybackModal] = useState(false);
  
  // Current selections
  const [currentQuality, setCurrentQuality] = useState(qualities[0]?.id || '');
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const controlsTimeout = useRef<NodeJS.Timeout>();
  
  const hideControlsAfterDelay = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    hideControlsAfterDelay();
  }, [hideControlsAfterDelay]);

  useEffect(() => {
    if (isPlaying) {
      hideControlsAfterDelay();
    }
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [isPlaying, hideControlsAfterDelay]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(showControlsTemporarily)();
    },
    onActive: (event) => {
      const { translationX, translationY, absoluteX } = event;
      
      // Volume gesture (right side)
      if (absoluteX > screenWidth * 0.5) {
        const volumeDelta = -translationY / screenHeight;
        runOnJS(setVolume)(Math.max(0, Math.min(1, volume + volumeDelta)));
      }
      // Brightness gesture (left side)
      else {
        const brightnessDelta = -translationY / screenHeight;
        runOnJS(setBrightness)(Math.max(0, Math.min(1, brightness + brightnessDelta)));
      }
      
      // Seek gesture (horizontal swipe in center)
      if (Math.abs(translationY) < 50 && Math.abs(translationX) > 50) {
        const seekDelta = (translationX / screenWidth) * 30; // 30 seconds max seek
        const newTime = Math.max(0, Math.min(duration, currentTime + seekDelta));
        runOnJS(setCurrentTime)(newTime);
      }
    },
  });

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    showControlsTemporarily();
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    videoRef.current?.seek(time);
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleQualityChange = (qualityId: string) => {
    setCurrentQuality(qualityId);
    setShowQualityModal(false);
    // In a real app, this would switch the video source
  };

  const handleSubtitleChange = (subtitleId: string) => {
    setCurrentSubtitle(subtitleId);
    setShowSubtitleModal(false);
    // In a real app, this would load the subtitle track
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowPlaybackModal(false);
  };

  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const renderQualityModal = () => (
    <Modal
      visible={showQualityModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowQualityModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: colors.background + 'E6' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
            Video Quality
          </Text>
          
          <FlatList
            data={qualities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  currentQuality === item.id && { backgroundColor: colors.primaryContainer }
                ]}
                onPress={() => handleQualityChange(item.id)}
              >
                <Text style={[
                  styles.modalOptionText,
                  { color: currentQuality === item.id ? colors.onPrimaryContainer : colors.onSurface }
                ]}>
                  {item.label} ({item.resolution})
                </Text>
                {currentQuality === item.id && (
                  <Icon name="check" size={20} color={colors.onPrimaryContainer} />
                )}
              </TouchableOpacity>
            )}
          />
          
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowQualityModal(false)}
          >
            <Text style={[styles.modalButtonText, { color: colors.onPrimary }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <StatusBar hidden />
      
      <GestureHandlerRootView style={styles.gestureContainer}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={styles.videoContainer}>
            <TouchableOpacity
              style={styles.videoTouch}
              onPress={showControlsTemporarily}
              activeOpacity={1}
            >
              <Video
                ref={videoRef}
                source={{ uri: videoUrl }}
                style={styles.video}
                resizeMode="contain"
                paused={!isPlaying}
                volume={volume}
                rate={playbackSpeed}
                onLoad={(data) => {
                  setDuration(data.duration);
                  setLoading(false);
                }}
                onProgress={(data) => setCurrentTime(data.currentTime)}
                onBuffer={({ isBuffering }) => setBuffering(isBuffering)}
                onError={(error) => {
                  console.error('Video error:', error);
                  Alert.alert('Playback Error', 'Unable to play video');
                }}
              />
              
              {loading && (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: '#FFF' }]}>
                    Loading...
                  </Text>
                </View>
              )}
              
              {buffering && (
                <View style={styles.bufferingContainer}>
                  <Text style={[styles.bufferingText, { color: '#FFF' }]}>
                    Buffering...
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>

      {/* Controls Overlay */}
      {showControls && (
        <Animated.View style={styles.controlsOverlay}>
          {/* Top Bar */}
          <View style={[styles.topControls, { backgroundColor: colors.surface + 'E6' }]}>
            <TouchableOpacity onPress={onClose} style={styles.controlButton}>
              <Icon name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.videoTitle} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.episodeText} numberOfLines={1}>
                {episode}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => setShowQualityModal(true)}
              style={styles.controlButton}
            >
              <Icon name="hd" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Center Controls */}
          <View style={styles.centerControls}>
            {onPrevious && (
              <TouchableOpacity onPress={onPrevious} style={styles.centerButton}>
                <Icon name="skip-previous" size={40} color="#FFF" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
              <Icon 
                name={isPlaying ? "pause" : "play-arrow"} 
                size={60} 
                color="#FFF" 
              />
            </TouchableOpacity>
            
            {onNext && (
              <TouchableOpacity onPress={onNext} style={styles.centerButton}>
                <Icon name="skip-next" size={40} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom Controls */}
          <View style={[styles.bottomControls, { backgroundColor: colors.surface + 'E6' }]}>
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)}
              </Text>
              
              <Slider
                style={styles.progressSlider}
                minimumValue={0}
                maximumValue={duration}
                value={currentTime}
                onValueChange={handleSeek}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="#666"
                thumbStyle={{ backgroundColor: colors.primary }}
              />
              
              <Text style={styles.timeText}>
                {formatTime(duration)}
              </Text>
            </View>
            
            <View style={styles.bottomButtonsContainer}>
              <TouchableOpacity 
                onPress={() => setShowSubtitleModal(true)}
                style={styles.bottomButton}
              >
                <Icon name="subtitles" size={20} color="#FFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setShowPlaybackModal(true)}
                style={styles.bottomButton}
              >
                <Text style={styles.speedText}>{playbackSpeed}x</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setIsFullscreen(!isFullscreen)}
                style={styles.bottomButton}
              >
                <Icon name="fullscreen" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Quality Selection Modal */}
      {renderQualityModal()}

      {/* Similar modals for subtitles and playback speed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
  },
  videoTouch: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bufferingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
  },
  bufferingText: {
    fontSize: 14,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    pointerEvents: 'box-only',
  },
  bottomControls: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34,
    pointerEvents: 'box-only',
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    pointerEvents: 'box-only',
  },
  controlButton: {
    padding: 8,
    borderRadius: 20,
  },
  centerButton: {
    padding: 20,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  playButton: {
    padding: 30,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  videoTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  episodeText: {
    color: '#CCC',
    fontSize: 14,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressSlider: {
    flex: 1,
    marginHorizontal: 12,
  },
  timeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomButton: {
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdvancedPlayer;