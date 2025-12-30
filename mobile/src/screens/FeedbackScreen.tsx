import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    RefreshControl,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import feedbackService, { Feedback } from '../services/feedbackService';

interface FeedbackScreenProps {
    navigation?: any;
}

const categories = [
    { id: 'general', label: 'General', icon: 'chatbubble' },
    { id: 'feature', label: 'Feature Request', icon: 'bulb' },
    { id: 'bug', label: 'Bug Report', icon: 'bug' },
    { id: 'ui', label: 'UI/UX', icon: 'color-palette' },
];

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ navigation }) => {
    const colors = useColors();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFeedbackText, setNewFeedbackText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchFeedback = useCallback(async (showLoader = true) => {
        if (showLoader) setIsLoading(true);
        try {
            const data = await feedbackService.getFeedback();
            setFeedback(data.feedback || []);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchFeedback();
    }, [fetchFeedback]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchFeedback(false);
    };

    const handleCreateFeedback = async () => {
        if (!newFeedbackText.trim()) {
            Alert.alert('Error', 'Please enter your feedback');
            return;
        }

        setIsSubmitting(true);
        try {
            const newFeedback = await feedbackService.createFeedback(
                newFeedbackText.trim(),
                selectedCategory
            );
            setFeedback([newFeedback, ...feedback]);
            setNewFeedbackText('');
            setSelectedCategory('general');
            setShowCreateModal(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleLike = async (feedbackId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            const updated = await feedbackService.toggleLike(feedbackId);
            setFeedback(prev => prev.map(f => f._id === feedbackId ? updated : f));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'bug': return '#EF4444';
            case 'feature': return '#3B82F6';
            case 'ui': return '#8B5CF6';
            default: return colors.primary;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        backButton: {
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'center', alignItems: 'center',
        },
        title: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: colors.text },
        addButton: {
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: colors.primary,
            justifyContent: 'center', alignItems: 'center',
        },
        content: { flex: 1 },
        contentContainer: { padding: SPACING.lg },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        emptyState: {
            flex: 1, justifyContent: 'center', alignItems: 'center',
            paddingHorizontal: SPACING.xl,
        },
        emptyIcon: {
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'center', alignItems: 'center',
            marginBottom: SPACING.lg,
        },
        emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: colors.text, marginBottom: SPACING.sm },
        emptyText: { fontSize: FONT_SIZES.md, color: colors.textMuted, textAlign: 'center' },
        feedbackCard: {
            backgroundColor: colors.card,
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.md,
            marginBottom: SPACING.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        feedbackHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.sm,
        },
        userAvatar: {
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: colors.primary,
            justifyContent: 'center', alignItems: 'center',
            marginRight: SPACING.sm,
        },
        avatarText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
        userInfo: { flex: 1 },
        userName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: colors.text },
        feedbackTime: { fontSize: FONT_SIZES.xs, color: colors.textMuted },
        categoryBadge: {
            paddingHorizontal: SPACING.sm,
            paddingVertical: 2,
            borderRadius: BORDER_RADIUS.full,
        },
        categoryText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#fff' },
        feedbackText: {
            fontSize: FONT_SIZES.md,
            color: colors.text,
            lineHeight: 22,
            marginBottom: SPACING.md,
        },
        feedbackFooter: { flexDirection: 'row', alignItems: 'center' },
        likeButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.xs,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: BORDER_RADIUS.full,
            backgroundColor: colors.backgroundSecondary,
        },
        likeButtonActive: { backgroundColor: `${colors.primary}20` },
        likeCount: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: colors.textSecondary },
        likeCountActive: { color: colors.primary },

        // Modal
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: colors.background,
            borderTopLeftRadius: BORDER_RADIUS.xl,
            borderTopRightRadius: BORDER_RADIUS.xl,
            maxHeight: '90%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: SPACING.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: colors.text },
        modalBody: { padding: SPACING.lg },
        inputLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: colors.text, marginBottom: SPACING.sm },
        textInput: {
            backgroundColor: colors.backgroundSecondary,
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.md,
            fontSize: FONT_SIZES.md,
            color: colors.text,
            minHeight: 120,
            textAlignVertical: 'top',
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: SPACING.lg,
        },
        categoriesRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: SPACING.sm,
            marginBottom: SPACING.xl,
        },
        categoryButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.xs,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: BORDER_RADIUS.full,
            backgroundColor: colors.backgroundSecondary,
            borderWidth: 1,
            borderColor: colors.border,
        },
        categoryButtonActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        categoryButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: colors.text },
        categoryButtonTextActive: { color: '#fff' },
        submitButton: {
            backgroundColor: colors.primary,
            paddingVertical: SPACING.md,
            borderRadius: BORDER_RADIUS.lg,
            alignItems: 'center',
        },
        submitButtonDisabled: { opacity: 0.6 },
        submitButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
    });

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Feedback</Text>
                    <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
                        <Ionicons name="add" size={24} color="#fff" />
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
                    contentContainerStyle={[
                        styles.contentContainer,
                        feedback.length === 0 && { flex: 1 },
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {feedback.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="chatbubbles-outline" size={36} color={colors.textMuted} />
                            </View>
                            <Text style={styles.emptyTitle}>No Feedback Yet</Text>
                            <Text style={styles.emptyText}>
                                Be the first to share your thoughts and help us improve!
                            </Text>
                        </View>
                    ) : (
                        feedback.map((item) => {
                            const isLiked = item.likes?.includes(user?._id || '');
                            return (
                                <View key={item._id} style={styles.feedbackCard}>
                                    <View style={styles.feedbackHeader}>
                                        <View style={[styles.userAvatar, { backgroundColor: getCategoryColor(item.category) }]}>
                                            <Text style={styles.avatarText}>
                                                {item.user?.firstName?.[0]}{item.user?.lastName?.[0]}
                                            </Text>
                                        </View>
                                        <View style={styles.userInfo}>
                                            <Text style={styles.userName}>
                                                {item.user?.firstName} {item.user?.lastName}
                                            </Text>
                                            <Text style={styles.feedbackTime}>{formatDate(item.createdAt)}</Text>
                                        </View>
                                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
                                            <Text style={styles.categoryText}>
                                                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.feedbackText}>{item.text}</Text>
                                    <View style={styles.feedbackFooter}>
                                        <TouchableOpacity
                                            style={[styles.likeButton, isLiked && styles.likeButtonActive]}
                                            onPress={() => handleToggleLike(item._id)}
                                        >
                                            <Ionicons
                                                name={isLiked ? 'heart' : 'heart-outline'}
                                                size={18}
                                                color={isLiked ? colors.primary : colors.textSecondary}
                                            />
                                            <Text style={[styles.likeCount, isLiked && styles.likeCountActive]}>
                                                {item.likeCount || 0}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>
            )}

            {/* Create Feedback Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowCreateModal(false)} />
                    <View style={styles.modalContent}>
                        <SafeAreaView edges={['bottom']}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Share Feedback</Text>
                                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.modalBody}>
                                <Text style={styles.inputLabel}>Category</Text>
                                <View style={styles.categoriesRow}>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[styles.categoryButton, selectedCategory === cat.id && styles.categoryButtonActive]}
                                            onPress={() => setSelectedCategory(cat.id)}
                                        >
                                            <Ionicons
                                                name={cat.icon as any}
                                                size={16}
                                                color={selectedCategory === cat.id ? '#fff' : colors.text}
                                            />
                                            <Text style={[styles.categoryButtonText, selectedCategory === cat.id && styles.categoryButtonTextActive]}>
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.inputLabel}>Your Feedback</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Tell us what you think..."
                                    placeholderTextColor={colors.textMuted}
                                    value={newFeedbackText}
                                    onChangeText={setNewFeedbackText}
                                    multiline
                                    numberOfLines={5}
                                />

                                <TouchableOpacity
                                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                                    onPress={handleCreateFeedback}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.submitButtonText}>
                                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

export default FeedbackScreen;
