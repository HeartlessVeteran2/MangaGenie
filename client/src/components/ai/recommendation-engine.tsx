import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Brain,
  Star,
  TrendingUp,
  Clock,
  Users,
  Sparkles,
  RefreshCw,
  Heart,
  BookOpen,
  Play,
  Filter,
  Target,
  Zap,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  id: string;
  title: string;
  type: 'anime' | 'manga';
  poster: string;
  score: number;
  confidence: number;
  reason: string;
  genres: string[];
  status: 'completed' | 'ongoing' | 'hiatus';
  rating: number;
  year?: number;
  episodes?: number;
  chapters?: number;
  description: string;
  tags: string[];
  similarTo: string[];
}

interface RecommendationEngineProps {
  userId?: string;
}

export function RecommendationEngine({ userId = 'demo-user' }: RecommendationEngineProps) {
  const [selectedType, setSelectedType] = useState<'all' | 'anime' | 'manga'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recommendations
  const { data: recommendations = [], isLoading } = useQuery<Recommendation[]>({
    queryKey: ['/api/ai/recommendations', userId, selectedType, selectedGenre],
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });

  // Fetch user preferences for better recommendations
  const { data: userPreferences } = useQuery({
    queryKey: ['/api/user/preferences', userId]
  });

  // Generate new recommendations
  const generateRecommendations = useMutation({
    mutationFn: async (options: { type?: string; genre?: string; forceRefresh?: boolean }) => {
      const response = await fetch('/api/ai/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...options })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/recommendations'] });
      setRefreshing(false);
      toast({
        title: 'Recommendations Updated',
        description: 'Fresh recommendations generated based on your preferences.'
      });
    },
    onError: () => {
      setRefreshing(false);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate new recommendations.',
        variant: 'destructive'
      });
    }
  });

  // Rate recommendation (feedback)
  const rateRecommendation = useMutation({
    mutationFn: async ({ id, rating }: { id: string; rating: 'like' | 'dislike' }) => {
      const response = await fetch(`/api/ai/recommendations/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, userId })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Feedback Received',
        description: 'Thank you! This helps improve future recommendations.'
      });
    }
  });

  const handleRefresh = () => {
    setRefreshing(true);
    generateRecommendations.mutate({ 
      type: selectedType === 'all' ? undefined : selectedType,
      genre: selectedGenre === 'all' ? undefined : selectedGenre,
      forceRefresh: true 
    });
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedType !== 'all' && rec.type !== selectedType) return false;
    if (selectedGenre !== 'all' && !rec.genres.includes(selectedGenre)) return false;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-500';
    if (confidence >= 0.7) return 'bg-blue-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getTypeIcon = (type: Recommendation['type']) => {
    return type === 'anime' ? Play : BookOpen;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">AI Recommendations</h2>
            <p className="text-muted-foreground">Personalized suggestions just for you</p>
          </div>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshing || generateRecommendations.isPending}
          variant="outline"
          className="glass-effect"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Generating...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={selectedType} onValueChange={setSelectedType as any}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="anime">Anime</SelectItem>
            <SelectItem value="manga">Manga</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            <SelectItem value="action">Action</SelectItem>
            <SelectItem value="adventure">Adventure</SelectItem>
            <SelectItem value="comedy">Comedy</SelectItem>
            <SelectItem value="drama">Drama</SelectItem>
            <SelectItem value="fantasy">Fantasy</SelectItem>
            <SelectItem value="romance">Romance</SelectItem>
            <SelectItem value="sci-fi">Sci-Fi</SelectItem>
            <SelectItem value="slice-of-life">Slice of Life</SelectItem>
            <SelectItem value="supernatural">Supernatural</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="secondary" className="glass-effect">
          {filteredRecommendations.length} recommendations
        </Badge>
      </div>

      {/* Recommendations Grid */}
      {isLoading ? (
        <div className="comick-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-muted rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <Card className="gemini-card">
          <CardContent className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start reading and watching content to get personalized recommendations.
            </p>
            <Button onClick={handleRefresh} className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="comick-grid">
          {filteredRecommendations.map((rec) => {
            const TypeIcon = getTypeIcon(rec.type);
            
            return (
              <Card key={rec.id} className="group hover:shadow-lg transition-all duration-300 gemini-card">
                {/* Poster */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                  <img
                    src={rec.poster}
                    alt={rec.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  
                  {/* Overlays */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black/70 text-white text-xs">
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {rec.type}
                    </Badge>
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-white text-xs">
                      <Target className="h-3 w-3" />
                      <span className={getScoreColor(rec.score)}>{rec.score}%</span>
                    </div>
                  </div>

                  {/* Confidence Indicator */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/70 rounded px-2 py-1">
                      <div className="flex items-center justify-between text-xs text-white mb-1">
                        <span>Match Confidence</span>
                        <span>{Math.round(rec.confidence * 100)}%</span>
                      </div>
                      <Progress 
                        value={rec.confidence * 100} 
                        className="h-1"
                      />
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => rateRecommendation.mutate({ id: rec.id, rating: 'like' })}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => rateRecommendation.mutate({ id: rec.id, rating: 'dislike' })}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">{rec.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{rec.rating}</span>
                        </div>
                        {rec.year && <span>{rec.year}</span>}
                        <span className="capitalize">{rec.status}</span>
                      </div>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-1">
                      {rec.genres.slice(0, 2).map(genre => (
                        <Badge key={genre} variant="outline" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>

                    {/* Reason */}
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {rec.reason}
                        </p>
                      </div>
                    </div>

                    {/* Similar To */}
                    {rec.similarTo.length > 0 && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Similar to: </span>
                        <span className="text-primary">{rec.similarTo.slice(0, 2).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {recommendations.filter(r => r.score >= 90).length}
            </div>
            <div className="text-sm text-muted-foreground">High Match</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {recommendations.filter(r => r.confidence >= 0.8).length}
            </div>
            <div className="text-sm text-muted-foreground">High Confidence</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {recommendations.filter(r => r.type === 'anime').length}
            </div>
            <div className="text-sm text-muted-foreground">Anime</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-500">
              {recommendations.filter(r => r.type === 'manga').length}
            </div>
            <div className="text-sm text-muted-foreground">Manga</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}