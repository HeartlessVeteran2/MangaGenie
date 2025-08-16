import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { 
  Upload,
  Image as ImageIcon,
  Search,
  Sparkles,
  Eye,
  Star,
  Clock,
  BookOpen,
  Play,
  Zap,
  X,
  Download,
  Share,
  Bookmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  title: string;
  type: 'anime' | 'manga';
  poster: string;
  similarity: number;
  year?: number;
  status: 'completed' | 'ongoing' | 'hiatus';
  rating: number;
  genres: string[];
  description: string;
  episodes?: number;
  chapters?: number;
}

interface ArtworkSearchProps {
  onResultSelect?: (result: SearchResult) => void;
}

export function ArtworkSearch({ onResultSelect }: ArtworkSearchProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  // Image upload and search mutation
  const searchByImage = useMutation({
    mutationFn: async (imageFile: File) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch('/api/ai/artwork-search', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      return response.json();
    },
    onSuccess: (data: SearchResult[]) => {
      setResults(data);
      setIsSearching(false);
      setSearchProgress(100);
      toast({
        title: 'Search Complete',
        description: `Found ${data.length} similar results`
      });
    },
    onError: () => {
      setIsSearching(false);
      setSearchProgress(0);
      toast({
        title: 'Search Failed',
        description: 'Failed to analyze the image. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Start search
      setIsSearching(true);
      setSearchProgress(0);
      setResults([]);

      // Simulate progress
      const interval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      searchByImage.mutate(file);
    }
  }, [searchByImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const getStatusColor = (status: SearchResult['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'ongoing': return 'bg-blue-500';
      case 'hiatus': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    return type === 'anime' ? Play : BookOpen;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="gemini-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <CardTitle>AI Artwork Search</CardTitle>
          </div>
          <CardDescription>
            Upload an image to find similar anime or manga using advanced AI recognition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
            }`}
          >
            <input {...getInputProps()} />
            
            {uploadedImage ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="max-h-48 rounded-lg shadow-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImage(null);
                      setResults([]);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {isSearching && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Search className="h-4 w-4 animate-pulse text-primary" />
                      <span className="text-sm">Analyzing artwork...</span>
                    </div>
                    <Progress value={searchProgress} className="w-full max-w-xs mx-auto" />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Drop image here' : 'Upload artwork image'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to select • JPEG, PNG, WebP up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card className="gemini-card">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {results.length} similar matches • Sorted by similarity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {results.map((result) => {
                  const TypeIcon = getTypeIcon(result.type);
                  
                  return (
                    <div
                      key={result.id}
                      className="flex gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-all group"
                      onClick={() => onResultSelect?.(result)}
                    >
                      {/* Poster */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={result.poster}
                          alt={result.title}
                          className="w-16 h-24 object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute -top-2 -right-2">
                          <Badge 
                            variant="secondary" 
                            className="text-xs font-bold bg-primary text-white"
                          >
                            {Math.round(result.similarity)}%
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg truncate">{result.title}</h3>
                            <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">{result.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(result.status)}`} />
                            <span className="capitalize">{result.status}</span>
                          </div>
                          {result.year && <span>{result.year}</span>}
                          {result.episodes && <span>{result.episodes} episodes</span>}
                          {result.chapters && <span>{result.chapters} chapters</span>}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {result.genres.slice(0, 3).map(genre => (
                            <Badge key={genre} variant="outline" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                          {result.genres.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{result.genres.length - 3}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base">Search Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Use clear, high-quality images for best results</p>
            <p>• Character artwork and promotional images work best</p>
            <p>• Screenshots from anime episodes are highly accurate</p>
            <p>• Manga panels and covers are also supported</p>
            <p>• The AI analyzes art style, characters, and visual elements</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}