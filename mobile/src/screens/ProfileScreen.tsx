import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';

// Menu items
const menuItems = [
    { icon: 'home-outline', label: 'My Listings' },
    { icon: 'document-text-outline', label: 'Applications' },
    { icon: 'star-outline', label: 'Reviews' },
    { icon: 'shield-checkmark-outline', label: 'Verification' },
    { icon: 'settings-outline', label: 'Settings' },
    { icon: 'help-circle-outline', label: 'Help' },
];

const ProfileScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                    <TouchableOpacity style={styles.settingsButton}>
                        <Ionicons name="settings-outline" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={32} color={COLORS.card} />
                    </View>
                    <Text style={styles.profileName}>Sign in to your account</Text>
                    <Text style={styles.profileSub}>Access saves, messages, and more</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.signInButton}>
                            <Text style={styles.signInText}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.signUpButton}>
                            <Text style={styles.signUpText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem}>
                            <Ionicons name={item.icon as any} size={22} color={COLORS.text} />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bottom padding */}
                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
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
        backgroundColor: COLORS.background,
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
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // Content
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.lg,
    },

    // Profile Card
    profileCard: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    profileName: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    profileSub: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        width: '100%',
    },
    signInButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    signInText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.card,
    },
    signUpButton: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    signUpText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },

    // Menu Items
    menuContainer: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
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
    menuLabel: {
        flex: 1,
        marginLeft: SPACING.md,
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
        color: COLORS.text,
    },
});

export default ProfileScreen;
