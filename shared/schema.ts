import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const manga = pgTable("manga", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  originalLanguage: text("original_language").notNull(),
  targetLanguage: text("target_language").default("en"),
  status: text("status").notNull().default("reading"), // reading, completed, planned
  currentChapter: integer("current_chapter").default(1),
  totalChapters: integer("total_chapters"),
  progress: integer("progress").default(0), // percentage
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mangaId: varchar("manga_id").notNull().references(() => manga.id),
  chapterNumber: integer("chapter_number").notNull(),
  title: text("title"),
  totalPages: integer("total_pages").notNull(),
  currentPage: integer("current_page").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chapterId: varchar("chapter_id").notNull().references(() => chapters.id),
  pageNumber: integer("page_number").notNull(),
  imageUrl: text("image_url").notNull(),
  ocrData: jsonb("ocr_data"), // Tesseract.js OCR results
  translations: jsonb("translations"), // OpenAI translation results
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  ocrSensitivity: integer("ocr_sensitivity").default(7),
  translationQuality: text("translation_quality").default("balanced"), // fast, balanced, premium
  autoTranslate: boolean("auto_translate").default(true),
  showOcrBoundaries: boolean("show_ocr_boundaries").default(false),
  defaultLanguagePair: text("default_language_pair").default("jp-en"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMangaSchema = createInsertSchema(manga).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  createdAt: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertManga = z.infer<typeof insertMangaSchema>;
export type Manga = typeof manga.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chapters.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
