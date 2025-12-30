import React from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import HomeScreen from '../screens/HomeScreen';
import RoommatesScreen from '../screens/RoommatesScreen';
import CommunityScreen from '../screens/CommunityScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

const Tab = createBottomTabNavigator();

// Clean tab bar with orange accents
const TabBar = ({ state, descriptors, navigation }: any) => {
    return (
        <View style={styles.tabBarContainer}>
            {Platform.OS === 'ios' ? (
                <BlurView intensity={90} tint="light" style={styles.tabBar}>
                    <TabBarContent state={state} navigation={navigation} />
                </BlurView>
            ) : (
                <View style={[styles.tabBar, styles.androidTabBar]}>
                    <TabBarContent state={state} navigation={navigation} />
                </View>
            )}
        </View>
    );
};

const TabBarContent = ({ state, navigation }: any) => {
    return (
        <View style={styles.tabBarInner}>
            {state.routes.map((route: any, index: number) => {
                const isFocused = state.index === index;
                const icon = getIcon(route.name, isFocused);

                const onPress = () => {
                    if (!isFocused) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <View key={route.key} style={styles.tabItem} onTouchEnd={onPress}>
                        <Ionicons
                            name={icon}
                            size={24}
                            color={isFocused ? COLORS.primary : COLORS.textMuted}
                        />
                        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                            {route.name}
                        </Text>
                    </View>
                );
            })}
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

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.md,
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    },
    tabBar: {
        borderRadius: SPACING.xxl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.lg,
    },
    androidTabBar: {
        backgroundColor: COLORS.card,
    },
    tabBarInner: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    tabItem: {
        alignItems: 'center',
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: COLORS.textMuted,
        marginTop: 2,
    },
    tabLabelActive: {
        color: COLORS.primary,  // Orange when active
        fontWeight: '600',
    },
});

export default TabNavigator;
