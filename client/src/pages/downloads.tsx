import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Download,
  Pause,
  Play,
  Trash2,
  FolderOpen,
  HardDriveDownload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Film,
  Book,
  Archive,
  FileText,
  Image,
  Video,
  Music,
  Settings,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const downloadSchema = z.object({
  mediaId: z.string().min(1, 'Media ID is required'),
  mediaType: z.enum(['anime', 'manga', 'episode', 'chapter']),
  quality: z.string().default('1080p'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  downloadPath: z.string().optional()
});

type Download = {
  id: string;
  mediaId: string;
  mediaType: 'anime' | 'manga' | 'episode' | 'chapter';
  title: string;
  quality: string;
  fileSize: number;
  downloadedSize: number;
  progress: number;
  speed: number;
  eta: string;
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high';
  downloadPath: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
};

type DownloadStats = {
  totalDownloads: number;
  activeDownloads: number;
  completedDownloads: number;
  failedDownloads: number;
  totalSize: number;
  downloadedSize: number;
  avgSpeed: number;
};

export default function DownloadsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | Download['status']>('all');
  const [filterType, setFilterType] = useState<'all' | Download['mediaType']>('all');
  const [activeTab, setActiveTab] = useState('active');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch downloads
  const { data: downloads = [], isLoading } = useQuery<Download[]>({
    queryKey: ['/api/downloads'],
    refetchInterval: 2000 // Refresh every 2 seconds for live progress
  });

  // Fetch download statistics
  const { data: stats } = useQuery<DownloadStats>({
    queryKey: ['/api/downloads/stats'],
    refetchInterval: 5000
  });

  // Start download mutation
  const startDownload = useMutation({
    mutationFn: async (data: z.infer<typeof downloadSchema>) => {
      const response = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/downloads'] });
      setShowAddDialog(false);
      toast({
        title: 'Download Started',
        description: 'Download has been added to the queue.'
      });
    },
    onError: () => {
      toast({
        title: 'Download Failed',
        description: 'Failed to start download.',
        variant: 'destructive'
      });
    }
  });

  // Control download mutations
  const controlDownload = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'pause' | 'resume' | 'cancel' }) => {
      const response = await fetch(`/api/downloads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: action === 'pause' ? 'paused' : 
                 action === 'resume' ? 'downloading' : 'cancelled'
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/downloads'] });
    }
  });

  // Delete download mutation
  const deleteDownload = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/downloads/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/downloads'] });
      toast({
        title: 'Download Removed',
        description: 'Download has been removed from the list.'
      });
    }
  });

  const form = useForm<z.infer<typeof downloadSchema>>({
    resolver: zodResolver(downloadSchema),
    defaultValues: {
      mediaId: '',
      mediaType: 'anime',
      quality: '1080p',
      priority: 'normal'
    }
  });

  const onSubmit = (data: z.infer<typeof downloadSchema>) => {
    startDownload.mutate(data);
  };

  const filteredDownloads = downloads.filter((download: Download) => {
    const matchesStatus = filterStatus === 'all' || download.status === filterStatus;
    const matchesType = filterType === 'all' || download.mediaType === filterType;
    return matchesStatus && matchesType;
  });

  const activeDownloads = downloads.filter(d => d.status === 'downloading' || d.status === 'pending');
  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const failedDownloads = downloads.filter(d => d.status === 'failed' || d.status === 'cancelled');

  const getStatusIcon = (status: Download['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'downloading': return <Download className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMediaIcon = (mediaType: Download['mediaType']) => {
    switch (mediaType) {
      case 'anime':
      case 'episode': return <Film className="h-4 w-4" />;
      case 'manga':
      case 'chapter': return <Book className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return formatFileSize(bytesPerSecond) + '/s';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Download Manager</h1>
          <p className="text-muted-foreground">Manage your anime and manga downloads</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              New Download
            </Button>
          </DialogTrigger>
          <DialogContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <DialogHeader>
                  <DialogTitle>Start New Download</DialogTitle>
                  <DialogDescription>
                    Add a new item to your download queue.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mediaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Media ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter media ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mediaType"
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
                            <SelectItem value="anime">Anime Series</SelectItem>
                            <SelectItem value="episode">Single Episode</SelectItem>
                            <SelectItem value="manga">Manga Series</SelectItem>
                            <SelectItem value="chapter">Single Chapter</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quality</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="720p">720p</SelectItem>
                            <SelectItem value="1080p">1080p</SelectItem>
                            <SelectItem value="1440p">1440p</SelectItem>
                            <SelectItem value="4K">4K</SelectItem>
                            <SelectItem value="original">Original</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="downloadPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Download Path (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="/path/to/downloads" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={startDownload.isPending}>
                    {startDownload.isPending ? 'Starting...' : 'Start Download'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <HardDriveDownload className="h-8 w-8 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                  <p className="text-2xl font-bold">{stats.totalDownloads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="h-8 w-8 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.activeDownloads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedDownloads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Archive className="h-8 w-8 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                  <p className="text-lg font-bold">{formatFileSize(stats.totalSize)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Speed</p>
                  <p className="text-lg font-bold">{formatSpeed(stats.avgSpeed)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active ({activeDownloads.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedDownloads.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failedDownloads.length})</TabsTrigger>
          <TabsTrigger value="all">All Downloads</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <Select value={filterStatus} onValueChange={setFilterStatus as any}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="downloading">Downloading</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType as any}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="anime">Anime</SelectItem>
              <SelectItem value="manga">Manga</SelectItem>
              <SelectItem value="episode">Episodes</SelectItem>
              <SelectItem value="chapter">Chapters</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-2 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredDownloads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  No downloads found. Start your first download to see it here.
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Start First Download
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredDownloads.map((download) => (
                <Card key={download.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getMediaIcon(download.mediaType)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{download.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="capitalize">
                              {download.mediaType}
                            </Badge>
                            <Badge variant="outline">
                              {download.quality}
                            </Badge>
                            <Badge 
                              variant={
                                download.priority === 'high' ? 'default' :
                                download.priority === 'low' ? 'secondary' : 'outline'
                              }
                              className="capitalize"
                            >
                              {download.priority} Priority
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {getStatusIcon(download.status)}
                        <Badge variant={
                          download.status === 'completed' ? 'default' :
                          download.status === 'failed' || download.status === 'cancelled' ? 'destructive' :
                          download.status === 'downloading' ? 'secondary' : 'outline'
                        }>
                          {download.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(download.status === 'downloading' || download.status === 'paused') && (
                      <div className="mb-4">
                        <Progress value={download.progress} className="h-2" />
                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                          <span>
                            {formatFileSize(download.downloadedSize)} / {formatFileSize(download.fileSize)}
                          </span>
                          <div className="flex items-center gap-4">
                            {download.status === 'downloading' && (
                              <>
                                <span>{formatSpeed(download.speed)}</span>
                                <span>ETA: {download.eta}</span>
                              </>
                            )}
                            <span>{Math.round(download.progress)}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Completed/Failed Info */}
                    {download.status === 'completed' && (
                      <div className="mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Size: {formatFileSize(download.fileSize)}</span>
                          <span>Completed: {new Date(download.completedAt!).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-1">
                          Path: {download.downloadPath}
                        </div>
                      </div>
                    )}

                    {download.status === 'failed' && download.error && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div className="text-sm text-red-600 dark:text-red-400">
                          Error: {download.error}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {download.status === 'downloading' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => controlDownload.mutate({ id: download.id, action: 'pause' })}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}

                        {download.status === 'paused' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => controlDownload.mutate({ id: download.id, action: 'resume' })}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}

                        {(download.status === 'failed' || download.status === 'cancelled') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Restart download logic
                              controlDownload.mutate({ id: download.id, action: 'resume' });
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}

                        {download.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Open folder logic
                              toast({
                                title: 'Opening Folder',
                                description: `Opening ${download.downloadPath}`
                              });
                            }}
                          >
                            <FolderOpen className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {(download.status === 'downloading' || download.status === 'pending' || download.status === 'paused') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => controlDownload.mutate({ id: download.id, action: 'cancel' })}
                          >
                            Cancel
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to remove this download?')) {
                              deleteDownload.mutate(download.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}