import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  Link,
  Unlink,
  RotateCw,
  Clock,
  Users,
  Star,
  Play,
  Book,
  Download,
  Upload,
  Eye,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SyncHistoryContent from '@/components/SyncHistoryContent';

const syncServiceSchema = z.object({
  serviceName: z.enum(['myanimelist', 'anilist', 'kitsu', 'simkl', 'trakt']),
  username: z.string().min(1, 'Username is required'),
  accessToken: z.string().optional(),
  isEnabled: z.boolean().default(true)
});

type SyncService = {
  id: string;
  serviceName: 'myanimelist' | 'anilist' | 'kitsu' | 'simkl' | 'trakt';
  username: string;
  accessToken?: string;
  refreshToken?: string;
  isEnabled: boolean;
  lastSyncAt?: string;
  syncedCount: number;
  status: 'connected' | 'error' | 'syncing' | 'disconnected';
  createdAt: string;
};

type SyncMapping = {
  id: string;
  mediaId: string;
  syncServiceId: string;
  externalId: string;
  lastSyncAt?: string;
  syncStatus: 'synced' | 'error' | 'pending';
};

type SyncStats = {
  totalMapped: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastSyncDate?: string;
};

export default function SyncPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sync services
  const { data: services = [], isLoading: servicesLoading } = useQuery<SyncService[]>({
    queryKey: ['/api/sync/services']
  });

  // Fetch sync mappings
  const { data: mappings = [] } = useQuery<SyncMapping[]>({
    queryKey: ['/api/sync/mappings']
  });

  // Fetch sync statistics
  const { data: stats } = useQuery<SyncStats>({
    queryKey: ['/api/sync/stats']
  });

  // Add sync service mutation
  const addService = useMutation({
    mutationFn: async (data: z.infer<typeof syncServiceSchema>) => {
      const response = await fetch('/api/sync/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sync/services'] });
      setShowAddDialog(false);
      toast({
        title: 'Service Connected',
        description: 'Sync service has been successfully connected.'
      });
    },
    onError: () => {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect sync service.',
        variant: 'destructive'
      });
    }
  });

  // Update service mutation
  const updateService = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SyncService> }) => {
      const response = await fetch(`/api/sync/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sync/services'] });
      toast({
        title: 'Service Updated',
        description: 'Sync service has been successfully updated.'
      });
    }
  });

  // Full sync mutation
  const performFullSync = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await fetch(`/api/sync/services/${serviceId}/sync`, {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sync/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sync/stats'] });
      toast({
        title: 'Sync Started',
        description: 'Full synchronization has been initiated.'
      });
    }
  });

  const form = useForm<z.infer<typeof syncServiceSchema>>({
    resolver: zodResolver(syncServiceSchema),
    defaultValues: {
      serviceName: 'myanimelist',
      username: '',
      isEnabled: true
    }
  });

  const onSubmit = (data: z.infer<typeof syncServiceSchema>) => {
    addService.mutate(data);
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case 'myanimelist': return '📋';
      case 'anilist': return '🎬';
      case 'kitsu': return '🐱';
      case 'simkl': return '📱';
      case 'trakt': return '📺';
      default: return '🔗';
    }
  };

  const getStatusIcon = (status: SyncService['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getServiceDisplayName = (serviceName: string) => {
    const names = {
      myanimelist: 'MyAnimeList',
      anilist: 'AniList',
      kitsu: 'Kitsu',
      simkl: 'Simkl',
      trakt: 'Trakt'
    };
    return names[serviceName as keyof typeof names] || serviceName;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sync Services</h1>
          <p className="text-muted-foreground">Connect and manage external sync services</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Connect Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <DialogHeader>
                  <DialogTitle>Connect Sync Service</DialogTitle>
                  <DialogDescription>
                    Connect an external service to sync your anime and manga progress.
                  </DialogDescription>
                </DialogHeader>

                <FormField
                  control={form.control}
                  name="serviceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="myanimelist">MyAnimeList</option>
                          <option value="anilist">AniList</option>
                          <option value="kitsu">Kitsu</option>
                          <option value="simkl">Simkl</option>
                          <option value="trakt">Trakt</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Token (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Your access token" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addService.isPending}>
                    {addService.isPending ? 'Connecting...' : 'Connect'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Link className="h-8 w-8 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Connected</p>
                  <p className="text-2xl font-bold">{services.filter(s => s.status === 'connected').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Synced Items</p>
                  <p className="text-2xl font-bold">{stats.totalMapped}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {stats.totalMapped > 0 
                      ? Math.round((stats.successfulSyncs / stats.totalMapped) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Last Sync</p>
                  <p className="text-sm font-bold">
                    {stats.lastSyncDate 
                      ? new Date(stats.lastSyncDate).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services">Connected Services</TabsTrigger>
          <TabsTrigger value="mappings">Sync Mappings</TabsTrigger>
          <TabsTrigger value="history">Sync History</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                    <div className="h-8 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : services.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  No sync services connected. Connect a service to start syncing your progress.
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <Card key={service.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getServiceIcon(service.serviceName)}</div>
                        <div>
                          <CardTitle className="text-lg">
                            {getServiceDisplayName(service.serviceName)}
                          </CardTitle>
                          <CardDescription>@{service.username}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(service.status)}
                        <Switch
                          checked={service.isEnabled}
                          onCheckedChange={(enabled) =>
                            updateService.mutate({
                              id: service.id,
                              data: { isEnabled: enabled }
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={
                          service.status === 'connected' ? 'default' :
                          service.status === 'error' ? 'destructive' :
                          service.status === 'syncing' ? 'secondary' : 'outline'
                        }>
                          {service.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Synced Items:</span>
                        <span>{service.syncedCount}</span>
                      </div>

                      {service.lastSyncAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last Sync:</span>
                          <span>{new Date(service.lastSyncAt).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => performFullSync.mutate(service.id)}
                            disabled={service.status === 'syncing'}
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to disconnect this service?')) {
                              // deleteService.mutate(service.id);
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

        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Mappings</CardTitle>
              <CardDescription>
                View and manage individual media sync mappings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mappings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sync mappings found. Connect services and sync your library to see mappings here.
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {mappings.map((mapping) => {
                      const service = services.find(s => s.id === mapping.syncServiceId);
                      return (
                        <div
                          key={mapping.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-lg">
                              {getServiceIcon(service?.serviceName || '')}
                            </div>
                            <div>
                              <div className="font-medium">Media ID: {mapping.mediaId}</div>
                              <div className="text-sm text-muted-foreground">
                                External ID: {mapping.externalId}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              mapping.syncStatus === 'synced' ? 'default' :
                              mapping.syncStatus === 'error' ? 'destructive' : 'secondary'
                            }>
                              {mapping.syncStatus}
                            </Badge>
                            {mapping.lastSyncAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(mapping.lastSyncAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                View detailed synchronization logs and history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SyncHistoryContent />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}