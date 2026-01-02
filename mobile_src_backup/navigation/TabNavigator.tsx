import React, { useEffect } from 'react';
import { StyleSheet, View, Platform, Text, Pressable, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
// @ts-ignore - expo-glass-effect types
import { GlassView } from 'expo-glass-effect';

import HomeScreen from '../screens/HomeScreen';
import RoommatesScreen from '../screens/RoommatesScreen';
import CommunityScreen from '../screens/CommunityScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useColors, SPACING } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_COUNT = 5;
const TAB_BAR_MARGIN = SPACING.md;
const TAB_BAR_PADDING = 6;
const TAB_BAR_WIDTH = SCREEN_WIDTH - TAB_BAR_MARGIN * 2;
const TAB_WIDTH = (TAB_BAR_WIDTH - TAB_BAR_PADDING * 2) / TAB_COUNT;
const BUBBLE_WIDTH = TAB_WIDTH - 6;
const BUBBLE_HEIGHT = 50;

// Animated Tab Item
const AnimatedTabItem = ({
    route,
    isFocused,
    onPress,
    colors,
    isDark,
}: any) => {
    const scale = useSharedValue(1);
    const iconY = useSharedValue(0);
    const icon = getIcon(route.name, isFocused);

    useEffect(() => {
        iconY.value = withSpring(isFocused ? -1 : 0, { damping: 15 });
    }, [isFocused]);

    const handlePress = () => {
        scale.value = withSpring(0.9, { damping: 15 }, () => {
            scale.value = withSpring(1, { damping: 10 });
        });
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateY: iconY.value }
        ],
    }));

    // Colors adapt to light/dark mode - Orange for active
    const iconColor = isFocused
        ? '#db4a2b'  // Orange for active
        : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(60,60,67,0.6)');

    const labelColor = isFocused
        ? '#db4a2b'  // Orange for active
        : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(60,60,67,0.5)');

    return (
        <Pressable onPress={handlePress} style={styles.tabItem}>
            <Animated.View style={[styles.tabItemInner, animatedStyle]}>
                <Ionicons
                    name={icon}
                    size={22}
                    color={iconColor}
                />
                <Text style={[
                    styles.tabLabel,
                    { color: labelColor },
                    isFocused && { fontWeight: '600' }
                ]}>
                    {route.name}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

// Animated Bubble Indicator - Pill shape with fluid squish animation
const BubbleIndicator = ({ position, scaleY, isDark }: any) => {
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: position.value },
            { scaleY: scaleY.value },
        ],
    }));

    return (
        <Animated.View style={[styles.bubbleContainer, animatedStyle]}>
            <View style={[
                styles.bubble,
                // Light mode: subtle gray-beige bubble. Dark mode: lighter white bubble
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(120, 110, 100, 0.18)' }
            ]}>
                <View style={[
                    styles.bubbleShine,
                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.5)' }
                ]} />
            </View>
        </Animated.View>
    );
};

// Liquid Glass Tab Bar - Light & Dark modes
const TabBar = ({ state, navigation }: any) => {
    const colors = useColors();
    const { isDark } = useTheme();

    // Calculate bubble center position
    const getBubblePosition = (index: number) => {
        return index * TAB_WIDTH + (TAB_WIDTH - BUBBLE_WIDTH) / 2;
    };

    const bubblePosition = useSharedValue(getBubblePosition(state.index));
    const bubbleScaleY = useSharedValue(1);

    useEffect(() => {
        // Quick squish with instant snap back
        bubbleScaleY.value = withSequence(
            withTiming(0.8, { duration: 80 }),  // Quick squish
            withTiming(1, { duration: 100 })    // Instant snap back
        );
        bubblePosition.value = withSpring(getBubblePosition(state.index), {
            damping: 25,
            stiffness: 300,
            mass: 0.5,
        });
    }, [state.index]);

    const dynamicStyles = StyleSheet.create({
        tabBarContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: TAB_BAR_MARGIN,
            paddingBottom: Platform.OS === 'ios' ? 28 : 16,
        },
        glassWrapper: {
            borderRadius: 32,
            overflow: 'hidden',
            // Shadow for floating effect
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.4 : 0.15,
            shadowRadius: 20,
            elevation: 16,
            // Light mode border
            borderWidth: isDark ? 0 : 1,
            borderColor: 'rgba(255, 255, 255, 0.6)',
        },
        glassView: {
            borderRadius: 32,
            overflow: 'hidden',
        },
        // Subtle top highlight for liquid glass look
        innerHighlight: {
            position: 'absolute',
            top: 0,
            left: 20,
            right: 20,
            height: 0.5,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.8)',
            zIndex: 100,
        },
        tabBarInner: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: TAB_BAR_PADDING,
        },
    });

    const TabBarContent = () => (
        <View style={dynamicStyles.tabBarInner}>
            {/* Animated bubble behind active tab */}
            <BubbleIndicator position={bubblePosition} scaleY={bubbleScaleY} isDark={isDark} />

            {state.routes.map((route: any, index: number) => {
                const isFocused = state.index === index;

                const onPress = () => {
                    if (!isFocused) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <AnimatedTabItem
                        key={route.key}
                        route={route}
                        isFocused={isFocused}
                        onPress={onPress}
                        colors={colors}
                        isDark={isDark}
                    />
                );
            })}
        </View>
    );

    // Adaptive glass tab bar - light frosted in light mode, dark frosted in dark mode
    return (
        <View style={dynamicStyles.tabBarContainer}>
            <View style={dynamicStyles.glassWrapper}>
                <GlassView
                    style={dynamicStyles.glassView}
                    glassEffectStyle="regular"
                    tintColor={isDark
                        ? 'rgba(28, 28, 30, 0.85)'  // Dark translucent
                        : 'rgba(255, 255, 255, 0.7)' // Light frosted white
                    }
                >
                    {/* Top edge shine for liquid effect */}
                    <View style={dynamicStyles.innerHighlight} />
                    <TabBarContent />
                </GlassView>
            </View>
        </View>
    );
};

const getIcon = (name: string, focused: boolean): any => {
    const icons: Record<string, { active: string; inactive: string }> = {
        Listings: { active: 'home', inactive: 'home-outline' },
        Roommates: { active: 'people', inactive: 'people-outline' },
        Community: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
        Messages: { active: 'mail', inactive: 'mail-outline' },
        Profile: { active: 'person', inactive: 'person-outline' },
    };
    const icon = icons[name] || { active: 'ellipse', inactive: 'ellipse-outline' };
    return focused ? icon.active : icon.inactive;
};

// Shared styles
const styles = StyleSheet.create({
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        zIndex: 10,
        height: BUBBLE_HEIGHT,
    },
    tabItemInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 9,
        fontWeight: '500',
        marginTop: 2,
        letterSpacing: 0.1,
    },
    bubbleContainer: {
        position: 'absolute',
        top: 4,
        left: TAB_BAR_PADDING,
        width: BUBBLE_WIDTH,
        height: BUBBLE_HEIGHT + 4,
        zIndex: 1,
    },
    bubble: {
        flex: 1,
        borderRadius: 22,  // More rounded for pill shape
        overflow: 'hidden',
    },
    bubbleShine: {
        position: 'absolute',
        top: 0,
        left: 8,
        right: 8,
        height: 2,
        borderRadius: 1,
    },
});

export const TabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Listings" component={HomeScreen} />
            <Tab.Screen name="Roommates" component={RoommatesScreen} />
            <Tab.Screen name="Community" component={CommunityScreen} />
            <Tab.Screen name="Messages" component={MessagesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
