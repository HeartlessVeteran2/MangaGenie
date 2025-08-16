import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { ocrService } from "./services/ocrService";
import { translationService } from "./services/translationService";
import { 
  insertMangaSchema, 
  insertMediaSchema,
  insertEpisodeSchema,
  insertChapterSchema, 
  insertPageSchema, 
  insertSourceSchema,
  insertCollectionSchema,
  insertUserSettingsSchema 
} from "@shared/schema";
import { animeService } from "./services/animeService";
import { colorExtractionService } from "./services/colorExtractionService";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // === UNIFIED MEDIA API (Manga + Anime) ===
  
  // Get user's media library with optional type filtering
  app.get("/api/media", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const type = req.query.type as 'manga' | 'anime' | undefined;
      const mediaList = await storage.getMediaByUserId(userId, type);
      res.json(mediaList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media library" });
    }
  });

  // Search media library
  app.get("/api/media/search", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      const results = await storage.searchMedia(query, userId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Create new media entry
  app.post("/api/media", upload.single('coverImage'), async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      let mediaData = insertMediaSchema.parse({ ...req.body, userId });
      
      // Extract colors from cover image if provided
      if (req.file) {
        const colors = await colorExtractionService.extractColorsFromImage(req.file.buffer);
        mediaData = { ...mediaData, colorPalette: colors };
      } else if (mediaData.coverImageUrl) {
        const colors = await colorExtractionService.extractColorsFromUrl(mediaData.coverImageUrl);
        mediaData = { ...mediaData, colorPalette: colors };
      }
      
      const media = await storage.createMedia(mediaData);
      res.json(media);
    } catch (error) {
      res.status(400).json({ error: "Invalid media data" });
    }
  });

  // Get specific media item
  app.get("/api/media/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const media = await storage.getMediaById(id);
      if (!media) {
        return res.status(404).json({ error: "Media not found" });
      }
      res.json(media);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  // Update media progress and info
  app.put("/api/media/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const media = await storage.updateMedia(id, updates);
      if (!media) {
        return res.status(404).json({ error: "Media not found" });
      }
      res.json(media);
    } catch (error) {
      res.status(500).json({ error: "Failed to update media" });
    }
  });

  // Delete media
  app.delete("/api/media/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMedia(id);
      if (!deleted) {
        return res.status(404).json({ error: "Media not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete media" });
    }
  });

  // === ANIME SPECIFIC API ===
  
  // Search anime from external sources
  app.get("/api/anime/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      
      const filters = {
        genre: req.query.genre ? (req.query.genre as string).split(',') : undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        status: req.query.status as string,
        format: req.query.format as string,
        isAdult: req.query.isAdult === 'true'
      };
      
      const results = await animeService.searchAnime(query, filters);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Anime search failed" });
    }
  });

  // Get trending anime
  app.get("/api/anime/trending", async (req, res) => {
    try {
      const trending = await animeService.getTrendingAnime();
      res.json(trending);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trending anime" });
    }
  });

  // Get popular anime by season/year
  app.get("/api/anime/popular", async (req, res) => {
    try {
      const season = req.query.season as string;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const popular = await animeService.getPopularAnime(season, year);
      res.json(popular);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popular anime" });
    }
  });

  // Get anime info by ID
  app.get("/api/anime/:id/info", async (req, res) => {
    try {
      const { id } = req.params;
      const animeInfo = await animeService.getAnimeInfo(id);
      if (!animeInfo) {
        return res.status(404).json({ error: "Anime not found" });
      }
      res.json(animeInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch anime info" });
    }
  });

  // Get anime episodes
  app.get("/api/anime/:id/episodes", async (req, res) => {
    try {
      const { id } = req.params;
      const episodes = await animeService.getAnimeEpisodes(id);
      res.json(episodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch episodes" });
    }
  });

  // Get video sources for episode
  app.get("/api/anime/:id/episodes/:episodeNumber/sources", async (req, res) => {
    try {
      const { id, episodeNumber } = req.params;
      const sources = await animeService.getVideoSources(id, parseInt(episodeNumber));
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch video sources" });
    }
  });

  // Get subtitles for episode
  app.get("/api/anime/:id/episodes/:episodeNumber/subtitles", async (req, res) => {
    try {
      const { id, episodeNumber } = req.params;
      const subtitles = await animeService.getSubtitles(id, parseInt(episodeNumber));
      res.json(subtitles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subtitles" });
    }
  });

  // === EPISODE MANAGEMENT (for user's anime library) ===

  // Get user's episode progress for a media item
  app.get("/api/media/:id/episodes", async (req, res) => {
    try {
      const { id } = req.params;
      const episodes = await storage.getEpisodesByMediaId(id);
      res.json(episodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch episodes" });
    }
  });

  // Create/update episode progress
  app.post("/api/media/:id/episodes", async (req, res) => {
    try {
      const { id } = req.params;
      const episodeData = insertEpisodeSchema.parse({ ...req.body, mediaId: id });
      const episode = await storage.createEpisode(episodeData);
      res.json(episode);
    } catch (error) {
      res.status(400).json({ error: "Invalid episode data" });
    }
  });

  // Update episode watch progress
  app.put("/api/episodes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const episode = await storage.updateEpisode(id, updates);
      if (!episode) {
        return res.status(404).json({ error: "Episode not found" });
      }
      res.json(episode);
    } catch (error) {
      res.status(500).json({ error: "Failed to update episode" });
    }
  });

  // === SOURCES MANAGEMENT ===

  // Get available sources
  app.get("/api/sources", async (req, res) => {
    try {
      const type = req.query.type as 'manga' | 'anime' | undefined;
      const sources = await storage.getSources(type);
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sources" });
    }
  });

  // Add new source
  app.post("/api/sources", async (req, res) => {
    try {
      const sourceData = insertSourceSchema.parse(req.body);
      const source = await storage.createSource(sourceData);
      res.json(source);
    } catch (error) {
      res.status(400).json({ error: "Invalid source data" });
    }
  });

  // === COLLECTIONS MANAGEMENT ===

  // Get user collections
  app.get("/api/collections", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const collections = await storage.getCollectionsByUserId(userId);
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  // Create new collection
  app.post("/api/collections", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const collectionData = insertCollectionSchema.parse({ ...req.body, userId });
      const collection = await storage.createCollection(collectionData);
      res.json(collection);
    } catch (error) {
      res.status(400).json({ error: "Invalid collection data" });
    }
  });

  // Get user's manga library
  app.get("/api/manga", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const mangaList = await storage.getMangaByUserId(userId);
      res.json(mangaList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch manga library" });
    }
  });

  // Create new manga entry
  app.post("/api/manga", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const mangaData = insertMangaSchema.parse({ ...req.body, userId });
      const manga = await storage.createManga(mangaData);
      res.json(manga);
    } catch (error) {
      res.status(400).json({ error: "Invalid manga data" });
    }
  });

  // Update manga progress
  app.put("/api/manga/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const manga = await storage.updateManga(id, updates);
      if (!manga) {
        return res.status(404).json({ error: "Manga not found" });
      }
      res.json(manga);
    } catch (error) {
      res.status(500).json({ error: "Failed to update manga" });
    }
  });

  // Get manga chapters
  app.get("/api/manga/:id/chapters", async (req, res) => {
    try {
      const { id } = req.params;
      const chapters = await storage.getChaptersByMangaId(id);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chapters" });
    }
  });

  // Create new chapter
  app.post("/api/manga/:id/chapters", async (req, res) => {
    try {
      const { id: mangaId } = req.params;
      const chapterData = insertChapterSchema.parse({ ...req.body, mangaId });
      const chapter = await storage.createChapter(chapterData);
      res.json(chapter);
    } catch (error) {
      res.status(400).json({ error: "Invalid chapter data" });
    }
  });

  // Get chapter pages
  app.get("/api/chapters/:id/pages", async (req, res) => {
    try {
      const { id } = req.params;
      const pages = await storage.getPagesByChapterId(id);
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  // Upload and process manga page
  app.post("/api/chapters/:id/pages", upload.single('image'), async (req, res) => {
    try {
      const { id: chapterId } = req.params;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const { pageNumber } = req.body;
      
      // For demo purposes, we'll store the image as a data URL
      const imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const pageData = insertPageSchema.parse({
        chapterId,
        pageNumber: parseInt(pageNumber),
        imageUrl
      });

      const page = await storage.createPage(pageData);
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload page" });
    }
  });

  // Process OCR on a page
  app.post("/api/pages/:id/ocr", async (req, res) => {
    try {
      const { id } = req.params;
      const { language = 'jpn+eng' } = req.body;
      
      const page = await storage.getPageById(id);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }

      // Extract image buffer from data URL
      const base64Data = page.imageUrl.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');

      const ocrResults = await ocrService.processImage(imageBuffer, language);
      
      // Update page with OCR data
      await storage.updatePage(id, { ocrData: ocrResults });

      res.json({ ocrResults });
    } catch (error) {
      console.error('OCR processing error:', error);
      res.status(500).json({ error: "Failed to process OCR" });
    }
  });

  // Translate OCR text
  app.post("/api/pages/:id/translate", async (req, res) => {
    try {
      const { id } = req.params;
      const { sourceLanguage, targetLanguage = 'English', quality = 'balanced' } = req.body;

      const page = await storage.getPageById(id);
      if (!page || !page.ocrData) {
        return res.status(404).json({ error: "Page or OCR data not found" });
      }

      const ocrResults = page.ocrData as any[];
      const texts = ocrResults.map(result => result.text);

      const translations = await translationService.translateBatch(
        texts,
        sourceLanguage,
        targetLanguage,
        quality
      );

      // Combine OCR and translation data
      const translatedResults = ocrResults.map((ocr, index) => ({
        ...ocr,
        translation: translations[index]
      }));

      // Update page with translation data
      await storage.updatePage(id, { translations: translatedResults });

      res.json({ translations: translatedResults });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: "Failed to translate text" });
    }
  });

  // Get user settings
  app.get("/api/settings", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      let settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        // Create default settings
        const defaultSettings = insertUserSettingsSchema.parse({ userId });
        settings = await storage.createUserSettings(defaultSettings);
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update user settings
  app.put("/api/settings", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const updates = req.body;
      
      const settings = await storage.updateUserSettings(userId, updates);
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Batch file upload for manga
  app.post("/api/manga/upload", upload.array('images', 50), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { title, originalLanguage, targetLanguage } = req.body;
      const userId = req.headers['x-user-id'] as string || 'demo-user';

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      // Create manga entry
      const manga = await storage.createManga({
        userId,
        title,
        originalLanguage: originalLanguage || 'Japanese',
        targetLanguage: targetLanguage || 'English',
        totalChapters: 1
      });

      // Create chapter
      const chapter = await storage.createChapter({
        mangaId: manga.id,
        chapterNumber: 1,
        title: "Chapter 1",
        totalPages: files.length
      });

      // Process files and create pages
      const pages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        
        const page = await storage.createPage({
          chapterId: chapter.id,
          pageNumber: i + 1,
          imageUrl
        });
        
        pages.push(page);
      }

      res.json({
        manga,
        chapter,
        pages: pages.length,
        message: "Files uploaded successfully"
      });
    } catch (error) {
      console.error('Batch upload error:', error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
