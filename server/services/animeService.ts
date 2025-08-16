interface AnimeSource {
  id: string;
  name: string;
  url: string;
  type: 'official' | 'community';
  isNsfw: boolean;
  language: string;
}

interface VideoQuality {
  quality: string; // '1080p', '720p', '480p', '360p'
  url: string;
  size?: number; // in bytes
}

interface SubtitleTrack {
  language: string;
  label: string;
  url: string;
  format: 'vtt' | 'ass' | 'srt';
}

interface AnimeEpisode {
  id: string;
  number: number;
  title: string;
  description?: string;
  duration: number; // in seconds
  thumbnailUrl?: string;
  videoSources: VideoQuality[];
  subtitles: SubtitleTrack[];
  airDate?: string;
}

interface AnimeInfo {
  id: string;
  title: string;
  alternativeTitles: string[];
  description: string;
  coverUrl: string;
  bannerUrl?: string;
  genres: string[];
  tags: string[];
  year: number;
  season?: string;
  studio?: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  format: 'TV' | 'Movie' | 'OVA' | 'Special';
  episodes: number;
  rating?: number;
  isAdult: boolean;
  source: string; // 'Manga', 'Light Novel', 'Original', etc.
}

export class AnimeService {
  private sources: AnimeSource[] = [
    {
      id: 'aniwatch',
      name: 'AniWatch',
      url: 'https://aniwatch.to',
      type: 'community',
      isNsfw: false,
      language: 'en'
    },
    {
      id: 'gogoanime',
      name: 'GogoAnime',
      url: 'https://gogoanime.lu',
      type: 'community',
      isNsfw: false,
      language: 'en'
    },
    {
      id: 'crunchyroll',
      name: 'Crunchyroll',
      url: 'https://crunchyroll.com',
      type: 'official',
      isNsfw: false,
      language: 'multiple'
    },
    {
      id: 'funimation',
      name: 'Funimation',
      url: 'https://funimation.com',
      type: 'official',
      isNsfw: false,
      language: 'en'
    }
  ];

  // Mock anime database for demonstration
  private mockAnimeDatabase: AnimeInfo[] = [
    {
      id: 'jujutsu-kaisen',
      title: 'Jujutsu Kaisen',
      alternativeTitles: ['呪術廻戦', 'Sorcery Fight'],
      description: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman\'s school to be able to locate the demon\'s other body parts and thus exorcise himself.',
      coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg',
      bannerUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg',
      genres: ['Action', 'Drama', 'School', 'Shounen', 'Supernatural'],
      tags: ['Curse', 'School', 'Urban Fantasy'],
      year: 2020,
      season: 'fall',
      studio: 'MAPPA',
      status: 'completed',
      format: 'TV',
      episodes: 24,
      rating: 8.7,
      isAdult: false,
      source: 'Manga'
    },
    {
      id: 'demon-slayer',
      title: 'Demon Slayer: Kimetsu no Yaiba',
      alternativeTitles: ['鬼滅の刃', 'Kimetsu no Yaiba'],
      description: 'A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly.',
      coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg',
      bannerUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YfZhKBUDDS6L.jpg',
      genres: ['Action', 'Drama', 'Historical', 'Shounen', 'Supernatural'],
      tags: ['Demons', 'Family', 'Swordplay'],
      year: 2019,
      season: 'spring',
      studio: 'Ufotable',
      status: 'completed',
      format: 'TV',
      episodes: 26,
      rating: 8.9,
      isAdult: false,
      source: 'Manga'
    },
    {
      id: 'attack-on-titan',
      title: 'Attack on Titan',
      alternativeTitles: ['進撃の巨人', 'Shingeki no Kyojin'],
      description: 'Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction.',
      coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-73IhOXpJZiMF.jpg',
      bannerUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg',
      genres: ['Action', 'Drama', 'Fantasy', 'Military'],
      tags: ['Titans', 'Military', 'Survival'],
      year: 2013,
      season: 'spring',
      studio: 'Pierrot',
      status: 'completed',
      format: 'TV',
      episodes: 87,
      rating: 9.0,
      isAdult: false,
      source: 'Manga'
    }
  ];

