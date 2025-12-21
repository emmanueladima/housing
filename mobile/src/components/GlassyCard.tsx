import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface GlassyCardProps {
    children: React.ReactNode;
    style?: any;
    intensity?: number;
    dark?: boolean;
}

export const GlassyCard: React.FC<GlassyCardProps> = ({
    children,
    style,
    intensity = 80,
    dark = false,
}) => {
    // BlurView works well on iOS, fallback for Android
    if (Platform.OS === 'ios') {
        return (
            <BlurView
                intensity={intensity}
                tint={dark ? 'dark' : 'light'}
                style={[styles.card, style]}
            >
                <View style={styles.content}>{children}</View>
            </BlurView>
        );
    }

    // Android fallback with semi-transparent background
    return (
        <View
            style={[
                styles.card,
                styles.androidCard,
                dark && styles.androidCardDark,
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        ...SHADOWS.md,
    },
    content: {
        padding: 0,
    },
    androidCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    androidCardDark: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
});

export default GlassyCard;
