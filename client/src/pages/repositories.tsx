import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Database, Download, Globe, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface Repository {
  id: string;
  userId: string;
  name: string;
  baseUrl: string;
  repositoryUrl: string;
  sourceType: 'manga' | 'anime' | 'both';
  language: string;
  version: string;
  isEnabled: boolean;
  isNsfw: boolean;
  isObsolete: boolean;
  priority: number;
  installCount: number;
  packageName: string;
  author: string;
  description: string;
  iconUrl: string;
  websiteUrl: string;
  supportsLatest: boolean;
  supportsSearch: boolean;
  hasCloudflare: boolean;
  lastChecked: string;
  createdAt: string;
}

interface RepositorySource {
  id: string;
  repositoryId: string;
  name: string;
  displayName: string;
  baseUrl: string;
  language: string;
  version: string;
  isEnabled: boolean;
  isNsfw: boolean;
  iconUrl: string;
  supportsLatest: boolean;
  supportsSearch: boolean;
  supportsGenres: boolean;
  supportsFilters: boolean;
  className: string;
  packageName: string;
}

export default function RepositoriesPage() {
  const { toast } = useToast();
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('repositories');

  // Fetch repositories
  const { data: repositories = [], isLoading: reposLoading } = useQuery<Repository[]>({
    queryKey: ['/api/repositories'],
  });

  // Fetch all sources from all repositories
  const { data: allSources = [], isLoading: sourcesLoading } = useQuery<RepositorySource[]>({
    queryKey: ['/api/sources'],
    enabled: false, // We'll fetch sources per repository instead
  });

  // Add repository mutation
  const addRepository = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user',
        },
        body: JSON.stringify({ repositoryUrl: url }),
      });
      if (!response.ok) throw new Error('Failed to add repository');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Repository added",
        description: "New repository has been added successfully.",
      });
      setNewRepoUrl('');
      queryClient.invalidateQueries({ queryKey: ['/api/repositories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add repository",
        variant: "destructive",
      });
    },
  });

  // Toggle repository
  const toggleRepository = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await fetch(`/api/repositories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) throw new Error('Failed to update repository');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/repositories'] });
    },
  });

  // Toggle source
  const toggleSource = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const response = await fetch(`/api/sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled }),
      });
      if (!response.ok) throw new Error('Failed to update source');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
    },
  });

  const handleAddRepository = () => {
    if (!newRepoUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid repository URL.",
        variant: "destructive",
      });
      return;
    }

    addRepository.mutate(newRepoUrl.trim());
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'manga':
        return <Database className="w-4 h-4" />;
      case 'anime':
        return <Download className="w-4 h-4" />;
      case 'mixed':
        return <Globe className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manga':
        return 'bg-blue-500';
      case 'anime':
        return 'bg-purple-500';
      case 'both':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatInstallCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const mangaSources = allSources.filter(s => repositories.find(r => r.id === s.repositoryId)?.sourceType === 'manga');
  const animeSources = allSources.filter(s => repositories.find(r => r.id === s.repositoryId)?.sourceType === 'anime');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Sources & Repositories</h1>
        <p className="text-muted-foreground">
          Manage your content sources and extension repositories
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="manga">Manga Sources</TabsTrigger>
          <TabsTrigger value="anime">Anime Sources</TabsTrigger>
        </TabsList>

        {/* Repositories */}
        <TabsContent value="repositories" className="space-y-6">
          {/* Add Repository */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <h3 className="text-lg font-medium">Add Repository</h3>
              </div>
              
              <div className="flex gap-3">
                <Input
                  placeholder="https://example.com/repository.json"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddRepository}
                  disabled={addRepository.isPending || !newRepoUrl.trim()}
                >
                  {addRepository.isPending ? 'Adding...' : 'Add Repository'}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Add repositories to get access to more content sources
              </p>
            </div>
          </Card>

          {/* Repository List */}
          <div className="space-y-4">
            {reposLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-8 bg-muted rounded w-full"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : repositories.length === 0 ? (
              <Card className="p-8 text-center">
                <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No repositories added</h3>
                <p className="text-muted-foreground mb-4">
                  Add repositories to access manga and anime sources
                </p>
                <Button onClick={() => setNewRepoUrl('https://example.com/repository.json')}>
                  Add Your First Repository
                </Button>
              </Card>
            ) : (
              repositories.map((repo) => (
                <Card key={repo.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <img 
                        src={repo.iconUrl} 
                        alt={repo.name}
                        className="w-12 h-12 rounded-lg object-cover bg-muted"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium">{repo.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {repo.sourceType.toUpperCase()}
                          </Badge>
                          {repo.isEnabled && (
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          )}
                          {repo.isNsfw && (
                            <Badge variant="destructive" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              NSFW
                            </Badge>
                          )}
                          {repo.hasCloudflare && (
                            <Badge variant="secondary" className="text-xs">
                              CloudFlare
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{repo.description}</p>
                        <p className="text-xs text-muted-foreground font-mono">{repo.repositoryUrl}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            <span>{formatInstallCount(repo.installCount)} installs</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>v{repo.version}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>by {repo.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Updated {new Date(repo.lastChecked).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {repo.isObsolete && (
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                            ⚠️ This repository is marked as obsolete and may be removed in the future.
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={repo.isEnabled}
                        onCheckedChange={(checked) =>
                          toggleRepository.mutate({ id: repo.id, enabled: checked })
                        }
                      />
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Manga Sources */}
        <TabsContent value="manga" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Manga Sources</h2>
            <Badge variant="outline">
              {mangaSources.length} sources
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sourcesLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="h-6 bg-muted rounded"></div>
                  </div>
                </Card>
              ))
            ) : mangaSources.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-8 text-center">
                  <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No manga sources available</h3>
                  <p className="text-muted-foreground">
                    Add repositories to get manga sources
                  </p>
                </Card>
              </div>
            ) : (
              mangaSources.map((source) => (
                <Card key={source.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {source.iconUrl ? (
                        <img
                          src={source.iconUrl}
                          alt={source.name}
                          className="w-8 h-8 rounded"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                          <Database className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{source.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {source.language.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={source.isEnabled}
                      onCheckedChange={(checked) =>
                        toggleSource.mutate({ id: source.id, isEnabled: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {source.isNsfw && (
                        <Badge variant="destructive" className="text-xs">
                          <Shield className="w-2 h-2 mr-1" />
                          NSFW
                        </Badge>
                      )}
                      {source.version && (
                        <Badge variant="outline" className="text-xs">
                          v{source.version}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Anime Sources */}
        <TabsContent value="anime" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Anime Sources</h2>
            <Badge variant="outline">
              {animeSources.length} sources
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sourcesLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="h-6 bg-muted rounded"></div>
                  </div>
                </Card>
              ))
            ) : animeSources.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-8 text-center">
                  <Download className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No anime sources available</h3>
                  <p className="text-muted-foreground">
                    Add repositories to get anime sources
                  </p>
                </Card>
              </div>
            ) : (
              animeSources.map((source) => (
                <Card key={source.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {source.iconUrl ? (
                        <img
                          src={source.iconUrl}
                          alt={source.name}
                          className="w-8 h-8 rounded"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                          <Download className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{source.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {source.language.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={source.isEnabled}
                      onCheckedChange={(checked) =>
                        toggleSource.mutate({ id: source.id, isEnabled: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {source.isNsfw && (
                        <Badge variant="destructive" className="text-xs">
                          <Shield className="w-2 h-2 mr-1" />
                          NSFW
                        </Badge>
                      )}
                      {source.version && (
                        <Badge variant="outline" className="text-xs">
                          v{source.version}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}