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

const SavedScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                {/* Simple Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Saved</Text>
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Empty State */}
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="bookmark-outline" size={40} color={COLORS.textMuted} />
                    </View>
                    <Text style={styles.emptyTitle}>No saved listings</Text>
                    <Text style={styles.emptySubtitle}>
                        Tap the bookmark icon on listings to save them here
                    </Text>
                </View>

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
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZES.title,
        fontWeight: '700',
        color: COLORS.text,
    },

    // Content
    content: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    emptyTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    emptySubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default SavedScreen;
