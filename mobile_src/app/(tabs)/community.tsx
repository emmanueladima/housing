import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const CHANNELS = [
    { id: 1, name: 'General', icon: 'chatbubble-outline', members: 1247 },
    { id: 2, name: 'Housing Tips', icon: 'home-outline', members: 892 },
    { id: 3, name: 'Roommate Search', icon: 'people-outline', members: 651 },
    { id: 4, name: 'Events', icon: 'calendar-outline', members: 423 },
    { id: 5, name: 'Buy & Sell', icon: 'pricetag-outline', members: 358 },
];

export default function CommunityScreen() {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#0f172a']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Community</Text>
                    <TouchableOpacity>
                        <Ionicons name="add-circle-outline" size={28} color="#F97316" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {CHANNELS.map((channel) => (
                        <TouchableOpacity key={channel.id}>
                            <BlurView intensity={25} tint="light" style={styles.channelCard}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name={channel.icon as any} size={24} color="#F97316" />
                                </View>
                                <View style={styles.channelInfo}>
                                    <Text style={styles.channelName}>{channel.name}</Text>
                                    <Text style={styles.memberCount}>{channel.members} members</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                            </BlurView>
                        </TouchableOpacity>
                    ))}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    channelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    channelInfo: {
        flex: 1,
    },
    channelName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    memberCount: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        marginTop: 2,
    },
});
