import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Play, Database, Download } from 'lucide-react';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { id: 'home', path: '/', icon: Home, label: 'Home' },
    { id: 'library', path: '/library', icon: BookOpen, label: 'Library' },
    { id: 'anime', path: '/anime', icon: Play, label: 'Anime' },
    { id: 'repositories', path: '/repositories', icon: Database, label: 'Sources' },
    { id: 'downloads', path: '/downloads', icon: Download, label: 'Downloads' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-40 backdrop-blur-lg bg-card/80">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-lg hover:bg-muted transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}