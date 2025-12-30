import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

interface Notification {
    _id: string;
    type: 'message' | 'application_update' | 'new_match' | 'post_reply' | 'system';
    title: string;
    body: string;
    data?: {
        threadId?: string;
        listingId?: string;
        applicationId?: string;
        postId?: string;
    };
    read: boolean;
    createdAt: string;
}

interface NotificationsScreenProps {
    navigation?: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
    const colors = useColors();
    const { isDark } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchNotifications = useCallback(async (showLoader = true) => {
        if (showLoader) setIsLoading(true);
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.notifications || response.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchNotifications(false);
    };

    const markAsRead = (notification: Notification) => {
        setNotifications(prev =>
            prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
        );
    };

    const handleNotificationPress = (notification: Notification) => {
        markAsRead(notification);

        switch (notification.type) {
            case 'message':
                if (notification.data?.threadId) {
                    navigation?.navigate('Chat', { threadId: notification.data.threadId });
                }
                break;
            case 'application_update':
                if (notification.data?.listingId) {
                    navigation?.navigate('ListingDetail', { listingId: notification.data.listingId });
                }
                break;
            case 'post_reply':
                if (notification.data?.postId) {
                    navigation?.navigate('PostDetail', { postId: notification.data.postId });
                }
                break;
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message': return { name: 'chatbubble', color: '#3B82F6' };
            case 'application_update': return { name: 'document-text', color: '#10B981' };
            case 'new_match': return { name: 'heart', color: colors.primary };
            case 'post_reply': return { name: 'chatbubbles', color: '#8B5CF6' };
            default: return { name: 'notifications', color: colors.textMuted };
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return 'Just now';
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
        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.backgroundSecondary,
            borderRadius: BORDER_RADIUS.md,
        },
        title: {
            fontSize: FONT_SIZES.xl,
            fontWeight: '700',
            color: colors.text,
        },
        markAllBtn: {
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.xs,
        },
        markAllText: {
            fontSize: FONT_SIZES.sm,
            color: colors.primary,
            fontWeight: '600',
        },
        content: {
            flex: 1,
        },
        contentContainer: {
            paddingHorizontal: SPACING.lg,
        },
        notificationCard: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            backgroundColor: colors.card,
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.md,
            marginBottom: SPACING.sm,
            borderWidth: 1,
            borderColor: colors.border,
        },
        notificationUnread: {
            backgroundColor: `${colors.primary}08`,
            borderColor: `${colors.primary}30`,
        },
        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: SPACING.md,
        },
        notificationContent: {
            flex: 1,
        },
        notificationTitle: {
            fontSize: FONT_SIZES.md,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 2,
        },
        notificationTitleUnread: {
            fontWeight: '700',
        },
        notificationBody: {
            fontSize: FONT_SIZES.sm,
            color: colors.textSecondary,
            marginBottom: 4,
            lineHeight: 18,
        },
        notificationTime: {
            fontSize: FONT_SIZES.xs,
            color: colors.textMuted,
        },
        unreadDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.primary,
            marginLeft: SPACING.sm,
            marginTop: 6,
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation?.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Notifications</Text>
                    {notifications.some(n => !n.read) ? (
                        <TouchableOpacity
                            style={styles.markAllBtn}
                            onPress={() => {
                                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                            }}
                        >
                            <Text style={styles.markAllText}>Mark all</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 60 }} />
                    )}
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
                    {notifications.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="notifications-outline" size={40} color={colors.textMuted} />
                            </View>
                            <Text style={styles.emptyTitle}>No notifications</Text>
                            <Text style={styles.emptyText}>You'll see updates about messages, applications, and more here</Text>
                        </View>
                    ) : (
                        notifications.map((notification) => {
                            const icon = getNotificationIcon(notification.type);
                            return (
                                <TouchableOpacity
                                    key={notification._id}
                                    style={[
                                        styles.notificationCard,
                                        !notification.read && styles.notificationUnread
                                    ]}
                                    onPress={() => handleNotificationPress(notification)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
                                        <Ionicons name={icon.name as any} size={20} color={icon.color} />
                                    </View>
                                    <View style={styles.notificationContent}>
                                        <Text style={[
                                            styles.notificationTitle,
                                            !notification.read && styles.notificationTitleUnread
                                        ]} numberOfLines={1}>
                                            {notification.title}
                                        </Text>
                                        <Text style={styles.notificationBody} numberOfLines={2}>
                                            {notification.body}
                                        </Text>
                                        <Text style={styles.notificationTime}>
                                            {formatTimeAgo(notification.createdAt)}
                                        </Text>
                                    </View>
                                    {!notification.read && <View style={styles.unreadDot} />}
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

export default NotificationsScreen;
