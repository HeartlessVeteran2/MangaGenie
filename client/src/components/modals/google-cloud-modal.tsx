import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Cloud, Drive, Database, Shield, Upload, Download } from "lucide-react";

interface GoogleCloudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositoryId?: string;
}

export default function GoogleCloudModal({ open, onOpenChange, repositoryId }: GoogleCloudModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("permissions");
  const [bucketName, setBucketName] = useState("");
  const [driveFolderId, setDriveFolderId] = useState("");

  const { data: cloudPermissions } = useQuery({
    queryKey: ['/api/cloud/permissions'],
    enabled: open,
  });

  const { data: driveFiles } = useQuery({
    queryKey: ['/api/cloud/drive/files'],
    enabled: open && activeTab === 'drive',
  });

  const { data: storageFiles } = useQuery({
    queryKey: ['/api/cloud/storage/files'],
    enabled: open && activeTab === 'storage',
  });

  const authenticateGoogleMutation = useMutation({
    mutationFn: (service: string) => apiRequest('POST', '/api/cloud/auth', { service }),
    onSuccess: (data) => {
      window.location.href = data.authUrl;
    },
    onError: () => {
      toast({
        title: "Authentication Failed",
        description: "Failed to start Google authentication process",
        variant: "destructive",
      });
    },
  });

  const syncRepositoryMutation = useMutation({
    mutationFn: (data: { repositoryId: string; service: string; config: any }) => 
      apiRequest('POST', '/api/cloud/sync', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/repositories'] });
      toast({
        title: "Sync Started",
        description: "Repository sync to cloud storage has been initiated",
      });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to start repository sync",
        variant: "destructive",
      });
    },
  });

  const revokePermissionMutation = useMutation({
    mutationFn: (permissionId: string) => 
      apiRequest('DELETE', `/api/cloud/permissions/${permissionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cloud/permissions'] });
      toast({
        title: "Permission Revoked",
        description: "Cloud service permission has been revoked",
      });
    },
  });

  const handleAuthenticateService = (service: string) => {
    authenticateGoogleMutation.mutate(service);
  };

  const handleSyncRepository = () => {
    if (!repositoryId) return;
    
    syncRepositoryMutation.mutate({
      repositoryId,
      service: activeTab === 'drive' ? 'drive' : 'storage',
      config: {
        bucketName: activeTab === 'storage' ? bucketName : undefined,
        driveFolderId: activeTab === 'drive' ? driveFolderId : undefined,
      }
    });
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'drive':
        return <Drive className="w-4 h-4" />;
      case 'storage':
        return <Database className="w-4 h-4" />;
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  const getServiceStatus = (permission: any) => {
    const isExpired = permission.expiresAt && new Date(permission.expiresAt) < new Date();
    if (!permission.isActive || isExpired) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="secondary">Active</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Google Cloud Integration
          </DialogTitle>
          <DialogDescription>
            Manage repository synchronization with Google Drive and Cloud Storage
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="drive">Google Drive</TabsTrigger>
            <TabsTrigger value="storage">Cloud Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Service Permissions</h3>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => handleAuthenticateService('drive')}
                    disabled={authenticateGoogleMutation.isPending}
                  >
                    <Drive className="w-4 h-4 mr-2" />
                    Add Drive Access
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAuthenticateService('storage')}
                    disabled={authenticateGoogleMutation.isPending}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Add Storage Access
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                {cloudPermissions?.map((permission: any) => (
                  <Card key={permission.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getServiceIcon(permission.serviceType)}
                        <div>
                          <h4 className="font-medium capitalize">
                            Google {permission.serviceType}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(permission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getServiceStatus(permission)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokePermissionMutation.mutate(permission.id)}
                          disabled={revokePermissionMutation.isPending}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {permission.scopes?.map((scope: string) => (
                        <Badge key={scope} variant="outline" className="text-xs">
                          {scope.split('/').pop()}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {(!cloudPermissions || cloudPermissions.length === 0) && (
                <Card className="p-6 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No Permissions Configured</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add Google Drive or Cloud Storage permissions to enable repository syncing
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button onClick={() => handleAuthenticateService('drive')}>
                      Authorize Google Drive
                    </Button>
                    <Button onClick={() => handleAuthenticateService('storage')}>
                      Authorize Cloud Storage
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="drive" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Drive className="w-5 h-5" />
                    Google Drive Sync
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="drive-folder">Drive Folder ID (Optional)</Label>
                    <Input
                      id="drive-folder"
                      placeholder="Enter Google Drive folder ID"
                      value={driveFolderId}
                      onChange={(e) => setDriveFolderId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to sync to root folder
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="auto-sync" />
                    <Label htmlFor="auto-sync">Enable automatic sync</Label>
                  </div>

                  <Button 
                    onClick={handleSyncRepository}
                    disabled={!repositoryId || syncRepositoryMutation.isPending}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {syncRepositoryMutation.isPending ? 'Syncing...' : 'Start Drive Sync'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Drive Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {driveFiles?.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{file.mimeType.split('/')[0]}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Cloud Storage Sync
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bucket-name">Storage Bucket Name</Label>
                    <Input
                      id="bucket-name"
                      placeholder="Enter bucket name"
                      value={bucketName}
                      onChange={(e) => setBucketName(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="public-access" />
                    <Label htmlFor="public-access">Make files publicly accessible</Label>
                  </div>

                  <Button 
                    onClick={handleSyncRepository}
                    disabled={!repositoryId || !bucketName || syncRepositoryMutation.isPending}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {syncRepositoryMutation.isPending ? 'Syncing...' : 'Start Storage Sync'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Storage Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {storageFiles?.map((file: any) => (
                      <div key={file.name} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{file.contentType}</Badge>
                          {file.publicUrl && (
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}