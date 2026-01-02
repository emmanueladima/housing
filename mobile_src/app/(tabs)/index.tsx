import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    StyleSheet,
    Image,
    Dimensions,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Theme colors matching wireframe
const colors = {
    primary: '#F97316', // Orange accent
    background: '#f8fafc',
    cardBg: 'rgba(255, 255, 255, 0.7)',
    cardBorder: 'rgba(255, 255, 255, 0.8)',
    text: {
        dark: '#1e293b',
        medium: '#475569',
        light: '#64748b',
    },
    glass: {
        light: 'rgba(255, 255, 255, 0.6)',
        border: 'rgba(255, 255, 255, 0.8)',
    },
};

// Sample listings data
const listings = [
    { id: 1, price: 850, beds: 1, title: 'Cozy Studio near Campus', location: 'Close to OSU Campus', image: null },
    { id: 2, price: 1200, beds: 2, title: 'Modern 2BR Apartment', location: 'Downtown Corvallis', image: null },
    { id: 3, price: 650, beds: 1, title: 'Shared Room Available', location: 'Walking distance to library', image: null },
];

const filters = ['All', 'Price', 'Beds', 'Distance', 'Pets OK', 'Parking'];

export default function HomeScreen() {
    const [activeFilter, setActiveFilter] = useState('All');

    return (
        <View style={styles.container}>
            {/* Gradient Background */}
            <LinearGradient
                colors={['#fdf4ff', '#e0f2fe', '#fff7ed', '#fdf4ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>Collegio</Text>
                    <TouchableOpacity style={styles.profileButton}>
                        <LinearGradient
                            colors={[colors.primary, '#ea580c']}
                            style={styles.profileGradient}
                        >
                            <Ionicons name="person" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Filter Pills */}
                <View style={styles.filterSection}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScroll}
                    >
                        {filters.map((filter) => {
                            const isActive = activeFilter === filter;
                            const canUseGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

                            const FilterContent = () => (
                                <Text style={[
                                    styles.filterText,
                                    isActive && styles.filterTextActive
                                ]}>
                                    {filter}
                                </Text>
                            );

                            return (
                                <TouchableOpacity
                                    key={filter}
                                    onPress={() => setActiveFilter(filter)}
                                    style={styles.filterButtonWrapper}
                                >
                                    {canUseGlass && !isActive ? (
                                        <GlassView
                                            style={styles.filterPill}
                                            glassEffectStyle="regular"
                                        >
                                            <FilterContent />
                                        </GlassView>
                                    ) : (
                                        <BlurView
                                            intensity={80}
                                            tint="light"
                                            style={[
                                                styles.filterPill,
                                                isActive && styles.filterPillActive
                                            ]}
                                        >
                                            <FilterContent />
                                        </BlurView>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Section Title */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Listings</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                {/* Listings Feed */}
                <ScrollView
                    style={styles.feed}
                    contentContainerStyle={styles.feedContent}
                    showsVerticalScrollIndicator={false}
                >
                    {listings.map((listing) => {
                        const canUseGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

                        const ListingContent = () => (
                            <>
                                {/* Image Placeholder */}
                                <View style={styles.listingImage}>
                                    <LinearGradient
                                        colors={['#cbd5e1', '#94a3b8']}
                                        style={styles.imagePlaceholder}
                                    >
                                        <Ionicons name="home-outline" size={40} color="#64748b" />
                                    </LinearGradient>
                                </View>

                                {/* Listing Info */}
                                <View style={styles.listingInfo}>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.price}>${listing.price}</Text>
                                        <Text style={styles.priceUnit}>/mo</Text>
                                        <View style={styles.bedsBadge}>
                                            <Ionicons name="bed-outline" size={14} color={colors.primary} />
                                            <Text style={styles.bedsText}>{listing.beds}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.listingTitle}>{listing.title}</Text>
                                    <View style={styles.locationRow}>
                                        <Ionicons name="location-outline" size={14} color={colors.text.light} />
                                        <Text style={styles.locationText}>{listing.location}</Text>
                                    </View>
                                </View>
                            </>
                        );

                        return (
                            <TouchableOpacity key={listing.id} activeOpacity={0.9}>
                                {canUseGlass ? (
                                    <GlassView
                                        style={styles.listingCard}
                                        glassEffectStyle="regular"
                                        isInteractive
                                    >
                                        <ListingContent />
                                    </GlassView>
                                ) : (
                                    <BlurView
                                        intensity={70}
                                        tint="light"
                                        style={styles.listingCard}
                                    >
                                        <ListingContent />
                                    </BlurView>
                                )}
                            </TouchableOpacity>
                        );
                    })}

                    {/* Bottom padding for floating button */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Floating Map Button */}
                <TouchableOpacity style={styles.mapButtonWrapper}>
                    <BlurView intensity={90} tint="light" style={styles.mapButton}>
                        <Ionicons name="map" size={20} color={colors.primary} />
                        <Text style={styles.mapButtonText}>Map</Text>
                    </BlurView>
                </TouchableOpacity>
            </SafeAreaView>

            <StatusBar style="dark" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
    },
    logo: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.primary,
        letterSpacing: -0.5,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    profileGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterSection: {
        marginBottom: 16,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 10,
    },
    filterButtonWrapper: {
        marginRight: 10,
    },
    filterPill: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: colors.glass.light,
        borderWidth: 1,
        borderColor: colors.glass.border,
        overflow: 'hidden',
    },
    filterPillActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.medium,
    },
    filterTextActive: {
        color: 'white',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text.dark,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    feed: {
        flex: 1,
    },
    feedContent: {
        paddingHorizontal: 20,
    },
    listingCard: {
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    listingImage: {
        height: 160,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listingInfo: {
        padding: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    price: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text.dark,
    },
    priceUnit: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text.light,
        marginRight: 12,
    },
    bedsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    bedsText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },
    listingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.dark,
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 14,
        color: colors.text.light,
    },
    mapButtonWrapper: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        gap: 8,
        backgroundColor: colors.glass.light,
        borderWidth: 1,
        borderColor: colors.glass.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    mapButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },
});
