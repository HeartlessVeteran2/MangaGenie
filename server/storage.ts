import { 
  type User, 
  type Media,
  type Manga, 
  type Episode,
  type Chapter, 
  type Page, 
  type Source,
  type Collection,
  type UserSettings,
  type Repository,
  type SkipMarker,
  type ReadingBookmark,
  type SyncService,
  type SyncMapping,
  type GalleryPreset,
  type PlayerState,
  type Download,
  type Comment,
  type InsertUser,
  type InsertMedia,
  type InsertManga,
  type InsertEpisode,
  type InsertChapter,
  type InsertPage,
  type InsertSource,
  type InsertCollection,
  type InsertUserSettings,
  type InsertRepository,
  type InsertSkipMarker,
  type InsertReadingBookmark,
  type InsertSyncService,
  type InsertSyncMapping,
  type InsertGalleryPreset,
  type InsertPlayerState,
  type InsertDownload,
  type InsertComment
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Unified Media management (manga + anime)
  getMediaByUserId(userId: string, type?: 'manga' | 'anime'): Promise<Media[]>;
  getMediaById(id: string): Promise<Media | undefined>;
  createMedia(media: InsertMedia): Promise<Media>;
  updateMedia(id: string, media: Partial<Media>): Promise<Media | undefined>;
  deleteMedia(id: string): Promise<boolean>;
  searchMedia(query: string, userId: string): Promise<Media[]>;

  // Legacy Manga management (for backwards compatibility)
  getMangaByUserId(userId: string): Promise<Manga[]>;
  getMangaById(id: string): Promise<Manga | undefined>;
  createManga(manga: InsertManga): Promise<Manga>;
  updateManga(id: string, manga: Partial<Manga>): Promise<Manga | undefined>;
  deleteManga(id: string): Promise<boolean>;

  // Episode management (for anime)
  getEpisodesByMediaId(mediaId: string): Promise<Episode[]>;
  getEpisodeById(id: string): Promise<Episode | undefined>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;
  updateEpisode(id: string, episode: Partial<Episode>): Promise<Episode | undefined>;

  // Chapter management (for manga)
  getChaptersByMangaId(mangaId: string): Promise<Chapter[]>;
  getChaptersByMediaId(mediaId: string): Promise<Chapter[]>;
  getChapterById(id: string): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, chapter: Partial<Chapter>): Promise<Chapter | undefined>;

  // Page management
  getPagesByChapterId(chapterId: string): Promise<Page[]>;
  getPageById(id: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, page: Partial<Page>): Promise<Page | undefined>;

  // Sources management
  getSources(type?: 'manga' | 'anime'): Promise<Source[]>;
  getSourceById(id: string): Promise<Source | undefined>;
  createSource(source: InsertSource): Promise<Source>;
  updateSource(id: string, source: Partial<Source>): Promise<Source | undefined>;
  deleteSource(id: string): Promise<boolean>;

  // Collections management
  getCollectionsByUserId(userId: string): Promise<Collection[]>;
  getCollectionById(id: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: string, collection: Partial<Collection>): Promise<Collection | undefined>;
  deleteCollection(id: string): Promise<boolean>;

  // User settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings | undefined>;

  // Repository management
  getRepositories(type?: 'manga' | 'anime' | 'mixed'): Promise<Repository[]>;
  getRepositoryById(id: string): Promise<Repository | undefined>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  updateRepository(id: string, repository: Partial<Repository>): Promise<Repository | undefined>;
  deleteRepository(id: string): Promise<boolean>;

  // Skip markers (opening/ending detection)
  getSkipMarkersByEpisodeId(episodeId: string): Promise<SkipMarker[]>;
  createSkipMarker(marker: InsertSkipMarker): Promise<SkipMarker>;
  updateSkipMarker(id: string, marker: Partial<SkipMarker>): Promise<SkipMarker | undefined>;
  deleteSkipMarker(id: string): Promise<boolean>;

  // Reading bookmarks and gallery mode
  getReadingBookmarksByUserId(userId: string): Promise<ReadingBookmark[]>;
  getReadingBookmarkByChapter(userId: string, chapterId: string): Promise<ReadingBookmark | undefined>;
  createReadingBookmark(bookmark: InsertReadingBookmark): Promise<ReadingBookmark>;
  updateReadingBookmark(id: string, bookmark: Partial<ReadingBookmark>): Promise<ReadingBookmark | undefined>;

  // Sync services integration
  getSyncServicesByUserId(userId: string): Promise<SyncService[]>;
  getSyncServiceById(id: string): Promise<SyncService | undefined>;
  createSyncService(service: InsertSyncService): Promise<SyncService>;
  updateSyncService(id: string, service: Partial<SyncService>): Promise<SyncService | undefined>;
  deleteSyncService(id: string): Promise<boolean>;

  // Sync mappings
  getSyncMappingsByMediaId(mediaId: string): Promise<SyncMapping[]>;
  createSyncMapping(mapping: InsertSyncMapping): Promise<SyncMapping>;
  updateSyncMapping(id: string, mapping: Partial<SyncMapping>): Promise<SyncMapping | undefined>;

  // Gallery presets
  getGalleryPresetsByUserId(userId: string): Promise<GalleryPreset[]>;
  createGalleryPreset(preset: InsertGalleryPreset): Promise<GalleryPreset>;
  updateGalleryPreset(id: string, preset: Partial<GalleryPreset>): Promise<GalleryPreset | undefined>;
  deleteGalleryPreset(id: string): Promise<boolean>;

  // Player states (VLC-like functionality)
  getPlayerState(userId: string, episodeId: string): Promise<PlayerState | undefined>;
  createPlayerState(state: InsertPlayerState): Promise<PlayerState>;
  updatePlayerState(userId: string, episodeId: string, state: Partial<PlayerState>): Promise<PlayerState | undefined>;

  // Download management
  getDownloadsByUserId(userId: string): Promise<Download[]>;
  getDownloadById(id: string): Promise<Download | undefined>;
  createDownload(download: InsertDownload): Promise<Download>;
  updateDownload(id: string, download: Partial<Download>): Promise<Download | undefined>;
  deleteDownload(id: string): Promise<boolean>;

  // Comments system
  getCommentsByMediaId(mediaId: string): Promise<Comment[]>;
  getCommentsByChapterId(chapterId: string): Promise<Comment[]>;
  getCommentsByEpisodeId(episodeId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, comment: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private media: Map<string, Media>;
  private manga: Map<string, Manga>;
  private episodes: Map<string, Episode>;
  private chapters: Map<string, Chapter>;
  private pages: Map<string, Page>;
  private sources: Map<string, Source>;
  private collections: Map<string, Collection>;
  private userSettings: Map<string, UserSettings>;
  private repositories: Map<string, Repository>;
  private skipMarkers: Map<string, SkipMarker>;
  private readingBookmarks: Map<string, ReadingBookmark>;
  private syncServices: Map<string, SyncService>;
  private syncMappings: Map<string, SyncMapping>;
  private galleryPresets: Map<string, GalleryPreset>;
  private playerStates: Map<string, PlayerState>;
  private downloads: Map<string, Download>;
  private comments: Map<string, Comment>;

  constructor() {
    this.users = new Map();
    this.media = new Map();
    this.manga = new Map();
    this.episodes = new Map();
    this.chapters = new Map();
    this.pages = new Map();
    this.sources = new Map();
    this.collections = new Map();
    this.userSettings = new Map();
    this.repositories = new Map();
    this.skipMarkers = new Map();
    this.readingBookmarks = new Map();
    this.syncServices = new Map();
    this.syncMappings = new Map();
    this.galleryPresets = new Map();
    this.playerStates = new Map();
    this.downloads = new Map();
    this.comments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Unified Media management
  async getMediaByUserId(userId: string, type?: 'manga' | 'anime'): Promise<Media[]> {
    const userMedia = Array.from(this.media.values()).filter(m => m.userId === userId);
    return type ? userMedia.filter(m => m.type === type) : userMedia;
  }

  async getMediaById(id: string): Promise<Media | undefined> {
    return this.media.get(id);
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = randomUUID();
    const media: Media = {
      ...insertMedia,
      id,
      status: insertMedia.status || "reading",
      alternativeTitles: insertMedia.alternativeTitles || null,
      description: insertMedia.description || null,
      originalLanguage: insertMedia.originalLanguage || null,
      targetLanguage: insertMedia.targetLanguage || "en",
      currentChapter: insertMedia.currentChapter ?? null,
      currentEpisode: insertMedia.currentEpisode ?? null,
      totalChapters: insertMedia.totalChapters ?? null,
      totalEpisodes: insertMedia.totalEpisodes ?? null,
      progress: insertMedia.progress ?? null,
      score: insertMedia.score || null,
      coverImageUrl: insertMedia.coverImageUrl || null,
      bannerImageUrl: insertMedia.bannerImageUrl || null,
      genres: insertMedia.genres || null,
      tags: insertMedia.tags || null,
      year: insertMedia.year ?? null,
      season: insertMedia.season || null,
      studio: insertMedia.studio || null,
      author: insertMedia.author || null,
      artist: insertMedia.artist || null,
      isAdult: insertMedia.isAdult ?? false,
      format: insertMedia.format || null,
      source: insertMedia.source || null,
      externalIds: insertMedia.externalIds || null,
      trackingData: insertMedia.trackingData || null,
      colorPalette: insertMedia.colorPalette || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.media.set(id, media);
    return media;
  }

  async updateMedia(id: string, updates: Partial<Media>): Promise<Media | undefined> {
    const media = this.media.get(id);
    if (!media) return undefined;
    
    const updatedMedia = {
      ...media,
      ...updates,
      updatedAt: new Date()
    };
    this.media.set(id, updatedMedia);
    return updatedMedia;
  }

  async deleteMedia(id: string): Promise<boolean> {
    return this.media.delete(id);
  }

  async searchMedia(query: string, userId: string): Promise<Media[]> {
    const userMedia = await this.getMediaByUserId(userId);
    const lowercaseQuery = query.toLowerCase();
    
    return userMedia.filter(media => 
      media.title.toLowerCase().includes(lowercaseQuery) ||
      (media.alternativeTitles && 
       (media.alternativeTitles as string[]).some((title: string) => 
         title.toLowerCase().includes(lowercaseQuery)
       )) ||
      (media.description && media.description.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Episode management (for anime)
  async getEpisodesByMediaId(mediaId: string): Promise<Episode[]> {
    return Array.from(this.episodes.values()).filter(e => e.mediaId === mediaId);
  }

  async getEpisodeById(id: string): Promise<Episode | undefined> {
    return this.episodes.get(id);
  }

  async createEpisode(insertEpisode: InsertEpisode): Promise<Episode> {
    const id = randomUUID();
    const episode: Episode = {
      ...insertEpisode,
      title: insertEpisode.title || null,
      description: insertEpisode.description || null,
      duration: insertEpisode.duration || null,
      airDate: insertEpisode.airDate || null,
      videoSources: insertEpisode.videoSources || null,
      subtitles: insertEpisode.subtitles || null,
      thumbnailUrl: insertEpisode.thumbnailUrl || null,
      watchedAt: insertEpisode.watchedAt || null,
      watchProgress: insertEpisode.watchProgress ?? null,
      id,
      createdAt: new Date()
    };
    this.episodes.set(id, episode);
    return episode;
  }

  async updateEpisode(id: string, updates: Partial<Episode>): Promise<Episode | undefined> {
    const existing = this.episodes.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.episodes.set(id, updated);
    return updated;
  }

  // Chapter management enhanced
  async getChaptersByMediaId(mediaId: string): Promise<Chapter[]> {
    return Array.from(this.chapters.values()).filter(c => c.mediaId === mediaId);
  }

  // Sources management
  async getSources(type?: 'manga' | 'anime'): Promise<Source[]> {
    const allSources = Array.from(this.sources.values());
    return type ? allSources.filter(s => s.type === type) : allSources;
  }

  async getSourceById(id: string): Promise<Source | undefined> {
    return this.sources.get(id);
  }

  async createSource(insertSource: InsertSource): Promise<Source> {
    const id = randomUUID();
    const source: Source = {
      ...insertSource,
      isEnabled: insertSource.isEnabled ?? true,
      isNsfw: insertSource.isNsfw ?? false,
      language: insertSource.language || null,
      version: insertSource.version || null,
      iconUrl: insertSource.iconUrl || null,
      config: insertSource.config || null,
      id,
      createdAt: new Date()
    };
    this.sources.set(id, source);
    return source;
  }

  async updateSource(id: string, updates: Partial<Source>): Promise<Source | undefined> {
    const existing = this.sources.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.sources.set(id, updated);
    return updated;
  }

  async deleteSource(id: string): Promise<boolean> {
    return this.sources.delete(id);
  }

  // Collections management
  async getCollectionsByUserId(userId: string): Promise<Collection[]> {
    return Array.from(this.collections.values()).filter(c => c.userId === userId);
  }

  async getCollectionById(id: string): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = randomUUID();
    const collection: Collection = {
      ...insertCollection,
      description: insertCollection.description || null,
      coverImageUrl: insertCollection.coverImageUrl || null,
      isPrivate: insertCollection.isPrivate ?? false,
      mediaIds: insertCollection.mediaIds || null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.collections.set(id, collection);
    return collection;
  }

  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | undefined> {
    const existing = this.collections.get(id);
    if (!existing) return undefined;

    const updated = { 
      ...existing, 
      ...updates,
      updatedAt: new Date()
    };
    this.collections.set(id, updated);
    return updated;
  }

  async deleteCollection(id: string): Promise<boolean> {
    return this.collections.delete(id);
  }

  async getMangaByUserId(userId: string): Promise<Manga[]> {
    return Array.from(this.manga.values()).filter(m => m.userId === userId);
  }

  async getMangaById(id: string): Promise<Manga | undefined> {
    return this.manga.get(id);
  }

  async createManga(insertManga: InsertManga): Promise<Manga> {
    const id = randomUUID();
    const mangaItem: Manga = {
      ...insertManga,
      status: insertManga.status || "reading",
      targetLanguage: insertManga.targetLanguage || "en",
      currentChapter: insertManga.currentChapter ?? null,
      totalChapters: insertManga.totalChapters ?? null,
      progress: insertManga.progress ?? null,
      coverImageUrl: insertManga.coverImageUrl || null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.manga.set(id, mangaItem);
    return mangaItem;
  }

  async updateManga(id: string, updates: Partial<Manga>): Promise<Manga | undefined> {
    const existing = this.manga.get(id);
    if (!existing) return undefined;

    const updated = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.manga.set(id, updated);
    return updated;
  }

  async deleteManga(id: string): Promise<boolean> {
    return this.manga.delete(id);
  }

  async getChaptersByMangaId(mangaId: string): Promise<Chapter[]> {
    return Array.from(this.chapters.values()).filter(c => c.mangaId === mangaId);
  }

  async getChapterById(id: string): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const id = randomUUID();
    const chapter: Chapter = {
      ...insertChapter,
      title: insertChapter.title || null,
      mediaId: insertChapter.mediaId || null,
      mangaId: insertChapter.mangaId || null,
      currentPage: insertChapter.currentPage ?? null,
      readAt: insertChapter.readAt || null,
      id,
      createdAt: new Date()
    };
    this.chapters.set(id, chapter);
    return chapter;
  }

  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | undefined> {
    const existing = this.chapters.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.chapters.set(id, updated);
    return updated;
  }

  async getPagesByChapterId(chapterId: string): Promise<Page[]> {
    return Array.from(this.pages.values()).filter(p => p.chapterId === chapterId);
  }

  async getPageById(id: string): Promise<Page | undefined> {
    return this.pages.get(id);
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const id = randomUUID();
    const page: Page = {
      ...insertPage,
      ocrData: insertPage.ocrData || null,
      translations: insertPage.translations || null,
      id,
      createdAt: new Date()
    };
    this.pages.set(id, page);
    return page;
  }

  async updatePage(id: string, updates: Partial<Page>): Promise<Page | undefined> {
    const existing = this.pages.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.pages.set(id, updated);
    return updated;
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(s => s.userId === userId);
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const id = randomUUID();
    const settings: UserSettings = {
      ...insertSettings,
      ocrSensitivity: insertSettings.ocrSensitivity ?? 7,
      translationQuality: insertSettings.translationQuality || "balanced",
      autoTranslate: insertSettings.autoTranslate ?? true,
      showOcrBoundaries: insertSettings.showOcrBoundaries ?? false,
      defaultLanguagePair: insertSettings.defaultLanguagePair || "jp-en",
      videoQuality: insertSettings.videoQuality || "auto",
      autoPlay: insertSettings.autoPlay ?? true,
      skipIntro: insertSettings.skipIntro ?? false,
      skipOutro: insertSettings.skipOutro ?? false,
      preferredPlayer: insertSettings.preferredPlayer || "internal",
      theme: insertSettings.theme || "dark",
      dynamicColors: insertSettings.dynamicColors ?? true,
      showAdultContent: insertSettings.showAdultContent ?? false,
      malSync: insertSettings.malSync ?? false,
      anilistSync: insertSettings.anilistSync ?? false,
      malUsername: insertSettings.malUsername || null,
      anilistToken: insertSettings.anilistToken || null,
      id
    };
    this.userSettings.set(id, settings);
    return settings;
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const existing = Array.from(this.userSettings.values()).find(s => s.userId === userId);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.userSettings.set(existing.id, updated);
    return updated;
  }

  // Repository management implementations
  async getRepositories(type?: 'manga' | 'anime' | 'mixed'): Promise<Repository[]> {
    const allRepos = Array.from(this.repositories.values());
    return type ? allRepos.filter(r => r.type === type) : allRepos;
  }

  async getRepositoryById(id: string): Promise<Repository | undefined> {
    return this.repositories.get(id);
  }

  async createRepository(insertRepo: InsertRepository): Promise<Repository> {
    const id = randomUUID();
    const repository: Repository = {
      ...insertRepo,
      enabled: insertRepo.enabled ?? true,
      lastUpdated: new Date(),
      totalSources: insertRepo.totalSources ?? 0,
      metadata: insertRepo.metadata || null,
      id,
      createdAt: new Date()
    };
    this.repositories.set(id, repository);
    return repository;
  }

  async updateRepository(id: string, updates: Partial<Repository>): Promise<Repository | undefined> {
    const existing = this.repositories.get(id);
    if (!existing) return undefined;

    const updated = { 
      ...existing, 
      ...updates,
      lastUpdated: new Date()
    };
    this.repositories.set(id, updated);
    return updated;
  }

  async deleteRepository(id: string): Promise<boolean> {
    return this.repositories.delete(id);
  }

  // Skip markers implementations
  async getSkipMarkersByEpisodeId(episodeId: string): Promise<SkipMarker[]> {
    return Array.from(this.skipMarkers.values()).filter(sm => sm.episodeId === episodeId);
  }

  async createSkipMarker(insertMarker: InsertSkipMarker): Promise<SkipMarker> {
    const id = randomUUID();
    const marker: SkipMarker = {
      ...insertMarker,
      confidence: insertMarker.confidence ?? 95,
      source: insertMarker.source || "auto",
      votes: insertMarker.votes ?? 0,
      id,
      createdAt: new Date()
    };
    this.skipMarkers.set(id, marker);
    return marker;
  }

  async updateSkipMarker(id: string, updates: Partial<SkipMarker>): Promise<SkipMarker | undefined> {
    const existing = this.skipMarkers.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.skipMarkers.set(id, updated);
    return updated;
  }

  async deleteSkipMarker(id: string): Promise<boolean> {
    return this.skipMarkers.delete(id);
  }

  // Reading bookmarks implementations
  async getReadingBookmarksByUserId(userId: string): Promise<ReadingBookmark[]> {
    return Array.from(this.readingBookmarks.values()).filter(rb => rb.userId === userId);
  }

  async getReadingBookmarkByChapter(userId: string, chapterId: string): Promise<ReadingBookmark | undefined> {
    return Array.from(this.readingBookmarks.values()).find(
      rb => rb.userId === userId && rb.chapterId === chapterId
    );
  }

  async createReadingBookmark(insertBookmark: InsertReadingBookmark): Promise<ReadingBookmark> {
    const id = randomUUID();
    const bookmark: ReadingBookmark = {
      ...insertBookmark,
      scrollPosition: insertBookmark.scrollPosition ?? 0,
      zoomLevel: insertBookmark.zoomLevel ?? 100,
      readingMode: insertBookmark.readingMode || "single",
      note: insertBookmark.note || null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.readingBookmarks.set(id, bookmark);
    return bookmark;
  }

  async updateReadingBookmark(id: string, updates: Partial<ReadingBookmark>): Promise<ReadingBookmark | undefined> {
    const existing = this.readingBookmarks.get(id);
    if (!existing) return undefined;

    const updated = { 
      ...existing, 
      ...updates,
      updatedAt: new Date()
    };
    this.readingBookmarks.set(id, updated);
    return updated;
  }

  // Sync services implementations
  async getSyncServicesByUserId(userId: string): Promise<SyncService[]> {
    return Array.from(this.syncServices.values()).filter(ss => ss.userId === userId);
  }

  async getSyncServiceById(id: string): Promise<SyncService | undefined> {
    return this.syncServices.get(id);
  }

  async createSyncService(insertService: InsertSyncService): Promise<SyncService> {
    const id = randomUUID();
    const service: SyncService = {
      ...insertService,
      serviceUserId: insertService.serviceUserId || null,
      accessToken: insertService.accessToken || null,
      refreshToken: insertService.refreshToken || null,
      expiresAt: insertService.expiresAt || null,
      isEnabled: insertService.isEnabled ?? true,
      lastSyncAt: insertService.lastSyncAt || null,
      syncSettings: insertService.syncSettings || null,
      id,
      createdAt: new Date()
    };
    this.syncServices.set(id, service);
    return service;
  }

  async updateSyncService(id: string, updates: Partial<SyncService>): Promise<SyncService | undefined> {
    const existing = this.syncServices.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.syncServices.set(id, updated);
    return updated;
  }

  async deleteSyncService(id: string): Promise<boolean> {
    return this.syncServices.delete(id);
  }

  // Sync mappings implementations
  async getSyncMappingsByMediaId(mediaId: string): Promise<SyncMapping[]> {
    return Array.from(this.syncMappings.values()).filter(sm => sm.mediaId === mediaId);
  }

  async createSyncMapping(insertMapping: InsertSyncMapping): Promise<SyncMapping> {
    const id = randomUUID();
    const mapping: SyncMapping = {
      ...insertMapping,
      externalUrl: insertMapping.externalUrl || null,
      lastSyncedAt: new Date(),
      syncStatus: insertMapping.syncStatus || "active",
      id
    };
    this.syncMappings.set(id, mapping);
    return mapping;
  }

  async updateSyncMapping(id: string, updates: Partial<SyncMapping>): Promise<SyncMapping | undefined> {
    const existing = this.syncMappings.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.syncMappings.set(id, updated);
    return updated;
  }

  // Gallery presets implementations
  async getGalleryPresetsByUserId(userId: string): Promise<GalleryPreset[]> {
    return Array.from(this.galleryPresets.values()).filter(gp => gp.userId === userId);
  }

  async createGalleryPreset(insertPreset: InsertGalleryPreset): Promise<GalleryPreset> {
    const id = randomUUID();
    const preset: GalleryPreset = {
      ...insertPreset,
      columnsPerRow: insertPreset.columnsPerRow ?? 3,
      showTitles: insertPreset.showTitles ?? true,
      showProgress: insertPreset.showProgress ?? true,
      sortBy: insertPreset.sortBy || "dateAdded",
      filterSettings: insertPreset.filterSettings || null,
      isDefault: insertPreset.isDefault ?? false,
      id,
      createdAt: new Date()
    };
    this.galleryPresets.set(id, preset);
    return preset;
  }

  async updateGalleryPreset(id: string, updates: Partial<GalleryPreset>): Promise<GalleryPreset | undefined> {
    const existing = this.galleryPresets.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.galleryPresets.set(id, updated);
    return updated;
  }

  async deleteGalleryPreset(id: string): Promise<boolean> {
    return this.galleryPresets.delete(id);
  }

  // Player states implementations (VLC-like functionality)
  async getPlayerState(userId: string, episodeId: string): Promise<PlayerState | undefined> {
    return Array.from(this.playerStates.values()).find(
      ps => ps.userId === userId && ps.episodeId === episodeId
    );
  }

  async createPlayerState(insertState: InsertPlayerState): Promise<PlayerState> {
    const id = randomUUID();
    const state: PlayerState = {
      ...insertState,
      currentTime: insertState.currentTime ?? 0,
      duration: insertState.duration ?? 0,
      playbackRate: insertState.playbackRate ?? 100,
      volume: insertState.volume ?? 80,
      subtitleTrack: insertState.subtitleTrack || null,
      audioTrack: insertState.audioTrack || null,
      quality: insertState.quality || "auto",
      aspectRatio: insertState.aspectRatio || "16:9",
      lastPosition: insertState.lastPosition ?? 0,
      watchedSegments: insertState.watchedSegments || null,
      id,
      updatedAt: new Date()
    };
    this.playerStates.set(id, state);
    return state;
  }

  async updatePlayerState(userId: string, episodeId: string, updates: Partial<PlayerState>): Promise<PlayerState | undefined> {
    const existing = await this.getPlayerState(userId, episodeId);
    if (!existing) {
      // Create new if doesn't exist
      return this.createPlayerState({
        userId,
        episodeId,
        ...updates
      } as InsertPlayerState);
    }

    const updated = { 
      ...existing, 
      ...updates,
      updatedAt: new Date()
    };
    this.playerStates.set(existing.id, updated);
    return updated;
  }

  // Download management implementations
  async getDownloadsByUserId(userId: string): Promise<Download[]> {
    return Array.from(this.downloads.values()).filter(d => d.userId === userId);
  }

  async getDownloadById(id: string): Promise<Download | undefined> {
    return this.downloads.get(id);
  }

  async createDownload(insertDownload: InsertDownload): Promise<Download> {
    const id = randomUUID();
    const download: Download = {
      ...insertDownload,
      chapterId: insertDownload.chapterId || null,
      episodeId: insertDownload.episodeId || null,
      status: insertDownload.status || "pending",
      progress: insertDownload.progress ?? 0,
      totalSize: insertDownload.totalSize || null,
      downloadedSize: insertDownload.downloadedSize ?? 0,
      quality: insertDownload.quality || null,
      localPath: insertDownload.localPath || null,
      expiresAt: insertDownload.expiresAt || null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.downloads.set(id, download);
    return download;
  }

  async updateDownload(id: string, updates: Partial<Download>): Promise<Download | undefined> {
    const existing = this.downloads.get(id);
    if (!existing) return undefined;

    const updated = { 
      ...existing, 
      ...updates,
      updatedAt: new Date()
    };
    this.downloads.set(id, updated);
    return updated;
  }

  async deleteDownload(id: string): Promise<boolean> {
    return this.downloads.delete(id);
  }

  // Comments system implementations
  async getCommentsByMediaId(mediaId: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(c => c.mediaId === mediaId);
  }

  async getCommentsByChapterId(chapterId: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(c => c.chapterId === chapterId);
  }

  async getCommentsByEpisodeId(episodeId: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(c => c.episodeId === episodeId);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      chapterId: insertComment.chapterId || null,
      episodeId: insertComment.episodeId || null,
      pageNumber: insertComment.pageNumber || null,
      timestamp: insertComment.timestamp || null,
      parentId: insertComment.parentId || null,
      likes: insertComment.likes ?? 0,
      dislikes: insertComment.dislikes ?? 0,
      isEdited: insertComment.isEdited ?? false,
      isDeleted: insertComment.isDeleted ?? false,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.comments.set(id, comment);
    return comment;
  }

  async updateComment(id: string, updates: Partial<Comment>): Promise<Comment | undefined> {
    const existing = this.comments.get(id);
    if (!existing) return undefined;

    const updated = { 
      ...existing, 
      ...updates,
      isEdited: true,
      updatedAt: new Date()
    };
    this.comments.set(id, updated);
    return updated;
  }

  async deleteComment(id: string): Promise<boolean> {
    const existing = this.comments.get(id);
    if (!existing) return false;

    const updated = {
      ...existing,
      isDeleted: true,
      content: "[deleted]",
      updatedAt: new Date()
    };
    this.comments.set(id, updated);
    return true;
  }
}

export const storage = new MemStorage();
