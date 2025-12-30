import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import lifestyleProfileService, { LifestyleProfile } from '../services/lifestyleProfileService';
import roommateGroupService, { RoommateGroup } from '../services/roommateGroupService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.md) / 2;

interface RoommatesScreenProps {
    navigation?: any;
}

const RoommatesScreen: React.FC<RoommatesScreenProps> = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState<'Solo' | 'Groups'>('Solo');
    const [searchQuery, setSearchQuery] = useState('');
    const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
    const [profiles, setProfiles] = useState<LifestyleProfile[]>([]);
    const [groups, setGroups] = useState<RoommateGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = useCallback(async (showLoader = true) => {
        if (showLoader) setIsLoading(true);
        try {
            if (activeTab === 'Solo') {
                const profilesData = await lifestyleProfileService.getMatches();
                setProfiles(profilesData || []);
            } else {
                const groupsData = await roommateGroupService.getAllGroups();
                setGroups(groupsData || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchData(false);
    };

    const toggleLike = async (id: string) => {
        try {
            await lifestyleProfileService.toggleSavedProfile(id);
            setLikedProfiles(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            );
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const openRoommateDetail = (profile: LifestyleProfile) => {
        navigation?.navigate?.('RoommateDetail', { profileId: profile._id });
    };

    const openGroupDetail = (group: RoommateGroup) => {
        navigation?.navigate?.('GroupDetail', { groupId: group._id });
    };

    // Helper to get user name from different formats
    const getUserName = (user: any): string => {
        if (user?.name) return user.name;
        if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
        if (user?.firstName) return user.firstName;
        return 'Unknown';
    };

    const getInitials = (user: any): string => {
        const name = getUserName(user);
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatBudget = (budget?: { min: number; max: number }) => {
        if (!budget) return 'Flexible';
        return `$${budget.min}-${budget.max}`;
    };

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

                {/* Pill Tab Switcher */}
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
                    <View style={styles.grid}>
                        {activeTab === 'Solo' ? (
                            profiles.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="person-outline" size={60} color={COLORS.textMuted} />
                                    <Text style={styles.emptyText}>No roommates found</Text>
                                </View>
                            ) : (
                                profiles.map((profile) => (
                                    <TouchableOpacity
                                        key={profile._id}
                                        style={styles.card}
                                        activeOpacity={0.95}
                                        onPress={() => openRoommateDetail(profile)}
                                    >
                                        {/* Image */}
                                        <View style={styles.imageContainer}>
                                            {profile.user.profilePhoto ? (
                                                <Image
                                                    source={{ uri: profile.user.profilePhoto }}
                                                    style={styles.profileImage}
                                                />
                                            ) : (
                                                <LinearGradient
                                                    colors={['#E5E7EB', '#D1D5DB']}
                                                    style={styles.imagePlaceholder}
                                                >
                                                    <View style={styles.avatarCircle}>
                                                        <Text style={styles.avatarText}>
                                                            {getInitials(profile.user)}
                                                        </Text>
                                                    </View>
                                                </LinearGradient>
                                            )}

                                            {/* Heart */}
                                            <TouchableOpacity
                                                style={styles.heartButton}
                                                onPress={() => toggleLike(profile._id)}
                                            >
                                                <Ionicons
                                                    name={likedProfiles.includes(profile._id) ? "heart" : "heart-outline"}
                                                    size={18}
                                                    color={likedProfiles.includes(profile._id) ? COLORS.primary : COLORS.text}
                                                />
                                            </TouchableOpacity>

                                            {/* Match Badge */}
                                            {profile.matchScore && (
                                                <View style={styles.matchBadge}>
                                                    <Text style={styles.matchText}>{profile.matchScore}%</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Content */}
                                        <View style={styles.cardContent}>
                                            <Text style={styles.cardName} numberOfLines={1}>{getUserName(profile.user)}</Text>
                                            <Text style={styles.cardDetails}>{profile.year || 'Student'}</Text>
                                            <Text style={styles.cardMajor} numberOfLines={1}>{profile.major || 'Undeclared'}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )
                        ) : (
                            groups.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="people-outline" size={60} color={COLORS.textMuted} />
                                    <Text style={styles.emptyText}>No groups found</Text>
                                </View>
                            ) : (
                                groups.map((group) => (
                                    <TouchableOpacity
                                        key={group._id}
                                        style={styles.card}
                                        activeOpacity={0.95}
                                        onPress={() => openGroupDetail(group)}
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
                                                { backgroundColor: group.spotsAvailable > 0 ? COLORS.success : COLORS.textMuted }
                                            ]}>
                                                <Text style={styles.matchText}>
                                                    {group.spotsAvailable > 0 ? `${group.spotsAvailable} spot${group.spotsAvailable > 1 ? 's' : ''}` : 'Full'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Content */}
                                        <View style={styles.cardContent}>
                                            <Text style={styles.cardName} numberOfLines={1}>{group.name}</Text>
                                            <Text style={styles.cardDetails}>{group.members.length} members</Text>
                                            <Text style={styles.cardMajor}>{formatBudget(group.budget)}/mo</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )
                        )}
                    </View>

                    {/* Bottom padding */}
                    <View style={{ height: 120 }} />
                </ScrollView>
            )}

            {/* Floating Create Button */}
            <View style={styles.createButtonContainer}>
                <TouchableOpacity
                    style={styles.createButton}
                    activeOpacity={0.9}
                    onPress={() => navigation?.navigate?.(activeTab === 'Solo' ? 'CreateProfile' : 'CreateGroup')}
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
        width: '100%',
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

    // Tab Pill
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
    profileImage: {
        width: '100%',
        height: '100%',
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
