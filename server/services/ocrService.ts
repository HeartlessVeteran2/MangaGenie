import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

export class OCRService {
  async processImage(imageBuffer: Buffer, language: string = 'jpn+eng'): Promise<OCRResult[]> {
    try {
      const { data } = await Tesseract.recognize(imageBuffer, language, {
        logger: m => console.log(m)
      });

      const results: OCRResult[] = [];
      
      // Process paragraphs (speech bubbles)
      for (const paragraph of data.paragraphs) {
        if (paragraph.confidence > 50 && paragraph.text.trim()) {
          const words = paragraph.words.map(word => ({
            text: word.text,
            confidence: word.confidence,
            bbox: word.bbox
          }));

          results.push({
            text: paragraph.text.trim(),
            confidence: paragraph.confidence,
            bbox: paragraph.bbox,
            words
          });
        }
      }

      return results;
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('Failed to process OCR');
    }
  }

  async detectTextRegions(imageBuffer: Buffer): Promise<Array<{ x: number, y: number, width: number, height: number }>> {
    try {
      const { data } = await Tesseract.recognize(imageBuffer, 'jpn+eng', {
        logger: m => console.log(m)
      });

      return data.paragraphs
        .filter(p => p.confidence > 50)
        .map(p => ({
          x: p.bbox.x0,
          y: p.bbox.y0,
          width: p.bbox.x1 - p.bbox.x0,
          height: p.bbox.y1 - p.bbox.y0
        }));
    } catch (error) {
      console.error('Text region detection failed:', error);
      throw new Error('Failed to detect text regions');
    }
  }
}

export const ocrService = new OCRService();
