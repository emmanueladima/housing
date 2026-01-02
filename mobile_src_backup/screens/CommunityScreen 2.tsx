import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import communityService, { Post } from '../services/communityService';

// Channel tabs
const channels = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'housing', label: 'Housing', icon: 'home' },
    { id: 'subleases', label: 'Subleases', icon: 'calendar' },
    { id: 'roommates', label: 'Roommates', icon: 'people' },
    { id: 'furniture', label: 'Furniture', icon: 'bed' },
];

interface CommunityScreenProps {
    navigation?: any;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
    const [activeChannel, setActiveChannel] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchPosts = useCallback(async (showLoader = true) => {
        if (showLoader) setIsLoading(true);
        try {
            const filters = activeChannel !== 'all' ? { channel: activeChannel } : {};
            const response = await communityService.getPosts(filters);
            setPosts(response.posts || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [activeChannel]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchPosts(false);
    };

    const openPostDetail = (post: Post) => {
        navigation?.navigate?.('PostDetail', { postId: post._id });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        return 'Just now';
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Community</Text>
                    <TouchableOpacity style={styles.notifButton}>
                        <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color={COLORS.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search posts..."
                            placeholderTextColor={COLORS.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Channel Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.channelContainer}
                >
                    {channels.map((channel) => {
                        const isActive = activeChannel === channel.id;
                        return (
                            <TouchableOpacity
                                key={channel.id}
                                style={[styles.channelPill, isActive && styles.channelPillActive]}
                                onPress={() => setActiveChannel(channel.id)}
                            >
                                <Ionicons
                                    name={channel.icon as any}
                                    size={16}
                                    color={isActive ? COLORS.card : COLORS.text}
                                />
                                <Text style={[styles.channelText, isActive && styles.channelTextActive]}>
                                    {channel.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </SafeAreaView>

            {/* Posts */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                        />
                    }
                >
                    {posts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={60} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>No posts yet</Text>
                        </View>
                    ) : (
                        posts.map((post) => (
                            <TouchableOpacity
                                key={post._id}
                                style={styles.postCard}
                                activeOpacity={0.95}
                                onPress={() => openPostDetail(post)}
                            >
                                {/* Post Header */}
                                <View style={styles.postHeader}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {getInitials(post.author.name)}
                                        </Text>
                                    </View>
                                    <View style={styles.postMeta}>
                                        <Text style={styles.authorName}>{post.author.name}</Text>
                                        <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.moreButton}>
                                        <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textMuted} />
                                    </TouchableOpacity>
                                </View>

                                {/* Post Content */}
                                <Text style={styles.postTitle}>{post.title}</Text>
                                <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>

                                {/* Tags */}
                                {post.tags && post.tags.length > 0 && (
                                    <View style={styles.tagRow}>
                                        {post.tags.slice(0, 3).map((tag, index) => (
                                            <View key={index} style={styles.tag}>
                                                <Text style={styles.tagText}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Post Footer */}
                                <View style={styles.postFooter}>
                                    <View style={styles.statRow}>
                                        <View style={styles.stat}>
                                            <Ionicons name="heart-outline" size={16} color={COLORS.textSecondary} />
                                            <Text style={styles.statText}>{post.likes}</Text>
                                        </View>
                                        <View style={styles.stat}>
                                            <Ionicons name="chatbubble-outline" size={15} color={COLORS.textSecondary} />
                                            <Text style={styles.statText}>{post.commentCount}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.messageButton}>
                                        <Ionicons name="send" size={14} color={COLORS.primary} />
                                        <Text style={styles.messageButtonText}>Message</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}

                    <View style={{ height: 120 }} />
                </ScrollView>
            )}

            {/* Floating Create Button */}
            <View style={styles.createButtonContainer}>
                <TouchableOpacity
                    style={styles.createButton}
                    activeOpacity={0.9}
                    onPress={() => navigation?.navigate?.('CreatePost', { channel: activeChannel })}
                >
                    <Ionicons name="add" size={24} color={COLORS.card} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textMuted,
        marginTop: SPACING.md,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
    },
    title: {
        fontSize: FONT_SIZES.title,
        fontWeight: '700',
        color: COLORS.text,
    },
    notifButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // Search
    searchContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
    },

    // Channel Pills
    channelContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    channelPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.full,
        marginRight: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    channelPillActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    channelText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text,
    },
    channelTextActive: {
        color: COLORS.card,
    },

    // Content
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: SPACING.lg,
    },

    // Post Card
    postCard: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        color: COLORS.card,
    },
    postMeta: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    authorName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    postTime: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
    },
    moreButton: {
        padding: SPACING.xs,
    },
    postTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    postContent: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        lineHeight: 22,
        marginBottom: SPACING.md,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs,
        marginBottom: SPACING.md,
    },
    tag: {
        backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    tagText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.primary,
        fontWeight: '500',
    },
    postFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    statRow: {
        flexDirection: 'row',
        gap: SPACING.lg,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'rgba(219, 74, 43, 0.1)',
    },
    messageButtonText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.primary,
    },

    // Floating Create Button
    createButtonContainer: {
        position: 'absolute',
        bottom: 100,
        right: SPACING.lg,
    },
    createButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.lg,
    },
});

export default CommunityScreen;
