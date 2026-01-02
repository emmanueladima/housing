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
    Platform,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { GlassButton } from '../components/GlassButton';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
    navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const { user, logout } = useAuth();
    const colors = useColors();
    const { isDark } = useTheme();

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

    // Menu items configuration
    const menuItems = [
        { icon: 'help-circle-outline', label: 'Help & Support', subtitle: 'Get help or contact us', action: () => navigation?.navigate('Settings') },
        { icon: 'heart-outline', label: 'Saved Items', subtitle: 'View your saved listings', action: () => navigation?.navigate('Saved') },
        { icon: 'chatbubble-ellipses-outline', label: 'Feedback', subtitle: 'Share your thoughts', action: () => navigation?.navigate('Feedback') },
        { icon: 'document-text-outline', label: 'Applications', subtitle: 'Track your applications', action: () => navigation?.navigate('Applications') },
        { icon: 'sparkles-outline', label: 'Compatibility Test', subtitle: 'Find your perfect match', action: () => navigation?.navigate('CompatibilityTest') },
        { icon: 'construct-outline', label: 'Toolkit', subtitle: 'Roommate resources', action: () => navigation?.navigate('Toolkit') },
        { icon: 'settings-outline', label: 'Settings', subtitle: 'App preferences', action: () => navigation?.navigate('Settings') },
    ];

    if (user?.userType === 'landlord') {
        menuItems.unshift({ icon: 'business-outline', label: 'Landlord Dashboard', subtitle: 'Manage properties', action: () => navigation?.navigate('LandlordDashboard') });
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
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.sm,
            marginBottom: SPACING.sm,
        },
        title: {
            fontSize: FONT_SIZES.xl,
            fontWeight: '700',
            color: colors.text,
        },
        headerButtonWrapper: {
            marginLeft: 'auto',
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: SPACING.lg,
            paddingBottom: 100,
        },

        // Profile Section
        profileSection: {
            marginBottom: SPACING.xl,
            alignItems: 'center',
            paddingVertical: SPACING.lg,
        },
        avatarContainer: {
            marginBottom: SPACING.md,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
        },
        avatar: {
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 3,
            borderColor: colors.primary,
        },
        avatarPlaceholder: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: colors.primary,
        },
        avatarText: {
            fontSize: 36,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        userName: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 4,
        },
        userEmail: {
            fontSize: FONT_SIZES.md,
            color: colors.textMuted,
        },

        // Solid Orange Card (no glass)
        menuCard: {
            marginBottom: SPACING.lg,
            borderRadius: BORDER_RADIUS.xl,
            backgroundColor: '#db4a2b', // Solid orange
            padding: SPACING.lg,
            flexDirection: 'row',
            alignItems: 'center',
            // Shadow for depth
            shadowColor: '#db4a2b',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
        },
        menuIconContainer: {
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: 'rgba(255,255,255,0.25)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: SPACING.lg,
        },
        menuTextContainer: {
            flex: 1,
        },
        menuLabel: {
            fontSize: FONT_SIZES.md,
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: 2,
        },
        menuSubtitle: {
            fontSize: FONT_SIZES.sm,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '500',
        },

        // Logout - Solid red
        logoutCard: {
            marginTop: SPACING.md,
            borderRadius: BORDER_RADIUS.xl,
            backgroundColor: '#FF3B30', // Solid red
            paddingVertical: SPACING.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#FF3B30',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        logoutText: {
            color: '#FFFFFF',
            fontSize: FONT_SIZES.md,
            fontWeight: '600',
            marginLeft: SPACING.sm,
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                    <View style={styles.headerButtonWrapper}>
                        <GlassButton
                            icon="pencil-outline"
                            size="icon"
                            variant="secondary"
                            onPress={() => navigation?.navigate('CreateProfile')}
                        />
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Header */}
                    <View style={styles.profileSection}>
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
                        </View>
                        <Text style={styles.userName}>{user?.name || 'User'}</Text>
                        <Text style={styles.userEmail}>{user?.email || ''}</Text>
                    </View>

                    {/* Menu Items - Solid Orange Cards */}
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={item.action}
                            activeOpacity={0.8}
                            style={styles.menuCard}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name={item.icon as any} size={22} color="#FFFFFF" />
                            </View>
                            <View style={styles.menuTextContainer}>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
                        </TouchableOpacity>
                    ))}

                    {/* Logout - Solid Red */}
                    <TouchableOpacity
                        onPress={handleLogout}
                        activeOpacity={0.7}
                        style={styles.logoutCard}
                    >
                        <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default ProfileScreen;
