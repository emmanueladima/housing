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
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Big filter pills with icons (like AllTrails)
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
    const [activeFilters, setActiveFilters] = React.useState<string[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [likedListings, setLikedListings] = React.useState<number[]>([]);
    const [showFilters, setShowFilters] = React.useState(false);
    const [placeType, setPlaceType] = React.useState('any');

    const toggleFilter = (id: string) => {
        setActiveFilters(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleLike = (id: number) => {
        setLikedListings(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const openListingDetail = () => {
        // Navigate to listing detail
        navigation?.navigate?.('ListingDetail');
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

                {/* Big Filter Pills with orange outline (like AllTrails) */}
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
            <ScrollView
                style={styles.listingsScroll}
                contentContainerStyle={styles.listingsContent}
                showsVerticalScrollIndicator={false}
            >
                {[1, 2, 3, 4].map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={styles.listingCard}
                        activeOpacity={0.95}
                        onPress={openListingDetail}
                    >
                        {/* Image */}
                        <View style={styles.imageContainer}>
                            <LinearGradient
                                colors={['#E5E7EB', '#D1D5DB']}
                                style={styles.imagePlaceholder}
                            >
                                <Ionicons name="home" size={40} color={COLORS.textMuted} />
                            </LinearGradient>

                            {/* Heart Button */}
                            <TouchableOpacity
                                style={styles.heartButton}
                                onPress={() => toggleLike(item)}
                            >
                                <Ionicons
                                    name={likedListings.includes(item) ? "heart" : "heart-outline"}
                                    size={22}
                                    color={likedListings.includes(item) ? COLORS.primary : COLORS.text}
                                />
                            </TouchableOpacity>

                            {/* Image dots */}
                            <View style={styles.imageDots}>
                                <View style={[styles.dot, styles.dotActive]} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                            </View>
                        </View>

                        {/* Content */}
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Modern Studio Apartment</Text>
                            <Text style={styles.cardLocation}>Corvallis, Oregon</Text>

                            <View style={styles.cardDetails}>
                                <Ionicons name="star" size={14} color={COLORS.warning} />
                                <Text style={styles.ratingText}>4.6 (24)</Text>
                                <Text style={styles.detailDot}>·</Text>
                                <Text style={styles.detailText}>1bd 1ba</Text>
                                <Text style={styles.detailDot}>·</Text>
                                <Text style={styles.detailText}>$1,200/mo</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Bottom padding */}
                <View style={{ height: 120 }} />
            </ScrollView>

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

                        {/* Price range */}
                        <Text style={styles.sectionTitle}>Price range</Text>
                        <Text style={styles.sectionSubtitle}>Monthly rent, includes all fees</Text>
                        <View style={styles.priceRow}>
                            <View style={styles.priceInput}>
                                <Text style={styles.priceLabel}>Minimum</Text>
                                <Text style={styles.priceValue}>$ 0</Text>
                            </View>
                            <Text style={styles.priceDash}>-</Text>
                            <View style={styles.priceInput}>
                                <Text style={styles.priceLabel}>Maximum</Text>
                                <Text style={styles.priceValue}>$ 5000+</Text>
                            </View>
                        </View>

                        {/* Rooms and beds */}
                        <Text style={styles.sectionTitle}>Rooms and beds</Text>
                        <View style={styles.counterRow}>
                            <Text style={styles.counterLabel}>Bedrooms</Text>
                            <View style={styles.counterControls}>
                                <TouchableOpacity style={styles.counterButton}>
                                    <Ionicons name="remove" size={18} color={COLORS.textMuted} />
                                </TouchableOpacity>
                                <Text style={styles.counterValue}>Any</Text>
                                <TouchableOpacity style={styles.counterButton}>
                                    <Ionicons name="add" size={18} color={COLORS.text} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.counterRow}>
                            <Text style={styles.counterLabel}>Bathrooms</Text>
                            <View style={styles.counterControls}>
                                <TouchableOpacity style={styles.counterButton}>
                                    <Ionicons name="remove" size={18} color={COLORS.textMuted} />
                                </TouchableOpacity>
                                <Text style={styles.counterValue}>Any</Text>
                                <TouchableOpacity style={styles.counterButton}>
                                    <Ionicons name="add" size={18} color={COLORS.text} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Amenities */}
                        <Text style={styles.sectionTitle}>Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {['WiFi', 'Laundry', 'Parking', 'Dishwasher', 'AC', 'Gym'].map((amenity) => (
                                <TouchableOpacity key={amenity} style={styles.amenityItem}>
                                    <View style={styles.checkbox} />
                                    <Text style={styles.amenityLabel}>{amenity}</Text>
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
                            onPress={() => setShowFilters(false)}
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

    // Big Filter Pills with orange outline
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
        borderColor: COLORS.primary,  // Orange outline when active
        backgroundColor: 'rgba(219, 74, 43, 0.05)',
    },
    filterText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    filterTextActive: {
        color: COLORS.primary,  // Orange text when active
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
    ratingText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text,
        marginLeft: 4,
    },
    detailText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
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
    sectionSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: -SPACING.sm,
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

    // Price inputs
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    priceInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
    },
    priceLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    priceValue: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    priceDash: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.textMuted,
    },

    // Counter rows
    counterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    counterLabel: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.lg,
    },
    counterButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterValue: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
        minWidth: 40,
        textAlign: 'center',
    },

    // Amenities
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        paddingVertical: SPACING.md,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: SPACING.sm,
    },
    amenityLabel: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
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
