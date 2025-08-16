interface TranslationOverlayProps {
  translation: {
    translatedText: string;
    confidence: number;
    context?: string;
  };
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export default function TranslationOverlay({ translation, position }: TranslationOverlayProps) {
  return (
    <div
      className="absolute bg-secondary/90 backdrop-blur-sm border border-secondary/50 rounded-lg px-3 py-2 text-white text-sm font-medium max-w-48 shadow-lg z-20 animate-in fade-in-0 zoom-in-95 duration-300"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        wordWrap: 'break-word',
      }}
    >
      <div className="relative">
        {translation.translatedText}
        
        {/* Confidence indicator */}
        <div
          className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-white/30"
          style={{
            backgroundColor: translation.confidence > 0.8 
              ? '#10B981' 
              : translation.confidence > 0.6 
              ? '#F59E0B' 
              : '#EF4444'
          }}
          title={`Confidence: ${Math.round(translation.confidence * 100)}%`}
        />
        
        {/* Context tooltip - shown on hover */}
        {translation.context && (
          <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-black/80 text-xs rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap z-30">
            {translation.context}
          </div>
        )}
      </div>
    </div>
  );
}
