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
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
        price: '',
        location: '',
        tags: [] as string[],
        images: [] as string[],
    });
    const [tagInput, setTagInput] = useState('');

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

    const updateForm = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Reset intent when changing channel
        if (field === 'channel') {
            setFormData(prev => ({ ...prev, intent: '', price: '' }));
        }
    };

    // Check if intent requires price
    const showPriceField = formData.intent === 'selling' || formData.intent === 'looking-for';

    // Image picker
    const pickImage = async () => {
        if (formData.images.length >= 5) {
            Alert.alert('Limit Reached', 'You can add up to 5 images');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            setFormData(prev => ({ ...prev, images: [...prev.images, result.assets[0].uri] }));
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    // Tags
    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && formData.tags.length < 5 && !formData.tags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
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

                    {/* Price/Budget (conditional) */}
                    {showPriceField && (
                        <View style={styles.section}>
                            <Text style={styles.label}>
                                {formData.intent === 'selling' ? 'Price' : 'Budget'}
                            </Text>
                            <View style={styles.priceInputContainer}>
                                <Text style={styles.priceCurrency}>$</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="0"
                                    value={formData.price}
                                    onChangeText={(v) => updateForm('price', v.replace(/[^0-9]/g, ''))}
                                    keyboardType="numeric"
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>
                        </View>
                    )}

                    {/* Location */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Location</Text>
                        <View style={styles.locationInput}>
                            <Ionicons name="location-outline" size={20} color={COLORS.textMuted} />
                            <TextInput
                                style={styles.locationTextInput}
                                placeholder="Add location (optional)"
                                value={formData.location}
                                onChangeText={(v) => updateForm('location', v)}
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>
                    </View>

                    {/* Tags */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Tags ({formData.tags.length}/5)</Text>
                        <View style={styles.tagInputRow}>
                            <TextInput
                                style={styles.tagInput}
                                placeholder="Add a tag..."
                                value={tagInput}
                                onChangeText={setTagInput}
                                onSubmitEditing={addTag}
                                returnKeyType="done"
                                placeholderTextColor={COLORS.textMuted}
                            />
                            <TouchableOpacity style={styles.addTagBtn} onPress={addTag}>
                                <Ionicons name="add" size={20} color={COLORS.card} />
                            </TouchableOpacity>
                        </View>
                        {formData.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {formData.tags.map((tag) => (
                                    <View key={tag} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                        <TouchableOpacity onPress={() => removeTag(tag)}>
                                            <Ionicons name="close" size={14} color={COLORS.text} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Images */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Photos ({formData.images.length}/5)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.imagesRow}>
                                {formData.images.map((uri, index) => (
                                    <View key={index} style={styles.imageContainer}>
                                        <Image source={{ uri }} style={styles.imagePreview} />
                                        <TouchableOpacity
                                            style={styles.removeImageBtn}
                                            onPress={() => removeImage(index)}
                                        >
                                            <Ionicons name="close" size={14} color={COLORS.card} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {formData.images.length < 5 && (
                                    <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                                        <Ionicons name="camera" size={24} color={COLORS.textMuted} />
                                        <Text style={styles.addImageText}>Add Photo</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>
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

    // Price
    priceInputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
    },
    priceCurrency: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginRight: SPACING.xs },
    priceInput: { flex: 1, paddingVertical: SPACING.md, fontSize: FONT_SIZES.lg, color: COLORS.text },

    // Location
    locationInput: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
        paddingHorizontal: SPACING.md, gap: SPACING.sm,
    },
    locationTextInput: { flex: 1, paddingVertical: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text },

    // Tags
    tagInputRow: { flexDirection: 'row', gap: SPACING.sm },
    tagInput: {
        flex: 1, backgroundColor: COLORS.backgroundSecondary, borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        fontSize: FONT_SIZES.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
    },
    addTagBtn: {
        width: 40, height: 40, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center', alignItems: 'center',
    },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.sm },
    tag: {
        flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.full,
    },
    tagText: { fontSize: FONT_SIZES.xs, color: COLORS.text, fontWeight: '500' },

    // Images
    imagesRow: { flexDirection: 'row', gap: SPACING.sm, paddingRight: SPACING.lg },
    imageContainer: { position: 'relative' },
    imagePreview: { width: 80, height: 80, borderRadius: BORDER_RADIUS.md },
    removeImageBtn: {
        position: 'absolute', top: -6, right: -6, width: 20, height: 20,
        backgroundColor: COLORS.error, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    },
    addImageBtn: {
        width: 80, height: 80, borderRadius: BORDER_RADIUS.md, borderWidth: 2, borderStyle: 'dashed',
        borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', gap: 4,
    },
    addImageText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
});

export default CreatePostScreen;
