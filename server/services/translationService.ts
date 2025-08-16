import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  confidence: number;
  context?: string;
}

export class TranslationService {
  async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string = 'English',
    quality: 'fast' | 'balanced' | 'premium' = 'balanced'
  ): Promise<TranslationResult> {
    try {
      const model = this.getModelForQuality(quality);
      
      const prompt = `You are a professional manga translator. Translate the following ${sourceLanguage} text to ${targetLanguage}. 
      
Consider manga-specific context including:
- Speech patterns and character personalities
- Cultural references and idioms  
- Onomatopoeia and sound effects
- Casual vs formal speech levels

Original text: "${text}"

Respond with JSON in this format:
{
  "translatedText": "your translation here",
  "confidence": 0.95,
  "context": "brief explanation of any cultural notes or translation choices"
}`;

      const response = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content!);

      return {
        originalText: text,
        translatedText: result.translatedText,
        confidence: Math.max(0, Math.min(1, result.confidence || 0.8)),
        context: result.context
      };
    } catch (error) {
      console.error('Translation failed:', error);
      throw new Error('Failed to translate text');
    }
  }

  async translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string = 'English',
    quality: 'fast' | 'balanced' | 'premium' = 'balanced'
  ): Promise<TranslationResult[]> {
    try {
      const model = this.getModelForQuality(quality);

      const prompt = `You are a professional manga translator. Translate these ${sourceLanguage} texts to ${targetLanguage}.
      
Consider manga context and maintain consistency across all translations.

Texts to translate:
${texts.map((text, i) => `${i + 1}. "${text}"`).join('\n')}

Respond with JSON array in this format:
{
  "translations": [
    {
      "translatedText": "translation 1",
      "confidence": 0.95,
      "context": "optional context"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content!);

      return texts.map((originalText, index) => ({
        originalText,
        translatedText: result.translations[index]?.translatedText || 'Translation failed',
        confidence: result.translations[index]?.confidence || 0.5,
        context: result.translations[index]?.context
      }));
    } catch (error) {
      console.error('Batch translation failed:', error);
      throw new Error('Failed to translate batch');
    }
  }

  private getModelForQuality(quality: 'fast' | 'balanced' | 'premium'): string {
    switch (quality) {
      case 'fast':
        return 'gpt-3.5-turbo';
      case 'premium':
        return 'gpt-4o';
      case 'balanced':
      default:
        return 'gpt-4o';
    }
  }
}

export const translationService = new TranslationService();
