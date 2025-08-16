import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Languages, Eye, EyeOff, Settings2 } from 'lucide-react';

interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  confidence: number;
  bbox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  fontSize?: number;
}

interface TranslationOverlayProps {
  translations: Translation[];
  visible: boolean;
  onToggleVisibility: () => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export default function TranslationOverlay({
  translations,
  visible,
  onToggleVisibility,
  opacity,
  onOpacityChange,
  fontSize,
  onFontSizeChange,
}: TranslationOverlayProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {/* Translation overlays */}
      {visible && (
        <div className="absolute inset-0 pointer-events-none">
          {translations.map((translation) => (
            <div
              key={translation.id}
              className="absolute bg-white text-black p-2 rounded shadow-lg border pointer-events-none"
              style={{
                left: `${translation.bbox.left}%`,
                top: `${translation.bbox.top}%`,
                width: `${translation.bbox.width}%`,
                minHeight: `${translation.bbox.height}%`,
                opacity: opacity / 100,
                fontSize: `${fontSize}px`,
                lineHeight: '1.2',
              }}
            >
              <div className="font-medium">
                {translation.translatedText}
              </div>
              {translation.confidence < 0.8 && (
                <Badge variant="secondary" className="text-xs mt-1">
                  Low confidence
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="fixed top-20 right-4 z-30 space-y-2">
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <Button
              variant={visible ? "default" : "outline"}
              size="sm"
              onClick={onToggleVisibility}
            >
              {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Settings panel */}
        {showSettings && (
          <Card className="p-4 w-64">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Translation Opacity
                </label>
                <Slider
                  value={[opacity]}
                  onValueChange={([value]) => onOpacityChange(value)}
                  min={10}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {opacity}%
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Font Size
                </label>
                <Slider
                  value={[fontSize]}
                  onValueChange={([value]) => onFontSizeChange(value)}
                  min={8}
                  max={24}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {fontSize}px
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <Languages className="w-3 h-3" />
                  <span>{translations.length} translations</span>
                </div>
                <div>
                  Avg confidence: {
                    Math.round(
                      translations.reduce((sum, t) => sum + t.confidence, 0) / translations.length * 100
                    )
                  }%
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}