import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Linking,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsScreenProps {
    navigation?: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
    const { logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const colors = useColors();
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. All your data will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive', onPress: () => {
                        Alert.alert('Contact Support', 'Please email support@collegio.com to delete your account.');
                    }
                },
            ]
        );
    };

    const settingsSections = [
        {
            title: 'Notifications',
            items: [
                {
                    icon: 'notifications-outline',
                    label: 'Push Notifications',
                    type: 'switch',
                    value: pushNotifications,
                    onToggle: setPushNotifications,
                },
                {
                    icon: 'mail-outline',
                    label: 'Email Notifications',
                    type: 'switch',
                    value: emailNotifications,
                    onToggle: setEmailNotifications,
                },
            ],
        },
        {
            title: 'Appearance',
            items: [
                {
                    icon: 'moon-outline',
                    label: 'Dark Mode',
                    type: 'switch',
                    value: isDark,
                    onToggle: toggleTheme,
                },
            ],
        },
        {
            title: 'Support',
            items: [
                {
                    icon: 'help-circle-outline',
                    label: 'Help Center',
                    type: 'link',
                    action: () => navigation?.navigate('Legal', { type: 'about' }),
                },
                {
                    icon: 'chatbubble-ellipses-outline',
                    label: 'Contact Support',
                    type: 'link',
                    action: () => Linking.openURL('mailto:support@collegio.us'),
                },
                {
                    icon: 'bug-outline',
                    label: 'Report a Bug',
                    type: 'link',
                    action: () => Linking.openURL('mailto:admin@collegio.us'),
                },
            ],
        },
        {
            title: 'Legal',
            items: [
                {
                    icon: 'document-text-outline',
                    label: 'Terms of Service',
                    type: 'link',
                    action: () => navigation?.navigate('Legal', { type: 'terms' }),
                },
                {
                    icon: 'shield-checkmark-outline',
                    label: 'Privacy Policy',
                    type: 'link',
                    action: () => navigation?.navigate('Legal', { type: 'privacy' }),
                },
                {
                    icon: 'information-circle-outline',
                    label: 'About Collegio',
                    type: 'link',
                    action: () => navigation?.navigate('Legal', { type: 'about' }),
                },
            ],
        },
        {
            title: 'Account',
            items: [
                {
                    icon: 'log-out-outline',
                    label: 'Logout',
                    type: 'button',
                    action: handleLogout,
                    color: colors.primary,
                },
                {
                    icon: 'trash-outline',
                    label: 'Delete Account',
                    type: 'button',
                    action: handleDeleteAccount,
                    color: colors.error,
                },
            ],
        },
    ];

    // Dynamic styles based on theme
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
        },
        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.backgroundSecondary,
            borderRadius: BORDER_RADIUS.md,
        },
        title: {
            fontSize: FONT_SIZES.xl,
            fontWeight: '700',
            color: colors.text,
        },
        content: {
            flex: 1,
        },
        contentContainer: {
            paddingHorizontal: SPACING.lg,
        },
        section: {
            marginBottom: SPACING.lg,
        },
        sectionTitle: {
            fontSize: FONT_SIZES.sm,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: SPACING.sm,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        sectionCard: {
            backgroundColor: colors.card,
            borderRadius: BORDER_RADIUS.xl,
            ...SHADOWS.sm,
            borderWidth: 1,
            borderColor: colors.border,
        },
        settingItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        settingItemLast: {
            borderBottomWidth: 0,
        },
        iconContainer: {
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: SPACING.md,
        },
        settingContent: {
            flex: 1,
        },
        settingLabel: {
            fontSize: FONT_SIZES.md,
            fontWeight: '500',
            color: colors.text,
        },
        settingSubtitle: {
            fontSize: FONT_SIZES.xs,
            color: colors.textMuted,
            marginTop: 2,
        },
        versionText: {
            textAlign: 'center',
            fontSize: FONT_SIZES.sm,
            color: colors.textMuted,
            marginTop: SPACING.lg,
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
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Settings</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {settingsSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.sectionCard}>
                            {section.items.map((item: any, itemIndex) => (
                                <TouchableOpacity
                                    key={itemIndex}
                                    style={[
                                        styles.settingItem,
                                        itemIndex === section.items.length - 1 && styles.settingItemLast,
                                    ]}
                                    onPress={item.action}
                                    disabled={item.type === 'switch'}
                                >
                                    <View style={[styles.iconContainer, item.color && { backgroundColor: `${item.color}15` }]}>
                                        <Ionicons
                                            name={item.icon as any}
                                            size={20}
                                            color={item.color || colors.text}
                                        />
                                    </View>
                                    <View style={styles.settingContent}>
                                        <Text style={[styles.settingLabel, item.color && { color: item.color }]}>
                                            {item.label}
                                        </Text>
                                        {item.subtitle && (
                                            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                                        )}
                                    </View>
                                    {item.type === 'switch' && (
                                        <Switch
                                            value={item.value}
                                            onValueChange={item.onToggle}
                                            trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                                            thumbColor={item.value ? colors.primary : colors.textMuted}
                                        />
                                    )}
                                    {item.type === 'link' && (
                                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <Text style={styles.versionText}>Collegio v1.0.0</Text>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

export default SettingsScreen;
