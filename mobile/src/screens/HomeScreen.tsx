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
    Modal,
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import listingService, { Listing, ListingFilters } from '../services/listingService';

const { width } = Dimensions.get('window');

// Filter pills
const filters = [
    { id: 'nearby', label: 'Nearby', icon: 'location' },
    { id: 'verified', label: 'Verified', icon: 'shield-checkmark' },
    { id: 'available', label: 'Available', icon: 'calendar' },
    { id: 'pets', label: 'Pet-friendly', icon: 'paw' },
];

// Recommended filter cards (for modal)
const recommendedFilters = [
    { id: 'verified', label: 'Verified Landlord', icon: 'shield-checkmark', color: '#DB4A2B' },
    { id: 'utilities', label: 'Utilities Included', icon: 'bulb', color: '#F59E0B' },
    { id: 'sublease', label: 'Sublease', icon: 'calendar', color: '#3B82F6' },
    { id: 'pets', label: 'Pet Friendly', icon: 'paw', color: '#6B7280' },
];

interface HomeScreenProps {
    navigation?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [likedListings, setLikedListings] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [placeType, setPlaceType] = useState('any');

    // Fetch listings from API
    const fetchListings = useCallback(async (showLoader = true) => {
        if (showLoader) setIsLoading(true);
        try {
            const apiFilters: ListingFilters = {};

            // Apply active filters
            if (activeFilters.includes('verified')) {
                // Backend filter for verified
            }
            if (activeFilters.includes('pets')) {
                apiFilters.amenities = ['pets'];
            }

            const response = await listingService.getListings(apiFilters);
            setListings(response.listings || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [activeFilters]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchListings(false);
    };

    const toggleFilter = (id: string) => {
        setActiveFilters(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleLike = async (id: string) => {
        try {
            await listingService.toggleFavorite(id);
            setLikedListings(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            );
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const openListingDetail = (listing: Listing) => {
        navigation?.navigate?.('ListingDetail', { listingId: listing._id });
    };

    const formatPrice = (price: number) => {
        return `$${price.toLocaleString()}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={COLORS.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Find listings"
                            placeholderTextColor={COLORS.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.filterIcon}
                        onPress={() => setShowFilters(true)}
                    >
                        <Ionicons name="options-outline" size={20} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Filter Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                >
                    {filters.map((filter) => {
                        const isActive = activeFilters.includes(filter.id);
                        return (
                            <TouchableOpacity
                                key={filter.id}
                                style={[styles.filterPill, isActive && styles.filterPillActive]}
                                onPress={() => toggleFilter(filter.id)}
                            >
                                <Ionicons
                                    name={filter.icon as any}
                                    size={18}
                                    color={isActive ? COLORS.primary : COLORS.text}
                                />
                                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </SafeAreaView>

            {/* Listings */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading listings...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.listingsScroll}
                    contentContainerStyle={styles.listingsContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                        />
                    }
                >
                    {listings.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="home-outline" size={60} color={COLORS.textMuted} />
                            <Text style={styles.emptyTitle}>No listings found</Text>
                            <Text style={styles.emptyText}>Try adjusting your filters</Text>
                        </View>
                    ) : (
                        listings.map((listing) => (
                            <TouchableOpacity
                                key={listing._id}
                                style={styles.listingCard}
                                activeOpacity={0.95}
                                onPress={() => openListingDetail(listing)}
                            >
                                {/* Image */}
                                <View style={styles.imageContainer}>
                                    {listing.images && listing.images.length > 0 ? (
                                        <Image
                                            source={{ uri: listing.images[0] }}
                                            style={styles.listingImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <LinearGradient
                                            colors={['#E5E7EB', '#D1D5DB']}
                                            style={styles.imagePlaceholder}
                                        >
                                            <Ionicons name="home" size={40} color={COLORS.textMuted} />
                                        </LinearGradient>
                                    )}

                                    {/* Heart Button */}
                                    <TouchableOpacity
                                        style={styles.heartButton}
                                        onPress={() => toggleLike(listing._id)}
                                    >
                                        <Ionicons
                                            name={likedListings.includes(listing._id) ? "heart" : "heart-outline"}
                                            size={22}
                                            color={likedListings.includes(listing._id) ? COLORS.primary : COLORS.text}
                                        />
                                    </TouchableOpacity>

                                    {/* Verified Badge */}
                                    {listing.isVerified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="shield-checkmark" size={12} color={COLORS.card} />
                                        </View>
                                    )}

                                    {/* Image dots */}
                                    {listing.images && listing.images.length > 1 && (
                                        <View style={styles.imageDots}>
                                            {listing.images.slice(0, 5).map((_, index) => (
                                                <View key={index} style={[styles.dot, index === 0 && styles.dotActive]} />
                                            ))}
                                        </View>
                                    )}
                                </View>

                                {/* Content */}
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>{listing.title}</Text>
                                    <Text style={styles.cardLocation}>{listing.city}, {listing.state}</Text>

                                    <View style={styles.cardDetails}>
                                        <Text style={styles.detailText}>{listing.bedrooms}bd {listing.bathrooms}ba</Text>
                                        <Text style={styles.detailDot}>·</Text>
                                        <Text style={styles.priceText}>{formatPrice(listing.rent)}/mo</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}

                    {/* Bottom padding */}
                    <View style={{ height: 120 }} />
                </ScrollView>
            )}

            {/* Floating Map Button */}
            <View style={styles.mapButtonContainer}>
                <TouchableOpacity style={styles.mapButton} activeOpacity={0.9}>
                    <Ionicons name="map" size={18} color={COLORS.card} />
                    <Text style={styles.mapButtonText}>Map</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Modal */}
            <Modal
                visible={showFilters}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Filters</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Recommended for you */}
                        <Text style={styles.sectionTitle}>Recommended for you</Text>
                        <View style={styles.recommendedGrid}>
                            {recommendedFilters.map((filter) => (
                                <TouchableOpacity
                                    key={filter.id}
                                    style={[
                                        styles.recommendedCard,
                                        activeFilters.includes(filter.id) && styles.recommendedCardActive
                                    ]}
                                    onPress={() => toggleFilter(filter.id)}
                                >
                                    <View style={[styles.recommendedIcon, { backgroundColor: filter.color + '15' }]}>
                                        <Ionicons name={filter.icon as any} size={24} color={filter.color} />
                                    </View>
                                    <Text style={styles.recommendedLabel}>{filter.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Type of place */}
                        <Text style={styles.sectionTitle}>Type of place</Text>
                        <View style={styles.typeRow}>
                            {['any', 'room', 'entire'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.typeButton, placeType === type && styles.typeButtonActive]}
                                    onPress={() => setPlaceType(type)}
                                >
                                    <Text style={[styles.typeText, placeType === type && styles.typeTextActive]}>
                                        {type === 'any' ? 'Any type' : type === 'room' ? 'Room' : 'Entire home'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    {/* Modal Footer */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity onPress={() => setActiveFilters([])}>
                            <Text style={styles.clearText}>Clear all</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.showButton}
                            onPress={() => {
                                setShowFilters(false);
                                fetchListings();
                            }}
                        >
                            <Text style={styles.showButtonText}>Show places</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
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
    loadingText: {
        marginTop: SPACING.md,
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: SPACING.md,
    },
    emptyText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
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
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.lg,
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
    filterIcon: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // Filter Pills
    filtersContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 2,
        borderColor: COLORS.border,
        marginRight: SPACING.sm,
    },
    filterPillActive: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(219, 74, 43, 0.05)',
    },
    filterText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    filterTextActive: {
        color: COLORS.primary,
    },

    // Listings
    listingsScroll: {
        flex: 1,
    },
    listingsContent: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
    },
    listingCard: {
        marginBottom: SPACING.xl,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
    },
    imageContainer: {
        height: 220,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        position: 'relative',
    },
    listingImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heartButton: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    verifiedBadge: {
        position: 'absolute',
        top: SPACING.md,
        left: SPACING.md,
        backgroundColor: COLORS.success,
        padding: 6,
        borderRadius: BORDER_RADIUS.sm,
    },
    imageDots: {
        position: 'absolute',
        bottom: SPACING.md,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.xs,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.white60,
    },
    dotActive: {
        backgroundColor: COLORS.card,
    },

    // Card content
    cardContent: {
        paddingTop: SPACING.md,
    },
    cardTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    cardLocation: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    cardDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    priceText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        color: COLORS.text,
    },
    detailDot: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
        marginHorizontal: SPACING.xs,
    },

    // Map button
    mapButtonContainer: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        ...SHADOWS.lg,
    },
    mapButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.card,
    },

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: SPACING.xl,
        marginBottom: SPACING.md,
    },

    // Recommended cards
    recommendedGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
    },
    recommendedCard: {
        width: (width - SPACING.lg * 2 - SPACING.md * 3) / 4,
        aspectRatio: 0.9,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recommendedCardActive: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(219, 74, 43, 0.05)',
    },
    recommendedIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    recommendedLabel: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '500',
        color: COLORS.text,
        textAlign: 'center',
    },

    // Type buttons
    typeRow: {
        flexDirection: 'row',
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    typeButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
    },
    typeButtonActive: {
        backgroundColor: COLORS.text,
    },
    typeText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text,
    },
    typeTextActive: {
        color: COLORS.card,
    },

    // Modal footer
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    clearText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
        textDecorationLine: 'underline',
    },
    showButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xxl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    showButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.card,
    },
});

export default HomeScreen;
