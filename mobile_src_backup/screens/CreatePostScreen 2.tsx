import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import communityService from '../services/communityService';

interface CreatePostScreenProps {
    navigation?: any;
    route?: any;
}

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation, route }) => {
    const initialChannel = route?.params?.channel || '';
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        channel: initialChannel,
        intent: '',
        title: '',
        content: '',
    });

    // Channels matching website exactly
    const channels = [
        { id: 'housing', label: 'Housing', icon: 'home', color: '#DB4A2B' },
        { id: 'subleases', label: 'Subleases', icon: 'key', color: '#10B981' },
        { id: 'roommates', label: 'Roommates', icon: 'people', color: '#3B82F6' },
        { id: 'furniture', label: 'Furniture', icon: 'bed', color: '#8B5CF6' },
        { id: 'study-groups', label: 'Study Groups', icon: 'book', color: '#22C55E' },
        { id: 'misc', label: 'Misc', icon: 'ellipsis-horizontal', color: '#6B7280' },
    ];

    // All available intents (matching website)
    const allIntents: Record<string, { id: string; label: string; description: string }> = {
        'looking-for': { id: 'looking-for', label: 'Looking For', description: 'You need something' },
        'offering': { id: 'offering', label: 'Offering', description: 'You have something' },
        'selling': { id: 'selling', label: 'Selling', description: 'For sale' },
        'announcement': { id: 'announcement', label: 'Announcement', description: 'Just sharing' },
    };

    // Channel-specific intent mapping (matching website exactly)
    const channelIntents: Record<string, string[]> = {
        'housing': ['looking-for', 'offering'],
        'subleases': ['looking-for', 'offering'],
        'roommates': ['looking-for', 'offering'],
        'furniture': ['selling', 'looking-for'],
        'study-groups': ['looking-for', 'offering', 'announcement'],
        'misc': ['looking-for', 'offering', 'announcement'],
    };

    const updateForm = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Reset intent when changing channel
        if (field === 'channel') {
            setFormData(prev => ({ ...prev, intent: '' }));
        }
    };

    const validate = () => {
        if (!formData.channel) {
            Alert.alert('Missing Info', 'Please select a channel');
            return false;
        }
        if (!formData.title || formData.title.length < 5) {
            Alert.alert('Missing Info', 'Please add a title (at least 5 characters)');
            return false;
        }
        if (!formData.content || formData.content.length < 20) {
            Alert.alert('Missing Info', 'Please add content (at least 20 characters)');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await communityService.createPost({
                channel: formData.channel,
                intent: formData.intent || undefined,
                title: formData.title,
                content: formData.content,
            });
            Alert.alert('Success', 'Post created successfully!', [
                { text: 'OK', onPress: () => navigation?.goBack?.() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Post</Text>
                <TouchableOpacity
                    style={[styles.postButton, loading && styles.postButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.postButtonText}>{loading ? 'Posting...' : 'Post'}</Text>
                </TouchableOpacity>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Channel Selection */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Channel *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.channelRow}>
                                {channels.map((channel) => (
                                    <TouchableOpacity
                                        key={channel.id}
                                        style={[
                                            styles.channelBtn,
                                            formData.channel === channel.id && { backgroundColor: channel.color, borderColor: channel.color }
                                        ]}
                                        onPress={() => updateForm('channel', channel.id)}
                                    >
                                        <Text style={[
                                            styles.channelText,
                                            formData.channel === channel.id && styles.channelTextActive
                                        ]}>{channel.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Intent Selection */}
                    {formData.channel && channelIntents[formData.channel] && (
                        <View style={styles.section}>
                            <Text style={styles.label}>Intent *</Text>
                            <View style={styles.intentGrid}>
                                {channelIntents[formData.channel].map((intentId: string) => {
                                    const intent = allIntents[intentId];
                                    if (!intent) return null;
                                    return (
                                        <TouchableOpacity
                                            key={intent.id}
                                            style={[
                                                styles.intentBtn,
                                                formData.intent === intent.id && styles.intentBtnActive
                                            ]}
                                            onPress={() => updateForm('intent', intent.id)}
                                        >
                                            <Text style={[
                                                styles.intentText,
                                                formData.intent === intent.id && styles.intentTextActive
                                            ]}>{intent.label}</Text>
                                            <Text style={styles.intentDescription}>{intent.description}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Title */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="What's on your mind?"
                            value={formData.title}
                            onChangeText={(v) => updateForm('title', v)}
                            placeholderTextColor={COLORS.textMuted}
                            maxLength={100}
                        />
                        <Text style={styles.charCount}>{formData.title.length}/100</Text>
                    </View>

                    {/* Content */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Content *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Share more details... (min 20 characters)"
                            value={formData.content}
                            onChangeText={(v) => updateForm('content', v)}
                            multiline
                            numberOfLines={8}
                            textAlignVertical="top"
                            placeholderTextColor={COLORS.textMuted}
                        />
                        <Text style={styles.charCount}>{formData.content.length} characters</Text>
                    </View>

                    <View style={{ height: 50 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: COLORS.background,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
    postButton: {
        backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
    },
    postButtonDisabled: { opacity: 0.5 },
    postButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.card },

    content: { flex: 1, paddingHorizontal: SPACING.lg },
    section: { marginTop: SPACING.lg },
    label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },

    channelRow: { flexDirection: 'row', gap: SPACING.sm, paddingRight: SPACING.lg },
    channelBtn: {
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.backgroundSecondary, borderWidth: 1, borderColor: COLORS.border,
    },
    channelText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
    channelTextActive: { color: COLORS.card },

    intentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    intentBtn: {
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.backgroundSecondary, borderWidth: 1, borderColor: COLORS.border,
    },
    intentBtnActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
    intentText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
    intentTextActive: { color: COLORS.card },
    intentDescription: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },

    input: {
        backgroundColor: COLORS.backgroundSecondary, borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
        fontSize: FONT_SIZES.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
    },
    textArea: { height: 180, paddingTop: SPACING.md },
    charCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'right', marginTop: SPACING.xs },
});

export default CreatePostScreen;
