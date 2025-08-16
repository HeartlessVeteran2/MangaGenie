import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Plus, Star, Calendar } from 'lucide-react';

interface AnimeCardProps {
  id: string;
  title: string;
  alternativeTitles?: string[];
  description?: string;
  coverUrl: string;
  bannerUrl?: string;
  genres?: string[];
  tags?: string[];
  year?: number;
  season?: string;
  studio?: string;
  status?: 'ongoing' | 'completed' | 'upcoming' | 'watching' | 'plan_to_watch';
  format?: 'TV' | 'Movie' | 'OVA' | 'Special';
  episodes?: number;
  rating?: number;
  isAdult?: boolean;
  source?: string;
  progress?: number;
  totalEpisodes?: number;
  currentEpisode?: number;
  colorPalette?: any;
  onAddToLibrary?: () => void;
  onPlay?: () => void;
}

export function AnimeCard({
  id,
  title,
  coverUrl,
  bannerUrl,
  description,
  genres = [],
  year,
  season,
  studio,
  status,
  format,
  episodes,
  rating,
  isAdult,
  progress = 0,
  currentEpisode = 0,
  totalEpisodes,
  colorPalette,
  onAddToLibrary,
  onPlay,
}: AnimeCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ongoing':
      case 'watching':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'upcoming':
      case 'plan_to_watch':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      case 'upcoming':
        return 'Upcoming';
      case 'watching':
        return 'Watching';
      case 'plan_to_watch':
        return 'Planned';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card
      className="group relative overflow-hidden bg-card hover:bg-card/80 transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {!imageError && coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Play className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* NSFW Blur */}
        {isAdult && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="destructive">18+</Badge>
          </div>
        )}

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-2">
            {onPlay && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay();
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <Play className="w-4 h-4 mr-1" />
                Watch
              </Button>
            )}
            {onAddToLibrary && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToLibrary();
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        )}

        {/* Status Badge */}
        {status && (
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className={`${getStatusColor(status)} text-white border-0`}
            >
              {getStatusText(status)}
            </Badge>
          </div>
        )}

        {/* Rating */}
        {rating && rating > 0 && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-black/50 text-white border-0">
              <Star className="w-3 h-3 mr-1 fill-current" />
              {rating.toFixed(1)}
            </Badge>
          </div>
        )}

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={progress} className="h-1 rounded-none" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-medium text-sm line-clamp-2 leading-tight">
            {title}
          </h3>
          
          {/* Metadata */}
          <div className="flex items-center space-x-2 mt-1">
            {year && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                {year}
              </div>
            )}
            {format && (
              <Badge variant="outline" className="text-xs h-4 px-1">
                {format}
              </Badge>
            )}
          </div>

          {/* Episode Progress */}
          {(currentEpisode > 0 || totalEpisodes) && (
            <div className="text-xs text-muted-foreground mt-1">
              {currentEpisode > 0 && totalEpisodes
                ? `Episode ${currentEpisode}/${totalEpisodes}`
                : totalEpisodes
                ? `${totalEpisodes} episodes`
                : episodes
                ? `${episodes} episodes`
                : ''}
            </div>
          )}
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genres.slice(0, 2).map((genre) => (
              <Badge
                key={genre}
                variant="outline"
                className="text-xs h-4 px-1"
              >
                {genre}
              </Badge>
            ))}
            {genres.length > 2 && (
              <Badge variant="outline" className="text-xs h-4 px-1">
                +{genres.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Studio */}
        {studio && (
          <div className="text-xs text-muted-foreground">
            {studio}
          </div>
        )}
      </div>
    </Card>
  );
}