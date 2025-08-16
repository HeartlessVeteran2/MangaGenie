import { type User, type InsertUser, type Manga, type InsertManga, type Chapter, type InsertChapter, type Page, type InsertPage, type UserSettings, type InsertUserSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Manga management
  getMangaByUserId(userId: string): Promise<Manga[]>;
  getMangaById(id: string): Promise<Manga | undefined>;
  createManga(manga: InsertManga): Promise<Manga>;
  updateManga(id: string, manga: Partial<Manga>): Promise<Manga | undefined>;
  deleteManga(id: string): Promise<boolean>;

  // Chapter management
  getChaptersByMangaId(mangaId: string): Promise<Chapter[]>;
  getChapterById(id: string): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, chapter: Partial<Chapter>): Promise<Chapter | undefined>;

  // Page management
  getPagesByChapterId(chapterId: string): Promise<Page[]>;
  getPageById(id: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, page: Partial<Page>): Promise<Page | undefined>;

  // User settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private manga: Map<string, Manga>;
  private chapters: Map<string, Chapter>;
  private pages: Map<string, Page>;
  private userSettings: Map<string, UserSettings>;

  constructor() {
    this.users = new Map();
    this.manga = new Map();
    this.chapters = new Map();
    this.pages = new Map();
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
