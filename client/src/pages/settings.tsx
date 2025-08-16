import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Settings,
  User,
  Shield,
  Zap,
  Palette,
  Globe,
  Eye,
  EyeOff,
  Brain,
  Star,
  Volume2,
  Download,
  Moon,
  Sun,
  Filter,
  Lock,
  Key,
  UserCheck,
  AlertTriangle,
  Image,
  Video,
  BookOpen,
  Languages,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';

const userProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  displayName: z.string().min(1, 'Display name is required'),
  bio: z.string().optional(),
  avatar: z.string().optional()
});

const nsfwSettingsSchema = z.object({
  enableNsfw: z.boolean(),
  ageVerified: z.boolean(),
  contentFilter: z.enum(['strict', 'moderate', 'off']),
  blurThumbnails: z.boolean(),
  hideFromHistory: z.boolean(),
  requirePin: z.boolean(),
  pin: z.string().optional()
});

const aiSettingsSchema = z.object({
  enableRecommendations: z.boolean(),
  personalizedContent: z.boolean(),
  artworkSearch: z.boolean(),
  translationQuality: z.enum(['fast', 'balanced', 'premium']),
  autoTranslate: z.boolean(),
  ocrSensitivity: z.number().min(1).max(10),
  learningMode: z.boolean()
});

type UserSettings = {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  defaultQuality: string;
  autoPlay: boolean;
  skipIntro: boolean;
  skipOutro: boolean;
  volume: number;
  notifications: boolean;
  downloadLocation: string;
  dataSaver: boolean;
  nsfwSettings: z.infer<typeof nsfwSettingsSchema>;
  aiSettings: z.infer<typeof aiSettingsSchema>;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showNsfwDialog, setShowNsfwDialog] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  // Fetch user settings
  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ['/api/user/settings']
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      toast({
        title: 'Settings Updated',
        description: 'Your preferences have been saved successfully.'
      });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update settings.',
        variant: 'destructive'
      });
    }
  });

  // User profile form
  const profileForm = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      username: settings?.username || '',
      email: settings?.email || '',
      displayName: settings?.displayName || '',
      bio: settings?.bio || '',
      avatar: settings?.avatar || ''
    }
  });

  // NSFW settings form
  const nsfwForm = useForm<z.infer<typeof nsfwSettingsSchema>>({
    resolver: zodResolver(nsfwSettingsSchema),
    defaultValues: settings?.nsfwSettings || {
      enableNsfw: false,
      ageVerified: false,
      contentFilter: 'strict',
      blurThumbnails: true,
      hideFromHistory: false,
      requirePin: false
    }
  });

  // AI settings form
  const aiForm = useForm<z.infer<typeof aiSettingsSchema>>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: settings?.aiSettings || {
      enableRecommendations: true,
      personalizedContent: true,
      artworkSearch: true,
      translationQuality: 'balanced',
      autoTranslate: false,
      ocrSensitivity: 7,
      learningMode: true
    }
  });

  const onProfileSubmit = (data: z.infer<typeof userProfileSchema>) => {
    updateSettings.mutate({ ...data });
  };

  const onNsfwSubmit = (data: z.infer<typeof nsfwSettingsSchema>) => {
    if (data.enableNsfw && !data.ageVerified) {
      setShowAgeVerification(true);
      return;
    }
    updateSettings.mutate({ nsfwSettings: data });
    setShowNsfwDialog(false);
  };

  const onAiSubmit = (data: z.infer<typeof aiSettingsSchema>) => {
    updateSettings.mutate({ aiSettings: data });
  };

  const handleQuickSetting = (key: keyof UserSettings, value: any) => {
    updateSettings.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Settings</h1>
          <p className="text-muted-foreground">Customize your reading and viewing experience</p>
        </div>
        <Badge variant="outline" className="glass-effect">
          <Zap className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 glass-effect">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="nsfw" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="playback" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Playback</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="gemini-card">
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter display name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Input placeholder="Tell us about yourself" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updateSettings.isPending} className="bg-gradient-to-r from-primary to-primary/80">
                    {updateSettings.isPending ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nsfw" className="space-y-6">
          <Card className="gemini-card border-amber-200 dark:border-amber-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <CardTitle>Adult Content Settings</CardTitle>
              </div>
              <CardDescription>
                Configure 18+ content visibility and safety features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...nsfwForm}>
                <form onSubmit={nsfwForm.handleSubmit(onNsfwSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <div className="font-medium">Enable Adult Content</div>
                        <div className="text-sm text-muted-foreground">
                          Show 18+ manga, anime and other adult content
                        </div>
                      </div>
                      <FormField
                        control={nsfwForm.control}
                        name="enableNsfw"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <div className="font-medium">Content Filter Level</div>
                        <div className="text-sm text-muted-foreground">
                          Control how strictly content is filtered
                        </div>
                      </div>
                      <FormField
                        control={nsfwForm.control}
                        name="contentFilter"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="strict">Strict</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="off">Off</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <div className="font-medium">Blur Thumbnails</div>
                        <div className="text-sm text-muted-foreground">
                          Blur adult content thumbnails until clicked
                        </div>
                      </div>
                      <FormField
                        control={nsfwForm.control}
                        name="blurThumbnails"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <div className="font-medium">Hide from History</div>
                        <div className="text-sm text-muted-foreground">
                          Don't save adult content in reading history
                        </div>
                      </div>
                      <FormField
                        control={nsfwForm.control}
                        name="hideFromHistory"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <div className="font-medium">Require PIN</div>
                        <div className="text-sm text-muted-foreground">
                          Require PIN to access adult content
                        </div>
                      </div>
                      <FormField
                        control={nsfwForm.control}
                        name="requirePin"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {nsfwForm.watch('requirePin') && (
                      <FormField
                        control={nsfwForm.control}
                        name="pin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PIN (4 digits)</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter 4-digit PIN" 
                                maxLength={4}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Button type="submit" disabled={updateSettings.isPending} className="bg-gradient-to-r from-amber-500 to-orange-500">
                    {updateSettings.isPending ? 'Saving...' : 'Save Content Settings'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card className="gemini-card border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                <CardTitle>AI & Recommendations</CardTitle>
              </div>
              <CardDescription>
                Configure AI-powered features and content recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...aiForm}>
                <form onSubmit={aiForm.handleSubmit(onAiSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <div className="font-medium">Smart Recommendations</div>
                        <div className="text-sm text-muted-foreground">
                          Get personalized manga and anime suggestions
                        </div>
                      </div>
                      <FormField
                        control={aiForm.control}
                        name="enableRecommendations"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <div className="font-medium">Artwork Search</div>
                        <div className="text-sm text-muted-foreground">
                          Find manga/anime by uploading artwork images
                        </div>
                      </div>
                      <FormField
                        control={aiForm.control}
                        name="artworkSearch"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">Translation Quality</div>
                          <div className="text-sm text-muted-foreground">
                            Higher quality uses more AI resources
                          </div>
                        </div>
                        <FormField
                          control={aiForm.control}
                          name="translationQuality"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="fast">Fast</SelectItem>
                                  <SelectItem value="balanced">Balanced</SelectItem>
                                  <SelectItem value="premium">Premium</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">OCR Sensitivity</div>
                          <div className="text-sm text-muted-foreground">
                            Text detection sensitivity: {aiForm.watch('ocrSensitivity')}/10
                          </div>
                        </div>
                      </div>
                      <FormField
                        control={aiForm.control}
                        name="ocrSensitivity"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={10}
                                min={1}
                                step={1}
                                className="w-full"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <div className="font-medium">Auto Translation</div>
                        <div className="text-sm text-muted-foreground">
                          Automatically translate pages as you read
                        </div>
                      </div>
                      <FormField
                        control={aiForm.control}
                        name="autoTranslate"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <div className="font-medium">Learning Mode</div>
                        <div className="text-sm text-muted-foreground">
                          Help improve AI by sharing usage data
                        </div>
                      </div>
                      <FormField
                        control={aiForm.control}
                        name="learningMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={updateSettings.isPending} className="bg-gradient-to-r from-blue-500 to-purple-500">
                    {updateSettings.isPending ? 'Saving...' : 'Save AI Settings'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="gemini-card">
            <CardHeader>
              <CardTitle>Appearance & Theme</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">Theme</div>
                    <div className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-4 w-4 mr-1" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-4 w-4 mr-1" />
                      Dark
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">Language</div>
                    <div className="text-sm text-muted-foreground">
                      Interface language
                    </div>
                  </div>
                  <Select 
                    value={settings?.language || 'en'} 
                    onValueChange={(value) => handleQuickSetting('language', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playback" className="space-y-6">
          <Card className="gemini-card">
            <CardHeader>
              <CardTitle>Playback & Media</CardTitle>
              <CardDescription>
                Configure video playback and reading preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">Default Video Quality</div>
                    <div className="text-sm text-muted-foreground">
                      Preferred streaming quality
                    </div>
                  </div>
                  <Select 
                    value={settings?.defaultQuality || '1080p'} 
                    onValueChange={(value) => handleQuickSetting('defaultQuality', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="1440p">1440p</SelectItem>
                      <SelectItem value="4K">4K</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">Auto Play</div>
                    <div className="text-sm text-muted-foreground">
                      Start playing videos automatically
                    </div>
                  </div>
                  <Switch
                    checked={settings?.autoPlay || false}
                    onCheckedChange={(checked) => handleQuickSetting('autoPlay', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">Skip Intro</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically skip intro sequences
                    </div>
                  </div>
                  <Switch
                    checked={settings?.skipIntro || false}
                    onCheckedChange={(checked) => handleQuickSetting('skipIntro', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">Skip Outro</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically skip end credits
                    </div>
                  </div>
                  <Switch
                    checked={settings?.skipOutro || false}
                    onCheckedChange={(checked) => handleQuickSetting('skipOutro', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Volume</div>
                      <div className="text-sm text-muted-foreground">
                        Default volume level: {settings?.volume || 100}%
                      </div>
                    </div>
                  </div>
                  <Slider
                    value={[settings?.volume || 100]}
                    onValueChange={(value) => handleQuickSetting('volume', value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card className="gemini-card">
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Additional configuration options for power users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">Data Saver</div>
                    <div className="text-sm text-muted-foreground">
                      Reduce bandwidth usage
                    </div>
                  </div>
                  <Switch
                    checked={settings?.dataSaver || false}
                    onCheckedChange={(checked) => handleQuickSetting('dataSaver', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive updates about new content
                    </div>
                  </div>
                  <Switch
                    checked={settings?.notifications || false}
                    onCheckedChange={(checked) => handleQuickSetting('notifications', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Download Location</div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={settings?.downloadLocation || '/downloads'}
                      onChange={(e) => handleQuickSetting('downloadLocation', e.target.value)}
                      placeholder="Download folder path"
                    />
                    <Button variant="outline" size="sm">
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">App Version</span>
                    <Badge variant="outline">v2.1.0</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Age Verification Dialog */}
      <Dialog open={showAgeVerification} onOpenChange={setShowAgeVerification}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Age Verification Required</DialogTitle>
            <DialogDescription>
              You must verify that you are 18 years or older to access adult content.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Adult Content Warning</span>
              </div>
              <p className="text-sm mt-2 text-amber-700 dark:text-amber-300">
                This content is intended for mature audiences only. By proceeding, you confirm that you are of legal age in your jurisdiction.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAgeVerification(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                nsfwForm.setValue('ageVerified', true);
                setShowAgeVerification(false);
                onNsfwSubmit(nsfwForm.getValues());
              }}
            >
              I am 18 or older
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}