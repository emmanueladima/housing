import React from 'react';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { View, useColorScheme, ViewProps, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

interface GlassyCardProps extends ViewProps {
    intensity?: number;
    variant?: 'default' | 'solid' | 'liquid';
    children: React.ReactNode;
    noPadding?: boolean;
    isInteractive?: boolean;
}

/**
 * GlassyCard - A glassmorphism card component with liquid glass effect.
 * Uses expo-glass-effect on iOS (if available) and expo-blur on Android/fallback.
 */
export function GlassyCard({
    children,
    style,
    intensity,
    variant = 'default',
    noPadding = false,
    isInteractive = false,
    ...props
}: GlassyCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const canUseGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

    // Standard blur intensity fallback
    const getIntensity = () => {
        if (intensity !== undefined) return intensity;
        switch (variant) {
            case 'liquid': return theme.blur.intensity.strong;
            case 'solid': return theme.blur.intensity.dark;
            default: return isDark ? theme.blur.intensity.dark : theme.blur.intensity.light;
        }
    };

    const tint = isDark ? 'dark' : 'light';
    const blurIntensity = getIntensity();

    if (canUseGlass) {
        return (
            <GlassView
                style={[
                    styles.container,
                    styles.glassContainer,
                    variant === 'liquid' && styles.liquidShadow,
                    style,
                ]}
                glassEffectStyle={variant === 'solid' ? 'regular' : 'regular'}
                isInteractive={isInteractive}
                {...props}
            >
                <View style={noPadding ? null : styles.padding}>
                    {children}
                </View>
            </GlassView>
        );
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: isDark
                        ? 'rgba(15, 23, 42, 0.5)'
                        : 'rgba(255, 255, 255, 0.6)',
                    borderColor: isDark
                        ? theme.colors.glass.borderDark
                        : theme.colors.glass.border,
                },
                variant === 'liquid' && styles.liquidShadow,
                style,
            ]}
            {...props}
        >
            {/* Top highlight gradient for fake glass reflection effect */}
            <LinearGradient
                colors={[
                    isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)',
                    'transparent',
                ]}
                style={styles.highlight}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            <BlurView
                intensity={blurIntensity}
                tint={tint}
                style={[styles.blur, noPadding ? null : styles.padding]}
            >
                {children}
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 20,
        borderWidth: 1,
        ...theme.shadows.glass,
    },
    glassContainer: {
        borderWidth: 0, // GlassView handles its own border/reflection mostly
        backgroundColor: 'transparent',
    },
    liquidShadow: {
        ...theme.shadows.glassStrong,
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        zIndex: 1,
        pointerEvents: 'none',
    },
    blur: {
        flex: 1,
    },
    padding: {
        padding: 16,
    },
});
