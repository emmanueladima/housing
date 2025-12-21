import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

const MessagesScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Messages</Text>
                    <TouchableOpacity style={styles.composeButton}>
                        <Ionicons name="create-outline" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Message threads */}
                {[1, 2, 3, 4, 5].map((item) => (
                    <TouchableOpacity key={item} style={styles.messageCard} activeOpacity={0.9}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>JD</Text>
                        </View>
                        <View style={styles.messageContent}>
                            <View style={styles.messageHeader}>
                                <Text style={styles.messageName}>John Doe</Text>
                                <Text style={styles.messageTime}>2h</Text>
                            </View>
                            <Text style={styles.messagePreview} numberOfLines={1}>
                                Hey! I saw your listing and I'm interested...
                            </Text>
                        </View>
                        {item === 1 && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                ))}

                {/* Bottom padding */}
                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        backgroundColor: COLORS.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: FONT_SIZES.title,
        fontWeight: '700',
        color: COLORS.text,
    },
    composeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // Content
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingTop: SPACING.sm,
    },

    // Messages
    messageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.card,
    },
    messageContent: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    messageName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    messageTime: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
    },
    messagePreview: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginLeft: SPACING.sm,
    },
});

export default MessagesScreen;
