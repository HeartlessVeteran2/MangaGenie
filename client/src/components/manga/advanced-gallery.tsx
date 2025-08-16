import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw,
  Move,
  Grid3X3,
  Book,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Settings,
  Bookmark,
  Download,
  Share,
  Eye,
  EyeOff,
  Filter,
  Search,
  MoreVertical,
  Fullscreen,
  ScanLine
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useGesture } from '@use-gesture/react';

interface Page {
  id: string;
  pageNumber: number;
  imageUrl: string;
  ocrText?: string;
  translatedText?: string;
}

interface ReadingBookmark {
  id: string;
  chapterId: string;
  pageNumber: number;
  progress: number;
  createdAt: string;
}

interface GalleryPreset {
  id: string;
  name: string;
  readingMode: 'single' | 'double' | 'webtoon' | 'grid';
  zoomLevel: number;
  backgroundColor: 'white' | 'black' | 'sepia';
  showOcr: boolean;
  showTranslations: boolean;
}

interface AdvancedGalleryProps {
  chapterId: string;
  pages: Page[];
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export function AdvancedGallery({ 
  chapterId, 
  pages, 
  initialPage = 0,
  onPageChange 
}: AdvancedGalleryProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [readingMode, setReadingMode] = useState<'single' | 'double' | 'webtoon' | 'grid'>('single');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [backgroundColor, setBackgroundColor] = useState<'white' | 'black' | 'sepia'>('white');
  const [rotation, setRotation] = useState(0);
  const [showOcr, setShowOcr] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch gallery presets
  const { data: presets = [] } = useQuery({
    queryKey: ['/api/gallery/presets']
  });

  // Fetch reading bookmarks
  const { data: bookmarks = [] } = useQuery({
    queryKey: ['/api/reading/bookmarks']
  });

  // Create/update bookmark mutation
  const updateBookmark = useMutation({
    mutationFn: async (data: { pageNumber: number; progress: number }) => {
      const response = await fetch('/api/reading/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          ...data
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reading/bookmarks'] });
    }
  });

  // Save gallery preset
  const savePreset = useMutation({
    mutationFn: async (preset: Omit<GalleryPreset, 'id' | 'userId' | 'createdAt'>) => {
      const response = await fetch('/api/gallery/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery/presets'] });
    }
  });

  // Pan and zoom gestures
  const bind = useGesture({
    onDrag: ({ offset }: { offset: [number, number] }) => {
      const [x, y] = offset;
      setPosition({ x, y });
    },
    onPinch: ({ offset }: { offset: [number, number] }) => {
      const [scale] = offset;
      setZoomLevel(Math.max(25, Math.min(400, scale * 100)));
    },
    onWheel: ({ event, delta }: { event: WheelEvent; delta: [number, number] }) => {
      event.preventDefault();
      const [, dy] = delta;
      if (event.ctrlKey || event.metaKey) {
        // Zoom with ctrl+wheel
        const newZoom = Math.max(25, Math.min(400, zoomLevel - dy));
        setZoomLevel(newZoom);
      } else {
        // Scroll pages with wheel
        if (dy > 0 && currentPage < pages.length - 1) {
          goToPage(currentPage + 1);
        } else if (dy < 0 && currentPage > 0) {
          goToPage(currentPage - 1);
        }
      }
    }
  });

  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(0, Math.min(pages.length - 1, page));
    setCurrentPage(newPage);
    onPageChange?.(newPage);
    
