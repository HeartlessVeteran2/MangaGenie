import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { id: 'home', path: '/', icon: 'fas fa-home', label: 'Home' },
    { id: 'library', path: '/library', icon: 'fas fa-book', label: 'Library' },
    { id: 'translations', path: '/translations', icon: 'fas fa-language', label: 'Translations' },
    { id: 'settings', path: '/settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-slate-700 px-4 py-2 z-40">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <i className={`${item.icon} text-lg`}></i>
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
