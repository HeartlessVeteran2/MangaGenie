import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Plus, Star, Calendar, Clock } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface AnimeCardProps {
  id: string;
  title: string;
  coverUrl: string;
  bannerUrl?: string;
  description?: string;
  genres: string[];
  year: number;
  season?: string;
  studio?: string;
  episodes: number;
  rating?: number;
  status: 'ongoing' | 'completed' | 'upcoming';
  format: 'TV' | 'Movie' | 'OVA' | 'Special';
  progress?: number; // episodes watched
  colorPalette?: any;
  onWatch?: () => void;
  onAddToLibrary?: () => void;
}

export function AnimeCard({
  id,
  title,
  coverUrl,
  bannerUrl,
  description,
  genres,
  year,
  season,
  studio,
  episodes,
  rating,
  status,
  format,
  progress = 0,
  colorPalette,
  onWatch,
  onAddToLibrary,
}: AnimeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { applyPalette, resetPalette, dynamicColors } = useTheme();

  const progressPercentage = progress > 0 ? (progress / episodes) * 100 : 0;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (dynamicColors && colorPalette) {
      applyPalette(colorPalette);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (dynamicColors) {
      resetPalette();
    }
  };

  const formatSeason = (season: string) => {
    return season.charAt(0).toUpperCase() + season.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'upcoming':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card/50 backdrop-blur-sm border-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Banner */}
      {bannerUrl && (
        <div
          className="absolute inset-0 opacity-20 transition-opacity duration-300 group-hover:opacity-30"
          style={{
            backgroundImage: `url(${bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={coverUrl}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          } group-hover:scale-110`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            {onWatch && (
              <Button size="sm" variant="default" onClick={onWatch}>
                <Play className="w-4 h-4 mr-1" />
                Watch
              </Button>
            )}
            {onAddToLibrary && (
              <Button size="sm" variant="secondary" onClick={onAddToLibrary}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className={`${getStatusColor(status)} text-white border-0`}>
            {status}
          </Badge>
        </div>

        {/* Rating */}
        {rating && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-1 text-xs text-white">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {rating.toFixed(1)}
          </div>
        )}
      </div>

      <CardHeader className="p-3 space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {season && year && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatSeason(season)} {year}
            </div>
          )}
          {episodes && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {episodes} eps
            </div>
          )}
        </div>

        {/* Studio */}
        {studio && (
          <p className="text-xs text-muted-foreground truncate">{studio}</p>
        )}

        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {genres.slice(0, 3).map((genre) => (
            <Badge key={genre} variant="outline" className="text-xs px-1 py-0">
              {genre}
            </Badge>
          ))}
          {genres.length > 3 && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              +{genres.length - 3}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Progress */}
      {progress > 0 && (
        <CardFooter className="p-3 pt-0">
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}/{episodes}</span>
            </div>
            <Progress value={progressPercentage} className="h-1" />
          </div>
        </CardFooter>
      )}

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 pointer-events-none" />
    </Card>
  );
}