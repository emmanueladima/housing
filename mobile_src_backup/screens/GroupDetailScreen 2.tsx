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

interface GroupDetailScreenProps {
    navigation?: any;
    route?: any;
}

const GroupDetailScreen: React.FC<GroupDetailScreenProps> = ({ navigation }) => {
    const [isSaved, setIsSaved] = React.useState(false);

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Check out this roommate group on Collegio!',
            });
        } catch (error) {
            console.log(error);
        }
    };

    // Sample group members
    const members = [
        { id: 1, name: 'John D.', role: 'Admin', major: 'CS' },
        { id: 2, name: 'Emily C.', role: 'Member', major: 'Business' },
        { id: 3, name: 'Alex M.', role: 'Member', major: 'Engineering' },
        { id: 4, name: 'Sarah K.', role: 'Member', major: 'Biology' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Fixed Background Image */}
            <View style={styles.fixedImage}>
                <LinearGradient
                    colors={['#9CA3AF', '#D1D5DB', '#E5E7EB']}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.groupIcon}>
                    <Ionicons name="people" size={40} color={COLORS.primary} />
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
                        <Text style={styles.title}>OSU CS House</Text>
                        <View style={styles.ratingRow}>
                            <View style={styles.spotsBadge}>
                                <Text style={styles.spotsText}>1 spot available</Text>
                            </View>
                            <Text style={styles.ratingDot}>·</Text>
                            <Text style={styles.location}>4 members</Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>$800-1k</Text>
                            <Text style={styles.statLabel}>budget/person</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>Near OSU</Text>
                            <Text style={styles.statLabel}>preferred area</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>Jan 2025</Text>
                            <Text style={styles.statLabel}>move-in</Text>
                        </View>
                    </View>

                    {/* Quick Info */}
                    <View style={styles.quickInfo}>
                        <View style={styles.infoItem}>
                            <Ionicons name="moon" size={18} color={COLORS.primary} />
                            <Text style={styles.infoText}>Night Owls</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="volume-low" size={18} color={COLORS.success} />
                            <Text style={styles.infoText}>Study-focused</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="game-controller" size={18} color={COLORS.warning} />
                            <Text style={styles.infoText}>Gamers</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About this group</Text>
                        <Text style={styles.description}>
                            We're a group of CS students looking for one more person to join our house
                            near campus. We're all night owls who enjoy gaming and study sessions together.
                            Looking for someone clean and respectful.
                        </Text>
                    </View>

                    {/* Members */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Members ({members.length})</Text>
                        {members.map((member) => (
                            <View key={member.id} style={styles.memberCard}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.memberInitials}>
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </Text>
                                </View>
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName}>{member.name}</Text>
                                    <Text style={styles.memberMeta}>{member.major}</Text>
                                </View>
                                {member.role === 'Admin' && (
                                    <View style={styles.adminBadge}>
                                        <Text style={styles.adminText}>Admin</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Preferences */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Group Preferences</Text>
                        <View style={styles.lifestyleGrid}>
                            {[
                                { icon: 'moon', label: 'Sleep', value: 'Late sleepers' },
                                { icon: 'volume-low', label: 'Noise', value: 'Quiet after 11pm' },
                                { icon: 'sparkles', label: 'Cleaning', value: 'Rotating schedule' },
                                { icon: 'paw', label: 'Pets', value: 'No pets' },
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

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.requestButton}>
                    <Ionicons name="person-add" size={18} color={COLORS.card} />
                    <Text style={styles.requestButtonText}>Request to Join</Text>
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
    groupIcon: {
        width: 100,
        height: 100,
        borderRadius: 24,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        borderWidth: 4,
        borderColor: COLORS.card,
        ...SHADOWS.lg,
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
    spotsBadge: {
        backgroundColor: COLORS.success,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    spotsText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        color: COLORS.card,
    },
    ratingDot: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
        marginHorizontal: SPACING.sm,
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
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        marginTop: 2,
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.md,
    },
    quickInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
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
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    memberAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberInitials: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.card,
    },
    memberInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    memberName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    memberMeta: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
    },
    adminBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    adminText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.card,
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
    requestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
    },
    requestButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.card,
    },
});

export default GroupDetailScreen;
