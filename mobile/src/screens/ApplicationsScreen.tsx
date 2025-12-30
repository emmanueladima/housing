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
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import applicationService, { Application, ApplicationsByStatus } from '../services/applicationService';

interface ApplicationsScreenProps {
    navigation?: any;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
    submitted: {
        label: 'Submitted',
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        icon: 'document-text',
    },
    under_review: {
        label: 'Under Review',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        icon: 'eye',
    },
    interview_scheduled: {
        label: 'Interview',
        color: '#8B5CF6',
        bgColor: '#EDE9FE',
        icon: 'calendar',
    },
    approved: {
        label: 'Approved',
        color: '#10B981',
        bgColor: '#D1FAE5',
        icon: 'checkmark-circle',
    },
    rejected: {
        label: 'Rejected',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        icon: 'close-circle',
    },
    withdrawn: {
        label: 'Withdrawn',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        icon: 'return-up-back',
    },
};

const PIPELINE_ORDER = ['submitted', 'under_review', 'interview_scheduled', 'approved', 'rejected'];

const ApplicationsScreen: React.FC<ApplicationsScreenProps> = ({ navigation }) => {
    const colors = useColors();
    const { isDark } = useTheme();
    const [applications, setApplications] = useState<ApplicationsByStatus>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async (showLoader = true) => {
        if (showLoader) setIsLoading(true);
        try {
            const data = await applicationService.getMyApplications(true) as ApplicationsByStatus;
            setApplications(data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleWithdraw = async (applicationId: string) => {
        Alert.alert(
            'Withdraw Application',
            'Are you sure you want to withdraw this application?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await applicationService.withdrawApplication(applicationId);
                            fetchApplications(false);
                        } catch (error) {
                            console.error('Error withdrawing:', error);
                            Alert.alert('Error', 'Failed to withdraw application');
                        }
                    },
                },
            ]
        );
    };

    const totalCount = useMemo(() => {
        return Object.values(applications).flat().length;
    }, [applications]);

    const activeCount = useMemo(() => {
        return (applications.submitted?.length || 0) +
            (applications.under_review?.length || 0) +
            (applications.interview_scheduled?.length || 0);
    }, [applications]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const daysSince = (dateString: string) => {
        return Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    };

    const renderApplicationCard = (application: Application) => {
        const listing = application.listingId;
        const config = STATUS_CONFIG[application.status] || STATUS_CONFIG.submitted;
        const days = daysSince(application.createdAt);

        return (
            <TouchableOpacity
                key={application._id}
                style={[styles.applicationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                    if (listing?._id) {
                        navigation?.navigate('ListingDetail', { listingId: listing._id });
                    }
                }}
                activeOpacity={0.8}
            >
                {/* Image */}
                {listing?.images?.[0] && (
                    <View style={styles.cardImageContainer}>
                        <Image source={{ uri: listing.images[0] }} style={styles.cardImage} />
                        <View style={styles.imageOverlay} />
                        <Text style={styles.imageTitle} numberOfLines={1}>{listing?.title || 'Untitled'}</Text>
                    </View>
                )}

                {/* Content */}
                <View style={styles.cardContent}>
                    {!listing?.images?.[0] && (
                        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                            {listing?.title || 'Untitled'}
                        </Text>
                    )}

                    {/* Location & Price */}
                    <View style={styles.cardRow}>
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={12} color={colors.textMuted} />
                            <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                                {listing?.city}, {listing?.state}
                            </Text>
                        </View>
                        <Text style={[styles.priceText, { color: colors.text }]}>
                            ${listing?.rent?.toLocaleString()}/mo
                        </Text>
                    </View>

                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
                        <Ionicons name={config.icon as any} size={12} color={config.color} />
                        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                    </View>

                    {/* Timeline */}
                    <View style={styles.timelineRow}>
                        <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                        <Text style={[styles.timelineText, { color: colors.textMuted }]}>
                            Applied {days === 0 ? 'today' : `${days}d ago`}
                        </Text>
                    </View>

                    {/* Tour Info */}
                    {application.tourScheduled?.date && (
                        <View style={[styles.tourInfo, { backgroundColor: isDark ? '#3B2D6E' : '#F3E8FF' }]}>
                            <Ionicons name="calendar" size={12} color="#8B5CF6" />
                            <Text style={styles.tourText}>
                                Tour: {formatDate(application.tourScheduled.date)}
                            </Text>
                            {application.tourScheduled.confirmed && (
                                <Text style={styles.confirmedText}>✓ Confirmed</Text>
                            )}
                        </View>
                    )}

                    {/* Landlord Response */}
                    {application.landlordResponse?.message && (
                        <View style={[styles.responseInfo, { backgroundColor: colors.backgroundSecondary }]}>
                            <Ionicons name="chatbubble" size={12} color={colors.textMuted} />
                            <Text style={[styles.responseText, { color: colors.textSecondary }]} numberOfLines={2}>
                                {application.landlordResponse.message}
                            </Text>
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() => {
                                if (listing?._id) {
                                    navigation?.navigate('ListingDetail', { listingId: listing._id });
                                }
                            }}
                        >
                            <Text style={[styles.viewButtonText, { color: colors.primary }]}>View Listing</Text>
                        </TouchableOpacity>
                        {['submitted', 'under_review'].includes(application.status) && (
                            <TouchableOpacity
                                style={styles.withdrawButton}
                                onPress={() => handleWithdraw(application._id)}
                            >
                                <Text style={[styles.withdrawButtonText, { color: colors.textMuted }]}>Withdraw</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderKanbanColumn = (status: string) => {
        const config = STATUS_CONFIG[status];
        const apps = applications[status as keyof ApplicationsByStatus] || [];

        return (
            <View key={status} style={[styles.kanbanColumn, { backgroundColor: colors.backgroundSecondary }]}>
                {/* Column Header */}
                <View style={[styles.columnHeader, { backgroundColor: config.color }]}>
                    <View style={styles.columnHeaderContent}>
                        <Ionicons name={config.icon as any} size={16} color="#FFFFFF" />
                        <Text style={styles.columnTitle}>{config.label}</Text>
                    </View>
                    <View style={styles.columnCountBadge}>
                        <Text style={styles.columnCount}>{apps.length}</Text>
                    </View>
                </View>

                {/* Column Content */}
                <ScrollView
                    style={styles.columnContent}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: SPACING.md }}
                >
                    {apps.length > 0 ? (
                        apps.map(app => renderApplicationCard(app))
                    ) : (
                        <View style={styles.emptyColumn}>
                            <Ionicons name={config.icon as any} size={24} color={colors.textMuted} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyColumnText, { color: colors.textMuted }]}>No applications</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        );
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
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: FONT_SIZES.xl,
            fontWeight: '700',
            color: colors.text,
        },
        placeholder: {
            width: 40,
        },
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: SPACING.xxl,
            paddingVertical: SPACING.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        statItem: {
            alignItems: 'center',
        },
        statNumber: {
            fontSize: FONT_SIZES.xxl,
            fontWeight: '800',
            color: colors.text,
        },
        statLabel: {
            fontSize: FONT_SIZES.sm,
            color: colors.textSecondary,
        },
        viewToggle: {
            flexDirection: 'row',
            marginHorizontal: SPACING.lg,
            marginTop: SPACING.md,
            padding: 4,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: BORDER_RADIUS.lg,
        },
        toggleButton: {
            flex: 1,
            paddingVertical: SPACING.sm,
            borderRadius: BORDER_RADIUS.md,
            alignItems: 'center',
        },
        toggleButtonActive: {
            backgroundColor: colors.primary,
        },
        toggleText: {
            fontSize: FONT_SIZES.sm,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        toggleTextActive: {
            color: '#FFFFFF',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: SPACING.md,
            fontSize: FONT_SIZES.md,
            color: colors.textSecondary,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: SPACING.xxl,
        },
        emptyIconContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: `${colors.primary}15`,
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
        emptyText: {
            fontSize: FONT_SIZES.md,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: SPACING.xl,
        },
        browseButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: SPACING.xxl,
            paddingVertical: SPACING.md,
            borderRadius: BORDER_RADIUS.full,
        },
        browseButtonText: {
            fontSize: FONT_SIZES.md,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        kanbanContainer: {
            flex: 1,
        },
        kanbanScroll: {
            paddingHorizontal: SPACING.md,
            paddingTop: SPACING.md,
            gap: SPACING.md,
        },
        kanbanColumn: {
            width: 280,
            borderRadius: BORDER_RADIUS.xl,
            overflow: 'hidden',
            marginRight: SPACING.md,
        },
        columnHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
        },
        columnHeaderContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.xs,
        },
        columnTitle: {
            fontSize: FONT_SIZES.md,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        columnCountBadge: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: SPACING.sm,
            paddingVertical: 2,
            borderRadius: BORDER_RADIUS.full,
        },
        columnCount: {
            fontSize: FONT_SIZES.xs,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        columnContent: {
            flex: 1,
            padding: SPACING.sm,
            maxHeight: 500,
        },
        emptyColumn: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: SPACING.xxl,
        },
        emptyColumnText: {
            fontSize: FONT_SIZES.sm,
            marginTop: SPACING.sm,
        },
        listContainer: {
            flex: 1,
            paddingHorizontal: SPACING.lg,
            paddingTop: SPACING.md,
        },
        applicationCard: {
            borderRadius: BORDER_RADIUS.lg,
            borderWidth: 1,
            marginBottom: SPACING.sm,
            overflow: 'hidden',
        },
        cardImageContainer: {
            height: 80,
            position: 'relative',
        },
        cardImage: {
            width: '100%',
            height: '100%',
        },
        imageOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.3)',
        },
        imageTitle: {
            position: 'absolute',
            bottom: SPACING.sm,
            left: SPACING.sm,
            right: SPACING.sm,
            fontSize: FONT_SIZES.md,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        cardContent: {
            padding: SPACING.sm,
        },
        cardTitle: {
            fontSize: FONT_SIZES.md,
            fontWeight: '700',
            marginBottom: SPACING.xs,
        },
        cardRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: SPACING.xs,
        },
        locationRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            flex: 1,
        },
        locationText: {
            fontSize: FONT_SIZES.xs,
        },
        priceText: {
            fontSize: FONT_SIZES.sm,
            fontWeight: '700',
        },
        statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            alignSelf: 'flex-start',
            paddingHorizontal: SPACING.sm,
            paddingVertical: 4,
            borderRadius: BORDER_RADIUS.full,
            marginBottom: SPACING.xs,
        },
        statusText: {
            fontSize: FONT_SIZES.xs,
            fontWeight: '600',
        },
        timelineRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginBottom: SPACING.xs,
        },
        timelineText: {
            fontSize: FONT_SIZES.xs,
        },
        tourInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            padding: SPACING.sm,
            borderRadius: BORDER_RADIUS.md,
            marginBottom: SPACING.xs,
        },
        tourText: {
            fontSize: FONT_SIZES.xs,
            color: '#8B5CF6',
            fontWeight: '500',
        },
        confirmedText: {
            fontSize: FONT_SIZES.xs,
            color: '#10B981',
            marginLeft: 'auto',
        },
        responseInfo: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 4,
            padding: SPACING.sm,
            borderRadius: BORDER_RADIUS.md,
            marginBottom: SPACING.xs,
        },
        responseText: {
            fontSize: FONT_SIZES.xs,
            flex: 1,
        },
        actionsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: SPACING.xs,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            marginTop: SPACING.xs,
        },
        viewButton: {
            paddingVertical: SPACING.xs,
        },
        viewButtonText: {
            fontSize: FONT_SIZES.sm,
            fontWeight: '600',
        },
        withdrawButton: {
            paddingVertical: SPACING.xs,
        },
        withdrawButtonText: {
            fontSize: FONT_SIZES.sm,
            fontWeight: '500',
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Applications</Text>
                    <View style={styles.placeholder} />
                </View>
            </SafeAreaView>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{totalCount}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.primary }]}>{activeCount}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#10B981' }]}>{applications.approved?.length || 0}</Text>
                    <Text style={styles.statLabel}>Approved</Text>
                </View>
            </View>

            {/* View Toggle */}
            <View style={styles.viewToggle}>
                <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'kanban' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('kanban')}
                >
                    <Text style={[styles.toggleText, viewMode === 'kanban' && styles.toggleTextActive]}>
                        Pipeline
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('list')}
                >
                    <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
                        List
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading applications...</Text>
                </View>
            ) : totalCount === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="document-text-outline" size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>No applications yet</Text>
                    <Text style={styles.emptyText}>
                        You haven't submitted any applications yet. Start exploring listings to find your perfect place.
                    </Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => navigation?.navigate('Main')}
                    >
                        <Text style={styles.browseButtonText}>Browse Listings</Text>
                    </TouchableOpacity>
                </View>
            ) : viewMode === 'kanban' ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.kanbanScroll}
                    style={styles.kanbanContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={() => {
                                setIsRefreshing(true);
                                fetchApplications(false);
                            }}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {PIPELINE_ORDER.map(status => renderKanbanColumn(status))}
                </ScrollView>
            ) : (
                <ScrollView
                    style={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={() => {
                                setIsRefreshing(true);
                                fetchApplications(false);
                            }}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {Object.values(applications)
                        .flat()
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map(app => renderApplicationCard(app))}
                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </View>
    );
};

export default ApplicationsScreen;
