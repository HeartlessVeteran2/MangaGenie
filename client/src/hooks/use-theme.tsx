import { useState, useEffect, createContext, useContext } from 'react';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
}

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  dynamicColors: boolean;
  toggleDynamicColors: () => void;
  currentPalette: ColorPalette | null;
  setCurrentPalette: (palette: ColorPalette | null) => void;
  applyPalette: (palette: ColorPalette) => void;
  resetPalette: () => void;
}

const defaultPalette: ColorPalette = {
  primary: '#6366f1',
  secondary: '#ec4899',
  accent: '#f59e0b',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  muted: '#64748b',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [dynamicColors, setDynamicColors] = useState(true);
  const [currentPalette, setCurrentPalette] = useState<ColorPalette | null>(null);

  useEffect(() => {
    // Load theme preferences from localStorage
    const savedTheme = localStorage.getItem('theme');
    const savedDynamicColors = localStorage.getItem('dynamicColors');
    
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
    
    if (savedDynamicColors) {
      setDynamicColors(savedDynamicColors === 'true');
    }
  }, []);

  useEffect(() => {
    // Apply theme class to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('dynamicColors', dynamicColors.toString());
  }, [dynamicColors]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleDynamicColors = () => {
    setDynamicColors(!dynamicColors);
    if (!dynamicColors) {
      resetPalette();
    }
  };

  const applyPalette = (palette: ColorPalette) => {
    if (!dynamicColors) return;
    
    const root = document.documentElement;
    
    // Apply CSS custom properties for dynamic theming
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-secondary', palette.secondary);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-background', palette.background);
    root.style.setProperty('--color-surface', palette.surface);
    root.style.setProperty('--color-text', palette.text);
    root.style.setProperty('--color-muted', palette.muted);
    
    // Update Tailwind-compatible variables
    const hslPrimary = hexToHsl(palette.primary);
    const hslSecondary = hexToHsl(palette.secondary);
    const hslAccent = hexToHsl(palette.accent);
    const hslBackground = hexToHsl(palette.background);
    const hslSurface = hexToHsl(palette.surface);
    const hslText = hexToHsl(palette.text);
    const hslMuted = hexToHsl(palette.muted);
    
    root.style.setProperty('--primary', `${hslPrimary.h} ${hslPrimary.s}% ${hslPrimary.l}%`);
    root.style.setProperty('--secondary', `${hslSecondary.h} ${hslSecondary.s}% ${hslSecondary.l}%`);
    root.style.setProperty('--accent', `${hslAccent.h} ${hslAccent.s}% ${hslAccent.l}%`);
    root.style.setProperty('--background', `${hslBackground.h} ${hslBackground.s}% ${hslBackground.l}%`);
    root.style.setProperty('--card', `${hslSurface.h} ${hslSurface.s}% ${hslSurface.l}%`);
    root.style.setProperty('--foreground', `${hslText.h} ${hslText.s}% ${hslText.l}%`);
    root.style.setProperty('--muted', `${hslMuted.h} ${hslMuted.s}% ${hslMuted.l}%`);
    
    setCurrentPalette(palette);
  };

  const resetPalette = () => {
    const root = document.documentElement;
    
    // Remove custom properties
    const properties = [
      '--color-primary', '--color-secondary', '--color-accent',
      '--color-background', '--color-surface', '--color-text', '--color-muted',
      '--primary', '--secondary', '--accent', '--background', '--card', '--foreground', '--muted'
    ];
    
    properties.forEach(prop => {
      root.style.removeProperty(prop);
    });
    
    setCurrentPalette(null);
  };

  const value = {
    isDark,
    toggleTheme,
    dynamicColors,
    toggleDynamicColors,
    currentPalette,
    setCurrentPalette,
    applyPalette,
    resetPalette,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}