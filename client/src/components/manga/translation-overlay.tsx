import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface Translation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalText: string;
  translatedText: string;
  confidence: number;
  visible: boolean;
}

interface TranslationOverlayProps {
  translations: Translation[];
  showBoundaries?: boolean;
}

export default function TranslationOverlay({
  translations = [],
  showBoundaries = false,
}: TranslationOverlayProps) {
  const [hiddenTranslations, setHiddenTranslations] = useState<Set<string>>(new Set());

  const toggleTranslation = (id: string) => {
    const newHidden = new Set(hiddenTranslations);
    if (newHidden.has(id)) {
      newHidden.delete(id);
    } else {
      newHidden.add(id);
    }
    setHiddenTranslations(newHidden);
  };

  if (!translations || translations.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {translations.map((translation) => {
        const isHidden = hiddenTranslations.has(translation.id);
        
        return (
          <div
            key={translation.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${translation.x}px`,
              top: `${translation.y}px`,
              width: `${translation.width}px`,
              height: `${translation.height}px`,
            }}
          >
            {/* Original Text Boundary */}
            {showBoundaries && (
              <div
                className="absolute inset-0 border-2 border-red-500 bg-red-500/10"
                style={{ zIndex: 1 }}
              />
            )}

            {/* Translation Card */}
            {!isHidden && translation.translatedText && (
              <Card
                className="absolute bg-white/95 dark:bg-gray-900/95 p-2 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 min-w-max max-w-xs"
                style={{
                  zIndex: 10,
                  // Position the translation bubble optimally
                  top: translation.height < 30 ? '100%' : '0',
                  left: translation.width > 200 ? '0' : translation.width < 100 ? '-50%' : '-25%',
                  marginTop: translation.height < 30 ? '4px' : '0',
                }}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                  {translation.translatedText}
                </div>
                
                {/* Confidence indicator */}
                {translation.confidence < 0.8 && (
                  <div className="text-xs text-orange-500 mt-1">
                    Low confidence ({Math.round(translation.confidence * 100)}%)
                  </div>
                )}

                {/* Original text on hover */}
                {showBoundaries && translation.originalText && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 border-t pt-1">
                    Original: {translation.originalText}
                  </div>
                )}
              </Card>
            )}

            {/* Toggle Button */}
            <Button
              size="sm"
              variant="secondary"
              className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800"
              onClick={() => toggleTranslation(translation.id)}
              style={{ zIndex: 20 }}
            >
              {isHidden ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
            </Button>

            {/* Hidden state indicator */}
            {isHidden && (
              <div
                className="absolute inset-0 bg-gray-500/20 border border-gray-400 border-dashed flex items-center justify-center"
                style={{ zIndex: 5 }}
              >
                <Eye className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>
        );
      })}

      {/* Global Controls */}
      {translations.length > 0 && (
        <div className="absolute top-4 left-4 flex gap-2 pointer-events-auto">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/80 dark:bg-gray-800/80"
            onClick={() => setHiddenTranslations(new Set())}
          >
            Show All
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/80 dark:bg-gray-800/80"
            onClick={() => setHiddenTranslations(new Set(translations.map(t => t.id)))}
          >
            Hide All
          </Button>
        </div>
      )}

      {/* Translation Stats */}
      {showBoundaries && translations.length > 0 && (
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <Card className="bg-white/90 dark:bg-gray-900/90 p-2">
            <div className="text-sm space-y-1">
              <div>Translations: {translations.length}</div>
              <div>Hidden: {hiddenTranslations.size}</div>
              <div>
                Avg. Confidence:{' '}
                {Math.round(
                  translations.reduce((acc, t) => acc + t.confidence, 0) / translations.length * 100
                )}%
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}