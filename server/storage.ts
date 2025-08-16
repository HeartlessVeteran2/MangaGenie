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
  type InsertUser,
  type InsertMedia,
  type InsertManga,
  type InsertEpisode,
  type InsertChapter,
  type InsertPage,
  type InsertSource,
  type InsertCollection,
  type InsertUserSettings
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
}

export const storage = new MemStorage();
