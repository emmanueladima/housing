import { Tabs } from 'expo-router';
import React from 'react';
import { GlassTabBar } from '../../src/components/GlassTabBar';

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <GlassTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                // Hide default tab bar background since we render a custom one
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 0,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="roommates"
                options={{
                    title: 'Roommates',
                }}
            />
            <Tabs.Screen
                name="community"
                options={{
                    title: 'Community',
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Messages',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                }}
            />
        </Tabs>
    );
}
