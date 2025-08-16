import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, RefreshCcw, Globe, Activity, Users, FileText, Clock } from 'lucide-react';

export default function SyncHistoryContent() {
  const { data: syncHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/sync/history'],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <RefreshCcw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'myanimelist':
        return <Globe className="w-5 h-5" />;
      case 'anilist':
        return <Activity className="w-5 h-5" />;
      case 'kitsu':
        return <Users className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (historyLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!syncHistory || syncHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sync history found. Run your first sync to see logs here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="max-h-96">
        {syncHistory.map((entry: any) => (
          <div key={entry.id} className="border rounded-lg p-4 space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getServiceIcon(entry.serviceName)}
                <div>
                  <div className="font-medium capitalize">{entry.serviceName}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {entry.operation.replace('_', ' ')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(entry.status)}
                <Badge variant={
                  entry.status === 'completed' ? 'default' :
                  entry.status === 'error' ? 'destructive' : 'secondary'
                }>
                  {entry.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Processed</div>
                <div className="font-medium">{entry.itemsProcessed}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Updated</div>
                <div className="font-medium">{entry.itemsUpdated}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Added</div>
                <div className="font-medium">{entry.itemsAdded}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Duration</div>
                <div className="font-medium">{formatDuration(entry.duration)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>
                Started: {new Date(entry.startedAt).toLocaleString()}
              </div>
              {entry.completedAt && (
                <div>
                  Completed: {new Date(entry.completedAt).toLocaleString()}
                </div>
              )}
            </div>

            {entry.errorMessage && (
              <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                {entry.errorMessage}
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}