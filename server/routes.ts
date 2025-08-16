import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { googleCloudService } from "./services/googleCloudService";
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
  insertUserSettingsSchema,
  insertRepositorySchema,
  insertSkipMarkerSchema,
  insertReadingBookmarkSchema,
  insertSyncServiceSchema,
  insertSyncMappingSchema,
  insertGalleryPresetSchema,
  insertPlayerStateSchema,
  insertDownloadSchema,
  insertCommentSchema
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
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
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

  // === ADVANCED FEATURES: REPOSITORY MANAGEMENT ===
  
  // Get all repositories with filtering
  app.get("/api/repositories", async (req, res) => {
    try {
      const type = req.query.type as 'manga' | 'anime' | 'mixed' | undefined;
      const repositories = await storage.getRepositories(type);
      res.json(repositories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repositories" });
    }
  });

  // Add new repository
  app.post("/api/repositories", async (req, res) => {
    try {
      const validatedData = insertRepositorySchema.parse(req.body);
      const repository = await storage.createRepository(validatedData);
      res.status(201).json(repository);
    } catch (error) {
      res.status(400).json({ error: "Failed to create repository" });
    }
  });

  // Update repository
  app.patch("/api/repositories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const repository = await storage.updateRepository(id, req.body);
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }
      res.json(repository);
    } catch (error) {
      res.status(500).json({ error: "Failed to update repository" });
    }
  });

  // Delete repository
  app.delete("/api/repositories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRepository(id);
      if (!deleted) {
        return res.status(404).json({ error: "Repository not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete repository" });
    }
  });

  // === ADVANCED FEATURES: SKIP DETECTION (VLC-LIKE) ===
  
  // Get skip markers for episode
  app.get("/api/episodes/:episodeId/skip-markers", async (req, res) => {
    try {
      const { episodeId } = req.params;
      const markers = await storage.getSkipMarkersByEpisodeId(episodeId);
      res.json(markers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch skip markers" });
    }
  });

  // Create skip marker (auto-detected or manual)
  app.post("/api/skip-markers", async (req, res) => {
    try {
      const validatedData = insertSkipMarkerSchema.parse(req.body);
      const marker = await storage.createSkipMarker(validatedData);
      res.status(201).json(marker);
    } catch (error) {
      res.status(400).json({ error: "Failed to create skip marker" });
    }
  });

  // Vote on skip marker accuracy
  app.patch("/api/skip-markers/:id/vote", async (req, res) => {
    try {
      const { id } = req.params;
      const { vote } = req.body; // 1 for upvote, -1 for downvote
      
      const existing = await storage.getSkipMarkerById?.(id);
      if (!existing) {
        return res.status(404).json({ error: "Skip marker not found" });
      }

      const updatedVotes = (existing.votes || 0) + vote;
      const marker = await storage.updateSkipMarker(id, { votes: updatedVotes });
      res.json(marker);
    } catch (error) {
      res.status(500).json({ error: "Failed to vote on skip marker" });
    }
  });

  // === ADVANCED FEATURES: GALLERY AND READING SYSTEM ===
  
  // Get reading bookmarks for user
  app.get("/api/reading/bookmarks", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const bookmarks = await storage.getReadingBookmarksByUserId(userId);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reading bookmarks" });
    }
  });

  // Create/Update reading bookmark
  app.post("/api/reading/bookmarks", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const validatedData = insertReadingBookmarkSchema.parse({
        ...req.body,
        userId
      });

      // Check if bookmark already exists for this chapter
      const existing = await storage.getReadingBookmarkByChapter(userId, validatedData.chapterId);
      
      if (existing) {
        const updated = await storage.updateReadingBookmark(existing.id, validatedData);
        res.json(updated);
      } else {
        const bookmark = await storage.createReadingBookmark(validatedData);
        res.status(201).json(bookmark);
      }
    } catch (error) {
      res.status(400).json({ error: "Failed to save reading bookmark" });
    }
  });

  // Gallery presets management
  app.get("/api/gallery/presets", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const presets = await storage.getGalleryPresetsByUserId(userId);
      res.json(presets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery presets" });
    }
  });

  app.post("/api/gallery/presets", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const validatedData = insertGalleryPresetSchema.parse({
        ...req.body,
        userId
      });
      const preset = await storage.createGalleryPreset(validatedData);
      res.status(201).json(preset);
    } catch (error) {
      res.status(400).json({ error: "Failed to create gallery preset" });
    }
  });

  // === ADVANCED FEATURES: VLC-LIKE PLAYER CONTROLS ===
  
  // Get/Update player state for episode
  app.get("/api/player/:episodeId/state", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const { episodeId } = req.params;
      const state = await storage.getPlayerState(userId, episodeId);
      res.json(state || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch player state" });
    }
  });

  app.post("/api/player/:episodeId/state", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const { episodeId } = req.params;
      
      const state = await storage.updatePlayerState(userId, episodeId, req.body);
      res.json(state);
    } catch (error) {
      res.status(500).json({ error: "Failed to update player state" });
    }
  });

  // === ADVANCED FEATURES: SYNC SERVICES ===
  
  // Get user's sync services
  app.get("/api/sync/services", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const services = await storage.getSyncServicesByUserId(userId);
      // Remove sensitive tokens from response
      const sanitized = services.map(service => ({
        ...service,
        accessToken: service.accessToken ? '[REDACTED]' : null,
        refreshToken: service.refreshToken ? '[REDACTED]' : null
      }));
      res.json(sanitized);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sync services" });
    }
  });

  // Add sync service (MAL, AniList, etc.)
  app.post("/api/sync/services", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const validatedData = insertSyncServiceSchema.parse({
        ...req.body,
        userId
      });
      const service = await storage.createSyncService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ error: "Failed to create sync service" });
    }
  });

  // Update sync service
  app.patch("/api/sync/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const service = await storage.updateSyncService(id, req.body);
      if (!service) {
        return res.status(404).json({ error: "Sync service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sync service" });
    }
  });

  // Sync media with external service
  app.post("/api/sync/:serviceId/media/:mediaId", async (req, res) => {
    try {
      const { serviceId, mediaId } = req.params;
      const { externalId } = req.body;
      
      const mapping = await storage.createSyncMapping({
        mediaId,
        syncServiceId: serviceId,
        externalId
      });
      
      res.status(201).json(mapping);
    } catch (error) {
      res.status(400).json({ error: "Failed to create sync mapping" });
    }
  });

  // === ADVANCED FEATURES: DOWNLOAD MANAGEMENT ===
  
  // Get user's downloads
  app.get("/api/downloads", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const downloads = await storage.getDownloadsByUserId(userId);
      res.json(downloads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch downloads" });
    }
  });

  // Start download
  app.post("/api/downloads", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const validatedData = insertDownloadSchema.parse({
        ...req.body,
        userId
      });
      const download = await storage.createDownload(validatedData);
      res.status(201).json(download);
    } catch (error) {
      res.status(400).json({ error: "Failed to start download" });
    }
  });

  // Update download progress
  app.patch("/api/downloads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const download = await storage.updateDownload(id, req.body);
      if (!download) {
        return res.status(404).json({ error: "Download not found" });
      }
      res.json(download);
    } catch (error) {
      res.status(500).json({ error: "Failed to update download" });
    }
  });

  // Cancel download
  app.delete("/api/downloads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDownload(id);
      if (!deleted) {
        return res.status(404).json({ error: "Download not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel download" });
    }
  });

  // === ADVANCED FEATURES: COMMENTS AND COMMUNITY ===
  
  // Get comments for media/chapter/episode
  app.get("/api/comments", async (req, res) => {
    try {
      const { mediaId, chapterId, episodeId } = req.query;
      
      let comments = [];
      if (mediaId) {
        comments = await storage.getCommentsByMediaId(mediaId as string);
      } else if (chapterId) {
        comments = await storage.getCommentsByChapterId(chapterId as string);
      } else if (episodeId) {
        comments = await storage.getCommentsByEpisodeId(episodeId as string);
      }
      
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Create comment
  app.post("/api/comments", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        userId
      });
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: "Failed to create comment" });
    }
  });

  // Update comment
  app.patch("/api/comments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const comment = await storage.updateComment(id, req.body);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update comment" });
    }
  });

  // Delete comment
  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteComment(id);
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
