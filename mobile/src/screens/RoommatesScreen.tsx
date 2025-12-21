import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.md) / 2;

interface RoommatesScreenProps {
    navigation?: any;
}

const RoommatesScreen: React.FC<RoommatesScreenProps> = ({ navigation }) => {
    const [activeTab, setActiveTab] = React.useState<'Solo' | 'Groups'>('Solo');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [likedProfiles, setLikedProfiles] = React.useState<number[]>([]);

    const toggleLike = (id: number) => {
        setLikedProfiles(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const openRoommateDetail = () => {
        navigation?.navigate?.('RoommateDetail');
    };

    const openGroupDetail = () => {
        navigation?.navigate?.('GroupDetail');
    };

    // Sample data
    const soloRoommates = [
        { id: 1, name: 'John D.', major: 'Computer Science', year: 'Junior', match: 85 },
        { id: 2, name: 'Emily C.', major: 'Business', year: 'Senior', match: 92 },
        { id: 3, name: 'Alex M.', major: 'Engineering', year: 'Sophomore', match: 78 },
        { id: 4, name: 'Sarah K.', major: 'Biology', year: 'Junior', match: 88 },
        { id: 5, name: 'Mike T.', major: 'Art', year: 'Freshman', match: 72 },
        { id: 6, name: 'Lisa P.', major: 'Psychology', year: 'Senior', match: 95 },
    ];

    const groups = [
        { id: 101, name: 'OSU CS House', members: 4, spots: 1, budget: '$800-1000' },
        { id: 102, name: 'Quiet Study Group', members: 3, spots: 2, budget: '$600-800' },
        { id: 103, name: 'Active Lifestyle', members: 5, spots: 0, budget: '$700-900' },
        { id: 104, name: 'Seniors 2025', members: 2, spots: 2, budget: '$900-1200' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Roommates</Text>
                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="options-outline" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Pill Tab Switcher - Centered and Prominent */}
                <View style={styles.tabContainer}>
                    <View style={styles.tabPill}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'Solo' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('Solo')}
                        >
                            <Ionicons
                                name="person"
                                size={16}
                                color={activeTab === 'Solo' ? COLORS.card : COLORS.textMuted}
                            />
                            <Text style={[styles.tabText, activeTab === 'Solo' && styles.tabTextActive]}>
                                Solo
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'Groups' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('Groups')}
                        >
                            <Ionicons
                                name="people"
                                size={16}
                                color={activeTab === 'Groups' ? COLORS.card : COLORS.textMuted}
                            />
                            <Text style={[styles.tabText, activeTab === 'Groups' && styles.tabTextActive]}>
                                Groups
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color={COLORS.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={activeTab === 'Solo' ? 'Search roommates...' : 'Search groups...'}
                            placeholderTextColor={COLORS.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    {activeTab === 'Solo' ? (
                        // Solo Roommates
                        soloRoommates.map((roommate) => (
                            <TouchableOpacity
                                key={roommate.id}
                                style={styles.card}
                                activeOpacity={0.95}
                                onPress={openRoommateDetail}
                            >
                                {/* Image */}
                                <View style={styles.imageContainer}>
                                    <LinearGradient
                                        colors={['#E5E7EB', '#D1D5DB']}
                                        style={styles.imagePlaceholder}
                                    >
                                        <View style={styles.avatarCircle}>
                                            <Text style={styles.avatarText}>
                                                {roommate.name.split(' ').map(n => n[0]).join('')}
                                            </Text>
                                        </View>
                                    </LinearGradient>

                                    {/* Heart */}
                                    <TouchableOpacity
                                        style={styles.heartButton}
                                        onPress={() => toggleLike(roommate.id)}
                                    >
                                        <Ionicons
                                            name={likedProfiles.includes(roommate.id) ? "heart" : "heart-outline"}
                                            size={18}
                                            color={likedProfiles.includes(roommate.id) ? COLORS.primary : COLORS.text}
                                        />
                                    </TouchableOpacity>

                                    {/* Match Badge */}
                                    <View style={styles.matchBadge}>
                                        <Text style={styles.matchText}>{roommate.match}%</Text>
                                    </View>
                                </View>

                                {/* Content */}
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardName} numberOfLines={1}>{roommate.name}</Text>
                                    <Text style={styles.cardDetails}>{roommate.year}</Text>
                                    <Text style={styles.cardMajor} numberOfLines={1}>{roommate.major}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        // Groups
                        groups.map((group) => (
                            <TouchableOpacity
                                key={group.id}
                                style={styles.card}
                                activeOpacity={0.95}
                                onPress={openGroupDetail}
                            >
                                {/* Image */}
                                <View style={styles.imageContainer}>
                                    <LinearGradient
                                        colors={['#E5E7EB', '#D1D5DB']}
                                        style={styles.imagePlaceholder}
                                    >
                                        <View style={styles.groupIcon}>
                                            <Ionicons name="people" size={30} color={COLORS.primary} />
                                        </View>
                                    </LinearGradient>

                                    {/* Spots Badge */}
                                    <View style={[
                                        styles.matchBadge,
                                        { backgroundColor: group.spots > 0 ? COLORS.success : COLORS.textMuted }
                                    ]}>
                                        <Text style={styles.matchText}>
                                            {group.spots > 0 ? `${group.spots} spot${group.spots > 1 ? 's' : ''}` : 'Full'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Content */}
                                < View style={styles.cardContent} >
                                    <Text style={styles.cardName} numberOfLines={1}>{group.name}</Text>
                                    <Text style={styles.cardDetails}>{group.members} members</Text>
                                    <Text style={styles.cardMajor}>{group.budget}/mo</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Bottom padding */}
                <View style={{ height: 120 }} />
            </ScrollView >

            {/* Floating Create Button */}
            < View style={styles.createButtonContainer} >
                <TouchableOpacity style={styles.createButton} activeOpacity={0.9}>
                    <Ionicons name="add" size={24} color={COLORS.card} />
                </TouchableOpacity>
            </View >
        </View >
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
    filterButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // Tab Pill - Centered and Prominent
    tabContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    tabPill: {
        flexDirection: 'row',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.full,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
    },
    tabButtonActive: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    tabTextActive: {
        color: COLORS.card,
    },

    // Search
    searchContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
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

    // Content
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: SPACING.lg,
    },

    // Grid
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    // Cards
    card: {
        width: CARD_WIDTH,
        marginBottom: SPACING.md,
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    imageContainer: {
        height: 140,
        position: 'relative',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.card,
    },
    groupIcon: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: COLORS.white80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heartButton: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.white90,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    matchBadge: {
        position: 'absolute',
        bottom: SPACING.sm,
        left: SPACING.sm,
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

    // Card content
    cardContent: {
        padding: SPACING.sm,
    },
    cardName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    cardDetails: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    cardMajor: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
        fontWeight: '500',
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

export default RoommatesScreen;
