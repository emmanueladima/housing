import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import messageService, { Thread } from '../services/messageService';
import { useTheme } from '../contexts/ThemeContext';

interface MessagesScreenProps {
    navigation?: any;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
    const colors = useColors();
    const { isDark } = useTheme();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchThreads = useCallback(async (showLoader = true) => {
        if (showLoader) setIsLoading(true);
        try {
            const response = await messageService.getThreads();
            setThreads(response.threads || []);
        } catch (error) {
            console.error('Error fetching threads:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchThreads();
    }, [fetchThreads]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchThreads(false);
    };

    const openThread = (thread: Thread) => {
        const otherUser = getOtherParticipant(thread);
        navigation.navigate('Chat', {
            threadId: thread._id,
            thread: thread,
            otherUserName: otherUser?.name || 'Chat',
        });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d`;
        if (diffHours > 0) return `${diffHours}h`;
        if (diffMins > 0) return `${diffMins}m`;
        return 'Now';
    };

    const getOtherParticipant = (thread: Thread) => {
        return thread.participants[0];
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        safeArea: {
            backgroundColor: colors.background,
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
        emptyIcon: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: SPACING.lg,
        },
        emptyTitle: {
            fontSize: FONT_SIZES.xl,
            fontWeight: '600',
            color: colors.text,
            marginBottom: SPACING.xs,
        },
        emptyText: {
            fontSize: FONT_SIZES.md,
            color: colors.textSecondary,
            textAlign: 'center',
            paddingHorizontal: SPACING.xl,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
        },
        title: {
            fontSize: FONT_SIZES.title,
            fontWeight: '700',
            color: colors.text,
        },
        newButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.backgroundSecondary,
            borderRadius: BORDER_RADIUS.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        content: {
            flex: 1,
        },
        contentContainer: {
            paddingHorizontal: SPACING.lg,
        },
        threadCard: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: SPACING.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        avatarContainer: {
            position: 'relative',
        },
        avatar: {
            width: 56,
            height: 56,
            borderRadius: 28,
        },
        avatarPlaceholder: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarText: {
            fontSize: FONT_SIZES.lg,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        unreadDot: {
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: colors.success,
            borderWidth: 2,
            borderColor: colors.background,
        },
        threadContent: {
            flex: 1,
            marginLeft: SPACING.md,
        },
        threadHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
        },
        threadName: {
            fontSize: FONT_SIZES.md,
            fontWeight: '500',
            color: colors.text,
            flex: 1,
        },
        threadNameUnread: {
            fontWeight: '700',
        },
        threadTime: {
            fontSize: FONT_SIZES.xs,
            color: colors.textMuted,
            marginLeft: SPACING.sm,
        },
        threadPreview: {
            fontSize: FONT_SIZES.sm,
            color: colors.textSecondary,
            marginBottom: 4,
        },
        threadPreviewUnread: {
            color: colors.text,
            fontWeight: '500',
        },
        contextBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: `${colors.primary}15`,
            paddingHorizontal: SPACING.sm,
            paddingVertical: 2,
            borderRadius: BORDER_RADIUS.sm,
            alignSelf: 'flex-start',
        },
        contextText: {
            fontSize: FONT_SIZES.xs,
            color: colors.primary,
            fontWeight: '500',
        },
        unreadBadge: {
            backgroundColor: colors.primary,
            paddingHorizontal: SPACING.sm,
            paddingVertical: 4,
            borderRadius: BORDER_RADIUS.full,
            minWidth: 24,
            alignItems: 'center',
        },
        unreadCount: {
            fontSize: FONT_SIZES.xs,
            fontWeight: '700',
            color: '#FFFFFF',
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>Messages</Text>
                    <TouchableOpacity
                        style={styles.newButton}
                        onPress={() => {
                            navigation?.navigate('Main', { screen: 'Roommates' });
                        }}
                    >
                        <Ionicons name="create-outline" size={22} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
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
                            tintColor={colors.primary}
                        />
                    }
                >
                    {threads.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="chatbubbles-outline" size={40} color={colors.textMuted} />
                            </View>
                            <Text style={styles.emptyTitle}>No messages yet</Text>
                            <Text style={styles.emptyText}>Start a conversation with a roommate or landlord</Text>
                        </View>
                    ) : (
                        threads.map((thread) => {
                            const otherUser = getOtherParticipant(thread);
                            return (
                                <TouchableOpacity
                                    key={thread._id}
                                    style={styles.threadCard}
                                    onPress={() => openThread(thread)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.avatarContainer}>
                                        {otherUser?.profilePhoto ? (
                                            <Image
                                                source={{ uri: otherUser.profilePhoto }}
                                                style={styles.avatar}
                                            />
                                        ) : (
                                            <View style={styles.avatarPlaceholder}>
                                                <Text style={styles.avatarText}>
                                                    {getInitials(otherUser?.name || 'U')}
                                                </Text>
                                            </View>
                                        )}
                                        {thread.unreadCount > 0 && (
                                            <View style={styles.unreadDot} />
                                        )}
                                    </View>

                                    <View style={styles.threadContent}>
                                        <View style={styles.threadHeader}>
                                            <Text style={[
                                                styles.threadName,
                                                thread.unreadCount > 0 && styles.threadNameUnread
                                            ]} numberOfLines={1}>
                                                {otherUser?.name || 'Unknown'}
                                            </Text>
                                            <Text style={styles.threadTime}>
                                                {formatTimeAgo(thread.updatedAt)}
                                            </Text>
                                        </View>
                                        <Text style={[
                                            styles.threadPreview,
                                            thread.unreadCount > 0 && styles.threadPreviewUnread
                                        ]} numberOfLines={1}>
                                            {thread.lastMessage?.content || 'No messages yet'}
                                        </Text>
                                        {thread.listing && (
                                            <View style={styles.contextBadge}>
                                                <Ionicons name="home" size={12} color={colors.primary} />
                                                <Text style={styles.contextText} numberOfLines={1}>
                                                    {thread.listing.title}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {thread.unreadCount > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <Text style={styles.unreadCount}>{thread.unreadCount}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })
                    )}

                    <View style={{ height: 120 }} />
                </ScrollView>
            )}
        </View>
    );
};

export default MessagesScreen;
