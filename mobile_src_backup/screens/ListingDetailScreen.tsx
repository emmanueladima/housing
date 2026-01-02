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
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import Mapbox, { MapView, Camera, MarkerView } from '@rnmapbox/maps';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { config } from '../config';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = height * 0.4;

interface ListingDetailScreenProps {
    navigation?: any;
    route?: any;
}

const ListingDetailScreen: React.FC<ListingDetailScreenProps> = ({ navigation }) => {
    const [isSaved, setIsSaved] = React.useState(false);
    const [activeImage, setActiveImage] = React.useState(0);

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Check out this amazing listing on Collegio!',
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Fixed Background Image */}
            <View style={styles.fixedImage}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                        const index = Math.round(e.nativeEvent.contentOffset.x / width);
                        setActiveImage(index);
                    }}
                >
                    {[1, 2, 3, 4, 5].map((_, index) => (
                        <View key={index} style={styles.imageSlide}>
                            <LinearGradient
                                colors={['#9CA3AF', '#D1D5DB', '#E5E7EB']}
                                style={StyleSheet.absoluteFill}
                            />
                            <Ionicons name="home" size={50} color={COLORS.textMuted} />
                        </View>
                    ))}
                </ScrollView>

                {/* Image dots */}
                <View style={styles.imageDots}>
                    {[0, 1, 2, 3, 4].map((index) => (
                        <View
                            key={index}
                            style={[styles.dot, activeImage === index && styles.dotActive]}
                        />
                    ))}
                </View>
            </View>

            {/* Header overlay */}
            <SafeAreaView edges={['top']} style={styles.header}>
                {/* Back Button - Glass Circle */}
                <TouchableOpacity
                    style={styles.glassButtonWrapper}
                    onPress={() => navigation?.goBack?.()}
                >
                    <GlassView style={styles.glassButton} glassType="regular">
                        <Ionicons name="chevron-back" size={22} color="#db4a2b" />
                    </GlassView>
                </TouchableOpacity>

                {/* Action Buttons - Glass Pill */}
                <View style={styles.glassActionsPillWrapper}>
                    <GlassView style={styles.glassActionsPill} glassType="regular">
                        <TouchableOpacity style={styles.glassAction} onPress={handleShare}>
                            <Ionicons name="arrow-redo-outline" size={20} color="#db4a2b" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.glassAction}
                            onPress={() => setIsSaved(!isSaved)}
                        >
                            <Ionicons
                                name={isSaved ? "bookmark" : "bookmark-outline"}
                                size={20}
                                color="#db4a2b"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.glassAction}>
                            <Ionicons name="ellipsis-horizontal" size={20} color="#db4a2b" />
                        </TouchableOpacity>
                    </GlassView>
                </View>
            </SafeAreaView>

            {/* Scrollable Content that covers the image */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Spacer to show image initially */}
                <View style={styles.imageSpacer} />

                {/* Content Card that slides over image */}
                <View style={styles.contentCard}>
                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Modern Studio Apartment</Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color={COLORS.warning} />
                            <Text style={styles.rating}>4.6 (24)</Text>
                            <Text style={styles.ratingDot}>·</Text>
                            <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
                            <Text style={styles.verified}>Verified</Text>
                            <Text style={styles.ratingDot}>·</Text>
                            <Text style={styles.location}>Near OSU Campus</Text>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>$1,200</Text>
                            <Text style={styles.statLabel}>per month</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>1 bd / 1 ba</Text>
                            <Text style={styles.statLabel}>rooms</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>650 sqft</Text>
                            <Text style={styles.statLabel}>size</Text>
                        </View>
                    </View>

                    {/* Quick Info */}
                    <View style={styles.quickInfo}>
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar" size={18} color={COLORS.primary} />
                            <Text style={styles.infoText}>Available Jan 1st</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="flash" size={18} color={COLORS.warning} />
                            <Text style={styles.infoText}>Utilities included</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="paw" size={18} color={COLORS.success} />
                            <Text style={styles.infoText}>Pets allowed</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About this place</Text>
                        <Text style={styles.description}>
                            Beautiful modern studio apartment just 5 minutes walk from OSU campus.
                            Features include in-unit laundry, updated kitchen with stainless steel
                            appliances, hardwood floors throughout, and plenty of natural light.
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.showMore}>Show more</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Amenities */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {[
                                { icon: 'wifi', label: 'WiFi' },
                                { icon: 'car', label: 'Parking' },
                                { icon: 'water', label: 'Laundry' },
                                { icon: 'thermometer', label: 'A/C' },
                                { icon: 'paw', label: 'Pets OK' },
                                { icon: 'fitness', label: 'Gym' },
                            ].map((amenity, index) => (
                                <View key={index} style={styles.amenityItem}>
                                    <View style={styles.amenityIcon}>
                                        <Ionicons name={amenity.icon as any} size={20} color={COLORS.primary} />
                                    </View>
                                    <Text style={styles.amenityLabel}>{amenity.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Landlord */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Landlord</Text>
                        <View style={styles.landlordCard}>
                            <View style={styles.landlordAvatar}>
                                <Text style={styles.landlordInitials}>JD</Text>
                            </View>
                            <View style={styles.landlordInfo}>
                                <Text style={styles.landlordName}>John Doe</Text>
                                <Text style={styles.landlordMeta}>Usually responds in 1 hour</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.messageBtn}
                                onPress={() => navigation?.navigate('Chat', {
                                    threadId: 'landlord-thread',
                                    otherUserName: 'John Doe',
                                })}
                            >
                                <Ionicons name="chatbubble" size={18} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Location */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Location</Text>
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.mapView}
                                scrollEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                                zoomEnabled={false}
                            >
                                <Camera
                                    zoomLevel={13}
                                    centerCoordinate={[config.DEFAULT_LONGITUDE, config.DEFAULT_LATITUDE]}
                                    animationMode="none"
                                    animationDuration={0}
                                />
                                <MarkerView
                                    coordinate={[config.DEFAULT_LONGITUDE, config.DEFAULT_LATITUDE]}
                                >
                                    <View style={styles.mapMarker}>
                                        <Ionicons name="location" size={24} color={COLORS.card} />
                                    </View>
                                </MarkerView>
                            </MapView>
                        </View>
                        <Text style={styles.addressText}>123 Main St, Corvallis, OR</Text>
                    </View>

                    {/* Bottom padding for footer */}
                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.priceFooter}>
                    <Text style={styles.priceText}>$1,200<Text style={styles.priceUnit}>/mo</Text></Text>
                </View>
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => navigation?.navigate('Apply', {
                        listingId: 'listing-id',
                        listingTitle: 'Modern 2BR Near Campus',
                        listingPrice: 1200,
                    })}
                >
                    <Text style={styles.applyButtonText}>Apply Now</Text>
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

    // Fixed Image
    fixedImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: IMAGE_HEIGHT,
    },
    imageSlide: {
        width: width,
        height: IMAGE_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageDots: {
        position: 'absolute',
        bottom: SPACING.xl,
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
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    dotActive: {
        backgroundColor: COLORS.card,
        width: 24,
    },

    // Header
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: SPACING.lg,
    },
    // Glass circular button wrapper
    glassButtonWrapper: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    glassButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    // Glass pill for action buttons
    glassActionsPillWrapper: {
        borderRadius: 28,
        overflow: 'hidden',
    },
    glassActionsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.sm,
        backgroundColor: 'transparent',
        borderRadius: 28,
        gap: SPACING.xs,
    },
    glassAction: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Scrollable content
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
    // Title
    titleSection: {
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
    verified: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.success,
        marginLeft: 4,
    },
    location: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },

    // Stats Card
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

    // Quick Info
    quickInfo: {
        flexDirection: 'row',
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

    // Sections
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
    showMore: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: SPACING.sm,
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
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    amenityIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(219, 74, 43, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    amenityLabel: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
    },

    // Landlord
    landlordCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
    },
    landlordAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    landlordInitials: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.card,
    },
    landlordInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    landlordName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    landlordMeta: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
    },
    messageBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(219, 74, 43, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Map
    mapContainer: {
        height: 180,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        marginBottom: SPACING.sm,
    },
    mapView: {
        flex: 1,
    },
    mapMarker: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    addressText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        paddingBottom: SPACING.xxxl,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    priceFooter: {
        flex: 1,
    },
    priceText: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '700',
        color: COLORS.text,
    },
    priceUnit: {
        fontSize: FONT_SIZES.md,
        fontWeight: '400',
        color: COLORS.textSecondary,
    },
    applyButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xxl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
    },
    applyButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.card,
    },
});

export default ListingDetailScreen;
