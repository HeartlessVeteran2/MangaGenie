import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Pause, Play, Trash2, HardDrive, Wifi, WifiOff } from 'lucide-react';

interface DownloadItem {
  id: string;
  mediaId: string;
  chapterId?: string;
  episodeId?: string;
  status: 'pending' | 'downloading' | 'completed' | 'error' | 'paused';
  progress: number;
  totalSize: number;
  downloadedSize: number;
  quality?: string;
  localPath?: string;
  mediaTitle: string;
  chapterNumber?: number;
  episodeNumber?: number;
  thumbnailUrl?: string;
  createdAt: string;
}

export default function DownloadsPage() {
  const [activeTab, setActiveTab] = useState('active');

  // Fetch downloads
  const { data: downloads = [], isLoading } = useQuery<DownloadItem[]>({
    queryKey: ['/api/downloads'],
  });

  // Filter downloads by status
  const activeDownloads = downloads.filter(d => 
    ['pending', 'downloading', 'paused'].includes(d.status)
  );
  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const errorDownloads = downloads.filter(d => d.status === 'error');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'downloading':
        return <Download className="w-4 h-4 animate-pulse" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'completed':
        return <Download className="w-4 h-4 text-green-500" />;
      case 'error':
        return <Download className="w-4 h-4 text-red-500" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'downloading':
        return 'bg-blue-500';
      case 'paused':
        return 'bg-orange-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'pending':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handlePauseResume = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'downloading' ? 'paused' : 'downloading';
      const response = await fetch(`/api/downloads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        // Refetch downloads
        // queryClient.invalidateQueries(['/api/downloads']);
      }
    } catch (error) {
      console.error('Failed to update download:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/downloads/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refetch downloads
        // queryClient.invalidateQueries(['/api/downloads']);
      }
    } catch (error) {
      console.error('Failed to delete download:', error);
    }
  };

  const totalStorageUsed = completedDownloads.reduce((acc, d) => acc + d.totalSize, 0);
  const activeDownloadsCount = activeDownloads.length;

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Downloads</h1>
        <p className="text-muted-foreground">
          Manage your offline content for reading and watching anywhere
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Download className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Downloads</p>
              <p className="text-2xl font-bold">{activeDownloadsCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <HardDrive className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <p className="text-2xl font-bold">{formatFileSize(totalStorageUsed)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              {navigator.onLine ? (
                <Wifi className="w-5 h-5 text-purple-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connection</p>
              <p className="text-2xl font-bold">
                {navigator.onLine ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Downloads Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            Active
            {activeDownloadsCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeDownloadsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            Completed
            {completedDownloads.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {completedDownloads.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            Errors
            {errorDownloads.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {errorDownloads.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Active Downloads */}
        <TabsContent value="active" className="space-y-4">
          {activeDownloads.length === 0 ? (
            <Card className="p-8 text-center">
              <Download className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No active downloads</h3>
              <p className="text-muted-foreground mb-4">
                Download content from your library to access it offline
              </p>
              <Button variant="outline">Browse Library</Button>
            </Card>
          ) : (
            activeDownloads.map((download) => (
              <Card key={download.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {download.thumbnailUrl ? (
                      <img
                        src={download.thumbnailUrl}
                        alt={download.mediaTitle}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Download className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{download.mediaTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          {download.chapterNumber 
                            ? `Chapter ${download.chapterNumber}`
                            : download.episodeNumber
                            ? `Episode ${download.episodeNumber}`
                            : 'Full Series'
                          }
                          {download.quality && ` • ${download.quality}`}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`${getStatusColor(download.status)} text-white border-0`}
                        >
                          {getStatusIcon(download.status)}
                          <span className="ml-1 capitalize">{download.status}</span>
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{download.progress}% complete</span>
                        <span>
                          {formatFileSize(download.downloadedSize)} / {formatFileSize(download.totalSize)}
                        </span>
                      </div>
                      <Progress value={download.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {download.status === 'downloading' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePauseResume(download.id, download.status)}
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePauseResume(download.id, download.status)}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Resume
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(download.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Completed Downloads */}
        <TabsContent value="completed" className="space-y-4">
          {completedDownloads.length === 0 ? (
            <Card className="p-8 text-center">
              <HardDrive className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No completed downloads</h3>
              <p className="text-muted-foreground">
                Your completed downloads will appear here
              </p>
            </Card>
          ) : (
            completedDownloads.map((download) => (
              <Card key={download.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {download.thumbnailUrl ? (
                      <img
                        src={download.thumbnailUrl}
                        alt={download.mediaTitle}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <HardDrive className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{download.mediaTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          {download.chapterNumber 
                            ? `Chapter ${download.chapterNumber}`
                            : download.episodeNumber
                            ? `Episode ${download.episodeNumber}`
                            : 'Full Series'
                          }
                          {download.quality && ` • ${download.quality}`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatFileSize(download.totalSize)} • Downloaded {new Date(download.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-500">
                          <Download className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(download.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Error Downloads */}
        <TabsContent value="errors" className="space-y-4">
          {errorDownloads.length === 0 ? (
            <Card className="p-8 text-center">
              <Download className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">No download errors</h3>
              <p className="text-muted-foreground">
                All your downloads completed successfully!
              </p>
            </Card>
          ) : (
            errorDownloads.map((download) => (
              <Card key={download.id} className="p-6 border-red-200 dark:border-red-800">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {download.thumbnailUrl ? (
                      <img
                        src={download.thumbnailUrl}
                        alt={download.mediaTitle}
                        className="w-full h-full object-cover rounded-lg opacity-50"
                      />
                    ) : (
                      <Download className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{download.mediaTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          {download.chapterNumber 
                            ? `Chapter ${download.chapterNumber}`
                            : download.episodeNumber
                            ? `Episode ${download.episodeNumber}`
                            : 'Full Series'
                          }
                        </p>
                        <p className="text-sm text-red-500 mt-1">
                          Download failed - network or source error
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">
                          Error
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePauseResume(download.id, 'pending')}
                        >
                          Retry
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(download.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}