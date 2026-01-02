import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const MENU_ITEMS = [
    { icon: 'settings-outline', label: 'Settings' },
    { icon: 'options-outline', label: 'Options' },
    { icon: 'ellipsis-horizontal-circle-outline', label: 'More' },
    { icon: 'notifications-outline', label: 'Notifications' },
];

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#0f172a']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Profile Card */}
                    <BlurView intensity={40} tint="light" style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={40} color="white" />
                        </View>
                        <Text style={styles.name}>Josn Smith</Text>
                        <Text style={styles.email}>adrianahoo@gmail.com</Text>
                        <Text style={styles.address}>123 College Ave</Text>
                    </BlurView>

                    {/* Menu Group */}
                    <BlurView intensity={20} tint="light" style={styles.menuGroup}>
                        {MENU_ITEMS.map((item, index) => (
                            <TouchableOpacity key={item.label} style={[
                                styles.menuItem,
                                index !== MENU_ITEMS.length - 1 && styles.menuBorder
                            ]}>
                                <View style={styles.menuLeft}>
                                    <Ionicons name={item.icon as any} size={22} color="rgba(255,255,255,0.8)" />
                                    <Text style={styles.menuText}>{item.label}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
                            </TouchableOpacity>
                        ))}
                    </BlurView>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    profileCard: {
        alignItems: 'center',
        padding: 30,
        borderRadius: 24,
        marginBottom: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 4,
    },
    address: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
    },
    menuGroup: {
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    menuBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});
