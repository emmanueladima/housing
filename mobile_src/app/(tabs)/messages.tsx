import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const MESSAGES = [
    { id: 1, name: 'Josn Smith', message: 'Last message preview...', time: '2:20 AM' },
    { id: 2, name: 'Sanithy Janahon', message: 'Last message content...', time: '10:29 AM' },
    { id: 3, name: 'Goolseoť', message: 'Hi!', time: '2:30 PM' },
    { id: 4, name: 'Josn Krialan', message: 'Last message preview...', time: '3:20 PM' },
    { id: 5, name: 'Smiite Marin', message: 'Hello!', time: '3:35 AM' },
];

export default function MessagesScreen() {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#0f172a']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={{ width: 24 }} />
                    <Text style={styles.headerTitle}>Messages</Text>
                    <Ionicons name="create-outline" size={24} color="#F97316" />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <BlurView intensity={20} tint="light" style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
                        <TextInput
                            placeholder="Search"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            style={styles.searchInput}
                        />
                    </BlurView>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {MESSAGES.map((msg) => (
                        <BlurView key={msg.id} intensity={25} tint="light" style={styles.messageRow}>
                            <View style={styles.avatar}>
                                <Text style={styles.initial}>{msg.name[0]}</Text>
                            </View>
                            <View style={styles.messageContent}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.name}>{msg.name}</Text>
                                    <Text style={styles.time}>{msg.time}</Text>
                                </View>
                                <Text style={styles.preview}>{msg.message}</Text>
                            </View>
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
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: 'white',
        fontSize: 16,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    initial: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    messageContent: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    time: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
    },
    preview: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    },
});
