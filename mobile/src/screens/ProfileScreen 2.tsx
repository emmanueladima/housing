import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

interface ProfileScreenProps {
    navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
            ]
        );
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const menuItems = [
        { icon: 'person-outline', label: 'Edit Profile', action: () => { } },
        { icon: 'home-outline', label: 'My Listings', action: () => { } },
        { icon: 'heart-outline', label: 'Saved Items', action: () => { } },
        { icon: 'document-text-outline', label: 'Applications', action: () => { } },
        { icon: 'people-outline', label: 'Roommate Profile', action: () => { } },
        { icon: 'settings-outline', label: 'Settings', action: () => { } },
        { icon: 'help-circle-outline', label: 'Help & Support', action: () => { } },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                    <TouchableOpacity style={styles.settingsButton}>
                        <Ionicons name="settings-outline" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        {user?.profilePhoto ? (
                            <Image
                                source={{ uri: user.profilePhoto }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {getInitials(user?.name || 'U')}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Ionicons name="camera" size={16} color={COLORS.card} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || ''}</Text>
                    {user?.isEmailVerified && (
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    )}
                </View>

                {/* Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Listings</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Saved</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Applications</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuCard}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.menuItem,
                                index === menuItems.length - 1 && styles.menuItemLast
                            ]}
                            onPress={item.action}
                        >
                            <View style={styles.menuIcon}>
                                <Ionicons name={item.icon as any} size={22} color={COLORS.text} />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text style={styles.versionText}>Collegio v1.0.0</Text>

                <View style={{ height: 120 }} />
            </ScrollView>
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

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZES.title,
        fontWeight: '700',
        color: COLORS.text,
    },
    settingsButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // Content
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: SPACING.lg,
    },

    // Profile Card
    profileCard: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: COLORS.card,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.background,
    },
    userName: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
    },
    verifiedText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.success,
    },

    // Stats Card
    statsCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '700',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.md,
    },

    // Menu Card
    menuCard: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    menuLabel: {
        flex: 1,
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
        color: COLORS.text,
    },

    // Logout Button
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.lg,
        marginBottom: SPACING.md,
    },
    logoutText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.primary,
    },

    // Version
    versionText: {
        textAlign: 'center',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
    },
});

export default ProfileScreen;
