/**
 * Repository Context for managing Aniyomi/Komikku compatible sources
 * Handles repository installation, source management, and content discovery
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Repository {
  id: string;
  userId: string;
  name: string;
  baseUrl: string;
  repositoryUrl: string;
  sourceType: 'manga' | 'anime' | 'both';
  language: string;
  version: string;
  isEnabled: boolean;
  isNsfw: boolean;
  isObsolete: boolean;
  priority: number;
  installCount: number;
  packageName: string;
  author: string;
  description: string;
  iconUrl: string;
  websiteUrl: string;
  supportsLatest: boolean;
  supportsSearch: boolean;
  hasCloudflare: boolean;
  lastChecked: string;
  createdAt: string;
}

interface RepositorySource {
  id: string;
  repositoryId: string;
  name: string;
  displayName: string;
  baseUrl: string;
  language: string;
  version: string;
  isEnabled: boolean;
  isNsfw: boolean;
  iconUrl: string;
  supportsLatest: boolean;
  supportsSearch: boolean;
  supportsGenres: boolean;
  supportsFilters: boolean;
  className: string;
  packageName: string;
}

interface RepositoryContextType {
  repositories: Repository[];
  sources: RepositorySource[];
  isLoading: boolean;
  addRepository: (url: string, name?: string) => Promise<void>;
  removeRepository: (id: string) => Promise<void>;
  toggleRepository: (id: string, enabled: boolean) => Promise<void>;
  updateRepository: (id: string, updates: Partial<Repository>) => Promise<void>;
  refreshRepositories: () => Promise<void>;
  searchContent: (query: string, type?: 'manga' | 'anime') => Promise<any[]>;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

interface RepositoryProviderProps {
  children: ReactNode;
}

export const RepositoryProvider: React.FC<RepositoryProviderProps> = ({ children }) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [sources, setSources] = useState<RepositorySource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load repositories and sources from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load repositories
        const savedRepos = await AsyncStorage.getItem('repositories');
        if (savedRepos) {
          setRepositories(JSON.parse(savedRepos));
        } else {
          // Initialize with default repositories
          const defaultRepos = getDefaultRepositories();
          setRepositories(defaultRepos);
          await AsyncStorage.setItem('repositories', JSON.stringify(defaultRepos));
        }

        // Load sources
        const savedSources = await AsyncStorage.getItem('sources');
        if (savedSources) {
          setSources(JSON.parse(savedSources));
        }
        
      } catch (error) {
        console.error('Failed to load repository data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getDefaultRepositories = (): Repository[] => {
    return [
      {
        id: 'tachiyomi-repo',
        userId: 'demo-user',
        name: 'Tachiyomi Extensions',
        baseUrl: 'https://extensions.tachiyomi.org',
        repositoryUrl: 'https://github.com/tachiyomiorg/tachiyomi-extensions',
        sourceType: 'manga',
        language: 'all',
        version: '1.4.0',
        isEnabled: true,
        isNsfw: false,
        isObsolete: false,
        priority: 10,
        installCount: 50000,
        packageName: 'eu.kanade.tachiyomi.extension',
        author: 'Tachiyomi Contributors',
        description: 'Official Tachiyomi extension repository with 300+ manga sources',
        iconUrl: 'https://raw.githubusercontent.com/tachiyomiorg/tachiyomi/master/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
        websiteUrl: 'https://tachiyomi.org',
        supportsLatest: true,
        supportsSearch: true,
        hasCloudflare: false,
        lastChecked: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
      {
        id: 'aniyomi-repo',
        userId: 'demo-user',
        name: 'Aniyomi Extensions',
        baseUrl: 'https://aniyomi.org',
        repositoryUrl: 'https://github.com/aniyomiorg/aniyomi-extensions',
        sourceType: 'anime',
        language: 'all',
        version: '2.1.0',
        isEnabled: true,
        isNsfw: true,
        isObsolete: false,
        priority: 9,
        installCount: 25000,
        packageName: 'eu.kanade.tachiyomi.animeextension',
        author: 'Aniyomi Contributors',
        description: 'Official Aniyomi anime extension repository with 150+ anime sources',
        iconUrl: 'https://raw.githubusercontent.com/aniyomiorg/aniyomi/main/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
        websiteUrl: 'https://aniyomi.org',
        supportsLatest: true,
        supportsSearch: true,
        hasCloudflare: true,
        lastChecked: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      },
    ];
  };

  const addRepository = async (url: string, name?: string) => {
    const newRepo: Repository = {
      id: `repo_${Date.now()}`,
      userId: 'demo-user',
      name: name || 'Custom Repository',
      baseUrl: url,
      repositoryUrl: url,
      sourceType: 'manga',
      language: 'en',
      version: '1.0.0',
      isEnabled: true,
      isNsfw: false,
      isObsolete: false,
      priority: 5,
      installCount: 0,
      packageName: 'custom.repository',
      author: 'Unknown',
      description: 'Custom repository',
      iconUrl: '',
      websiteUrl: url,
      supportsLatest: true,
      supportsSearch: true,
      hasCloudflare: false,
      lastChecked: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updatedRepos = [...repositories, newRepo];
    setRepositories(updatedRepos);
    await AsyncStorage.setItem('repositories', JSON.stringify(updatedRepos));
  };

  const removeRepository = async (id: string) => {
    const updatedRepos = repositories.filter(repo => repo.id !== id);
    setRepositories(updatedRepos);
    await AsyncStorage.setItem('repositories', JSON.stringify(updatedRepos));
  };

  const toggleRepository = async (id: string, enabled: boolean) => {
    const updatedRepos = repositories.map(repo => 
      repo.id === id ? { ...repo, isEnabled: enabled } : repo
    );
    setRepositories(updatedRepos);
    await AsyncStorage.setItem('repositories', JSON.stringify(updatedRepos));
  };

  const updateRepository = async (id: string, updates: Partial<Repository>) => {
    const updatedRepos = repositories.map(repo =>
      repo.id === id ? { ...repo, ...updates } : repo
    );
    setRepositories(updatedRepos);
    await AsyncStorage.setItem('repositories', JSON.stringify(updatedRepos));
  };

  const refreshRepositories = async () => {
    setIsLoading(true);
    // In a real app, this would fetch latest repository data
    // For now, just update lastChecked timestamps
    const updatedRepos = repositories.map(repo => ({
      ...repo,
      lastChecked: new Date().toISOString(),
    }));
    setRepositories(updatedRepos);
    await AsyncStorage.setItem('repositories', JSON.stringify(updatedRepos));
    setIsLoading(false);
  };

  const searchContent = async (query: string, type?: 'manga' | 'anime'): Promise<any[]> => {
    // Mock search results
    return [
      {
        id: 'result1',
        title: `${query} - Sample Manga`,
        description: 'Sample search result',
        coverImageUrl: '',
        author: 'Sample Author',
        status: 'ongoing',
        genres: ['Action', 'Adventure'],
        rating: 8.5,
        sourceId: 'sample-source',
        sourceName: 'Sample Source',
      },
    ];
  };

  const value: RepositoryContextType = {
    repositories,
    sources,
    isLoading,
    addRepository,
    removeRepository,
    toggleRepository,
    updateRepository,
    refreshRepositories,
    searchContent,
  };

  return (
    <RepositoryContext.Provider value={value}>
      {children}
    </RepositoryContext.Provider>
  );
};

export const useRepository = (): RepositoryContextType => {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepository must be used within a RepositoryProvider');
  }
  return context;
};