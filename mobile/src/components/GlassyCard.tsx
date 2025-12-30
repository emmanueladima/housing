import React from 'react';
import { StyleSheet, View, Platform, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface GlassyCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    dark?: boolean;
    noPadding?: boolean;
}

export const GlassyCard: React.FC<GlassyCardProps> = ({
    children,
    style,
    intensity = 50,
    dark,
    noPadding = false,
}) => {
    const { isDark: themeDark } = useTheme();
    const isDark = dark ?? themeDark;

    const styles = StyleSheet.create({
        // Outer container with glow
        glassOuter: {
            borderRadius: BORDER_RADIUS.xl,
            shadowColor: isDark ? '#fff' : '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDark ? 0.08 : 0.06,
            shadowRadius: 16,
            elevation: 8,
        },
        // Glass border
        glassBorder: {
            borderRadius: BORDER_RADIUS.xl - 1,
            borderWidth: 0.5,
            borderColor: isDark
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(255, 255, 255, 0.5)',
            overflow: 'hidden',
        },
        // Main card
        card: {
            borderRadius: BORDER_RADIUS.xl - 2,
            overflow: 'hidden',
        },
        // Highlight gradient for depth
        glassHighlight: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            borderTopLeftRadius: BORDER_RADIUS.xl - 2,
            borderTopRightRadius: BORDER_RADIUS.xl - 2,
        },
        content: {
            padding: noPadding ? 0 : 16,
        },
        // Android fallback
        androidCard: {
            backgroundColor: isDark
                ? 'rgba(40, 40, 40, 0.92)'
                : 'rgba(255, 255, 255, 0.88)',
            borderRadius: BORDER_RADIUS.xl - 2,
        },
    });

    // iOS with native blur
    if (Platform.OS === 'ios') {
        return (
            <View style={[styles.glassOuter, style]}>
                <View style={styles.glassBorder}>
                    <BlurView
                        intensity={intensity}
                        tint={isDark ? 'dark' : 'light'}
                        style={styles.card}
                    >
                        {/* Subtle highlight for liquid glass depth */}
                        <LinearGradient
                            colors={isDark
                                ? ['rgba(255,255,255,0.06)', 'transparent']
                                : ['rgba(255,255,255,0.5)', 'transparent']
                            }
                            style={styles.glassHighlight}
                        />
                        <View style={styles.content}>{children}</View>
                    </BlurView>
                </View>
            </View>
        );
    }

    // Android fallback
    return (
        <View style={[styles.glassOuter, style]}>
            <View style={styles.glassBorder}>
                <View style={[styles.card, styles.androidCard]}>
                    <View style={styles.content}>{children}</View>
                </View>
            </View>
        </View>
    );
};

export default GlassyCard;
