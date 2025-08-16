import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface Manga {
  id: string;
  title: string;
  status: string;
  currentChapter: number;
  totalChapters?: number;
  progress: number;
  coverImageUrl?: string;
  originalLanguage: string;
  createdAt: string;
}

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: manga = [], isLoading } = useQuery<Manga[]>({
    queryKey: ['/api/manga'],
  });

  const filteredManga = manga.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: manga.length,
    reading: manga.filter(m => m.status === 'reading').length,
    completed: manga.filter(m => m.status === 'completed').length,
    translations: manga.reduce((acc, m) => acc + (m.progress * 10), 0) // Mock calculation
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-surface border-slate-700">
              <div className="animate-pulse">
                <div className="w-full h-48 bg-slate-700 rounded-t-xl"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      {/* Library Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Library</h2>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <i className={`fas ${viewMode === 'grid' ? 'fa-list' : 'fa-th-large'}`}></i>
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <i className="fas fa-plus mr-2"></i>
            Add Manga
          </Button>
        </div>
      </div>

      {/* Library Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-surface border-slate-700">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-slate-400">Total Manga</div>
          </div>
        </Card>
        <Card className="bg-surface border-slate-700">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{stats.reading}</div>
            <div className="text-sm text-slate-400">Currently Reading</div>
          </div>
        </Card>
        <Card className="bg-surface border-slate-700">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-sm text-slate-400">Completed</div>
          </div>
        </Card>
        <Card className="bg-surface border-slate-700">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{Math.round(stats.translations)}</div>
            <div className="text-sm text-slate-400">AI Translations</div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-surface border-slate-700">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
              <Input
                placeholder="Search your manga collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600"
              />
            </div>
            <div className="flex space-x-3">
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Genres</SelectItem>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="romance">Romance</SelectItem>
                  <SelectItem value="comedy">Comedy</SelectItem>
                  <SelectItem value="drama">Drama</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="planned">Plan to Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Manga Grid/List */}
      {filteredManga.length === 0 ? (
        <Card className="bg-surface border-slate-700">
          <div className="p-8 text-center">
            <i className="fas fa-book text-4xl text-slate-600 mb-4"></i>
            <h3 className="text-lg font-medium mb-2">No manga found</h3>
            <p className="text-slate-400 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Start building your library by uploading manga files'}
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              <i className="fas fa-plus mr-2"></i>
              Add Your First Manga
            </Button>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredManga.map((item) => (
            <Link key={item.id} href={`/reader/${item.id}/1`}>
              <Card className="bg-surface border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer overflow-hidden">
                <div className="aspect-[3/4] bg-slate-800 flex items-center justify-center">
                  {item.coverImageUrl ? (
                    <img 
                      src={item.coverImageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-book text-4xl text-slate-600"></i>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm mb-1 truncate">{item.title}</h4>
                  <p className="text-xs text-slate-400 mb-2">
                    {item.status === 'reading' ? `Chapter ${item.currentChapter}` : item.status}
                  </p>
                  <Progress value={item.progress} className="h-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredManga.map((item) => (
            <Link key={item.id} href={`/reader/${item.id}/1`}>
              <Card className="bg-surface border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer">
                <div className="p-4 flex items-center space-x-4">
                  <div className="w-12 h-16 bg-slate-800 rounded flex items-center justify-center flex-shrink-0">
                    {item.coverImageUrl ? (
                      <img 
                        src={item.coverImageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <i className="fas fa-book text-slate-600"></i>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.title}</h4>
                    <p className="text-sm text-slate-400">
                      {item.originalLanguage} • {item.status}
                    </p>
                    <div className="mt-2">
                      <Progress value={item.progress} className="h-1" />
                      <p className="text-xs text-slate-500 mt-1">
                        Chapter {item.currentChapter}{item.totalChapters && ` of ${item.totalChapters}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
