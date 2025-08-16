import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface MangaReaderProps {
  pages: Array<{
    id: string;
    pageNumber: number;
    imageUrl: string;
    ocrData?: any[];
    translations?: any[];
  }>;
  currentPage: number;
  onPageChange: (page: number) => void;
  translationMode: boolean;
  ocrBoundariesVisible: boolean;
}

export default function MangaReader({
  pages,
  currentPage,
  onPageChange,
  translationMode,
  ocrBoundariesVisible
}: MangaReaderProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const currentPageData = pages.find(p => p.pageNumber === currentPage);

  const nextPage = () => {
    if (currentPage < pages.length) {
      onPageChange(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextPage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'r':
          e.preventDefault();
          handleReset();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length]);

  const progress = (currentPage / pages.length) * 100;

  return (
    <div ref={containerRef} className="relative h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm">
              Page {currentPage} of {pages.length}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="text-white hover:bg-white/10"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Badge variant="secondary" className="text-xs">
              {Math.round(zoom * 100)}%
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="text-white hover:bg-white/10"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/10"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-2">
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Main content */}
      <div 
        className="flex items-center justify-center h-full overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {currentPageData && (
          <div className="relative">
            <img
              ref={imageRef}
              src={currentPageData.imageUrl}
              alt={`Page ${currentPage}`}
              className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
              style={{
                transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
                transformOrigin: 'center',
              }}
              draggable={false}
            />

            {/* Translation overlay */}
            {translationMode && currentPageData.translations && (
              <div className="absolute inset-0">
                {currentPageData.translations.map((translation: any, index: number) => (
                  <div
                    key={index}
                    className="absolute bg-white/95 text-black text-sm p-2 rounded shadow-lg border"
                    style={{
                      left: `${translation.bbox?.left}%`,
                      top: `${translation.bbox?.top}%`,
                      width: `${translation.bbox?.width}%`,
                      height: `${translation.bbox?.height}%`,
                      fontSize: `${Math.max(10, translation.fontSize || 12)}px`,
                      transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                    }}
                  >
                    {translation.translatedText}
                  </div>
                ))}
              </div>
            )}

            {/* OCR boundaries */}
            {ocrBoundariesVisible && currentPageData.ocrData && (
              <div className="absolute inset-0">
                {currentPageData.ocrData.map((ocr: any, index: number) => (
                  <div
                    key={index}
                    className="absolute border-2 border-blue-500/50 bg-blue-500/10"
                    style={{
                      left: `${ocr.bbox?.left}%`,
                      top: `${ocr.bbox?.top}%`,
                      width: `${ocr.bbox?.width}%`,
                      height: `${ocr.bbox?.height}%`,
                      transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                    }}
                  >
                    <div className="text-xs text-blue-700 bg-blue-100/80 p-1 rounded">
                      {ocr.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={prevPage}
            disabled={currentPage === 1}
            className="text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <div className="text-white text-center">
            <div className="text-sm opacity-75">Page</div>
            <div className="text-lg font-bold">{currentPage} / {pages.length}</div>
          </div>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={nextPage}
            disabled={currentPage === pages.length}
            className="text-white hover:bg-white/10"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Touch areas for mobile */}
      <div className="absolute inset-0 flex">
        <div
          className="flex-1 cursor-pointer"
          onClick={prevPage}
          style={{ zIndex: 10 }}
        />
        <div className="flex-1" />
        <div
          className="flex-1 cursor-pointer"
          onClick={nextPage}
          style={{ zIndex: 10 }}
        />
      </div>
    </div>
  );
}