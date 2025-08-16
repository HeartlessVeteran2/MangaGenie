import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useOCR } from "@/hooks/use-ocr";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import TranslationOverlay from "./translation-overlay";
import LanguageModal from "@/components/modals/language-modal";
import OCRSettingsModal from "@/components/modals/ocr-settings-modal";

interface Page {
  id: string;
  pageNumber: number;
  imageUrl: string;
  ocrData?: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  translations?: Array<{
    text: string;
    translatedText: string;
    confidence: number;
    context?: string;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

interface Chapter {
  id: string;
  title: string;
  totalPages: number;
  currentPage: number;
  chapterNumber: number;
}

interface Manga {
  id: string;
  title: string;
  currentChapter: number;
  status: string;
  progress: number;
}

interface MangaReaderProps {
  mangaId?: string;
  chapterId?: string;
  initialPage?: number;
}

export default function MangaReader({ 
  mangaId: propMangaId, 
  chapterId: propChapterId, 
  initialPage = 0 
}: MangaReaderProps) {
  const params = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Use props if provided, otherwise get from URL params
  const mangaId = propMangaId || (params.mangaId as string);
  const chapterId = propChapterId || (params.chapterId as string);
  
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPage);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { processOCR, isProcessing: isOCRProcessing } = useOCR();
  const { translatePage, isTranslating } = useTranslation();

  // Fetch manga data
  const { data: manga, isLoading: mangaLoading } = useQuery<Manga>({
    queryKey: ['/api/manga', mangaId],
    enabled: !!mangaId,
  });

  // Fetch chapter data
  const { data: chapter, isLoading: chapterLoading } = useQuery<Chapter>({
    queryKey: ['/api/chapters', chapterId],
    enabled: !!chapterId,
  });

  // Fetch pages
  const { data: pages = [], isLoading: pagesLoading } = useQuery<Page[]>({
    queryKey: ['/api/chapters', chapterId, 'pages'],
    enabled: !!chapterId,
  });

  // Fetch user settings
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const currentPage = pages[currentPageIndex];
  const progress = pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;

  // Update manga progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: (data: { mangaId: string; progress: number; currentPage: number }) =>
      apiRequest('PUT', `/api/manga/${data.mangaId}`, {
        progress: data.progress,
        currentChapter: chapter?.chapterNumber || 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manga'] });
    },
  });

  // Update progress when page changes
  useEffect(() => {
    if (manga && pages.length > 0 && currentPageIndex >= 0) {
      const newProgress = Math.round(((currentPageIndex + 1) / pages.length) * 100);
      if (newProgress !== manga.progress) {
        updateProgressMutation.mutate({
          mangaId: manga.id,
          progress: newProgress,
          currentPage: currentPageIndex + 1,
        });
      }
    }
  }, [currentPageIndex, manga, pages.length, updateProgressMutation]);

  // Handle OCR toggle
  const handleOCRToggle = useCallback(async () => {
    if (!currentPage) return;

    const newOcrEnabled = !ocrEnabled;
    setOcrEnabled(newOcrEnabled);
    
    if (newOcrEnabled && !currentPage.ocrData) {
      try {
        const sourceLanguage = settings?.defaultLanguagePair?.split('-')[0] || 'jpn';
        await processOCR(currentPage.id, sourceLanguage);
      } catch (error) {
        setOcrEnabled(false);
        console.error('OCR failed:', error);
      }
    }
  }, [currentPage, ocrEnabled, processOCR, settings]);

  // Handle translation toggle
  const handleTranslationToggle = useCallback(async () => {
    if (!currentPage) return;

    const newTranslationEnabled = !translationEnabled;
    setTranslationEnabled(newTranslationEnabled);
    
    if (newTranslationEnabled && currentPage.ocrData && !currentPage.translations) {
      try {
        const [source, target] = (settings?.defaultLanguagePair || 'jp-en').split('-');
        const sourceLanguage = source === 'jp' ? 'Japanese' : source === 'kr' ? 'Korean' : 'Chinese';
        await translatePage(
          currentPage.id, 
          sourceLanguage,
          'English',
          settings?.translationQuality || 'balanced'
        );
      } catch (error) {
        console.error('Translation failed:', error);
      }
    }
  }, [currentPage, translationEnabled, translatePage, settings]);

