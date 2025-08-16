import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import FileUpload from "@/components/manga/file-upload";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Manga {
  id: string;
  title: string;
  status: string;
  currentChapter: number;
  progress: number;
  coverImageUrl?: string;
}

export default function Home() {
  const [showUpload, setShowUpload] = useState(false);

  const { data: recentManga = [], isLoading } = useQuery<Manga[]>({
    queryKey: ['/api/manga'],
  });

  const recentReading = recentManga.filter(m => m.status === 'reading').slice(0, 3);

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 p-6">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Premium AI Translation</h2>
          <p className="text-slate-300 mb-4">
            Read any manga with real-time OCR translation powered by OpenAI
          </p>
          <Button 
            onClick={() => setShowUpload(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <i className="fas fa-play mr-2"></i>
            Start Reading
          </Button>
        </div>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-2 h-full">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="bg-white/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="bg-surface border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-upload text-primary mr-3"></i>
            Quick Upload & Translate
          </h3>
          <FileUpload />
        </div>
      </Card>

      {/* Recent Manga */}
      {recentReading.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Continue Reading</h3>
            <Link href="/library">
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentReading.map((manga) => (
              <Card key={manga.id} className="bg-surface border-slate-700">
                <div className="p-4 flex items-center space-x-4">
                  <div className="w-16 h-20 bg-slate-700 rounded-lg flex items-center justify-center">
                    {manga.coverImageUrl ? (
                      <img 
                        src={manga.coverImageUrl} 
                        alt={manga.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <i className="fas fa-book text-slate-400"></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{manga.title}</h4>
                    <p className="text-sm text-slate-400">
                      Chapter {manga.currentChapter}
                    </p>
                    <div className="mt-2">
                      <Progress value={manga.progress} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">
                        {manga.progress}% complete
                      </p>
                    </div>
                  </div>
                  <Link href={`/reader/${manga.id}/1`}>
                    <Button size="sm" className="w-10 h-10 bg-primary/20 hover:bg-primary/30">
                      <i className="fas fa-play text-primary text-sm"></i>
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Features Showcase */}
      <Card className="bg-gradient-to-r from-surface to-slate-800/50 border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-robot text-secondary mr-3"></i>
            AI Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
                <i className="fas fa-eye text-primary"></i>
              </div>
              <h4 className="font-medium mb-2">Smart OCR</h4>
              <p className="text-sm text-slate-400">
                Advanced text detection for Japanese, Korean, and Chinese manga panels
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-3">
                <i className="fas fa-language text-secondary"></i>
              </div>
              <h4 className="font-medium mb-2">Real-time Translation</h4>
              <p className="text-sm text-slate-400">
                Contextual translation overlays powered by OpenAI GPT-4
              </p>
            </div>
          </div>
        </div>
      </Card>

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-surface border-slate-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upload Manga Files</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpload(false)}
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
              <FileUpload onComplete={() => setShowUpload(false)} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