    // Update bookmark
    const progress = ((newPage + 1) / pages.length) * 100;
    updateBookmark.mutate({ 
      pageNumber: newPage + 1, 
      progress 
    });
  }, [pages.length, onPageChange, updateBookmark]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          e.preventDefault();
          goToPage(currentPage - 1);
          break;
        case 'ArrowRight':
        case 'd':
          e.preventDefault();
          goToPage(currentPage + 1);
          break;
        case 'Home':
          e.preventDefault();
          goToPage(0);
          break;
        case 'End':
          e.preventDefault();
          goToPage(pages.length - 1);
          break;
        case 'f':
          e.preventDefault();
          setIsFullscreen(!isFullscreen);
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoomLevel(Math.min(400, zoomLevel + 10));
          break;
        case '-':
          e.preventDefault();
          setZoomLevel(Math.max(25, zoomLevel - 10));
          break;
        case '0':
          e.preventDefault();
          setZoomLevel(100);
          setPosition({ x: 0, y: 0 });
          break;
        case 'r':
          e.preventDefault();
          setRotation((prev) => (prev + 90) % 360);
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, isFullscreen, zoomLevel, goToPage]);

  const getBackgroundClass = () => {
    switch (backgroundColor) {
      case 'black': return 'bg-black';
      case 'sepia': return 'bg-yellow-50';
      default: return 'bg-white';
    }
  };

  const getCurrentPages = () => {
    if (readingMode === 'double' && currentPage < pages.length - 1) {
      return [pages[currentPage], pages[currentPage + 1]];
    }
    return [pages[currentPage]];
  };

  const renderSinglePage = (page: Page, index = 0) => (
    <div
      key={page.id}
      className="relative flex items-center justify-center"
      style={{
        transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
        transformOrigin: 'center',
      }}
    >
      <img
        src={page.imageUrl}
        alt={`Page ${page.pageNumber}`}
        className="max-w-full max-h-full object-contain"
        draggable={false}
      />
      
      {/* OCR Overlay */}
      {showOcr && page.ocrText && (
        <div className="absolute inset-0 bg-blue-500/20 border border-blue-500">
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
            OCR Detected
          </div>
        </div>
      )}
      
      {/* Translation Overlay */}
      {showTranslations && page.translatedText && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-3 rounded backdrop-blur">
          <div className="text-sm">{page.translatedText}</div>
        </div>
      )}
    </div>
  );

  const renderWebtoonMode = () => (
    <div className="flex flex-col gap-2">
      {pages.map((page) => (
        <div key={page.id} className="relative">
          <img
            src={page.imageUrl}
            alt={`Page ${page.pageNumber}`}
            className="w-full object-contain"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          />
          {/* Page number indicator */}
          <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
            {page.pageNumber}
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridMode = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 p-2">
      {pages.map((page, index) => (
        <Card 
          key={page.id} 
          className={`cursor-pointer transition-all hover:scale-105 ${
            index === currentPage ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => goToPage(index)}
        >
          <CardContent className="p-1">
            <img
              src={page.imageUrl}
              alt={`Page ${page.pageNumber}`}
              className="w-full h-32 object-cover rounded"
            />
            <div className="text-xs text-center mt-1">
              {page.pageNumber}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (!pages.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">No pages available</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`relative w-full h-screen ${getBackgroundClass()}`}>
        {/* Main Content */}
        <div
          ref={containerRef}
          {...bind()}
          className="w-full h-full overflow-hidden relative"
          style={{ touchAction: 'none' }}
        >
          {readingMode === 'webtoon' ? renderWebtoonMode() : 
           readingMode === 'grid' ? renderGridMode() :
           (
            <div className="w-full h-full flex items-center justify-center">
              {readingMode === 'double' ? (
                <div className="flex gap-4">
                  {getCurrentPages().map((page, index) => renderSinglePage(page, index))}
                </div>
              ) : (
                renderSinglePage(pages[currentPage])
              )}
            </div>
          )}
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Page {currentPage + 1} of {pages.length}
            </Badge>
            <Badge variant="outline">
              {Math.round(((currentPage + 1) / pages.length) * 100)}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Reading Mode */}
            <Select value={readingMode} onValueChange={setReadingMode as any}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="webtoon">Webtoon</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
              </SelectContent>
            </Select>

            {/* Settings */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Gallery Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Background */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Background</label>
                    <Select value={backgroundColor} onValueChange={setBackgroundColor as any}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="black">Black</SelectItem>
                        <SelectItem value="sepia">Sepia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* OCR/Translation Toggles */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show OCR</label>
                    <Button
                      variant={showOcr ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowOcr(!showOcr)}
                    >
                      {showOcr ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Translations</label>
                    <Button
                      variant={showTranslations ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowTranslations(!showTranslations)}
                    >
                      {showTranslations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Save Preset */}
                  <Button
                    onClick={() => {
                      savePreset.mutate({
                        name: `Preset ${new Date().toLocaleTimeString()}`,
                        readingMode,
                        zoomLevel,
                        backgroundColor,
                        showOcr,
                        showTranslations
                      });
                      setShowSettings(false);
                    }}
                    className="w-full"
                  >
                    Save as Preset
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Bottom Controls */}
        {readingMode !== 'webtoon' && readingMode !== 'grid' && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <Card className="p-4 bg-background/90 backdrop-blur">
              <div className="flex items-center gap-4">
                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Slider
                    value={[currentPage]}
                    max={pages.length - 1}
                    step={1}
                    onValueChange={(value) => goToPage(value[0])}
                    className="w-32"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === pages.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>

                  <span className="text-sm font-mono w-12 text-center">
                    {zoomLevel}%
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(Math.min(400, zoomLevel + 10))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setZoomLevel(100);
                      setPosition({ x: 0, y: 0 });
                      setRotation(0);
                    }}
                  >
                    Reset
                  </Button>
                </div>

                {/* Rotate */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation((prev) => (prev - 90) % 360)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Thumbnails */}
                <Button
                  variant={showThumbnails ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowThumbnails(!showThumbnails)}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>

                {/* Fullscreen */}
                <Button
                  variant={isFullscreen ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Fullscreen className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Thumbnail Strip */}
        {showThumbnails && readingMode !== 'grid' && (
          <div className="absolute right-4 top-16 bottom-16 w-24 z-10">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-2">
                {pages.map((page, index) => (
                  <Card
                    key={page.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      index === currentPage ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => goToPage(index)}
                  >
                    <CardContent className="p-1">
                      <img
                        src={page.imageUrl}
                        alt={`Page ${page.pageNumber}`}
                        className="w-full h-16 object-cover rounded"
                      />
                      <div className="text-xs text-center">
                        {page.pageNumber}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="absolute bottom-4 left-4 z-10 opacity-50 hover:opacity-100 transition-opacity">
          <Card className="p-2">
            <div className="text-xs space-y-1">
              <div><kbd>←/→</kbd> Navigate</div>
              <div><kbd>+/-</kbd> Zoom</div>
              <div><kbd>F</kbd> Fullscreen</div>
              <div><kbd>R</kbd> Rotate</div>
            </div>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}