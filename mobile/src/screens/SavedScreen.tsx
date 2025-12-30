import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import listingService, { Listing } from '../services/listingService';
import { useTheme } from '../contexts/ThemeContext';

interface SavedScreenProps {
    navigation?: any;
}

const SavedScreen: React.FC<SavedScreenProps> = ({ navigation }) => {
    const colors = useColors();
    const { isDark } = useTheme();
    const [savedListings, setSavedListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchSavedListings = useCallback(async (showLoader = true) => {
        if (showLoader) setIsLoading(true);
        try {
            const data = await listingService.getSavedListings();
            setSavedListings(data || []);
        } catch (error) {
            console.error('Error fetching saved listings:', error);
            setSavedListings([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchSavedListings();
    }, [fetchSavedListings]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchSavedListings(false);
    };

    const handleUnsave = async (listingId: string) => {
        try {
            await listingService.toggleFavorite(listingId);
            setSavedListings(prev => prev.filter(l => l._id !== listingId));
        } catch (error) {
            console.error('Error unsaving listing:', error);
        }
    };

    const openListingDetail = (listing: Listing) => {
        navigation?.navigate('ListingDetail', { listingId: listing._id });
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        safeArea: {
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: SPACING.md,
        },
        title: {
            fontSize: FONT_SIZES.title,
            fontWeight: '700',
            color: colors.text,
            flex: 1,
        },
        content: {
            flex: 1,
        },
        contentContainer: {
            paddingHorizontal: SPACING.lg,
            paddingTop: SPACING.md,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyState: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: SPACING.lg,
        },
        emptyIcon: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: SPACING.lg,
        },
        emptyTitle: {
            fontSize: FONT_SIZES.xl,
            fontWeight: '700',
            color: colors.text,
            marginBottom: SPACING.sm,
        },
        emptySubtitle: {
            fontSize: FONT_SIZES.md,
            color: colors.textMuted,
            textAlign: 'center',
            lineHeight: 22,
            paddingHorizontal: SPACING.xl,
        },
        browseButton: {
            marginTop: SPACING.lg,
            backgroundColor: colors.primary,
            paddingHorizontal: SPACING.xl,
            paddingVertical: SPACING.md,
            borderRadius: BORDER_RADIUS.lg,
        },
        browseButtonText: {
            color: '#FFFFFF',
            fontSize: FONT_SIZES.md,
            fontWeight: '600',
        },
        listingCard: {
            backgroundColor: colors.card,
            borderRadius: BORDER_RADIUS.xl,
            marginBottom: SPACING.md,
            overflow: 'hidden',
            ...SHADOWS.sm,
            borderWidth: 1,
            borderColor: colors.border,
        },
        listingImage: {
            width: '100%',
            height: 160,
            backgroundColor: colors.backgroundSecondary,
        },
        listingContent: {
            padding: SPACING.md,
        },
        listingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        listingInfo: {
            flex: 1,
        },
        listingTitle: {
            fontSize: FONT_SIZES.lg,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        listingAddress: {
            fontSize: FONT_SIZES.sm,
            color: colors.textSecondary,
            marginBottom: 8,
        },
        listingPrice: {
            fontSize: FONT_SIZES.lg,
            fontWeight: '700',
            color: colors.primary,
        },
        unsaveButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation?.goBack()}
                    >
                        <Ionicons name="chevron-back" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Saved Items</Text>
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
                        savedListings.length === 0 && { flex: 1 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {savedListings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="heart-outline" size={40} color={colors.textMuted} />
                            </View>
                            <Text style={styles.emptyTitle}>No Saved Listings</Text>
                            <Text style={styles.emptySubtitle}>
                                When you save listings, they'll appear here so you can easily find them later.
                            </Text>
                            <TouchableOpacity
                                style={styles.browseButton}
                                onPress={() => navigation?.navigate('Main', { screen: 'Listings' })}
                            >
                                <Text style={styles.browseButtonText}>Browse Listings</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {savedListings.map((listing) => (
                                <TouchableOpacity
                                    key={listing._id}
                                    style={styles.listingCard}
                                    onPress={() => openListingDetail(listing)}
                                    activeOpacity={0.7}
                                >
                                    {listing.images?.[0] ? (
                                        <Image
                                            source={{ uri: listing.images[0] }}
                                            style={styles.listingImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={styles.listingImage}>
                                            <Ionicons name="home" size={40} color={colors.textMuted} />
                                        </View>
                                    )}
                                    <View style={styles.listingContent}>
                                        <View style={styles.listingRow}>
                                            <View style={styles.listingInfo}>
                                                <Text style={styles.listingTitle} numberOfLines={1}>
                                                    {listing.title}
                                                </Text>
                                                <Text style={styles.listingAddress} numberOfLines={1}>
                                                    {listing.address}, {listing.city}
                                                </Text>
                                                <Text style={styles.listingPrice}>
                                                    ${listing.price?.toLocaleString()}/mo
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.unsaveButton}
                                                onPress={() => handleUnsave(listing._id)}
                                            >
                                                <Ionicons name="heart" size={20} color={colors.heart} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            <View style={{ height: 120 }} />
                        </>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

export default SavedScreen;
