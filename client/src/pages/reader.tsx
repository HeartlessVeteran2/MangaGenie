import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MangaReader from '@/components/manga/manga-reader';
import TranslationOverlay from '@/components/manga/translation-overlay';
import { ChevronLeft, Settings, Eye, Languages } from 'lucide-react';

interface Chapter {
  id: string;
  chapterNumber: number;
  title?: string;
  totalPages: number;
  currentPage: number;
  readAt?: string;
}

interface Page {
  id: string;
  pageNumber: number;
  imageUrl: string;
  ocrData?: any[];
  translations?: any[];
}

export default function ReaderPage() {
  const { mangaId, chapterId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [translationMode, setTranslationMode] = useState(true);
  const [ocrBoundariesVisible, setOcrBoundariesVisible] = useState(false);

  // Fetch chapter info
  const { data: chapter, isLoading: chapterLoading } = useQuery<Chapter>({
    queryKey: [`/api/chapters/${chapterId}`],
    enabled: !!chapterId,
  });

  // Fetch pages
  const { data: pages = [], isLoading: pagesLoading } = useQuery<Page[]>({
    queryKey: [`/api/chapters/${chapterId}/pages`],
    enabled: !!chapterId,
  });

  // Get current page data
  const currentPageData = pages.find(p => p.pageNumber === currentPage);

  // Fetch settings for OCR preferences
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    if (chapter && currentPage <= chapter.totalPages) {
      // Update reading progress
      const updateProgress = async () => {
        try {
          await fetch(`/api/chapters/${chapterId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': 'demo-user',
            },
            body: JSON.stringify({
              currentPage,
              readAt: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error('Failed to update reading progress:', error);
        }
      };

      updateProgress();
    }
  }, [currentPage, chapterId, chapter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && chapter && newPage <= chapter.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const processOCR = async () => {
    if (!currentPageData) return;

    try {
      const response = await fetch(`/api/pages/${currentPageData.id}/ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user',
        },
        body: JSON.stringify({
          language: settings?.defaultLanguagePair?.split('-')[0] === 'jp' ? 'jpn+eng' : 'eng',
        }),
      });

      if (response.ok) {
        // Refetch pages to get updated OCR data
        // queryClient.invalidateQueries([`/api/chapters/${chapterId}/pages`]);
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
    }
  };

  const processTranslation = async () => {
    if (!currentPageData || !currentPageData.ocrData) return;

    try {
      const [sourceLang, targetLang] = settings?.defaultLanguagePair?.split('-') || ['jp', 'en'];
      
      const response = await fetch(`/api/pages/${currentPageData.id}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user',
        },
        body: JSON.stringify({
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          quality: settings?.translationQuality || 'balanced',
        }),
      });

      if (response.ok) {
        // Refetch pages to get updated translation data
        // queryClient.invalidateQueries([`/api/chapters/${chapterId}/pages`]);
      }
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  // Auto-process if settings allow
  useEffect(() => {
    if (currentPageData && settings?.autoTranslate && !currentPageData.ocrData) {
      processOCR();
    }
    if (currentPageData?.ocrData && settings?.autoTranslate && !currentPageData.translations) {
      processTranslation();
    }
  }, [currentPageData, settings]);

  if (chapterLoading || pagesLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-white">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter || !currentPageData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-medium text-white">Chapter not found</h3>
          <p className="text-gray-400">This chapter might not exist or failed to load.</p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-medium">
                {chapter.title || `Chapter ${chapter.chapterNumber}`}
              </h1>
              <p className="text-sm text-gray-400">
                Page {currentPage} of {chapter.totalPages}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOcrBoundariesVisible(!ocrBoundariesVisible)}
              className={`text-white hover:bg-white/10 ${ocrBoundariesVisible ? 'bg-white/20' : ''}`}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTranslationMode(!translationMode)}
              className={`text-white hover:bg-white/10 ${translationMode ? 'bg-white/20' : ''}`}
            >
              <Languages className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Reader */}
      <div className="pt-20">
        <MangaReader
          imageUrl={currentPageData.imageUrl}
          currentPage={currentPage}
          totalPages={chapter.totalPages}
          onPageChange={handlePageChange}
          className="min-h-screen"
        />

        {/* Translation Overlay */}
        {translationMode && currentPageData.translations && (
          <TranslationOverlay
            translations={currentPageData.translations}
            showBoundaries={ocrBoundariesVisible || settings?.showOcrBoundaries}
          />
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed right-4 top-24 z-50">
          <Card className="p-4 bg-gray-900 border-gray-700 min-w-[300px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Reader Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">OCR Detection</span>
                  <Button
                    size="sm"
                    variant={currentPageData.ocrData ? "secondary" : "default"}
                    onClick={processOCR}
                    disabled={!!currentPageData.ocrData}
                  >
                    {currentPageData.ocrData ? 'Detected' : 'Detect Text'}
                  </Button>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Translation</span>
                  <Button
                    size="sm"
                    variant={currentPageData.translations ? "secondary" : "default"}
                    onClick={processTranslation}
                    disabled={!currentPageData.ocrData || !!currentPageData.translations}
                  >
                    {currentPageData.translations ? 'Translated' : 'Translate'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Page Navigation */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <Card className="p-2 bg-gray-900/90 backdrop-blur border-gray-700">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="text-white hover:bg-white/10"
            >
              Previous
            </Button>
            
            <div className="px-3 py-1 bg-gray-800 rounded text-sm">
              {currentPage} / {chapter.totalPages}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= chapter.totalPages}
              className="text-white hover:bg-white/10"
            >
              Next
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}