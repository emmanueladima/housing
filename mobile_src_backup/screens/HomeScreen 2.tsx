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
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Mapbox, { MapView, Camera, PointAnnotation, MarkerView } from '@rnmapbox/maps';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import listingService, { Listing, ListingFilters } from '../services/listingService';
import { config } from '../config';

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
    const [showMap, setShowMap] = useState(false);
    const [placeType, setPlaceType] = useState('any');

    // Advanced filter states
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [leaseTerm, setLeaseTerm] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

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

            {/* Floating Buttons */}
            <View style={styles.fabContainer}>
                {/* Create Listing FAB */}
                <TouchableOpacity
                    style={styles.fabButton}
                    activeOpacity={0.9}
                    onPress={() => navigation?.navigate?.('CreateListing')}
                >
                    <Ionicons name="add" size={24} color={COLORS.card} />
                </TouchableOpacity>

                {/* Map Button */}
                <TouchableOpacity
                    style={styles.mapButton}
                    activeOpacity={0.9}
                    onPress={() => setShowMap(true)}
                >
                    <Ionicons name="map" size={18} color={COLORS.card} />
                    <Text style={styles.mapButtonText}>Map</Text>
                </TouchableOpacity>
            </View>

            {/* Map Modal */}
            <Modal
                visible={showMap}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <View style={styles.mapModalContainer}>
                    {/* Map Header */}
                    <SafeAreaView edges={['top']} style={styles.mapHeader}>
                        <TouchableOpacity
                            style={styles.mapCloseButton}
                            onPress={() => setShowMap(false)}
                        >
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.mapTitle}>Listings Map</Text>
                        <View style={{ width: 40 }} />
                    </SafeAreaView>

                    {/* Map View - Mapbox */}
                    <MapView style={styles.map}>
                        <Camera
                            zoomLevel={14}
                            centerCoordinate={[config.DEFAULT_LONGITUDE, config.DEFAULT_LATITUDE]}
                        />
                        {listings
                            .filter(l => (l.latitude && l.longitude) || (l.coordinates?.lat && l.coordinates?.lng))
                            .map((listing) => {
                                const lat = listing.latitude || listing.coordinates?.lat;
                                const lng = listing.longitude || listing.coordinates?.lng;
                                if (!lat || !lng) return null;
                                return (
                                    <MarkerView
                                        key={listing._id}
                                        coordinate={[lng, lat]}
                                    >
                                        <TouchableOpacity
                                            style={styles.mapboxMarker}
                                            onPress={() => {
                                                setShowMap(false);
                                                openListingDetail(listing);
                                            }}
                                        >
                                            <Text style={styles.mapboxMarkerText}>
                                                ${listing.rent >= 1000 ? `${(listing.rent / 1000).toFixed(1)}k` : listing.rent}
                                            </Text>
                                        </TouchableOpacity>
                                    </MarkerView>
                                );
                            })}
                    </MapView>

                    {/* List View Toggle */}
                    <View style={styles.listToggleContainer}>
                        <TouchableOpacity
                            style={styles.listToggleButton}
                            onPress={() => setShowMap(false)}
                        >
                            <Ionicons name="list" size={18} color={COLORS.card} />
                            <Text style={styles.listToggleText}>List</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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

                        {/* Price Range */}
                        <Text style={styles.sectionTitle}>Price Range</Text>
                        <View style={styles.priceRangeRow}>
                            <View style={styles.priceInputWrapper}>
                                <Text style={styles.priceLabel}>Min</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="$0"
                                    keyboardType="numeric"
                                    value={priceMin}
                                    onChangeText={setPriceMin}
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>
                            <Text style={styles.priceDash}>—</Text>
                            <View style={styles.priceInputWrapper}>
                                <Text style={styles.priceLabel}>Max</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="$5000+"
                                    keyboardType="numeric"
                                    value={priceMax}
                                    onChangeText={setPriceMax}
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>
                        </View>

                        {/* Bedrooms */}
                        <Text style={styles.sectionTitle}>Bedrooms</Text>
                        <View style={styles.optionRow}>
                            {['Any', '1', '2', '3', '4+'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.optionButton,
                                        bedrooms === option && styles.optionButtonActive
                                    ]}
                                    onPress={() => setBedrooms(bedrooms === option ? '' : option)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        bedrooms === option && styles.optionTextActive
                                    ]}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Bathrooms */}
                        <Text style={styles.sectionTitle}>Bathrooms</Text>
                        <View style={styles.optionRow}>
                            {['Any', '1', '2', '3+'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.optionButton,
                                        bathrooms === option && styles.optionButtonActive
                                    ]}
                                    onPress={() => setBathrooms(bathrooms === option ? '' : option)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        bathrooms === option && styles.optionTextActive
                                    ]}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Lease Term */}
                        <Text style={styles.sectionTitle}>Lease Term</Text>
                        <View style={styles.optionRow}>
                            {[
                                { value: '', label: 'Any' },
                                { value: 'month-to-month', label: 'Monthly' },
                                { value: '6-months', label: '6 mo' },
                                { value: '1-year', label: '1 year' },
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionButton,
                                        leaseTerm === option.value && styles.optionButtonActive
                                    ]}
                                    onPress={() => setLeaseTerm(leaseTerm === option.value ? '' : option.value)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        leaseTerm === option.value && styles.optionTextActive
                                    ]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Amenities */}
                        <Text style={styles.sectionTitle}>Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {[
                                { id: 'WiFi', icon: 'wifi', label: 'WiFi' },
                                { id: 'parking', icon: 'car', label: 'Parking' },
                                { id: 'laundry', icon: 'water', label: 'Laundry' },
                                { id: 'pet-friendly', icon: 'paw', label: 'Pets OK' },
                                { id: 'furnished', icon: 'bed', label: 'Furnished' },
                                { id: 'AC', icon: 'snow', label: 'A/C' },
                                { id: 'gym', icon: 'fitness', label: 'Gym' },
                                { id: 'pool', icon: 'water', label: 'Pool' },
                            ].map((amenity) => (
                                <TouchableOpacity
                                    key={amenity.id}
                                    style={[
                                        styles.amenityButton,
                                        selectedAmenities.includes(amenity.id) && styles.amenityButtonActive
                                    ]}
                                    onPress={() => {
                                        setSelectedAmenities(prev =>
                                            prev.includes(amenity.id)
                                                ? prev.filter(a => a !== amenity.id)
                                                : [...prev, amenity.id]
                                        );
                                    }}
                                >
                                    <Ionicons
                                        name={amenity.icon as any}
                                        size={20}
                                        color={selectedAmenities.includes(amenity.id) ? COLORS.card : COLORS.text}
                                    />
                                    <Text style={[
                                        styles.amenityText,
                                        selectedAmenities.includes(amenity.id) && styles.amenityTextActive
                                    ]}>{amenity.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    {/* Modal Footer */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity onPress={() => {
                            setActiveFilters([]);
                            setPriceMin('');
                            setPriceMax('');
                            setBedrooms('');
                            setBathrooms('');
                            setLeaseTerm('');
                            setSelectedAmenities([]);
                            setPlaceType('any');
                        }}>
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

    // Floating buttons
    fabContainer: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.md,
    },
    fabButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.text,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.lg,
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

    // Map Modal
    mapModalContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    mapHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    mapCloseButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        alignItems: 'center',
    },
    marker: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
        ...SHADOWS.md,
    },
    markerText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        color: COLORS.card,
    },
    callout: {
        width: 200,
        padding: SPACING.sm,
    },
    calloutTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    calloutSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    calloutAction: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.primary,
        fontWeight: '500',
    },
    listToggleContainer: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    listToggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        ...SHADOWS.lg,
    },
    listToggleText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.card,
    },

    // Mapbox markers
    mapboxMarker: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        ...SHADOWS.md,
    },
    mapboxMarkerText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        color: COLORS.card,
    },

    // Advanced Filter Styles
    priceRangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    priceInputWrapper: {
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    priceLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    priceInput: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
    priceDash: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.textMuted,
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    optionButton: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.backgroundSecondary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    optionButtonActive: {
        backgroundColor: COLORS.text,
        borderColor: COLORS.text,
    },
    optionText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
        color: COLORS.text,
    },
    optionTextActive: {
        color: COLORS.card,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    amenityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.backgroundSecondary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    amenityButtonActive: {
        backgroundColor: COLORS.text,
        borderColor: COLORS.text,
    },
    amenityText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.text,
    },
    amenityTextActive: {
        color: COLORS.card,
    },
});

export default HomeScreen;
