/**
 * Reader Screen - Fullscreen manga reading with AI translation
 * Features OCR translation overlay, page navigation, and reading controls
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  PanGestureHandler,
  State,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';

interface MangaPage {
  id: string;
  imageUrl: string;
  translationOverlays?: TranslationOverlay[];
}

interface TranslationOverlay {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalText: string;
  translatedText: string;
  confidence: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ReaderScreen: React.FC = () => {
  const { colors } = useTheme();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [readingMode, setReadingMode] = useState<'single' | 'continuous'>('single');
  const [showTranslations, setShowTranslations] = useState(true);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  // Mock manga pages
  const pages: MangaPage[] = Array.from({ length: 20 }, (_, index) => ({
    id: `page-${index + 1}`,
    imageUrl: `https://via.placeholder.com/800x1200?text=Page+${index + 1}`,
    translationOverlays: index === 0 ? [
      {
        id: 'overlay-1',
        x: 100,
        y: 200,
        width: 150,
        height: 40,
        originalText: 'こんにちは',
        translatedText: 'Hello',
        confidence: 0.95,
      },
      {
        id: 'overlay-2',
        x: 300,
        y: 400,
        width: 200,
        height: 60,
        originalText: 'どうしたの？',
        translatedText: 'What happened?',
        confidence: 0.88,
      },
    ] : undefined,
  }));

  const handlePageChange = (index: number) => {
    setCurrentPage(index);
  };

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      if (readingMode === 'single') {
        flatListRef.current?.scrollToIndex({ index: nextPage, animated: true });
      }
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      if (readingMode === 'single') {
        flatListRef.current?.scrollToIndex({ index: prevPage, animated: true });
      }
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const processPageOCR = async (pageIndex: number) => {
    setIsProcessingOCR(true);
    
    // Simulate OCR processing
    setTimeout(() => {
      Alert.alert(
        'OCR Complete',
        `Found ${Math.floor(Math.random() * 5) + 1} text bubbles on page ${pageIndex + 1}`
      );
      setIsProcessingOCR(false);
    }, 2000);
  };

  const renderTranslationOverlay = (overlay: TranslationOverlay) => (
    <TouchableOpacity
      key={overlay.id}
      style={[
        styles.translationOverlay,
        {
          left: overlay.x,
          top: overlay.y,
          width: overlay.width,
          height: overlay.height,
          backgroundColor: colors.surface + 'E6',
          borderColor: colors.primary,
        },
      ]}
      onPress={() => {
        Alert.alert('Translation', `Original: ${overlay.originalText}\nTranslated: ${overlay.translatedText}\nConfidence: ${(overlay.confidence * 100).toFixed(1)}%`);
      }}
    >
      <Text style={[styles.translationText, { color: colors.onSurface }]} numberOfLines={3}>
        {overlay.translatedText}
      </Text>
    </TouchableOpacity>
  );

  const renderPage = ({ item, index }: { item: MangaPage; index: number }) => (
    <TouchableOpacity
      style={styles.pageContainer}
      activeOpacity={1}
      onPress={toggleControls}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.pageImage}
        resizeMode="contain"
      />
      
      {showTranslations && item.translationOverlays?.map(renderTranslationOverlay)}
      
      {/* Page OCR Processing Indicator */}
      {isProcessingOCR && index === currentPage && (
        <View style={[styles.ocrIndicator, { backgroundColor: colors.surface + 'CC' }]}>
          <Icon name="translate" size={24} color={colors.primary} />
          <Text style={[styles.ocrText, { color: colors.onSurface }]}>
            Processing OCR...
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    pageContainer: {
      width: screenWidth,
      height: screenHeight,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    pageImage: {
      width: screenWidth,
      height: screenHeight,
      backgroundColor: colors.surfaceVariant,
    },
    translationOverlay: {
      position: 'absolute',
      borderWidth: 1,
      borderRadius: 4,
      padding: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    translationText: {
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
    },
    ocrIndicator: {
      position: 'absolute',
      top: 100,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    ocrText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
    },
    controls: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface + 'CC',
      paddingTop: 50,
      paddingBottom: 16,
      paddingHorizontal: 20,
    },
    controlsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    controlsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.onSurface,
    },
    closeButton: {
      padding: 8,
    },
    controlsContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pageInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pageText: {
      fontSize: 16,
      color: colors.onSurface,
      marginHorizontal: 16,
    },
    navButton: {
      padding: 12,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
    },
    bottomControls: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface + 'CC',
      paddingVertical: 16,
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    bottomControlsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    controlButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
    },
    activeControlButton: {
      backgroundColor: colors.primary,
    },
    controlButtonText: {
      marginLeft: 6,
      fontSize: 12,
      fontWeight: '500',
      color: colors.onSurfaceVariant,
    },
    activeControlButtonText: {
      color: colors.onPrimary,
    },
    pageSlider: {
      position: 'absolute',
      bottom: 100,
      left: 20,
      right: 20,
      height: 40,
      backgroundColor: colors.surface + 'CC',
      borderRadius: 20,
      paddingHorizontal: 16,
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={item => item.id}
        horizontal={readingMode === 'single'}
        pagingEnabled={readingMode === 'single'}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          if (readingMode === 'single') {
            const pageIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            handlePageChange(pageIndex);
          }
        }}
        initialScrollIndex={currentPage}
        getItemLayout={(data, index) => ({
          length: readingMode === 'single' ? screenWidth : screenHeight,
          offset: (readingMode === 'single' ? screenWidth : screenHeight) * index,
          index,
        })}
      />

      {/* Top Controls */}
      {showControls && (
        <View style={styles.controls}>
          <View style={styles.controlsHeader}>
            <Text style={styles.controlsTitle}>One Piece Chapter 1100</Text>
            <TouchableOpacity style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.controlsContent}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={goToPreviousPage}
              disabled={currentPage === 0}
            >
              <Icon 
                name="chevron-left" 
                size={24} 
                color={currentPage === 0 ? colors.onSurfaceVariant : colors.onSurface} 
              />
            </TouchableOpacity>
            
            <View style={styles.pageInfo}>
              <Text style={styles.pageText}>
                {currentPage + 1} / {pages.length}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={goToNextPage}
              disabled={currentPage === pages.length - 1}
            >
              <Icon 
                name="chevron-right" 
                size={24} 
                color={currentPage === pages.length - 1 ? colors.onSurfaceVariant : colors.onSurface} 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Controls */}
      {showControls && (
        <View style={styles.bottomControls}>
          <View style={styles.bottomControlsRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                showTranslations && styles.activeControlButton,
              ]}
              onPress={() => setShowTranslations(!showTranslations)}
            >
              <Icon 
                name="translate" 
                size={16} 
                color={showTranslations ? colors.onPrimary : colors.onSurfaceVariant} 
              />
              <Text 
                style={[
                  styles.controlButtonText,
                  showTranslations && styles.activeControlButtonText,
                ]}
              >
                Translate
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => processPageOCR(currentPage)}
              disabled={isProcessingOCR}
            >
              <Icon name="photo-camera" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.controlButtonText}>OCR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.controlButton,
                readingMode === 'continuous' && styles.activeControlButton,
              ]}
              onPress={() => setReadingMode(readingMode === 'single' ? 'continuous' : 'single')}
            >
              <Icon 
                name={readingMode === 'single' ? 'view-carousel' : 'view-stream'} 
                size={16} 
                color={readingMode === 'continuous' ? colors.onPrimary : colors.onSurfaceVariant} 
              />
              <Text 
                style={[
                  styles.controlButtonText,
                  readingMode === 'continuous' && styles.activeControlButtonText,
                ]}
              >
                {readingMode === 'single' ? 'Single' : 'Scroll'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReaderScreen;