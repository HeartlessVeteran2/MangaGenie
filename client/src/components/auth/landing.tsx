import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Palette, Zap, Globe, Shield, Download, RefreshCw } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">MangaAI</h1>
        </div>
        <Button 
          onClick={() => window.location.href = '/api/login'}
          size="lg"
          className="bg-white text-black hover:bg-gray-100"
        >
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-800">
            Powered by AI
          </Badge>
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            The Ultimate Manga &amp; Anime Experience
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Read manga with real-time AI translation, stream anime with advanced player features, 
            and manage your collection with cutting-edge tools that surpass Komikku and Aniyomi.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg"
          >
            Get Started Free
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <BookOpen className="w-12 h-12 text-purple-400 mb-2" />
              <CardTitle className="text-white">Smart Reading</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                OCR-powered translation overlay with confidence scoring and multi-language support
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <Play className="w-12 h-12 text-blue-400 mb-2" />
              <CardTitle className="text-white">Advanced Player</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                VLC-like controls, auto skip intro/outro, and intelligent episode detection
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <Palette className="w-12 h-12 text-pink-400 mb-2" />
              <CardTitle className="text-white">Dynamic Theming</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Auto-extracted color palettes from cover art for personalized UI themes
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <Zap className="w-12 h-12 text-yellow-400 mb-2" />
              <CardTitle className="text-white">AI-Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Smart recommendations, artwork search, and content analysis using advanced AI
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Globe className="w-6 h-6 text-green-400" />
                Universal Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>• Repository management for manga and anime sources</p>
              <p>• NSFW content support with advanced filtering</p>
              <p>• Multi-language content with intelligent detection</p>
              <p>• Automatic source updates and health monitoring</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Download className="w-6 h-6 text-blue-400" />
                Offline Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>• Download chapters and episodes for offline reading</p>
              <p>• Quality selection and compression options</p>
              <p>• Automatic expiration and storage management</p>
              <p>• Resume downloads across sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <RefreshCw className="w-6 h-6 text-purple-400" />
                Sync & Track
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>• MyAnimeList and AniList synchronization</p>
              <p>• Progress tracking across devices</p>
              <p>• Reading statistics and analytics</p>
              <p>• Community features and comments</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-400" />
                Privacy First
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>• Secure authentication with Replit</p>
              <p>• Local data storage and encryption</p>
              <p>• No tracking or data collection</p>
              <p>• Open source and transparent</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Reading Experience?
          </h3>
          <p className="text-gray-300 mb-6 text-lg">
            Join thousands of users who have upgraded from traditional manga and anime apps.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
          >
            Start Reading Now
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 border-t border-white/10 mt-16">
        <p>&copy; 2024 MangaAI. Built with modern web technologies.</p>
      </footer>
    </div>
  );
}