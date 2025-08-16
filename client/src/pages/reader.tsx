import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useOCR } from "@/hooks/use-ocr";
import { useTranslation } from "@/hooks/use-translation";
import TranslationOverlay from "@/components/manga/translation-overlay";
import LanguageModal from "@/components/modals/language-modal";
import OCRSettingsModal from "@/components/modals/ocr-settings-modal";

interface Page {
  id: string;
  pageNumber: number;
  imageUrl: string;
  ocrData?: any[];
  translations?: any[];
}

interface Chapter {
  id: string;
  title: string;
  totalPages: number;
  currentPage: number;
}

interface Manga {
  id: string;
  title: string;
  currentChapter: number;
}

export default function Reader() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const mangaId = params.mangaId as string;
  const chapterId = params.chapterId as string;
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(true);

  const { data: manga } = useQuery<Manga>({
    queryKey: ['/api/manga', mangaId],
  });

  const { data: pages = [] } = useQuery<Page[]>({
    queryKey: ['/api/chapters', chapterId, 'pages'],
  });

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const { processOCR, isProcessing: isOCRProcessing } = useOCR();
  const { translatePage, isTranslating } = useTranslation();

  const currentPage = pages[currentPageIndex];
  const progress = pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;

  const updatePageMutation = useMutation({
    mutationFn: (data: { pageId: string; updates: any }) =>
      apiRequest('PUT', `/api/pages/${data.pageId}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chapters', chapterId, 'pages'] });
    },
  });

  const handleOCRToggle = async () => {
    if (!currentPage) return;

    setOcrEnabled(!ocrEnabled);
    
    if (!ocrEnabled && !currentPage.ocrData) {
      await processOCR(currentPage.id, settings?.defaultLanguagePair?.split('-')[0] || 'jpn');
    }
  };

  const handleTranslationToggle = async () => {
    if (!currentPage) return;

    setTranslationEnabled(!translationEnabled);
    
    if (!translationEnabled && currentPage.ocrData && !currentPage.translations) {
      const [source, target] = (settings?.defaultLanguagePair || 'jp-en').split('-');
      await translatePage(
        currentPage.id, 
        source === 'jp' ? 'Japanese' : source === 'kr' ? 'Korean' : 'Chinese',
        'English',
        settings?.translationQuality || 'balanced'
      );
    }
  };

  const navigatePage = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else if (direction === 'next' && currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const exitReader = () => {
    setLocation('/');
  };

  if (!manga || !currentPage) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading manga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Reader Header */}
      <div className="absolute top-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between z-40">
        <Button variant="ghost" size="sm" onClick={exitReader}>
          <i className="fas fa-arrow-left"></i>
        </Button>
        <div className="text-center">
          <h3 className="font-medium">{manga.title}</h3>
          <p className="text-sm text-slate-400">Chapter {manga.currentChapter}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowSettingsModal(true)}>
          <i className="fas fa-cog"></i>
        </Button>
      </div>

      {/* Main Reading Area */}
      <div className="pt-16 pb-24">
        <div className="relative">
          <img 
            src={currentPage.imageUrl} 
            alt={`Page ${currentPage.pageNumber}`}
            className="w-full h-auto block mx-auto max-h-screen object-contain"
          />
          
          {/* Translation Overlays */}
          {translationEnabled && currentPage.translations && (
            <>
              {currentPage.translations.map((translation: any, index: number) => (
                <TranslationOverlay
                  key={index}
                  translation={translation}
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
          {ocrEnabled && currentPage.ocrData && settings?.showOcrBoundaries && (
            <div className="absolute inset-0 pointer-events-none">
              {currentPage.ocrData.map((ocr: any, index: number) => (
                <div
                  key={index}
                  className="absolute border-2 border-primary animate-pulse"
                  style={{
                    left: `${(ocr.bbox?.x0 / 800) * 100}%`,
                    top: `${(ocr.bbox?.y0 / 1200) * 100}%`,
                    width: `${((ocr.bbox?.x1 - ocr.bbox?.x0) / 800) * 100}%`,
                    height: `${((ocr.bbox?.y1 - ocr.bbox?.y0) / 1200) * 100}%`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reading Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bgDark via-bgDark/95 to-transparent p-4">
        <div className="flex items-center justify-between bg-surface/95 backdrop-blur-sm rounded-2xl px-6 py-4 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigatePage('prev')}
            disabled={currentPageIndex === 0}
          >
            <i className="fas fa-chevron-left"></i>
          </Button>

          <div className="text-center flex-1 mx-4">
            <p className="text-sm font-medium mb-2">
              Page {currentPageIndex + 1} of {pages.length}
            </p>
            <Progress value={progress} className="h-1" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigatePage('next')}
            disabled={currentPageIndex === pages.length - 1}
          >
            <i className="fas fa-chevron-right"></i>
          </Button>
        </div>
      </div>

      {/* Floating AI Controls */}
      <div className="absolute top-20 right-4 space-y-3 z-30">
        <Button
          size="sm"
          className={`w-14 h-14 rounded-full shadow-lg ${
            ocrEnabled ? 'bg-primary' : 'bg-slate-700'
          } hover:scale-105 transition-all`}
          onClick={handleOCRToggle}
          disabled={isOCRProcessing}
        >
          {isOCRProcessing ? (
            <i className="fas fa-spinner fa-spin text-white text-lg"></i>
          ) : (
            <i className="fas fa-eye text-white text-lg"></i>
          )}
        </Button>
        
        <Button
          size="sm"
          className={`w-14 h-14 rounded-full shadow-lg ${
            translationEnabled ? 'bg-secondary' : 'bg-slate-700'
          } hover:scale-105 transition-all`}
          onClick={handleTranslationToggle}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <i className="fas fa-spinner fa-spin text-white text-lg"></i>
          ) : (
            <i className="fas fa-language text-white text-lg"></i>
          )}
        </Button>
        
        <Button
          size="sm"
          className="w-14 h-14 bg-slate-700 hover:bg-slate-600 rounded-full shadow-lg hover:scale-105 transition-all"
        >
          <i className="fas fa-bookmark text-white text-lg"></i>
        </Button>
      </div>

      {/* AI Processing Indicator */}
      {(isOCRProcessing || isTranslating) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-surface/95 backdrop-blur-sm rounded-full px-4 py-2 z-50">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">
              {isOCRProcessing ? 'Processing OCR...' : 'Translating...'}
            </span>
          </div>
        </div>
      )}

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
