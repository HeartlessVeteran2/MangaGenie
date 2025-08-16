/**
 * Creator Discovery Component  
 * Features: Author/artist/studio pages, work collections, creator following
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';

interface Creator {
  id: string;
  name: string;
  type: 'author' | 'artist' | 'studio' | 'voice_actor';
  profileImage: string;
  bio: string;
  birthDate?: Date;
  nationality: string;
  website?: string;
  socialMedia: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  stats: {
    worksCount: number;
    followerCount: number;
    averageRating: number;
    totalVolumes: number;
  };
  works: CreatorWork[];
  relatedCreators: Creator[];
  isFollowing: boolean;
  awards: Award[];
}

interface CreatorWork {
  id: string;
  title: string;
  type: 'manga' | 'anime' | 'light_novel';
  coverUrl: string;
  year: number;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  genres: string[];
  rating: number;
  chapters?: number;
  volumes?: number;
  episodes?: number;
  role: string; // author, artist, director, voice_actor, etc.
  description: string;
  source: string;
}

interface Award {
  id: string;
  name: string;
  year: number;
  category: string;
  work?: string;
}

interface CreatorDiscoveryProps {
  visible: boolean;
  onClose: () => void;
  initialCreator?: Creator;
  onWorkSelect: (work: CreatorWork) => void;
}

const CreatorDiscovery: React.FC<CreatorDiscoveryProps> = ({
  visible,
  onClose,
  initialCreator,
  onWorkSelect,
}) => {
  const { colors } = useTheme();
  
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(initialCreator || null);
  const [activeTab, setActiveTab] = useState<'works' | 'biography' | 'related'>('works');
  const [featuredCreators, setFeaturedCreators] = useState<Creator[]>([]);
  const [workFilter, setWorkFilter] = useState<'all' | 'manga' | 'anime' | 'light_novel'>('all');
  const [sortBy, setSortBy] = useState<'year' | 'rating' | 'title'>('year');

  useEffect(() => {
    if (visible) {
      loadFeaturedCreators();
      if (initialCreator) {
        loadCreatorDetails(initialCreator.id);
      }
    }
  }, [visible, initialCreator]);

  const loadFeaturedCreators = () => {
    // Mock featured creators - would be fetched from API
    const mockCreators: Creator[] = [
      {
        id: '1',
        name: 'Eiichiro Oda',
        type: 'author',
        profileImage: 'https://via.placeholder.com/150',
        bio: 'Japanese manga artist best known for creating One Piece, one of the best-selling manga series of all time.',
        nationality: 'Japanese',
        website: 'https://one-piece.com',
        socialMedia: { twitter: '@Eiichiro_Staff' },
        stats: {
          worksCount: 3,
          followerCount: 2500000,
          averageRating: 9.2,
          totalVolumes: 105,
        },
        works: [
          {
            id: '1',
            title: 'One Piece',
            type: 'manga',
            coverUrl: 'https://via.placeholder.com/150x200',
            year: 1997,
            status: 'ongoing',
            genres: ['Adventure', 'Comedy', 'Shounen'],
            rating: 9.2,
            chapters: 1100,
            volumes: 105,
            role: 'Story & Art',
            description: 'The adventures of Monkey D. Luffy and his pirate crew.',
            source: 'Shueisha',
          },
        ],
        relatedCreators: [],
        isFollowing: false,
        awards: [
          {
            id: '1',
            name: 'Tezuka Osamu Cultural Prize',
            year: 2012,
            category: 'Grand Prize',
            work: 'One Piece',
          },
        ],
      },
      {
        id: '2',
        name: 'Studio MAPPA',
        type: 'studio',
        profileImage: 'https://via.placeholder.com/150',
        bio: 'Japanese animation studio known for high-quality anime productions and innovative animation techniques.',
        nationality: 'Japanese',
        website: 'https://mappa.co.jp',
        socialMedia: { twitter: '@MAPPA_Info' },
        stats: {
          worksCount: 25,
          followerCount: 1200000,
          averageRating: 8.7,
          totalVolumes: 0,
        },
        works: [
          {
            id: '2',
            title: 'Attack on Titan: The Final Season',
            type: 'anime',
            coverUrl: 'https://via.placeholder.com/150x200',
            year: 2020,
            status: 'completed',
            genres: ['Action', 'Drama', 'Fantasy'],
            rating: 9.0,
            episodes: 28,
            role: 'Animation Studio',
            description: 'The final season of the epic titan-fighting saga.',
            source: 'WIT Studio/MAPPA',
          },
          {
            id: '3',
            title: 'Jujutsu Kaisen',
            type: 'anime',
            coverUrl: 'https://via.placeholder.com/150x200',
            year: 2020,
            status: 'ongoing',
            genres: ['Supernatural', 'Action', 'School'],
            rating: 8.9,
            episodes: 24,
            role: 'Animation Studio',
            description: 'Students fight cursed spirits in modern Japan.',
            source: 'MAPPA',
          },
        ],
        relatedCreators: [],
        isFollowing: true,
        awards: [
          {
            id: '2',
            name: 'Tokyo Anime Award',
            year: 2021,
            category: 'Animation of the Year',
            work: 'Jujutsu Kaisen',
          },
        ],
      },
    ];

    setFeaturedCreators(mockCreators);
  };

  const loadCreatorDetails = async (creatorId: string) => {
    // Mock loading creator details - would be API call
    const creator = featuredCreators.find(c => c.id === creatorId);
    if (creator) {
      setSelectedCreator(creator);
    }
  };

  const followCreator = (creatorId: string) => {
    if (selectedCreator && selectedCreator.id === creatorId) {
      setSelectedCreator(prev => prev ? {
        ...prev,
        isFollowing: !prev.isFollowing,
        stats: {
          ...prev.stats,
          followerCount: prev.isFollowing 
            ? prev.stats.followerCount - 1 
            : prev.stats.followerCount + 1
        }
      } : null);
    }

    setFeaturedCreators(prev => prev.map(creator => 
      creator.id === creatorId 
        ? { 
            ...creator, 
            isFollowing: !creator.isFollowing,
            stats: {
              ...creator.stats,
              followerCount: creator.isFollowing 
                ? creator.stats.followerCount - 1 
                : creator.stats.followerCount + 1
            }
          }
        : creator
    ));
  };

  const getFilteredWorks = () => {
    if (!selectedCreator) return [];
    
    let filtered = selectedCreator.works;
    
    if (workFilter !== 'all') {
      filtered = filtered.filter(work => work.type === workFilter);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'rating':
          return b.rating - a.rating;
        case 'year':
        default:
          return b.year - a.year;
      }
    });
  };

  const renderCreatorCard = ({ item }: { item: Creator }) => (
    <TouchableOpacity
      style={[styles.creatorCard, { backgroundColor: colors.surface }]}
      onPress={() => setSelectedCreator(item)}
    >
      <View style={[styles.creatorAvatar, { backgroundColor: colors.surfaceVariant }]}>
        <Icon 
          name={item.type === 'studio' ? 'business' : 'person'} 
          size={32} 
          color={colors.onSurfaceVariant} 
        />
      </View>
      
      <View style={styles.creatorInfo}>
        <Text style={[styles.creatorName, { color: colors.onSurface }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.creatorType, { color: colors.onSurfaceVariant }]}>
          {item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Text>
        <Text style={[styles.creatorStats, { color: colors.onSurfaceVariant }]}>
          {item.stats.worksCount} works • {(item.stats.followerCount / 1000).toFixed(0)}K followers
        </Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={14} color={colors.warning} />
          <Text style={[styles.avgRating, { color: colors.onSurfaceVariant }]}>
            {item.stats.averageRating.toFixed(1)} avg
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.followButton,
          item.isFollowing 
            ? { backgroundColor: colors.primary } 
            : { backgroundColor: colors.surfaceVariant }
        ]}
        onPress={() => followCreator(item.id)}
      >
        <Icon 
          name={item.isFollowing ? 'check' : 'add'} 
          size={16} 
          color={item.isFollowing ? colors.onPrimary : colors.onSurfaceVariant} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderWork = ({ item }: { item: CreatorWork }) => (
    <TouchableOpacity
      style={[styles.workCard, { backgroundColor: colors.surface }]}
      onPress={() => onWorkSelect(item)}
    >
      <View style={[styles.workCover, { backgroundColor: colors.surfaceVariant }]}>
        <Icon 
          name={item.type === 'manga' ? 'menu-book' : 'play-circle-outline'} 
          size={28} 
          color={colors.onSurfaceVariant} 
        />
      </View>
      
      <View style={styles.workInfo}>
        <Text style={[styles.workTitle, { color: colors.onSurface }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.workMeta}>
          <View style={[
            styles.workTypeBadge,
            { backgroundColor: item.type === 'manga' ? colors.manga + '20' : colors.anime + '20' }
          ]}>
            <Text style={[
              styles.workTypeBadgeText,
              { color: item.type === 'manga' ? colors.manga : colors.anime }
            ]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          
          <Text style={[styles.workYear, { color: colors.onSurfaceVariant }]}>
            {item.year}
          </Text>
          
          <View style={styles.workRating}>
            <Icon name="star" size={12} color={colors.warning} />
            <Text style={[styles.workRatingText, { color: colors.onSurfaceVariant }]}>
              {item.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.workRole, { color: colors.primary }]}>
          {item.role}
        </Text>
        
        <Text style={[styles.workGenres, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
          {item.genres.join(', ')}
        </Text>
        
        <View style={styles.workStats}>
          {item.chapters && (
            <Text style={[styles.workStat, { color: colors.onSurfaceVariant }]}>
              {item.chapters} chapters
            </Text>
          )}
          {item.episodes && (
            <Text style={[styles.workStat, { color: colors.onSurfaceVariant }]}>
              {item.episodes} episodes
            </Text>
          )}
          {item.volumes && (
            <Text style={[styles.workStat, { color: colors.onSurfaceVariant }]}>
              {item.volumes} volumes
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCreatorProfile = () => {
    if (!selectedCreator) return null;

    return (
      <ScrollView style={styles.profileContent}>
        {/* Creator Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.surfaceVariant }]}>
            <Icon 
              name={selectedCreator.type === 'studio' ? 'business' : 'person'} 
              size={48} 
              color={colors.onSurfaceVariant} 
            />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.onSurface }]}>
              {selectedCreator.name}
            </Text>
            <Text style={[styles.profileType, { color: colors.onSurfaceVariant }]}>
              {selectedCreator.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            <Text style={[styles.profileNationality, { color: colors.onSurfaceVariant }]}>
              {selectedCreator.nationality}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.profileFollowButton,
              selectedCreator.isFollowing 
                ? { backgroundColor: colors.primary } 
                : { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.outline }
            ]}
            onPress={() => followCreator(selectedCreator.id)}
          >
            <Text style={[
              styles.profileFollowButtonText,
              { color: selectedCreator.isFollowing ? colors.onPrimary : colors.onSurface }
            ]}>
              {selectedCreator.isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.onSurface }]}>
              {selectedCreator.stats.worksCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
              Works
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.onSurface }]}>
              {(selectedCreator.stats.followerCount / 1000).toFixed(0)}K
            </Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
              Followers
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.onSurface }]}>
              {selectedCreator.stats.averageRating.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
              Avg Rating
            </Text>
          </View>
          {selectedCreator.stats.totalVolumes > 0 && (
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.onSurface }]}>
                {selectedCreator.stats.totalVolumes}
              </Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                Volumes
              </Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: colors.surfaceVariant }]}>
          {(['works', 'biography', 'related'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: colors.primary }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab 
                  ? { color: colors.onPrimary }
                  : { color: colors.onSurfaceVariant }
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'works' && (
          <View style={styles.worksSection}>
            <View style={styles.worksFilters}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterButtons}>
                  {(['all', 'manga', 'anime', 'light_novel'] as const).map(filter => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterButton,
                        workFilter === filter && { backgroundColor: colors.primary },
                        { borderColor: colors.outline }
                      ]}
                      onPress={() => setWorkFilter(filter)}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        workFilter === filter 
                          ? { color: colors.onPrimary }
                          : { color: colors.onSurface }
                      ]}>
                        {filter === 'all' ? 'All' : filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            <FlatList
              data={getFilteredWorks()}
              renderItem={renderWork}
              keyExtractor={item => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.workRow}
              contentContainerStyle={styles.worksList}
            />
          </View>
        )}

        {activeTab === 'biography' && (
          <View style={[styles.biographySection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.bioText, { color: colors.onSurface }]}>
              {selectedCreator.bio}
            </Text>
            
            {selectedCreator.awards.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  Awards & Recognition
                </Text>
                {selectedCreator.awards.map(award => (
                  <View key={award.id} style={styles.awardItem}>
                    <Icon name="emoji-events" size={20} color={colors.warning} />
                    <View style={styles.awardInfo}>
                      <Text style={[styles.awardName, { color: colors.onSurface }]}>
                        {award.name} ({award.year})
                      </Text>
                      <Text style={[styles.awardCategory, { color: colors.onSurfaceVariant }]}>
                        {award.category}
                        {award.work && ` - ${award.work}`}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.outline }]}>
          <TouchableOpacity 
            onPress={() => {
              if (selectedCreator) {
                setSelectedCreator(null);
              } else {
                onClose();
              }
            }} 
            style={styles.headerButton}
          >
            <Icon name="arrow-back" size={24} color={colors.onBackground} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
            {selectedCreator ? selectedCreator.name : 'Creators'}
          </Text>
          
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="search" size={24} color={colors.onBackground} />
          </TouchableOpacity>
        </View>

        {selectedCreator ? renderCreatorProfile() : (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
                Featured Creators
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant }]}>
                Discover popular authors, artists, and studios
              </Text>
            </View>
            
            <FlatList
              data={featuredCreators}
              renderItem={renderCreatorCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.creatorsList}
            />
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  creatorsList: {
    paddingBottom: 100,
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  creatorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  creatorType: {
    fontSize: 12,
    marginBottom: 4,
  },
  creatorStats: {
    fontSize: 12,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avgRating: {
    fontSize: 12,
    marginLeft: 2,
  },
  followButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginVertical: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    marginBottom: 2,
  },
  profileNationality: {
    fontSize: 12,
  },
  profileFollowButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  profileFollowButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  worksSection: {
    marginBottom: 100,
  },
  worksFilters: {
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  worksList: {
    gap: 12,
  },
  workRow: {
    justifyContent: 'space-between',
  },
  workCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workCover: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  workInfo: {
    flex: 1,
  },
  workTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
  },
  workMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  workTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  workTypeBadgeText: {
    fontSize: 8,
    fontWeight: '600',
  },
  workYear: {
    fontSize: 10,
  },
  workRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workRatingText: {
    fontSize: 10,
    marginLeft: 2,
  },
  workRole: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  workGenres: {
    fontSize: 10,
    marginBottom: 4,
  },
  workStats: {
    gap: 2,
  },
  workStat: {
    fontSize: 9,
  },
  biographySection: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 100,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  awardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  awardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  awardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  awardCategory: {
    fontSize: 12,
  },
});

export default CreatorDiscovery;