  // Navigation functions
  const navigatePage = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      setImageLoaded(false);
    } else if (direction === 'next' && currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setImageLoaded(false);
    }
  }, [currentPageIndex, pages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          navigatePage('prev');
          break;
        case 'ArrowRight':
          navigatePage('next');
          break;
        case 'o':
          handleOCRToggle();
          break;
        case 't':
          handleTranslationToggle();
          break;
        case 'Escape':
          exitReader();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigatePage, handleOCRToggle, handleTranslationToggle]);

  const exitReader = useCallback(() => {
    setLocation('/library');
  }, [setLocation]);

  const toggleBookmark = useCallback(() => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Bookmark Removed" : "Bookmark Added",
      description: `Page ${currentPageIndex + 1} ${isBookmarked ? 'removed from' : 'added to'} bookmarks`,
    });
  }, [isBookmarked, currentPageIndex, toast]);

  // Auto-translate on OCR completion if enabled
  useEffect(() => {
    if (
      settings?.autoTranslate &&
      currentPage?.ocrData &&
      !currentPage.translations &&
      !isTranslating
    ) {
      const [source] = (settings.defaultLanguagePair || 'jp-en').split('-');
      const sourceLanguage = source === 'jp' ? 'Japanese' : source === 'kr' ? 'Korean' : 'Chinese';
      translatePage(
        currentPage.id,
        sourceLanguage,
        'English',
        settings.translationQuality || 'balanced'
      );
    }
  }, [currentPage?.ocrData, settings, translatePage, isTranslating]);

  // Loading state
  if (mangaLoading || chapterLoading || pagesLoading || !currentPage) {
    return (
      <div className="min-h-screen bg-bgDark flex items-center justify-center">
        <Card className="bg-surface border-slate-700 p-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-lg font-medium text-slate-50">Loading Manga</h3>
              <p className="text-slate-400 text-sm">Preparing your reading experience...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Reader Header */}
      <div className="absolute top-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between z-40">
        <Button variant="ghost" size="sm" onClick={exitReader}>
          <i className="fas fa-arrow-left mr-2"></i>
          Exit
        </Button>
        <div className="text-center">
          <h3 className="font-medium text-slate-50">{manga?.title}</h3>
          <p className="text-sm text-slate-400">
            {chapter?.title || `Chapter ${chapter?.chapterNumber || 1}`}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowSettingsModal(true)}>
          <i className="fas fa-cog"></i>
        </Button>
      </div>

      {/* Main Reading Area */}
      <div className="pt-16 pb-24 min-h-screen flex items-center justify-center">
        <div className="relative max-w-full max-h-full">
          {/* Page Image */}
          <div className="relative">
            <img 
              src={currentPage.imageUrl} 
              alt={`Page ${currentPage.pageNumber}`}
              className={`max-w-full max-h-[calc(100vh-10rem)] object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                toast({
                  title: "Image Load Error",
                  description: "Failed to load page image",
                  variant: "destructive",
                });
              }}
            />
            
            {/* Loading overlay for image */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface/20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Translation Overlays */}
            {translationEnabled && currentPage.translations && imageLoaded && (
              <>
                {currentPage.translations.map((translation, index) => (
                  <TranslationOverlay
                    key={`translation-${index}`}
                    translation={{
                      translatedText: translation.translatedText,
                      confidence: translation.confidence,
                      context: translation.context,
                    }}
                    position={{
                      x: translation.bbox?.x0 || 0,
                      y: translation.bbox?.y0 || 0,
                      width: (translation.bbox?.x1 || 0) - (translation.bbox?.x0 || 0),
                      height: (translation.bbox?.y1 || 0) - (translation.bbox?.y0 || 0),
                    }}
                  />
                ))}
              </>
            )}

            {/* OCR Detection Zones */}
            {ocrEnabled && currentPage.ocrData && settings?.showOcrBoundaries && imageLoaded && (
              <div className="absolute inset-0 pointer-events-none">
                {currentPage.ocrData.map((ocr, index) => (
                  <div
                    key={`ocr-${index}`}
                    className="absolute border-2 border-primary animate-pulse rounded"
                    style={{
                      left: `${ocr.bbox?.x0 || 0}px`,
                      top: `${ocr.bbox?.y0 || 0}px`,
                      width: `${(ocr.bbox?.x1 || 0) - (ocr.bbox?.x0 || 0)}px`,
                      height: `${(ocr.bbox?.y1 || 0) - (ocr.bbox?.y0 || 0)}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reading Controls */}
      <div className="absolute bottom-0 left-0 right-0 reader-controls p-4">
        <div className="flex items-center justify-between bg-surface/95 backdrop-blur-sm rounded-2xl px-6 py-4 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigatePage('prev')}
            disabled={currentPageIndex === 0}
            className="w-12 h-12 rounded-full hover:bg-slate-700 transition-colors"
          >
            <i className="fas fa-chevron-left"></i>
          </Button>

          <div className="text-center flex-1 mx-4">
            <p className="text-sm font-medium mb-2 text-slate-50">
              Page {currentPageIndex + 1} of {pages.length}
            </p>
            <Progress 
              value={progress} 
              className="h-2 bg-slate-700" 
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigatePage('next')}
            disabled={currentPageIndex === pages.length - 1}
            className="w-12 h-12 rounded-full hover:bg-slate-700 transition-colors"
          >
            <i className="fas fa-chevron-right"></i>
          </Button>
        </div>
      </div>

      {/* Floating AI Controls */}
      <div className="absolute top-20 right-4 space-y-3 z-30">
        {/* OCR Toggle */}
        <Button
          size="sm"
          className={`w-14 h-14 rounded-full shadow-lg transition-all transform hover:scale-105 ${
            ocrEnabled ? 'bg-primary hover:bg-primary/90' : 'bg-slate-700 hover:bg-slate-600'
          }`}
          onClick={handleOCRToggle}
          disabled={isOCRProcessing}
          title="Toggle OCR Detection (O)"
        >
          {isOCRProcessing ? (
            <i className="fas fa-spinner fa-spin text-white text-lg"></i>
          ) : (
            <i className="fas fa-eye text-white text-lg"></i>
          )}
        </Button>
        
        {/* Translation Toggle */}
        <Button
          size="sm"
          className={`w-14 h-14 rounded-full shadow-lg transition-all transform hover:scale-105 ${
            translationEnabled ? 'bg-secondary hover:bg-secondary/90' : 'bg-slate-700 hover:bg-slate-600'
          }`}
          onClick={handleTranslationToggle}
          disabled={isTranslating}
          title="Toggle Translation (T)"
        >
          {isTranslating ? (
            <i className="fas fa-spinner fa-spin text-white text-lg"></i>
          ) : (
            <i className="fas fa-language text-white text-lg"></i>
          )}
        </Button>
        
        {/* Bookmark Toggle */}
        <Button
          size="sm"
          className={`w-14 h-14 rounded-full shadow-lg transition-all transform hover:scale-105 ${
            isBookmarked ? 'bg-amber-500 hover:bg-amber-400' : 'bg-slate-700 hover:bg-slate-600'
          }`}
          onClick={toggleBookmark}
          title="Toggle Bookmark"
        >
          <i className={`fas ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'} text-white text-lg`}></i>
        </Button>

        {/* Language Settings */}
        <Button
          size="sm"
          className="w-14 h-14 bg-slate-700 hover:bg-slate-600 rounded-full shadow-lg transition-all transform hover:scale-105"
          onClick={() => setShowLanguageModal(true)}
          title="Language Settings"
        >
          <i className="fas fa-globe text-white text-lg"></i>
        </Button>
      </div>

      {/* AI Processing Indicator */}
      {(isOCRProcessing || isTranslating) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-surface/95 backdrop-blur-sm rounded-full px-4 py-2 z-50 ai-processing">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-slate-50">
              {isOCRProcessing ? 'Processing OCR...' : 'Translating...'}
            </span>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 left-4 text-xs text-slate-500 space-y-1">
        <div>← → Navigate pages</div>
        <div>O Toggle OCR</div>
        <div>T Toggle translation</div>
        <div>ESC Exit reader</div>
      </div>

      {/* Modals */}
      <LanguageModal 
        open={showLanguageModal}
        onOpenChange={setShowLanguageModal}
      />
      
      <OCRSettingsModal
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
      />
    </div>
  );
}