  async searchAnime(query: string, filters?: {
    genre?: string[];
    year?: number;
    status?: string;
    format?: string;
    isAdult?: boolean;
  }): Promise<AnimeInfo[]> {
    let results = this.mockAnimeDatabase.filter(anime =>
      anime.title.toLowerCase().includes(query.toLowerCase()) ||
      anime.alternativeTitles.some(title => 
        title.toLowerCase().includes(query.toLowerCase())
      )
    );

    if (filters) {
      if (filters.genre) {
        results = results.filter(anime =>
          filters.genre!.some(genre => anime.genres.includes(genre))
        );
      }
      if (filters.year) {
        results = results.filter(anime => anime.year === filters.year);
      }
      if (filters.status) {
        results = results.filter(anime => anime.status === filters.status);
      }
      if (filters.format) {
        results = results.filter(anime => anime.format === filters.format);
      }
      if (filters.isAdult !== undefined) {
        results = results.filter(anime => anime.isAdult === filters.isAdult);
      }
    }

    return results;
  }

  async getAnimeInfo(animeId: string): Promise<AnimeInfo | null> {
    return this.mockAnimeDatabase.find(anime => anime.id === animeId) || null;
  }

  async getAnimeEpisodes(animeId: string): Promise<AnimeEpisode[]> {
    const anime = await this.getAnimeInfo(animeId);
    if (!anime) return [];

    // Generate mock episodes
    const episodes: AnimeEpisode[] = [];
    for (let i = 1; i <= Math.min(anime.episodes, 25); i++) {
      episodes.push({
        id: `${animeId}-ep-${i}`,
        number: i,
        title: `Episode ${i}`,
        description: `Episode ${i} of ${anime.title}`,
        duration: 1440, // 24 minutes in seconds
        thumbnailUrl: anime.coverUrl,
        videoSources: [
          {
            quality: '1080p',
            url: `https://example.com/video/${animeId}/ep${i}/1080p.m3u8`,
            size: 1200000000 // ~1.2GB
          },
          {
            quality: '720p',
            url: `https://example.com/video/${animeId}/ep${i}/720p.m3u8`,
            size: 800000000 // ~800MB
          },
          {
            quality: '480p',
            url: `https://example.com/video/${animeId}/ep${i}/480p.m3u8`,
            size: 400000000 // ~400MB
          }
        ],
        subtitles: [
          {
            language: 'en',
            label: 'English',
            url: `https://example.com/subs/${animeId}/ep${i}/en.vtt`,
            format: 'vtt'
          },
          {
            language: 'ja',
            label: 'Japanese',
            url: `https://example.com/subs/${animeId}/ep${i}/ja.vtt`,
            format: 'vtt'
          }
        ],
        airDate: new Date(Date.now() - (25 - i) * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return episodes;
  }

  async getVideoSources(animeId: string, episodeNumber: number): Promise<VideoQuality[]> {
    // In a real implementation, this would scrape/API call to get actual video sources
    return [
      {
        quality: '1080p',
        url: `https://example.com/video/${animeId}/ep${episodeNumber}/1080p.m3u8`
      },
      {
        quality: '720p',
        url: `https://example.com/video/${animeId}/ep${episodeNumber}/720p.m3u8`
      },
      {
        quality: '480p',
        url: `https://example.com/video/${animeId}/ep${episodeNumber}/480p.m3u8`
      }
    ];
  }

  async getSubtitles(animeId: string, episodeNumber: number): Promise<SubtitleTrack[]> {
    return [
      {
        language: 'en',
        label: 'English',
        url: `https://example.com/subs/${animeId}/ep${episodeNumber}/en.vtt`,
        format: 'vtt'
      },
      {
        language: 'ja',
        label: 'Japanese',
        url: `https://example.com/subs/${animeId}/ep${episodeNumber}/ja.vtt`,
        format: 'vtt'
      }
    ];
  }

  async getTrendingAnime(): Promise<AnimeInfo[]> {
    // Return a subset of popular anime
    return this.mockAnimeDatabase.slice(0, 10);
  }

  async getPopularAnime(season?: string, year?: number): Promise<AnimeInfo[]> {
    let results = [...this.mockAnimeDatabase];
    
    if (season) {
      results = results.filter(anime => anime.season === season);
    }
    
    if (year) {
      results = results.filter(anime => anime.year === year);
    }

    return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  getAvailableSources(): AnimeSource[] {
    return this.sources.filter(source => source.type === 'community');
  }

  async validateVideoUrl(url: string): Promise<boolean> {
    // In a real implementation, this would validate if the video URL is accessible
    try {
      // Mock validation - always return true for demo
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const animeService = new AnimeService();