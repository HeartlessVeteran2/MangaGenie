import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Bookmark,
  Star,
  Clock,
  Users,
  Book,
  Film,
  Database
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const repositorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Invalid URL'),
  type: z.enum(['manga', 'anime', 'mixed']),
  description: z.string().optional(),
  isEnabled: z.boolean().default(true),
  isNsfw: z.boolean().default(false),
  language: z.string().optional(),
  version: z.string().optional(),
  config: z.record(z.any()).optional()
});

type Repository = {
  id: string;
  name: string;
  url: string;
  type: 'manga' | 'anime' | 'mixed';
  description?: string;
  isEnabled: boolean;
  isNsfw: boolean;
  language?: string;
  version?: string;
  iconUrl?: string;
  config?: Record<string, any>;
  createdAt: string;
  lastSyncAt?: string;
  mediaCount?: number;
  status: 'active' | 'error' | 'syncing' | 'inactive';
};

export default function RepositoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'manga' | 'anime' | 'mixed'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'error' | 'inactive'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch repositories
  const { data: repositories = [], isLoading } = useQuery<Repository[]>({
    queryKey: ['/api/repositories', filterType !== 'all' ? filterType : undefined]
  });

  // Add repository mutation
  const addRepository = useMutation({
    mutationFn: async (data: z.infer<typeof repositorySchema>) => {
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/repositories'] });
      setShowAddDialog(false);
      toast({
        title: 'Repository Added',
        description: 'Repository has been successfully added.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add repository.',
        variant: 'destructive'
      });
    }
  });

  // Update repository mutation
  const updateRepository = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Repository> }) => {
      const response = await fetch(`/api/repositories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/repositories'] });
      toast({
        title: 'Repository Updated',
        description: 'Repository has been successfully updated.'
      });
    }
  });

  // Delete repository mutation
  const deleteRepository = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/repositories/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/repositories'] });
      toast({
        title: 'Repository Deleted',
        description: 'Repository has been successfully deleted.'
      });
    }
  });

  const form = useForm<z.infer<typeof repositorySchema>>({
    resolver: zodResolver(repositorySchema),
    defaultValues: {
      name: '',
      url: '',
      type: 'manga',
      description: '',
      isEnabled: true,
      isNsfw: false,
      language: 'en',
      version: '1.0.0'
    }
  });

  const onSubmit = (data: z.infer<typeof repositorySchema>) => {
    addRepository.mutate(data);
  };

  const filteredRepositories = repositories.filter((repo: Repository) => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || repo.type === filterType;
    const matchesStatus = filterStatus === 'all' || repo.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: Repository['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: Repository['type']) => {
    switch (type) {
      case 'manga': return <Book className="h-4 w-4" />;
      case 'anime': return <Film className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Repository Management</h1>
          <p className="text-muted-foreground">Manage your content sources and repositories</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Repository
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <DialogHeader>
                  <DialogTitle>Add New Repository</DialogTitle>
                  <DialogDescription>
                    Add a new content repository to your collection. This will allow you to access content from external sources.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Repository name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manga">Manga</SelectItem>
                            <SelectItem value="anime">Anime</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/repo" {...field} />
                      </FormControl>
                      <FormDescription>
                        The base URL for the repository or API endpoint
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Repository description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                          <Input placeholder="en, ja, ko, zh" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <FormField
                    control={form.control}
                    name="isEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Enabled</FormLabel>
                          <FormDescription>Enable this repository for content fetching</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isNsfw"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>NSFW Content</FormLabel>
                          <FormDescription>Repository contains adult content</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addRepository.isPending}>
                    {addRepository.isPending ? 'Adding...' : 'Add Repository'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType as any}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="manga">Manga</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus as any}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Repository Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepositories.map((repo: Repository) => (
            <Card key={repo.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(repo.type)}
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    {repo.isNsfw && <Badge variant="destructive" className="text-xs">NSFW</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(repo.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateRepository.mutate({
                        id: repo.id,
                        data: { isEnabled: !repo.isEnabled }
                      })}
                    >
                      {repo.isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {repo.description || 'No description available'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">URL:</span>
                    <a 
                      href={repo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-500 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {new URL(repo.url).hostname}
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {repo.type}
                    </Badge>
                  </div>

                  {repo.language && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Language:</span>
                      <Badge variant="outline">{repo.language.toUpperCase()}</Badge>
                    </div>
                  )}

                  {repo.mediaCount !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Content:</span>
                      <span>{repo.mediaCount.toLocaleString()} items</span>
                    </div>
                  )}

                  {repo.lastSyncAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync:</span>
                      <span>{new Date(repo.lastSyncAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this repository?')) {
                        deleteRepository.mutate(repo.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredRepositories.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'No repositories match your filters.'
              : 'No repositories found. Add your first repository to get started.'}
          </div>
        </div>
      )}
    </div>
  );
}