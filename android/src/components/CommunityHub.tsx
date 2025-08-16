/**
 * Community Hub Component
 * Features: Chapter discussions, creator pages, social integration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';

interface Discussion {
  id: string;
  chapterNumber: string;
  mangaTitle: string;
  commentCount: number;
  latestComment: {
    author: string;
    text: string;
    timestamp: Date;
    likes: number;
  };
  spoilerWarning: boolean;
}

interface Creator {
  id: string;
  name: string;
  type: 'author' | 'artist' | 'studio';
  profileImage: string;
  worksCount: number;
  followerCount: number;
  bio: string;
  works: CreatorWork[];
  isFollowing: boolean;
}

interface CreatorWork {
  id: string;
  title: string;
  type: 'manga' | 'anime';
  year: number;
  rating: number;
  status: string;
}

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  timestamp: Date;
  likes: number;
  replies: Comment[];
  isLiked: boolean;
  spoilerWarning: boolean;
}

interface CommunityHubProps {
  visible: boolean;
  onClose: () => void;
  currentManga?: {
    id: string;
    title: string;
    currentChapter: string;
  };
  currentCreator?: Creator;
}

const CommunityHub: React.FC<CommunityHubProps> = ({
  visible,
  onClose,
  currentManga,
  currentCreator,
}) => {
  const { colors } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'discussions' | 'creators' | 'community'>('discussions');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  useEffect(() => {
    if (visible) {
      loadCommunityData();
    }
  }, [visible, activeTab]);

  const loadCommunityData = () => {
    // Mock community data - would be fetched from API
    const mockDiscussions: Discussion[] = [
      {
        id: '1',
        chapterNumber: '1100',
        mangaTitle: 'One Piece',
        commentCount: 245,
        latestComment: {
          author: 'PirateKing94',
          text: 'That reveal was absolutely insane! Did not see that coming at all...',
          timestamp: new Date('2024-01-15T10:30:00'),
          likes: 28,
        },
        spoilerWarning: true,
      },
      {
        id: '2',
        chapterNumber: '257',
        mangaTitle: 'Chainsaw Man',
        commentCount: 189,
        latestComment: {
          author: 'DevilHunter',
          text: 'Fujimoto never fails to surprise us with these plot twists',
          timestamp: new Date('2024-01-15T09:45:00'),
          likes: 15,
        },
        spoilerWarning: false,
      },
    ];

    const mockCreators: Creator[] = [
      {
        id: '1',
        name: 'Eiichiro Oda',
        type: 'author',
        profileImage: 'https://via.placeholder.com/100',
        worksCount: 3,
        followerCount: 2500000,
        bio: 'Manga artist best known for creating One Piece, one of the best-selling manga series of all time.',
        works: [
          {
            id: '1',
            title: 'One Piece',
            type: 'manga',
            year: 1997,
            rating: 9.2,
            status: 'Ongoing',
          },
          {
            id: '2',
            title: 'Romance Dawn',
            type: 'manga',
            year: 1996,
            rating: 7.8,
            status: 'Completed',
          },
        ],
        isFollowing: false,
      },
      {
        id: '2',
        name: 'Studio Pierrot',
        type: 'studio',
        profileImage: 'https://via.placeholder.com/100',
        worksCount: 127,
        followerCount: 890000,
        bio: 'Japanese animation studio known for producing high-quality anime series and films.',
        works: [
          {
            id: '3',
            title: 'Naruto',
            type: 'anime',
            year: 2002,
            rating: 8.9,
            status: 'Completed',
          },
          {
            id: '4',
            title: 'Bleach',
            type: 'anime',
            year: 2004,
            rating: 8.7,
            status: 'Completed',
          },
        ],
        isFollowing: true,
      },
    ];

    const mockComments: Comment[] = [
      {
        id: '1',
        author: 'MangaFan2024',
        authorAvatar: 'https://via.placeholder.com/40',
        text: 'This chapter was absolutely incredible! The character development has been outstanding.',
        timestamp: new Date('2024-01-15T11:00:00'),
        likes: 42,
        replies: [
          {
            id: '1-1',
            author: 'OneListReader',
            authorAvatar: 'https://via.placeholder.com/40',
            text: 'Totally agree! The pacing has been perfect lately.',
            timestamp: new Date('2024-01-15T11:15:00'),
            likes: 8,
            replies: [],
            isLiked: false,
            spoilerWarning: false,
          },
        ],
        isLiked: true,
        spoilerWarning: false,
      },
      {
        id: '2',
        author: 'ChapterAnalyst',
        authorAvatar: 'https://via.placeholder.com/40',
        text: '[SPOILER] The way they revealed the connection to the previous arc was masterful storytelling.',
        timestamp: new Date('2024-01-15T10:45:00'),
        likes: 37,
        replies: [],
        isLiked: false,
        spoilerWarning: true,
      },
    ];

    setDiscussions(mockDiscussions);
    setCreators(mockCreators);
    setComments(mockComments);
  };

  const followCreator = (creatorId: string) => {
    setCreators(prev => prev.map(creator => 
      creator.id === creatorId 
        ? { ...creator, isFollowing: !creator.isFollowing }
        : creator
    ));
  };

  const likeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

  const postComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      authorAvatar: 'https://via.placeholder.com/40',
      text: newComment,
      timestamp: new Date(),
      likes: 0,
      replies: [],
      isLiked: false,
      spoilerWarning: newComment.toLowerCase().includes('spoiler'),
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const openCreatorPage = (creator: Creator) => {
    setSelectedCreator(creator);
    setShowCreatorModal(true);
  };

  const renderDiscussion = ({ item }: { item: Discussion }) => (
    <TouchableOpacity
      style={[styles.discussionCard, { backgroundColor: colors.surface }]}
      onPress={() => {
        // Open chapter discussion
        Alert.alert('Chapter Discussion', `Opening discussion for ${item.mangaTitle} Chapter ${item.chapterNumber}`);
      }}
    >
      {item.spoilerWarning && (
        <View style={[styles.spoilerWarning, { backgroundColor: colors.errorContainer }]}>
          <Icon name="visibility-off" size={14} color={colors.onErrorContainer} />
          <Text style={[styles.spoilerText, { color: colors.onErrorContainer }]}>
            Contains Spoilers
          </Text>
        </View>
      )}
      
      <Text style={[styles.discussionTitle, { color: colors.onSurface }]}>
        {item.mangaTitle} - Chapter {item.chapterNumber}
      </Text>
      
      <View style={styles.discussionMeta}>
        <Icon name="comment" size={16} color={colors.primary} />
        <Text style={[styles.commentCount, { color: colors.primary }]}>
          {item.commentCount} comments
        </Text>
      </View>
      
      <View style={styles.latestComment}>
        <Text style={[styles.commentAuthor, { color: colors.onSurfaceVariant }]}>
          {item.latestComment.author}:
        </Text>
        <Text style={[styles.commentText, { color: colors.onSurface }]} numberOfLines={2}>
          {item.latestComment.text}
        </Text>
        <View style={styles.commentFooter}>
          <Text style={[styles.commentTime, { color: colors.onSurfaceVariant }]}>
            {item.latestComment.timestamp.toLocaleTimeString()}
          </Text>
          <View style={styles.commentLikes}>
            <Icon name="thumb-up" size={12} color={colors.onSurfaceVariant} />
            <Text style={[styles.likesCount, { color: colors.onSurfaceVariant }]}>
              {item.latestComment.likes}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCreator = ({ item }: { item: Creator }) => (
    <TouchableOpacity
      style={[styles.creatorCard, { backgroundColor: colors.surface }]}
      onPress={() => openCreatorPage(item)}
    >
      <View style={[styles.creatorAvatar, { backgroundColor: colors.surfaceVariant }]}>
        <Icon name="person" size={32} color={colors.onSurfaceVariant} />
      </View>
      
      <View style={styles.creatorInfo}>
        <Text style={[styles.creatorName, { color: colors.onSurface }]}>
          {item.name}
        </Text>
        <Text style={[styles.creatorType, { color: colors.onSurfaceVariant }]}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
        <Text style={[styles.creatorStats, { color: colors.onSurfaceVariant }]}>
          {item.worksCount} works • {(item.followerCount / 1000).toFixed(0)}K followers
        </Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.followButton,
          item.isFollowing 
            ? { backgroundColor: colors.primary } 
            : { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.outline }
        ]}
        onPress={() => followCreator(item.id)}
      >
        <Text style={[
          styles.followButtonText,
          { color: item.isFollowing ? colors.onPrimary : colors.onSurface }
        ]}>
          {item.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={[styles.commentCard, { backgroundColor: colors.surface }]}>
      {item.spoilerWarning && (
        <View style={[styles.spoilerTag, { backgroundColor: colors.errorContainer }]}>
          <Text style={[styles.spoilerTagText, { color: colors.onErrorContainer }]}>
            SPOILER
          </Text>
        </View>
      )}
      
      <View style={styles.commentHeader}>
        <View style={[styles.commentAvatar, { backgroundColor: colors.surfaceVariant }]}>
          <Icon name="person" size={20} color={colors.onSurfaceVariant} />
        </View>
        <View style={styles.commentMeta}>
          <Text style={[styles.commentAuthorName, { color: colors.onSurface }]}>
            {item.author}
          </Text>
          <Text style={[styles.commentTimestamp, { color: colors.onSurfaceVariant }]}>
            {item.timestamp.toLocaleTimeString()}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.commentContent, { color: colors.onSurface }]}>
        {item.text}
      </Text>
      
      <View style={styles.commentActions}>
        <TouchableOpacity
          style={styles.commentAction}
          onPress={() => likeComment(item.id)}
        >
          <Icon 
            name={item.isLiked ? 'thumb-up' : 'thumb-up-off-alt'} 
            size={16} 
            color={item.isLiked ? colors.primary : colors.onSurfaceVariant} 
          />
          <Text style={[
            styles.commentActionText,
            { color: item.isLiked ? colors.primary : colors.onSurfaceVariant }
          ]}>
            {item.likes}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.commentAction}>
          <Icon name="reply" size={16} color={colors.onSurfaceVariant} />
          <Text style={[styles.commentActionText, { color: colors.onSurfaceVariant }]}>
            Reply
          </Text>
        </TouchableOpacity>
      </View>
      
      {item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map(reply => (
            <View key={reply.id} style={styles.replyCard}>
              <Text style={[styles.replyAuthor, { color: colors.primary }]}>
                {reply.author}:
              </Text>
              <Text style={[styles.replyText, { color: colors.onSurface }]}>
                {reply.text}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

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
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Icon name="arrow-back" size={24} color={colors.onBackground} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
            Community
          </Text>
          
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="notifications" size={24} color={colors.onBackground} />
          </TouchableOpacity>
        </View>

        <View style={[styles.tabBar, { backgroundColor: colors.surfaceVariant }]}>
          {(['discussions', 'creators', 'community'] as const).map(tab => (
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

        <ScrollView style={styles.content}>
          {activeTab === 'discussions' && (
            <>
              {currentManga && (
                <View style={[styles.currentChapterSection, { backgroundColor: colors.primaryContainer }]}>
                  <Text style={[styles.currentChapterTitle, { color: colors.onPrimaryContainer }]}>
                    Current Chapter Discussion
                  </Text>
                  <Text style={[styles.currentChapterInfo, { color: colors.onPrimaryContainer }]}>
                    {currentManga.title} - Chapter {currentManga.currentChapter}
                  </Text>
                </View>
              )}
              
              <FlatList
                data={discussions}
                renderItem={renderDiscussion}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.discussionsList}
              />
            </>
          )}

          {activeTab === 'creators' && (
            <FlatList
              data={creators}
              renderItem={renderCreator}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.creatorsList}
            />
          )}

          {activeTab === 'community' && (
            <>
              <View style={[styles.commentInput, { backgroundColor: colors.surface }]}>
                <TextInput
                  style={[
                    styles.commentTextInput,
                    { 
                      backgroundColor: colors.surfaceVariant,
                      color: colors.onSurfaceVariant
                    }
                  ]}
                  placeholder="Share your thoughts..."
                  placeholderTextColor={colors.onSurfaceVariant + '80'}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.postButton, { backgroundColor: colors.primary }]}
                  onPress={postComment}
                >
                  <Icon name="send" size={20} color={colors.onPrimary} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.commentsList}
              />
            </>
          )}
        </ScrollView>
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
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  currentChapterSection: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  currentChapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentChapterInfo: {
    fontSize: 14,
  },
  discussionsList: {
    paddingBottom: 100,
  },
  discussionCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  spoilerWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  spoilerText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  discussionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentCount: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  latestComment: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 6,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentTime: {
    fontSize: 12,
  },
  commentLikes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  creatorsList: {
    paddingBottom: 100,
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
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
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentInput: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  commentTextInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxHeight: 100,
    marginRight: 12,
  },
  postButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    paddingBottom: 100,
  },
  commentCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  spoilerTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  spoilerTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentMeta: {
    flex: 1,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentTimestamp: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 20,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentActionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  repliesContainer: {
    marginTop: 12,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
  replyCard: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  replyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default CommunityHub;