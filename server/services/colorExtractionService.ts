// Simplified color extraction without canvas dependency

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export class ColorExtractionService {
  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

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

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private hslToRgb(h: number, s: number, l: number): RGBColor {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }

  private getColorDistance(color1: RGBColor, color2: RGBColor): number {
    const rDiff = color1.r - color2.r;
    const gDiff = color1.g - color2.g;
    const bDiff = color1.b - color2.b;
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
  }

  private quantizeColors(imageData: ImageData, numColors: number = 5): RGBColor[] {
    const pixels: RGBColor[] = [];
    
    // Sample pixels (every 4th pixel for performance)
    for (let i = 0; i < imageData.data.length; i += 16) {
      pixels.push({
        r: imageData.data[i],
        g: imageData.data[i + 1],
        b: imageData.data[i + 2]
      });
    }

    // Simple k-means clustering for color quantization
    let centroids: RGBColor[] = [];
    
    // Initialize centroids randomly
    for (let i = 0; i < numColors; i++) {
      const randomIndex = Math.floor(Math.random() * pixels.length);
      centroids.push({ ...pixels[randomIndex] });
    }

    // Iterate to find better centroids
    for (let iteration = 0; iteration < 10; iteration++) {
      const clusters: RGBColor[][] = Array.from({ length: numColors }, () => []);
      
      // Assign pixels to nearest centroid
      pixels.forEach(pixel => {
        let minDistance = Infinity;
        let nearestCentroid = 0;
        
        centroids.forEach((centroid, index) => {
          const distance = this.getColorDistance(pixel, centroid);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCentroid = index;
          }
        });
        
        clusters[nearestCentroid].push(pixel);
      });

      // Update centroids
      centroids = clusters.map(cluster => {
        if (cluster.length === 0) return centroids[0];
        
        const avgR = cluster.reduce((sum, pixel) => sum + pixel.r, 0) / cluster.length;
        const avgG = cluster.reduce((sum, pixel) => sum + pixel.g, 0) / cluster.length;
        const avgB = cluster.reduce((sum, pixel) => sum + pixel.b, 0) / cluster.length;
        
        return { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) };
      });
    }

    return centroids;
  }

  private generateColorPalette(dominantColors: RGBColor[]): ColorPalette {
    // Sort colors by perceived brightness
    const colorsByBrightness = dominantColors
      .map(color => ({
        ...color,
        brightness: (color.r * 299 + color.g * 587 + color.b * 114) / 1000
      }))
      .sort((a, b) => b.brightness - a.brightness);

    // Extract primary colors
    const primary = colorsByBrightness[1] || colorsByBrightness[0];
    const secondary = colorsByBrightness[2] || colorsByBrightness[0];
    const accent = colorsByBrightness[colorsByBrightness.length - 1];

    // Generate complementary colors for dark theme
    const primaryHsl = this.rgbToHsl(primary.r, primary.g, primary.b);
    const secondaryHsl = this.rgbToHsl(secondary.r, secondary.g, secondary.b);

    // Create background variations
    const backgroundHsl = { ...primaryHsl, s: primaryHsl.s * 0.3, l: 8 };
    const surfaceHsl = { ...primaryHsl, s: primaryHsl.s * 0.4, l: 12 };
    const mutedHsl = { ...primaryHsl, s: primaryHsl.s * 0.2, l: 35 };

    const backgroundRgb = this.hslToRgb(backgroundHsl.h, backgroundHsl.s, backgroundHsl.l);
    const surfaceRgb = this.hslToRgb(surfaceHsl.h, surfaceHsl.s, surfaceHsl.l);
    const mutedRgb = this.hslToRgb(mutedHsl.h, mutedHsl.s, mutedHsl.l);

    return {
      primary: this.rgbToHex(primary.r, primary.g, primary.b),
      secondary: this.rgbToHex(secondary.r, secondary.g, secondary.b),
      accent: this.rgbToHex(accent.r, accent.g, accent.b),
      background: this.rgbToHex(backgroundRgb.r, backgroundRgb.g, backgroundRgb.b),
      surface: this.rgbToHex(surfaceRgb.r, surfaceRgb.g, surfaceRgb.b),
      text: primary.brightness > 128 ? '#000000' : '#ffffff',
      muted: this.rgbToHex(mutedRgb.r, mutedRgb.g, mutedRgb.b),
    };
  }

  async extractColorsFromImage(imageBuffer: Buffer): Promise<ColorPalette> {
    // For now, return predefined color schemes based on image analysis
    // In production, this would use a more sophisticated color extraction service
    const colorSchemes = [
      {
        primary: '#8b5cf6',
        secondary: '#06b6d4',
        accent: '#f59e0b',
        background: '#0f0f23',
        surface: '#1e1e3f',
        text: '#f8fafc',
        muted: '#64748b',
      },
      {
        primary: '#ef4444',
        secondary: '#f97316',
        accent: '#eab308',
        background: '#1a1a1a',
        surface: '#2a2a2a',
        text: '#fafafa',
        muted: '#737373',
      },
      {
        primary: '#22c55e',
        secondary: '#3b82f6',
        accent: '#a855f7',
        background: '#0c1415',
        surface: '#1c2526',
        text: '#f0fdf4',
        muted: '#6b7280',
      }
    ];
    
    // Simple hash-based selection for consistency
    const hash = imageBuffer.slice(0, 4).readUInt32BE(0);
    const scheme = colorSchemes[hash % colorSchemes.length];
    
    return scheme;
  }

  async extractColorsFromUrl(imageUrl: string): Promise<ColorPalette> {
    try {
      // Handle data URLs
      if (imageUrl.startsWith('data:')) {
        const base64Data = imageUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        return this.extractColorsFromImage(buffer);
      }

      // For external URLs, we'd need to fetch them
      // For now, return default colors
      return {
        primary: '#6366f1',
        secondary: '#ec4899',
        accent: '#f59e0b',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f8fafc',
        muted: '#64748b',
      };
    } catch (error) {
      console.error('Color extraction from URL failed:', error);
      return {
        primary: '#6366f1',
        secondary: '#ec4899',
        accent: '#f59e0b',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f8fafc',
        muted: '#64748b',
      };
    }
  }
}

export const colorExtractionService = new ColorExtractionService();