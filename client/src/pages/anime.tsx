import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimeCard } from '@/components/anime/anime-card';
import { Search, Filter, TrendingUp, Star, Calendar, Clock } from 'lucide-react';

interface AnimeInfo {
  id: string;
  title: string;
  alternativeTitles: string[];
  description: string;
  coverUrl: string;
  bannerUrl?: string;
  genres: string[];
  tags: string[];
  year: number;
  season?: string;
  studio?: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  format: 'TV' | 'Movie' | 'OVA' | 'Special';
  episodes: number;
  rating?: number;
  isAdult: boolean;
  source: string;
}

export default function AnimePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Fetch trending anime
  const { data: trendingAnime, isLoading: trendingLoading } = useQuery({
    queryKey: ['/api/anime/trending'],
  });

  // Fetch popular anime
  const { data: popularAnime, isLoading: popularLoading } = useQuery({
    queryKey: ['/api/anime/popular'],
  });

  // Fetch seasonal anime
  const { data: seasonalAnime, isLoading: seasonalLoading } = useQuery({
    queryKey: ['/api/anime/seasonal'],
  });

  // Search anime
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/anime/search', searchQuery, selectedGenres, selectedYear, selectedStatus],
    enabled: searchQuery.length > 0,
  });

  // Get user's anime library
  const { data: userAnime, isLoading: libraryLoading } = useQuery({
    queryKey: ['/api/media', 'anime'],
  });

  const availableGenres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural',
    'Thriller', 'Mystery', 'Historical', 'Psychological'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const seasons = ['spring', 'summer', 'fall', 'winter'];
  const statuses = ['ongoing', 'completed', 'upcoming'];

  const handleAddToLibrary = async (anime: AnimeInfo) => {
    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user',
        },
        body: JSON.stringify({
          type: 'anime',
          title: anime.title,
          alternativeTitles: anime.alternativeTitles,
          description: anime.description,
          coverImageUrl: anime.coverUrl,
          bannerImageUrl: anime.bannerUrl,
          genres: anime.genres,
          tags: anime.tags,
          year: anime.year,
          season: anime.season,
          studio: anime.studio,
          status: 'watching',
          totalEpisodes: anime.episodes,
          format: anime.format,
          source: anime.source,
          isAdult: anime.isAdult,
        }),
      });

      if (response.ok) {
        // Refetch user library
        // queryClient.invalidateQueries(['/api/media']);
      }
    } catch (error) {
      console.error('Failed to add anime to library:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedYear(null);
    setSelectedStatus(null);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Anime Discovery</h1>
            <p className="text-muted-foreground">
              Discover and watch your favorite anime series
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {(selectedGenres.length > 0 || selectedYear || selectedStatus) && (
              <Badge variant="secondary" className="ml-2">
                {selectedGenres.length + (selectedYear ? 1 : 0) + (selectedStatus ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>

        {/* Active Filters */}
        {(selectedGenres.length > 0 || selectedYear || selectedStatus) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {selectedGenres.map(genre => (
              <Badge
                key={genre}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleGenre(genre)}
              >
                {genre} ×
              </Badge>
            ))}
            {selectedYear && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSelectedYear(null)}
              >
                {selectedYear} ×
              </Badge>
            )}
            {selectedStatus && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSelectedStatus(null)}
              >
                {selectedStatus} ×
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {/* Genre Filter */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map(genre => (
              <Badge
                key={genre}
                variant={selectedGenres.includes(genre) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Seasonal
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            My Library
          </TabsTrigger>
        </TabsList>

        {/* Search Results */}
        <TabsContent value="discover" className="space-y-6">
          {searchQuery && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Search Results for "{searchQuery}"
                </h2>
                {searchResults && (
                  <Badge variant="outline">
                    {searchResults.length} results
                  </Badge>
                )}
              </div>

              {searchLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-muted rounded-lg mb-2" />
                      <div className="h-4 bg-muted rounded mb-1" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  ))}
                </div>
              )}

              {searchResults && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {searchResults.map((anime: AnimeInfo) => (
                    <AnimeCard
                      key={anime.id}
                      {...anime}
                      onAddToLibrary={() => handleAddToLibrary(anime)}
                    />
                  ))}
                </div>
              )}

              {searchResults && searchResults.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No anime found for "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          )}

          {!searchQuery && popularAnime && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Popular Anime</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {popularAnime.map((anime: AnimeInfo) => (
                  <AnimeCard
                    key={anime.id}
                    {...anime}
                    onAddToLibrary={() => handleAddToLibrary(anime)}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Trending */}
        <TabsContent value="trending" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Trending This Week</h2>
            
            {trendingLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-muted rounded-lg mb-2" />
                    <div className="h-4 bg-muted rounded mb-1" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                ))}
              </div>
            )}

            {trendingAnime && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trendingAnime.map((anime: AnimeInfo) => (
                  <AnimeCard
                    key={anime.id}
                    {...anime}
                    onAddToLibrary={() => handleAddToLibrary(anime)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Seasonal */}
        <TabsContent value="seasonal" className="space-y-6">
          {seasonalAnime && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">This Season</h2>
              
              {seasonalLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-muted rounded-lg mb-2" />
                      <div className="h-4 bg-muted rounded mb-1" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {seasonalAnime.map((anime: AnimeInfo) => (
                  <AnimeCard
                    key={anime.id}
                    {...anime}
                    onAddToLibrary={() => handleAddToLibrary(anime)}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* User Library */}
        <TabsContent value="library" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Anime Library</h2>
              {userAnime && (
                <Badge variant="outline">
                  {userAnime.length} anime
                </Badge>
              )}
            </div>

            {libraryLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-muted rounded-lg mb-2" />
                    <div className="h-4 bg-muted rounded mb-1" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                ))}
              </div>
            )}

            {userAnime && userAnime.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {userAnime.map((anime: any) => (
                  <AnimeCard
                    key={anime.id}
                    id={anime.id}
                    title={anime.title}
                    coverUrl={anime.coverImageUrl}
                    bannerUrl={anime.bannerImageUrl}
                    description={anime.description}
                    genres={anime.genres || []}
                    year={anime.year}
                    season={anime.season}
                    studio={anime.studio}
                    episodes={anime.totalEpisodes}
                    status={anime.status}
                    format={anime.format}
                    progress={anime.currentEpisode || 0}
                    colorPalette={anime.colorPalette}
                  />
                ))}
              </div>
            )}

            {userAnime && userAnime.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Your anime library is empty. Start discovering anime to add them here!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}