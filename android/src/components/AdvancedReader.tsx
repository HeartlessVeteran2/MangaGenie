/**
 * Advanced Manga Reader Component
 * Features: AI translation overlay, reading modes, page navigation
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  PanGestureHandler,
  ScrollView,
  Image,
} from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';

interface TranslationBubble {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalText: string;
  translatedText: string;
  confidence: number;
}

interface AdvancedReaderProps {
  pages: string[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
  mangaTitle: string;
  chapterTitle: string;
  readingMode: 'paged' | 'continuous' | 'webtoon';
  translationMode: boolean;
  onTranslationToggle: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AdvancedReader: React.FC<AdvancedReaderProps> = ({
  pages,
  currentPage,
  onPageChange,
  onClose,
  mangaTitle,
  chapterTitle,
  readingMode,
  translationMode,
  onTranslationToggle,
}) => {
  const { colors } = useTheme();
  const [showUI, setShowUI] = useState(false);
  const [translations, setTranslations] = useState<TranslationBubble[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  const scrollViewRef = useRef<ScrollView>(null);

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startScale = scale.value;
    },
    onActive: (event, context) => {
      scale.value = Math.max(0.5, Math.min(context.startScale * event.scale, 3));
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const panHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      if (scale.value > 1) {
        translateX.value = context.startX + event.translationX;
        translateY.value = context.startY + event.translationY;
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const toggleUI = () => {
    setShowUI(!showUI);
  };

  const performOCRTranslation = async (pageUrl: string) => {
    setIsLoading(true);
    try {
      // Mock AI translation - in real app, this would call your OCR/translation API
      const mockTranslations: TranslationBubble[] = [
        {
          id: '1',
          x: 100,
          y: 200,
          width: 120,
          height: 40,
          originalText: 'こんにちは',
          translatedText: 'Hello',
          confidence: 0.95,
        },
        {
          id: '2',
          x: 200,
          y: 350,
          width: 150,
          height: 60,
          originalText: 'どうしたの？',
          translatedText: 'What happened?',
          confidence: 0.88,
        },
      ];
      
      setTimeout(() => {
        setTranslations(mockTranslations);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Translation failed:', error);
      setIsLoading(false);
    }
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      onPageChange(currentPage + 1);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: (currentPage + 1) * screenWidth, animated: true });
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: (currentPage - 1) * screenWidth, animated: true });
      }
    }
  };

  const renderTranslationBubble = (bubble: TranslationBubble) => (
    <Animated.View
      key={bubble.id}
      style={[
        styles.translationBubble,
        {
          left: bubble.x,
          top: bubble.y,
          width: bubble.width,
          height: bubble.height,
          backgroundColor: colors.surface + 'E6',
          borderColor: colors.primary,
        },
      ]}
    >
      <Text style={[styles.translatedText, { color: colors.onSurface }]}>
        {bubble.translatedText}
      </Text>
      <View style={[styles.confidenceBadge, { backgroundColor: colors.primary }]}>
        <Text style={[styles.confidenceText, { color: colors.onPrimary }]}>
          {Math.round(bubble.confidence * 100)}%
        </Text>
      </View>
    </Animated.View>
  );

  const renderPage = (pageUrl: string, index: number) => (
    <View key={index} style={styles.pageContainer}>
      <GestureHandlerRootView style={styles.gestureContainer}>
        <PinchGestureHandler onGestureEvent={pinchHandler}>
          <Animated.View>
            <PanGestureHandler onGestureEvent={panHandler}>
              <Animated.View style={animatedStyle}>
                <TouchableOpacity
                  style={styles.pageTouch}
                  onPress={toggleUI}
                  activeOpacity={1}
                >
                  <Image
                    source={{ uri: pageUrl }}
                    style={styles.pageImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </PinchGestureHandler>
        
        {translationMode && translations.map(renderTranslationBubble)}
        
        {isLoading && (
          <View style={[styles.loadingOverlay, { backgroundColor: colors.background + 'AA' }]}>
            <Text style={[styles.loadingText, { color: colors.onBackground }]}>
              Translating...
            </Text>
          </View>
        )}
      </GestureHandlerRootView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar hidden />
      
      {readingMode === 'paged' ? (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const page = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            onPageChange(page);
          }}
        >
          {pages.map((pageUrl, index) => renderPage(pageUrl, index))}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {pages.map((pageUrl, index) => renderPage(pageUrl, index))}
        </ScrollView>
      )}

      {/* Navigation Areas */}
      <TouchableOpacity style={styles.leftNav} onPress={prevPage} />
      <TouchableOpacity style={styles.rightNav} onPress={nextPage} />

      {/* UI Overlay */}
      {showUI && (
        <Animated.View style={[styles.uiOverlay, { backgroundColor: colors.surface + 'E6' }]}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Icon name="arrow-back" size={24} color={colors.onSurface} />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={[styles.mangaTitle, { color: colors.onSurface }]} numberOfLines={1}>
                {mangaTitle}
              </Text>
              <Text style={[styles.chapterTitle, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                {chapterTitle}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={onTranslationToggle} 
              style={[
                styles.iconButton,
                translationMode && { backgroundColor: colors.primary + '20' }
              ]}
            >
              <Icon 
                name="translate" 
                size={24} 
                color={translationMode ? colors.primary : colors.onSurface} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBar}>
            <Text style={[styles.pageIndicator, { color: colors.onSurface }]}>
              {currentPage + 1} / {pages.length}
            </Text>
            
            {translationMode && (
              <TouchableOpacity
                style={[styles.translateButton, { backgroundColor: colors.primary }]}
                onPress={() => performOCRTranslation(pages[currentPage])}
              >
                <Icon name="auto-fix-high" size={20} color={colors.onPrimary} />
                <Text style={[styles.translateButtonText, { color: colors.onPrimary }]}>
                  Translate
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    width: screenWidth,
    height: screenHeight,
  },
  gestureContainer: {
    flex: 1,
  },
  pageTouch: {
    flex: 1,
  },
  pageImage: {
    width: screenWidth,
    height: screenHeight,
  },
  leftNav: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: screenWidth * 0.3,
    height: screenHeight,
  },
  rightNav: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: screenWidth * 0.3,
    height: screenHeight,
  },
  uiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    pointerEvents: 'box-only',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34,
    pointerEvents: 'box-only',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  mangaTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chapterTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: '500',
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  translateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  translationBubble: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  translatedText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  confidenceBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdvancedReader;