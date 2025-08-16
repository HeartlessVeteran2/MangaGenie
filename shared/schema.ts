import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Unified media table for both manga and anime
export const media = pgTable("media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "manga" or "anime"
  title: text("title").notNull(),
  alternativeTitles: jsonb("alternative_titles"), // Array of alternative titles
  description: text("description"),
  originalLanguage: text("original_language"),
  targetLanguage: text("target_language").default("en"),
  status: text("status").notNull().default("reading"), // reading, completed, planned, watching, dropped
  currentChapter: integer("current_chapter").default(1),
  currentEpisode: integer("current_episode").default(1),
  totalChapters: integer("total_chapters"),
  totalEpisodes: integer("total_episodes"),
  progress: integer("progress").default(0), // percentage
  score: decimal("score", { precision: 3, scale: 1 }), // User rating 1-10
  coverImageUrl: text("cover_image_url"),
  bannerImageUrl: text("banner_image_url"),
  genres: jsonb("genres"), // Array of genre strings
  tags: jsonb("tags"), // Array of tag strings
  year: integer("year"),
  season: text("season"), // spring, summer, fall, winter
  studio: text("studio"), // For anime
  author: text("author"), // For manga
  artist: text("artist"), // For manga
  isAdult: boolean("is_adult").default(false),
  format: text("format"), // TV, Movie, OVA, Special, Manga, Manhwa, Manhua, etc.
  source: text("source"), // Manga, Light Novel, Original, etc.
  externalIds: jsonb("external_ids"), // MAL, AniList, etc. IDs
  trackingData: jsonb("tracking_data"), // Sync data from tracking services
  colorPalette: jsonb("color_palette"), // Extracted colors from cover for theming
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legacy manga table - keeping for backwards compatibility
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

// Episodes for anime content
export const episodes = pgTable("episodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mediaId: varchar("media_id").notNull().references(() => media.id),
  episodeNumber: integer("episode_number").notNull(),
  title: text("title"),
  description: text("description"),
  duration: integer("duration"), // in minutes
  airDate: timestamp("air_date"),
  videoSources: jsonb("video_sources"), // Array of video sources with qualities
  subtitles: jsonb("subtitles"), // Subtitle tracks
  thumbnailUrl: text("thumbnail_url"),
  watchedAt: timestamp("watched_at"),
  watchProgress: integer("watch_progress").default(0), // seconds watched
  createdAt: timestamp("created_at").defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mediaId: varchar("media_id").references(() => media.id),
  mangaId: varchar("manga_id").references(() => manga.id), // Legacy support
  chapterNumber: integer("chapter_number").notNull(),
  title: text("title"),
  totalPages: integer("total_pages").notNull(),
  currentPage: integer("current_page").default(1),
  readAt: timestamp("read_at"),
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

// Sources and extensions system
export const sources = pgTable("sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // manga, anime
  baseUrl: text("base_url").notNull(),
  isEnabled: boolean("is_enabled").default(true),
  isNsfw: boolean("is_nsfw").default(false),
  language: text("language").default("en"),
  version: text("version"),
  iconUrl: text("icon_url"),
  config: jsonb("config"), // Source-specific configuration
  createdAt: timestamp("created_at").defaultNow(),
});

// User collections and categories
export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").default(false),
  coverImageUrl: text("cover_image_url"),
  mediaIds: jsonb("media_ids"), // Array of media IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  // Reading settings
  ocrSensitivity: integer("ocr_sensitivity").default(7),
  translationQuality: text("translation_quality").default("balanced"), // fast, balanced, premium
  autoTranslate: boolean("auto_translate").default(true),
  showOcrBoundaries: boolean("show_ocr_boundaries").default(false),
  defaultLanguagePair: text("default_language_pair").default("jp-en"),
  
  // Player settings
  videoQuality: text("video_quality").default("auto"), // auto, 1080p, 720p, 480p, 360p
  autoPlay: boolean("auto_play").default(true),
  skipIntro: boolean("skip_intro").default(false),
  skipOutro: boolean("skip_outro").default(false),
  preferredPlayer: text("preferred_player").default("internal"), // internal, external
  
  // UI settings
  theme: text("theme").default("dark"), // dark, light, auto
  dynamicColors: boolean("dynamic_colors").default(true),
  showAdultContent: boolean("show_adult_content").default(false),
  
  // Tracking integration
  malSync: boolean("mal_sync").default(false),
  anilistSync: boolean("anilist_sync").default(false),
  malUsername: text("mal_username"),
  anilistToken: text("anilist_token"),
});

// Schema exports
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMangaSchema = createInsertSchema(manga).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEpisodeSchema = createInsertSchema(episodes).omit({
  id: true,
  createdAt: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  createdAt: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
});

