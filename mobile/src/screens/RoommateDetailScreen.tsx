import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = height * 0.35;

interface RoommateDetailScreenProps {
    navigation?: any;
    route?: any;
}

const RoommateDetailScreen: React.FC<RoommateDetailScreenProps> = ({ navigation }) => {
    const [isSaved, setIsSaved] = React.useState(false);

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Check out this roommate on Collegio!',
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Fixed Background Image with Profile */}
            <View style={styles.fixedImage}>
                <LinearGradient
                    colors={['#9CA3AF', '#D1D5DB', '#E5E7EB']}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.profilePicture}>
                    <Text style={styles.profileInitials}>JD</Text>
                </View>
            </View>

            {/* Header overlay */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation?.goBack?.()}
                >
                    <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                        <Ionicons name="share-outline" size={20} color={COLORS.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setIsSaved(!isSaved)}
                    >
                        <Ionicons
                            name={isSaved ? "heart" : "heart-outline"}
                            size={20}
                            color={isSaved ? COLORS.primary : COLORS.text}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Spacer */}
                <View style={styles.imageSpacer} />

                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* Title */}
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>John Doe</Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color={COLORS.warning} />
                            <Text style={styles.rating}>4.8</Text>
                            <Text style={styles.ratingDot}>·</Text>
                            <View style={styles.matchBadge}>
                                <Text style={styles.matchText}>85% Match</Text>
                            </View>
                            <Text style={styles.ratingDot}>·</Text>
                            <Text style={styles.location}>OSU Student</Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>Junior</Text>
                            <Text style={styles.statLabel}>year</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>CS</Text>
                            <Text style={styles.statLabel}>major</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>$800-1k</Text>
                            <Text style={styles.statLabel}>budget</Text>
                        </View>
                    </View>

                    {/* Quick Info */}
                    <View style={styles.quickInfo}>
                        <View style={styles.infoItem}>
                            <Ionicons name="moon" size={18} color={COLORS.primary} />
                            <Text style={styles.infoText}>Night Owl</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="volume-low" size={18} color={COLORS.success} />
                            <Text style={styles.infoText}>Quiet</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="sparkles" size={18} color={COLORS.warning} />
                            <Text style={styles.infoText}>Very Clean</Text>
                        </View>
                    </View>

                    {/* Bio */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.description}>
                            CS major looking for a quiet roommate who respects personal space.
                            I enjoy gaming and watching movies. Clean and organized.
                        </Text>
                    </View>

                    {/* Lifestyle */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Lifestyle</Text>
                        <View style={styles.lifestyleGrid}>
                            {[
                                { icon: 'moon', label: 'Sleep', value: 'Late (after midnight)' },
                                { icon: 'volume-low', label: 'Noise', value: 'Quiet environment' },
                                { icon: 'sparkles', label: 'Cleaning', value: 'Very organized' },
                                { icon: 'people', label: 'Guests', value: 'Occasionally' },
                            ].map((item, index) => (
                                <View key={index} style={styles.lifestyleItem}>
                                    <View style={styles.lifestyleIcon}>
                                        <Ionicons name={item.icon as any} size={18} color={COLORS.primary} />
                                    </View>
                                    <View style={styles.lifestyleContent}>
                                        <Text style={styles.lifestyleLabel}>{item.label}</Text>
                                        <Text style={styles.lifestyleValue}>{item.value}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Interests */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Interests</Text>
                        <View style={styles.interestsGrid}>
                            {['Gaming', 'Movies', 'Coding', 'Music', 'Hiking'].map((interest, index) => (
                                <View key={index} style={styles.interestTag}>
                                    <Text style={styles.interestText}>{interest}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Reviews */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Past Roommate Reviews</Text>
                        <View style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewerAvatar}>
                                    <Text style={styles.reviewerInitials}>EC</Text>
                                </View>
                                <View>
                                    <Text style={styles.reviewerName}>Emily C.</Text>
                                    <Text style={styles.reviewDate}>Lived together 2023-2024</Text>
                                </View>
                            </View>
                            <Text style={styles.reviewText}>
                                "Great roommate! Very respectful and clean."
                            </Text>
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.messageButton}>
                    <Ionicons name="chatbubble" size={18} color={COLORS.card} />
                    <Text style={styles.messageButtonText}>Message</Text>
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
    fixedImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: IMAGE_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        borderWidth: 4,
        borderColor: COLORS.card,
        ...SHADOWS.lg,
    },
    profileInitials: {
        fontSize: 36,
        fontWeight: '700',
        color: COLORS.card,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white90,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    headerActions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white90,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        minHeight: height,
    },
    imageSpacer: {
        height: IMAGE_HEIGHT - 30,
    },
    contentCard: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        minHeight: height - IMAGE_HEIGHT + 100,
        ...SHADOWS.lg,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZES.xxxl,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text,
        marginLeft: 4,
    },
    ratingDot: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
        marginHorizontal: SPACING.sm,
    },
    matchBadge: {
        backgroundColor: COLORS.success,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    matchText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        color: COLORS.card,
    },
    location: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.md,
    },
    quickInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
    },
    infoText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.text,
    },
    section: {
        paddingVertical: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    description: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    lifestyleGrid: {
        gap: SPACING.sm,
    },
    lifestyleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    lifestyleIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(219, 74, 43, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    lifestyleContent: {
        flex: 1,
    },
    lifestyleLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
    },
    lifestyleValue: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
        color: COLORS.text,
    },
    interestsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    interestTag: {
        backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    interestText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text,
    },
    reviewCard: {
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    reviewerInitials: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        color: COLORS.card,
    },
    reviewerName: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text,
    },
    reviewDate: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
    },
    reviewText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        paddingBottom: SPACING.xxxl,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
    },
    messageButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.card,
    },
});

export default RoommateDetailScreen;
