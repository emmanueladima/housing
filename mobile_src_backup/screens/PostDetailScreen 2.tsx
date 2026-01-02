import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface PostDetailScreenProps {
    navigation?: any;
    route?: any;
}

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ navigation }) => {
    const [comment, setComment] = React.useState('');
    const [liked, setLiked] = React.useState(false);

    // Sample comments
    const comments = [
        { id: 1, author: 'Emily C.', text: 'I\'m interested! Is it still available?', time: '2h ago', likes: 3 },
        { id: 2, author: 'Alex M.', text: 'What\'s the move-in date?', time: '1h ago', likes: 1 },
        { id: 3, author: 'Sarah K.', text: 'DMed you!', time: '30m ago', likes: 0 },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation?.goBack?.()}
                    >
                        <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Post</Text>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Post Card */}
                    <View style={styles.postCard}>
                        {/* Author */}
                        <View style={styles.authorRow}>
                            <View style={styles.authorAvatar}>
                                <Text style={styles.authorInitials}>JD</Text>
                            </View>
                            <View style={styles.authorInfo}>
                                <Text style={styles.authorName}>John Doe</Text>
                                <Text style={styles.postMeta}>2 hours ago · Housing</Text>
                            </View>
                            <View style={styles.intentBadge}>
                                <Text style={styles.intentText}>Looking to rent</Text>
                            </View>
                        </View>

                        {/* Title */}
                        <Text style={styles.postTitle}>
                            Looking for a 1BR apartment near campus for Spring term
                        </Text>

                        {/* Content */}
                        <Text style={styles.postContent}>
                            Hey everyone! I'm a junior CS major looking for a 1BR or studio apartment
                            near OSU campus for Spring term 2025. My budget is around $800-1000/month.
                            {'\n\n'}
                            Preferences:
                            {'\n'}• Walking distance to campus (max 15 min)
                            {'\n'}• In-unit or shared laundry
                            {'\n'}• Pet-friendly would be great but not required
                            {'\n'}• Parking spot if possible
                            {'\n\n'}
                            I'm clean, quiet, and pay rent on time. Let me know if you have any leads!
                        </Text>

                        {/* Tags */}
                        <View style={styles.tagsRow}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>$800-1000/mo</Text>
                            </View>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>1BR</Text>
                            </View>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>Near Campus</Text>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => setLiked(!liked)}
                            >
                                <Ionicons
                                    name={liked ? "heart" : "heart-outline"}
                                    size={22}
                                    color={liked ? COLORS.primary : COLORS.textSecondary}
                                />
                                <Text style={[styles.actionText, liked && styles.actionTextActive]}>
                                    12
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.actionBtn}>
                                <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
                                <Text style={styles.actionText}>{comments.length}</Text>
                            </View>
                            <TouchableOpacity style={styles.actionBtn}>
                                <Ionicons name="share-outline" size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Comments Section */}
                    <View style={styles.commentsSection}>
                        <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>

                        {comments.map((c) => (
                            <View key={c.id} style={styles.commentCard}>
                                <View style={styles.commentAvatar}>
                                    <Text style={styles.commentInitials}>
                                        {c.author.split(' ').map(n => n[0]).join('')}
                                    </Text>
                                </View>
                                <View style={styles.commentContent}>
                                    <View style={styles.commentHeader}>
                                        <Text style={styles.commentAuthor}>{c.author}</Text>
                                        <Text style={styles.commentTime}>{c.time}</Text>
                                    </View>
                                    <Text style={styles.commentText}>{c.text}</Text>
                                    <View style={styles.commentActions}>
                                        <TouchableOpacity style={styles.commentAction}>
                                            <Ionicons name="heart-outline" size={16} color={COLORS.textMuted} />
                                            {c.likes > 0 && <Text style={styles.commentLikes}>{c.likes}</Text>}
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.commentAction}>
                                            <Text style={styles.replyText}>Reply</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Message Author Button */}
                <View style={styles.messageAuthorContainer}>
                    <TouchableOpacity style={styles.messageAuthorBtn}>
                        <Ionicons name="mail" size={18} color={COLORS.primary} />
                        <Text style={styles.messageAuthorText}>Message John privately</Text>
                    </TouchableOpacity>
                </View>

                {/* Comment Input */}
                <View style={styles.commentInputContainer}>
                    <View style={styles.inputAvatar}>
                        <Ionicons name="person" size={18} color={COLORS.textMuted} />
                    </View>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Add a comment..."
                        placeholderTextColor={COLORS.textMuted}
                        value={comment}
                        onChangeText={setComment}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, comment.trim() && styles.sendBtnActive]}
                        disabled={!comment.trim()}
                    >
                        <Ionicons
                            name="send"
                            size={18}
                            color={comment.trim() ? COLORS.card : COLORS.textMuted}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
    moreButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.lg,
    },

    // Post Card
    postCard: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    authorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorInitials: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.card,
    },
    authorInfo: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    authorName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    postMeta: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
    },
    intentBadge: {
        backgroundColor: 'rgba(219, 74, 43, 0.1)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    intentText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.primary,
    },
    postTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
        lineHeight: 28,
    },
    postContent: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        lineHeight: 24,
        marginBottom: SPACING.md,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    tag: {
        backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    tagText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '500',
        color: COLORS.text,
    },
    actionsRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.md,
        gap: SPACING.xl,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    actionText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    actionTextActive: {
        color: COLORS.primary,
    },

    // Comments
    commentsSection: {
        marginTop: SPACING.xl,
    },
    commentsTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    commentCard: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentInitials: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        color: COLORS.card,
    },
    commentContent: {
        flex: 1,
        marginLeft: SPACING.sm,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentAuthor: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text,
    },
    commentTime: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
    },
    commentText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        lineHeight: 20,
    },
    commentActions: {
        flexDirection: 'row',
        marginTop: SPACING.sm,
        gap: SPACING.md,
    },
    commentAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    commentLikes: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
    },
    replyText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '500',
        color: COLORS.textMuted,
    },

    // Message Author
    messageAuthorContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
    },
    messageAuthorBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: 'rgba(219, 74, 43, 0.1)',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    messageAuthorText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.primary,
    },

    // Comment Input
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: SPACING.sm,
    },
    inputAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentInput: {
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        maxHeight: 100,
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnActive: {
        backgroundColor: COLORS.primary,
    },
});

export default PostDetailScreen;