export const insertSourceSchema = createInsertSchema(sources).omit({
  id: true,
  createdAt: true,
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof media.$inferSelect;
export type InsertManga = z.infer<typeof insertMangaSchema>;
export type Manga = typeof manga.$inferSelect;
export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;
export type Episode = typeof episodes.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chapters.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertSource = z.infer<typeof insertSourceSchema>;
export type Source = typeof sources.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// Advanced repository management for sources
export const repositories = pgTable("repositories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  type: text("type").notNull(), // "manga", "anime", "mixed"
  enabled: boolean("enabled").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  totalSources: integer("total_sources").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Skip detection for anime episodes
export const skipMarkers = pgTable("skip_markers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  episodeId: varchar("episode_id").notNull().references(() => episodes.id),
  type: text("type").notNull(), // "opening", "ending", "recap", "preview"
  startTime: integer("start_time").notNull(), // seconds
  endTime: integer("end_time").notNull(), // seconds
  confidence: integer("confidence").default(95), // AI confidence %
  source: text("source").default("auto"), // auto, manual, community
  votes: integer("votes").default(0), // community votes
  createdAt: timestamp("created_at").defaultNow(),
});

// Reading bookmarks and positions for gallery mode
export const readingBookmarks = pgTable("reading_bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  chapterId: varchar("chapter_id").notNull().references(() => chapters.id),
  pageNumber: integer("page_number").notNull(),
  scrollPosition: integer("scroll_position").default(0),
  zoomLevel: integer("zoom_level").default(100),
  readingMode: text("reading_mode").default("single"), // single, continuous, gallery
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// External sync services integration
export const syncServices = pgTable("sync_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  serviceName: text("service_name").notNull(), // mal, anilist, kitsu, mangaupdates
  serviceUserId: text("service_user_id"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  isEnabled: boolean("is_enabled").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  syncSettings: jsonb("sync_settings"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Media sync mapping for external services
export const syncMappings = pgTable("sync_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mediaId: varchar("media_id").notNull().references(() => media.id),
  syncServiceId: varchar("sync_service_id").notNull().references(() => syncServices.id),
  externalId: text("external_id").notNull(),
  externalUrl: text("external_url"),
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
  syncStatus: text("sync_status").default("active"), // active, error, disabled
});

// Advanced gallery and preview system
export const galleryPresets = pgTable("gallery_presets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  layoutType: text("layout_type").notNull(), // grid, masonry, carousel, strip
  columnsPerRow: integer("columns_per_row").default(3),
  showTitles: boolean("show_titles").default(true),
  showProgress: boolean("show_progress").default(true),
  sortBy: text("sort_by").default("dateAdded"), // dateAdded, title, progress, rating
  filterSettings: jsonb("filter_settings"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video player state and advanced controls
export const playerStates = pgTable("player_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  episodeId: varchar("episode_id").notNull().references(() => episodes.id),
  currentTime: integer("current_time").default(0),
  duration: integer("duration").default(0),
  playbackRate: integer("playback_rate").default(100), // percentage
  volume: integer("volume").default(80),
  subtitleTrack: text("subtitle_track"),
  audioTrack: text("audio_track"),
  quality: text("quality").default("auto"),
  aspectRatio: text("aspect_ratio").default("16:9"),
  lastPosition: integer("last_position").default(0),
  watchedSegments: jsonb("watched_segments"), // Array of [start, end] segments
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Download management for offline reading/watching
export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mediaId: varchar("media_id").notNull().references(() => media.id),
  chapterId: varchar("chapter_id").references(() => chapters.id),
  episodeId: varchar("episode_id").references(() => episodes.id),
  status: text("status").default("pending"), // pending, downloading, completed, error, paused
  progress: integer("progress").default(0),
  totalSize: integer("total_size"),
  downloadedSize: integer("downloaded_size").default(0),
  quality: text("quality"),
  localPath: text("local_path"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments and community features
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mediaId: varchar("media_id").notNull().references(() => media.id),
  chapterId: varchar("chapter_id").references(() => chapters.id),
  episodeId: varchar("episode_id").references(() => episodes.id),
  pageNumber: integer("page_number"),
  timestamp: integer("timestamp"), // for video comments
  content: text("content").notNull(),
  parentId: varchar("parent_id"), // for replies - removed self reference for now
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  isEdited: boolean("is_edited").default(false),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports for new tables
export const insertRepositorySchema = createInsertSchema(repositories).omit({
  id: true,
  createdAt: true,
});

export const insertSkipMarkerSchema = createInsertSchema(skipMarkers).omit({
  id: true,
  createdAt: true,
});

export const insertReadingBookmarkSchema = createInsertSchema(readingBookmarks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSyncServiceSchema = createInsertSchema(syncServices).omit({
  id: true,
  createdAt: true,
});

export const insertSyncMappingSchema = createInsertSchema(syncMappings).omit({
  id: true,
  lastSyncedAt: true,
});

export const insertGalleryPresetSchema = createInsertSchema(galleryPresets).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerStateSchema = createInsertSchema(playerStates).omit({
  id: true,
  updatedAt: true,
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for new tables
export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type Repository = typeof repositories.$inferSelect;
export type InsertSkipMarker = z.infer<typeof insertSkipMarkerSchema>;
export type SkipMarker = typeof skipMarkers.$inferSelect;
export type InsertReadingBookmark = z.infer<typeof insertReadingBookmarkSchema>;
export type ReadingBookmark = typeof readingBookmarks.$inferSelect;
export type InsertSyncService = z.infer<typeof insertSyncServiceSchema>;
export type SyncService = typeof syncServices.$inferSelect;
export type InsertSyncMapping = z.infer<typeof insertSyncMappingSchema>;
export type SyncMapping = typeof syncMappings.$inferSelect;
export type InsertGalleryPreset = z.infer<typeof insertGalleryPresetSchema>;
export type GalleryPreset = typeof galleryPresets.$inferSelect;
export type InsertPlayerState = z.infer<typeof insertPlayerStateSchema>;
export type PlayerState = typeof playerStates.$inferSelect;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
