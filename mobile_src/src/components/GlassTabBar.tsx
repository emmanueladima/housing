import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

/**
 * GlassTabBar - A custom tab bar with liquid glass effect using expo-glass-effect.
 * Fallbacks to expo-blur on Android or if liquid glass is unavailable.
 */
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const isLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

    const renderTabs = () => (
        <View style={styles.tabsRow}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                let iconName: any = 'home-outline';
                if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
                else if (route.name === 'roommates') iconName = isFocused ? 'people' : 'people-outline';
                else if (route.name === 'community') iconName = isFocused ? 'chatbubbles' : 'chatbubbles-outline';
                else if (route.name === 'messages') iconName = isFocused ? 'chatbox' : 'chatbox-outline';
                else if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

                const label = options.tabBarLabel ?? options.title ?? route.name;

                return (
                    <TouchableOpacity
                        key={index}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        onPress={onPress}
                        style={[
                            styles.tabButton,
                            isFocused && styles.tabButtonActive,
                        ]}
                    >
                        <Ionicons
                            name={iconName}
                            size={22}
                            color={isFocused ? theme.colors.primary : '#64748b'}
                        />
                        <Text style={[
                            styles.label,
                            { color: isFocused ? theme.colors.primary : '#64748b' }
                        ]}>
                            {label as string}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Outer glow effect */}
            <View style={[styles.glowWrapper, isLiquidGlass && styles.glassGlow]}>
                {isLiquidGlass ? (
                    <GlassView
                        style={styles.glassContainer}
                        glassEffectStyle="regular"
                    >
                        {renderTabs()}
                    </GlassView>
                ) : (
                    <>
                        {/* Top highlight for fake glass reflection */}
                        <LinearGradient
                            colors={['rgba(255, 255, 255, 0.35)', 'transparent']}
                            style={styles.highlight}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                        />
                        <BlurView
                            intensity={80}
                            tint="light"
                            style={styles.blurContainer}
                        >
                            <View style={styles.innerBackground}>
                                {renderTabs()}
                            </View>
                        </BlurView>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
    },
    glowWrapper: {
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.35)',
        ...theme.shadows.glassStrong,
    },
    glassGlow: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'transparent',
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 30,
        zIndex: 10,
        pointerEvents: 'none',
    },
    blurContainer: {
        borderRadius: 32,
        overflow: 'hidden',
    },
    glassContainer: {
        borderRadius: 32,
        overflow: 'hidden',
    },
    innerBackground: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    tabsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 14,
        paddingHorizontal: 8,
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
    },
    tabButtonActive: {
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
    },
});
