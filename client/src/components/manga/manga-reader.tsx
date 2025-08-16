import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MangaReaderProps {
  imageUrl: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function MangaReader({
  imageUrl,
  currentPage,
  totalPages,
  onPageChange,
  className,
}: MangaReaderProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoaded(true);
  };

  // Reset zoom and position when page changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setImageError(false);
    setImageLoaded(false);
  }, [imageUrl]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentPage > 1) {
            onPageChange(currentPage - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
          }
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
        case '0':
          e.preventDefault();
          handleResetZoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages, onPageChange]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* Loading State */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            <p className="text-white text-sm">Loading page...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <RotateCcw className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-white text-lg font-medium mb-2">Failed to load image</p>
              <p className="text-gray-400 text-sm">Check your connection or try another page</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setImageError(false);
                if (imageRef.current) {
                  imageRef.current.src = imageUrl;
                }
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Main Image */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt={`Page ${currentPage}`}
        className={`max-w-full max-h-full object-contain select-none transition-transform duration-200 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          transformOrigin: 'center center',
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        draggable={false}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleZoomIn}
          disabled={zoom >= 5}
          className="bg-black/50 text-white border-gray-600 hover:bg-black/70"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          className="bg-black/50 text-white border-gray-600 hover:bg-black/70"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleResetZoom}
          disabled={zoom === 1 && position.x === 0 && position.y === 0}
          className="bg-black/50 text-white border-gray-600 hover:bg-black/70"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Page Navigation Gestures */}
      <div
        className="absolute left-0 top-0 w-1/4 h-full cursor-pointer"
        onClick={() => {
          if (currentPage > 1) {
            onPageChange(currentPage - 1);
          }
        }}
        style={{ zIndex: zoom > 1 ? -1 : 10 }}
      />
      <div
        className="absolute right-0 top-0 w-1/4 h-full cursor-pointer"
        onClick={() => {
          if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
          }
        }}
        style={{ zIndex: zoom > 1 ? -1 : 10 }}
      />

      {/* Side Navigation Hints */}
      {zoom <= 1 && (
        <>
          {currentPage > 1 && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-black/50 rounded-full p-2">
                <ChevronLeft className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
          {currentPage < totalPages && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-black/50 rounded-full p-2">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
        </>
      )}

      {/* Zoom Indicator */}
      {zoom !== 1 && (
        <div className="absolute top-20 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
          {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
}