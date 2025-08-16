import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import LanguageModal from "@/components/modals/language-modal";

export default function AppHeader() {
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const getLanguageDisplay = (langPair: string) => {
    const pairs: Record<string, string> = {
      'jp-en': 'JP→EN',
      'kr-en': 'KR→EN',
      'cn-en': 'CN→EN',
    };
    return pairs[langPair] || 'JP→EN';
  };

  return (
    <>
      <header className="bg-surface border-b border-slate-700 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <i className="fas fa-book-open text-primary text-xl"></i>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MangaAI
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Language selector */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLanguageModal(true)}
              className="bg-slate-700 hover:bg-slate-600 text-sm flex items-center space-x-2"
            >
              <span>{getLanguageDisplay(settings?.defaultLanguagePair || 'jp-en')}</span>
              <i className="fas fa-chevron-down text-xs"></i>
            </Button>
            
            {/* AI Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-slate-400">AI Ready</span>
            </div>
            
            {/* Profile */}
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center"
            >
              <i className="fas fa-user text-white text-sm"></i>
            </Button>
          </div>
        </div>
      </header>

      <LanguageModal 
        open={showLanguageModal}
        onOpenChange={setShowLanguageModal}
      />
    </>
  );
}
