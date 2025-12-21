import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';

// Channel pills - matching website
const channels = [
    { id: 'all', label: 'All Channels', icon: 'grid' },
    { id: 'housing', label: 'Housing', icon: 'home' },
    { id: 'subleases', label: 'Subleases', icon: 'key' },
    { id: 'roommates', label: 'Roommates', icon: 'people' },
    { id: 'furniture', label: 'Furniture', icon: 'bed' },
];

const CommunityScreen = ({ navigation }: { navigation?: any }) => {
    const [activeChannel, setActiveChannel] = React.useState('all');
    const [searchQuery, setSearchQuery] = React.useState('');

    const openPostDetail = () => {
        navigation?.navigate?.('PostDetail');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Community</Text>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Channel Pills - Like website */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.channelsContainer}
                >
                    {channels.map((channel) => (
                        <TouchableOpacity
                            key={channel.id}
                            style={[
                                styles.channelPill,
                                activeChannel === channel.id && styles.channelPillActive,
                            ]}
                            onPress={() => setActiveChannel(channel.id)}
                        >
                            <Ionicons
                                name={channel.icon as any}
                                size={14}
                                color={activeChannel === channel.id ? COLORS.card : COLORS.text}
                            />
                            <Text
                                style={[
                                    styles.channelText,
                                    activeChannel === channel.id && styles.channelTextActive,
                                ]}
                            >
                                {channel.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

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
                    <TouchableOpacity style={styles.createButton}>
                        <Ionicons name="add" size={22} color={COLORS.card} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Posts Feed */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Posts */}
                {[1, 2, 3, 4].map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={styles.postCard}
                        activeOpacity={0.95}
                        onPress={openPostDetail}
                    >
                        {/* Post Header */}
                        <View style={styles.postHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>JD</Text>
                            </View>
                            <View style={styles.postMeta}>
                                <Text style={styles.postAuthor}>John Doe</Text>
                                <View style={styles.postInfo}>
                                    <Text style={styles.postTime}>2h ago</Text>
                                    <Text style={styles.postDot}>·</Text>
                                    <View style={styles.channelTag}>
                                        <Ionicons name="home" size={10} color={COLORS.primary} />
                                        <Text style={styles.channelTagText}>Housing</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.intentBadge}>
                                <Text style={styles.intentText}>Looking for</Text>
                            </View>
                        </View>

                        {/* Post Content */}
                        <Text style={styles.postTitle}>Looking for 2BR apartment near campus</Text>
                        <Text style={styles.postBody} numberOfLines={2}>
                            Hi everyone! I'm a junior CS student looking for a 2BR apartment for next semester. Budget is around $800-1000/mo.
                        </Text>

                        {/* Post Footer */}
                        <View style={styles.postFooter}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="chatbubble-outline" size={18} color={COLORS.textSecondary} />
                                <Text style={styles.actionText}>5</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="heart-outline" size={18} color={COLORS.textSecondary} />
                                <Text style={styles.actionText}>12</Text>
                            </TouchableOpacity>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity style={styles.messageButton}>
                                <Ionicons name="send" size={14} color={COLORS.primary} />
                                <Text style={styles.messageButtonText}>Message</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Bottom padding */}
                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
    },
    safeArea: {
        backgroundColor: COLORS.background,
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
    notificationButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // Channels
    channelsContainer: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    channelPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: SPACING.sm,
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

    // Search
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
    },
    searchBar: {
        flex: 1,
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
    createButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.lg,
    },

    // Content
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.lg,
    },

    // Posts
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
    postAuthor: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    postInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    postTime: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
    },
    postDot: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        marginHorizontal: SPACING.xs,
    },
    channelTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    channelTagText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.primary,
        fontWeight: '500',
    },
    intentBadge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    intentText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: '#1D4ED8',
    },
    postTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    postBody: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: SPACING.md,
    },
    postFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginRight: SPACING.lg,
    },
    actionText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: 'rgba(219, 74, 43, 0.1)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
    },
    messageButtonText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.primary,
    },
});

export default CommunityScreen;
