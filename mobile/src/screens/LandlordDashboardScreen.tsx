import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import listingService from '../services/listingService';
import applicationService from '../services/applicationService';

interface LandlordDashboardScreenProps {
    navigation?: any;
}

interface Listing {
    _id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    rent: number;
    images?: string[];
    status: 'active' | 'inactive' | 'rented';
    applicantCount?: number;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
    submitted: { label: 'New', color: '#3B82F6', bgColor: '#DBEAFE', icon: 'mail' },
    under_review: { label: 'Reviewing', color: '#F59E0B', bgColor: '#FEF3C7', icon: 'eye' },
    interview_scheduled: { label: 'Interview', color: '#8B5CF6', bgColor: '#EDE9FE', icon: 'calendar' },
    approved: { label: 'Approved', color: '#10B981', bgColor: '#D1FAE5', icon: 'checkmark-circle' },
    rejected: { label: 'Rejected', color: '#EF4444', bgColor: '#FEE2E2', icon: 'close-circle' },
};

const LandlordDashboardScreen: React.FC<LandlordDashboardScreenProps> = ({ navigation }) => {
    const colors = useColors();
    const { isDark } = useTheme();
    const [listings, setListings] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedListing, setSelectedListing] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'listings' | 'applications'>('listings');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (showLoader = true) => {
        if (showLoader) setIsLoading(true);
        try {
            const [myListings, applicationsData] = await Promise.all([
                listingService.getMyListings(),
                applicationService.getReceivedApplications({ grouped: false }),
            ]);
            setListings(myListings || []);
            // Handle the response format - may be grouped or flat array
            const apps = applicationsData.applications;
            setApplications(Array.isArray(apps) ? apps : Object.values(apps || {}).flat());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleStatusChange = async (applicationId: string, newStatus: string) => {
        try {
            await applicationService.updateApplicationStatus(applicationId, { status: newStatus });
            fetchData(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update application status');
        }
    };

    const filteredApplications = useMemo(() => {
        if (!selectedListing) return applications;
        return applications.filter((app: any) => app.listingId?._id === selectedListing);
    }, [applications, selectedListing]);

    const stats = useMemo(() => ({
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'active').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter((a: any) =>
            ['submitted', 'under_review'].includes(a.status)
        ).length,
    }), [listings, applications]);

    const renderListingCard = (listing: Listing) => (
        <TouchableOpacity
            key={listing._id}
            style={[
                styles.listingCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedListing === listing._id && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => setSelectedListing(
                selectedListing === listing._id ? null : listing._id
            )}
            activeOpacity={0.8}
        >
            {listing.images?.[0] && (
                <Image source={{ uri: listing.images[0] }} style={styles.listingImage} />
            )}
            <View style={styles.listingContent}>
                <Text style={[styles.listingTitle, { color: colors.text }]} numberOfLines={1}>
                    {listing.title}
                </Text>
                <Text style={[styles.listingLocation, { color: colors.textSecondary }]} numberOfLines={1}>
                    {listing.city}, {listing.state}
                </Text>
                <View style={styles.listingMeta}>
                    <Text style={[styles.listingPrice, { color: colors.primary }]}>
                        ${listing.rent}/mo
                    </Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: listing.status === 'active' ? '#D1FAE5' : '#F3F4F6' }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: listing.status === 'active' ? '#10B981' : '#6B7280' }
                        ]}>
                            {listing.status}
                        </Text>
                    </View>
                </View>
                <View style={styles.applicantInfo}>
                    <Ionicons name="people-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.applicantCount, { color: colors.textMuted }]}>
                        {listing.applicantCount || 0} applicants
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation?.navigate('EditListing', { listingId: listing._id })}
            >
                <Ionicons name="create-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderApplicationCard = (application: any) => {
        const config = STATUS_CONFIG[application.status] || STATUS_CONFIG.submitted;
        const applicant = application.applicantId;
        const listing = application.listingId;

        return (
            <View
                key={application._id}
                style={[styles.applicationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
                <View style={styles.applicantRow}>
                    <View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}>
                        {applicant?.profilePhoto ? (
                            <Image source={{ uri: applicant.profilePhoto }} style={styles.avatarImage} />
                        ) : (
                            <Text style={[styles.avatarText, { color: colors.primary }]}>
                                {applicant?.name?.charAt(0) || '?'}
                            </Text>
                        )}
                    </View>
                    <View style={styles.applicantInfo2}>
                        <Text style={[styles.applicantName, { color: colors.text }]}>
                            {applicant?.name || 'Unknown'}
                        </Text>
                        <Text style={[styles.listingRef, { color: colors.textSecondary }]} numberOfLines={1}>
                            Applied for: {listing?.title}
                        </Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: config.bgColor }]}>
                        <Text style={[styles.statusPillText, { color: config.color }]}>{config.label}</Text>
                    </View>
                </View>

                {application.coverLetter && (
                    <Text style={[styles.coverLetter, { color: colors.textSecondary }]} numberOfLines={2}>
                        "{application.coverLetter}"
                    </Text>
                )}

                <View style={styles.actionRow}>
                    {application.status === 'submitted' && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#D1FAE5' }]}
                                onPress={() => handleStatusChange(application._id, 'under_review')}
                            >
                                <Text style={{ color: '#10B981', fontWeight: '600', fontSize: 12 }}>Review</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]}
                                onPress={() => handleStatusChange(application._id, 'rejected')}
                            >
                                <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 12 }}>Reject</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {application.status === 'under_review' && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#EDE9FE' }]}
                                onPress={() => handleStatusChange(application._id, 'interview_scheduled')}
                            >
                                <Text style={{ color: '#8B5CF6', fontWeight: '600', fontSize: 12 }}>Schedule Tour</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#D1FAE5' }]}
                                onPress={() => handleStatusChange(application._id, 'approved')}
                            >
                                <Text style={{ color: '#10B981', fontWeight: '600', fontSize: 12 }}>Approve</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => navigation?.navigate('Chat', { userId: applicant?._id })}
                    >
                        <Ionicons name="chatbubble-outline" size={14} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        safeArea: { backgroundColor: colors.background },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
        headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: colors.text },
        addButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        statsRow: {
            flexDirection: 'row',
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
            gap: SPACING.sm,
        },
        statCard: {
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.md,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        statNumber: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: colors.text },
        statLabel: { fontSize: FONT_SIZES.xs, color: colors.textSecondary, marginTop: 2 },
        tabRow: {
            flexDirection: 'row',
            marginHorizontal: SPACING.lg,
            padding: 4,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: BORDER_RADIUS.lg,
        },
        tabButton: {
            flex: 1,
            paddingVertical: SPACING.sm,
            borderRadius: BORDER_RADIUS.md,
            alignItems: 'center',
        },
        tabButtonActive: { backgroundColor: colors.primary },
        tabText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: colors.textSecondary },
        tabTextActive: { color: '#FFFFFF' },
        scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
        sectionTitle: {
            fontSize: FONT_SIZES.md,
            fontWeight: '700',
            color: colors.text,
            marginBottom: SPACING.md,
        },
        listingCard: {
            flexDirection: 'row',
            borderRadius: BORDER_RADIUS.lg,
            borderWidth: 1,
            marginBottom: SPACING.sm,
            overflow: 'hidden',
        },
        listingImage: { width: 80, height: 80 },
        listingContent: { flex: 1, padding: SPACING.sm, justifyContent: 'center' },
        listingTitle: { fontSize: FONT_SIZES.md, fontWeight: '700' },
        listingLocation: { fontSize: FONT_SIZES.xs, marginTop: 2 },
        listingMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
        listingPrice: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
        statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
        statusText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
        applicantInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
        applicantCount: { fontSize: FONT_SIZES.xs },
        editButton: { padding: SPACING.md, justifyContent: 'center' },
        applicationCard: {
            borderRadius: BORDER_RADIUS.lg,
            borderWidth: 1,
            padding: SPACING.md,
            marginBottom: SPACING.sm,
        },
        applicantRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
        avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
        avatarImage: { width: 44, height: 44, borderRadius: 22 },
        avatarText: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
        applicantInfo2: { flex: 1, marginLeft: SPACING.sm },
        applicantName: { fontSize: FONT_SIZES.md, fontWeight: '700' },
        listingRef: { fontSize: FONT_SIZES.xs },
        statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
        statusPillText: { fontSize: 11, fontWeight: '600' },
        coverLetter: { fontSize: FONT_SIZES.sm, fontStyle: 'italic', marginBottom: SPACING.sm },
        actionRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
        actionButton: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.md },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        emptyContainer: { alignItems: 'center', paddingVertical: SPACING.xxl },
        emptyText: { fontSize: FONT_SIZES.md, color: colors.textMuted, marginTop: SPACING.md },
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Landlord Dashboard</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation?.navigate('CreateListing')}
                    >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.activeListings}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalApplications}</Text>
                    <Text style={styles.statLabel}>Applications</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.pendingApplications}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'listings' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('listings')}
                >
                    <Text style={[styles.tabText, activeTab === 'listings' && styles.tabTextActive]}>
                        My Listings
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'applications' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('applications')}
                >
                    <Text style={[styles.tabText, activeTab === 'applications' && styles.tabTextActive]}>
                        Applications
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={() => { setIsRefreshing(true); fetchData(false); }}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {activeTab === 'listings' ? (
                        listings.length > 0 ? (
                            listings.map(renderListingCard)
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="home-outline" size={48} color={colors.textMuted} />
                                <Text style={styles.emptyText}>No listings yet</Text>
                            </View>
                        )
                    ) : (
                        filteredApplications.length > 0 ? (
                            filteredApplications.map(renderApplicationCard)
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
                                <Text style={styles.emptyText}>No applications yet</Text>
                            </View>
                        )
                    )}
                </ScrollView>
            )}
        </View>
    );
};

export default LandlordDashboardScreen;
