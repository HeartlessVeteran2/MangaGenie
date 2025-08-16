import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface UserSettings {
  userId: string;
  ocrSensitivity: number;
  translationQuality: string;
  autoTranslate: boolean;
  showOcrBoundaries: boolean;
  defaultLanguagePair: string;
  videoQuality: string;
  autoPlay: boolean;
  skipIntro: boolean;
  skipOutro: boolean;
  preferredPlayer: string;
  theme: string;
  dynamicColors: boolean;
  showAdultContent: boolean;
  malSync: boolean;
  anilistSync: boolean;
  malUsername?: string;
  anilistToken?: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("reading");

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    updateSettings.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-medium mb-2">Settings not found</h3>
          <p className="text-muted-foreground">Unable to load your preferences.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your MangaAI experience with advanced AI-powered features
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="player">Player</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="sync">Sync</TabsTrigger>
        </TabsList>

        {/* Reading Settings */}
        <TabsContent value="reading" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">OCR & Translation</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>OCR Sensitivity</Label>
                    <div className="px-3">
                      <Slider
                        value={[settings.ocrSensitivity]}
                        onValueChange={([value]) => handleSettingChange('ocrSensitivity', value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Higher values detect smaller text but may include noise
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Translation Quality</Label>
                    <Select
                      value={settings.translationQuality}
                      onValueChange={(value) => handleSettingChange('translationQuality', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">
                          Fast - Quick translations
                        </SelectItem>
                        <SelectItem value="balanced">
                          Balanced - Good quality and speed
                        </SelectItem>
                        <SelectItem value="premium">
                          Premium - Best quality, slower
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Language Pair</Label>
                    <Select
                      value={settings.defaultLanguagePair}
                      onValueChange={(value) => handleSettingChange('defaultLanguagePair', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jp-en">Japanese → English</SelectItem>
                        <SelectItem value="kr-en">Korean → English</SelectItem>
                        <SelectItem value="cn-en">Chinese → English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-translate pages</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically translate detected text
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoTranslate}
                      onCheckedChange={(checked) => handleSettingChange('autoTranslate', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show OCR boundaries</Label>
                      <p className="text-sm text-muted-foreground">
                        Display detection boundaries for debugging
                      </p>
                    </div>
                    <Switch
                      checked={settings.showOcrBoundaries}
                      onCheckedChange={(checked) => handleSettingChange('showOcrBoundaries', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Player Settings */}
        <TabsContent value="player" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Video Player</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Video Quality</Label>
                    <Select
                      value={settings.videoQuality}
                      onValueChange={(value) => handleSettingChange('videoQuality', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="1080p">1080p</SelectItem>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="480p">480p</SelectItem>
                        <SelectItem value="360p">360p</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Player</Label>
                    <Select
                      value={settings.preferredPlayer}
                      onValueChange={(value) => handleSettingChange('preferredPlayer', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal Player</SelectItem>
                        <SelectItem value="external">External Player</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-play episodes</Label>
                      <p className="text-sm text-muted-foreground">
                        Start playing episodes automatically
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoPlay}
                      onCheckedChange={(checked) => handleSettingChange('autoPlay', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Skip intro sequences</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically skip detected openings
                      </p>
                    </div>
                    <Switch
                      checked={settings.skipIntro}
                      onCheckedChange={(checked) => handleSettingChange('skipIntro', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Skip outro sequences</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically skip detected endings
                      </p>
                    </div>
                    <Switch
                      checked={settings.skipOutro}
                      onCheckedChange={(checked) => handleSettingChange('skipOutro', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Theme & Display</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => handleSettingChange('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dynamic colors</Label>
                      <p className="text-sm text-muted-foreground">
                        Extract colors from cover images for theming
                      </p>
                    </div>
                    <Switch
                      checked={settings.dynamicColors}
                      onCheckedChange={(checked) => handleSettingChange('dynamicColors', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        Show adult content
                        <Badge variant="destructive" className="text-xs">18+</Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Display NSFW content in search results
                      </p>
                    </div>
                    <Switch
                      checked={settings.showAdultContent}
                      onCheckedChange={(checked) => handleSettingChange('showAdultContent', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Sync Settings */}
        <TabsContent value="sync" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">External Services</h3>
                
                <div className="space-y-6">
                  {/* MyAnimeList */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          MyAnimeList Sync
                          <Badge variant={settings.malSync ? "default" : "outline"}>
                            {settings.malSync ? "Connected" : "Disconnected"}
                          </Badge>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Sync your progress with MyAnimeList
                        </p>
                      </div>
                      <Switch
                        checked={settings.malSync}
                        onCheckedChange={(checked) => handleSettingChange('malSync', checked)}
                      />
                    </div>
                    
                    {settings.malSync && (
                      <div className="space-y-2">
                        <Label>MAL Username</Label>
                        <Input
                          value={settings.malUsername || ''}
                          onChange={(e) => handleSettingChange('malUsername', e.target.value)}
                          placeholder="Enter your MAL username"
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* AniList */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          AniList Sync
                          <Badge variant={settings.anilistSync ? "default" : "outline"}>
                            {settings.anilistSync ? "Connected" : "Disconnected"}
                          </Badge>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Sync your progress with AniList
                        </p>
                      </div>
                      <Switch
                        checked={settings.anilistSync}
                        onCheckedChange={(checked) => handleSettingChange('anilistSync', checked)}
                      />
                    </div>
                    
                    {settings.anilistSync && (
                      <div className="space-y-2">
                        <Label>AniList Token</Label>
                        <Input
                          type="password"
                          value={settings.anilistToken || ''}
                          onChange={(e) => handleSettingChange('anilistToken', e.target.value)}
                          placeholder="Enter your AniList access token"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Test Connections
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Indicator */}
      {updateSettings.isPending && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="p-4 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              <span className="text-sm">Saving...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}