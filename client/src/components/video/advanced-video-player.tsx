import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
  RotateCcw,
  RotateCw,
  Subtitle,
  PictureInPicture,
  Download,
  Share,
  Bookmark,
  FastForward,
  Rewind
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface VideoSource {
  quality: string;
  url: string;
  type: string;
}

interface SubtitleTrack {
  language: string;
  label: string;
  url: string;
  default?: boolean;
}

interface SkipSegment {
  type: 'intro' | 'outro' | 'recap';
  start: number;
  end: number;
  confidence: number;
}

interface AdvancedVideoPlayerProps {
  mediaId: string;
  sources: VideoSource[];
  subtitles?: SubtitleTrack[];
  skipSegments?: SkipSegment[];
  autoPlay?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onProgress?: (progress: number) => void;
}

export function AdvancedVideoPlayer({
  mediaId,
  sources,
  subtitles = [],
  skipSegments = [],
  autoPlay = false,
  onTimeUpdate,
  onProgress
}: AdvancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState(sources[0]?.quality || '1080p');
  const [selectedSubtitle, setSelectedSubtitle] = useState('none');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [currentSkipSegment, setCurrentSkipSegment] = useState<SkipSegment | null>(null);

  // Fetch video progress
  const { data: watchProgress } = useQuery({
    queryKey: ['/api/watch/progress', mediaId]
  });

  // Save progress mutation
  const saveProgress = useMutation({
    mutationFn: async (progress: { currentTime: number; totalTime: number }) => {
      const response = await fetch(`/api/watch/progress/${mediaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress)
      });
      return response.json();
    }
  });

  // Auto-hide controls
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      setShowControls(true);
      timeoutId = setTimeout(() => {
        if (isPlaying && !isFullscreen) {
          setShowControls(false);
        }
      }, 3000);
    };

    const handleMouseMove = () => resetTimeout();
    const handleKeyDown = (e: KeyboardEvent) => {
      resetTimeout();
      handleKeyboardControls(e);
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('keydown', handleKeyDown);
    }

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, isFullscreen]);

  // Check for skip segments
  useEffect(() => {
    const segment = skipSegments.find(
      seg => currentTime >= seg.start && currentTime <= seg.end
    );
    
    if (segment && segment !== currentSkipSegment) {
      setCurrentSkipSegment(segment);
      setShowSkipButton(true);
    } else if (!segment && currentSkipSegment) {
      setCurrentSkipSegment(null);
      setShowSkipButton(false);
    }
  }, [currentTime, skipSegments, currentSkipSegment]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      
      // Resume from saved progress
      if (watchProgress?.currentTime) {
        videoRef.current.currentTime = watchProgress.currentTime;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
      
      // Save progress every 10 seconds
      if (Math.floor(time) % 10 === 0) {
        saveProgress.mutate({
          currentTime: time,
          totalTime: duration
        });
      }
      
      const progress = (time / duration) * 100;
      onProgress?.(progress);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipSegment = () => {
    if (currentSkipSegment && videoRef.current) {
      videoRef.current.currentTime = currentSkipSegment.end;
      setShowSkipButton(false);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleKeyboardControls = (e: KeyboardEvent) => {
    if (!videoRef.current) return;
    
    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        videoRef.current.currentTime -= 10;
        break;
      case 'ArrowRight':
        e.preventDefault();
        videoRef.current.currentTime += 10;
        break;
      case 'ArrowUp':
        e.preventDefault();
        handleVolumeChange([Math.min(1, volume + 0.1)]);
        break;
      case 'ArrowDown':
        e.preventDefault();
        handleVolumeChange([Math.max(0, volume - 0.1)]);
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentSource = sources.find(s => s.quality === selectedQuality) || sources[0];

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={`relative bg-black group ${isFullscreen ? 'w-screen h-screen' : 'w-full aspect-video'}`}
        onMouseEnter={() => setShowControls(true)}
      >
        <video
          ref={videoRef}
          src={currentSource?.url}
          className="w-full h-full object-contain"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          autoPlay={autoPlay}
          playsInline
        />

        {/* Skip Segment Button */}
        {showSkipButton && currentSkipSegment && (
          <div className="absolute top-4 right-4 z-20">
            <Button
              onClick={skipSegment}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Skip {currentSkipSegment.type} →
            </Button>
          </div>
        )}

        {/* Video Controls Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-black/60 text-white">
                {selectedQuality}
              </Badge>
              {selectedSubtitle !== 'none' && (
                <Badge variant="secondary" className="bg-black/60 text-white">
                  <Subtitle className="h-3 w-3 mr-1" />
                  Subtitles
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Share className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Center Play/Pause */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-black/40 hover:bg-black/60 text-white border-2 border-white/30"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[(currentTime / duration) * 100 || 0]}
                max={100}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1 text-xs text-white/80">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => videoRef.current && (videoRef.current.currentTime += 10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.05}
                    onValueChange={handleVolumeChange}
                    className="w-16"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Playback Speed */}
                <Select value={playbackSpeed.toString()} onValueChange={(value) => changePlaybackSpeed(Number(value))}>
                  <SelectTrigger className="w-16 h-8 text-white border-white/30 bg-black/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25">0.25x</SelectItem>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>

                {/* Quality Selector */}
                <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                  <SelectTrigger className="w-20 h-8 text-white border-white/30 bg-black/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source.quality} value={source.quality}>
                        {source.quality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Subtitles */}
                {subtitles.length > 0 && (
                  <Select value={selectedSubtitle} onValueChange={setSelectedSubtitle}>
                    <SelectTrigger className="w-20 h-8 text-white border-white/30 bg-black/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {subtitles.map((subtitle) => (
                        <SelectItem key={subtitle.language} value={subtitle.language}>
                          {subtitle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-16 right-4 z-30">
            <Card className="w-64 bg-black/90 border-white/20">
              <CardContent className="p-4 space-y-4">
                <div className="text-white font-medium">Video Settings</div>
                
                <div>
                  <label className="text-sm text-white/80 block mb-2">Quality</label>
                  <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                    <SelectTrigger className="w-full text-white border-white/30 bg-black/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((source) => (
                        <SelectItem key={source.quality} value={source.quality}>
                          {source.quality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-white/80 block mb-2">Speed</label>
                  <Select value={playbackSpeed.toString()} onValueChange={(value) => changePlaybackSpeed(Number(value))}>
                    <SelectTrigger className="w-full text-white border-white/30 bg-black/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.25">0.25x</SelectItem>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">Normal</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {skipSegments.length > 0 && (
                  <div>
                    <label className="text-sm text-white/80 block mb-2">Skip Segments</label>
                    <div className="space-y-1">
                      {skipSegments.map((segment, index) => (
                        <div key={index} className="text-xs text-white/60">
                          {segment.type}: {formatTime(segment.start)} - {formatTime(segment.end)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}