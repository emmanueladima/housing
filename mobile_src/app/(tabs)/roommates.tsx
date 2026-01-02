import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/constants/theme';

const USERS = [
    { id: 1, name: 'Josher Mande', role: 'Developer', bio: 'Quiet but friendly...', image: null },
    { id: 2, name: 'Saria Anily', role: 'Designer', bio: 'Loves cooking...', image: null },
    { id: 3, name: 'Joeus Arigour', role: 'Student', bio: 'Study focused...', image: null },
    { id: 4, name: 'Nattino Solten', role: 'Musician', bio: 'Plays guitar...', image: null },
];

export default function RoommatesScreen() {
    const [selectedTab, setSelectedTab] = useState<'Solo' | 'Groups'>('Solo');

    return (
        <View style={styles.container}>
            {/* Dark Gradient Background for "Match Mode" feel as per wireframe dark mode */}
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#0f172a']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Roommates</Text>
                    <TouchableOpacity>
                        <Ionicons name="add" size={24} color="#F97316" />
                    </TouchableOpacity>
                </View>

                {/* Segmented Control */}
                <View style={styles.segmentContainer}>
                    <View style={styles.segmentWrapper}>
                        <TouchableOpacity
                            style={[styles.segmentButton, selectedTab === 'Solo' && styles.segmentActive]}
                            onPress={() => setSelectedTab('Solo')}
                        >
                            <Text style={[styles.segmentText, selectedTab === 'Solo' && styles.segmentTextActive]}>Solo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segmentButton, selectedTab === 'Groups' && styles.segmentActive]}
                            onPress={() => setSelectedTab('Groups')}
                        >
                            <Text style={[styles.segmentText, selectedTab === 'Groups' && styles.segmentTextActive]}>Groups</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* List */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {USERS.map((user) => (
                        <BlurView key={user.id} intensity={30} tint="light" style={styles.card}>
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitial}>{user.name[0]}</Text>
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardName}>{user.name}</Text>
                                <Text style={styles.cardRole}>{user.role}</Text>
                                <Text style={styles.cardBio}>{user.bio}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                        </BlurView>
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
    segmentContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    segmentWrapper: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 25,
        padding: 4,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 20,
    },
    segmentActive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    segmentText: {
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
    },
    segmentTextActive: {
        color: 'white',
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
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
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarInitial: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardInfo: {
        flex: 1,
    },
    cardName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cardRole: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        marginTop: 2,
    },
    cardBio: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 4,
    },
});
