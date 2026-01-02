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
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import roommateGroupService from '../services/roommateGroupService';

interface CreateGroupScreenProps {
    navigation?: any;
}

const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [groupImage, setGroupImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        budget: '',
        lookingFor: '2',
        vibe: [] as string[],
        location: 'Near Campus',
    });

    const vibeOptions = [
        'Studious', 'Chill', 'Party', 'Clean', 'Gamers',
        'Night Owls', 'Early Birds', 'Fitness', 'Music',
        'Pet Lovers', 'Eco-Friendly', 'Foodies', 'Movie Nights',
        'Quiet', 'Social', 'Outdoorsy', 'Creative'
    ];

    const locationOptions = ['Near Campus', 'Downtown', 'Suburbs', 'Flexible'];

    const updateForm = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleVibe = (vibe: string) => {
        setFormData(prev => ({
            ...prev,
            vibe: prev.vibe.includes(vibe)
                ? prev.vibe.filter(v => v !== vibe)
                : [...prev.vibe, vibe].slice(0, 3)
        }));
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setGroupImage(result.assets[0].uri);
        }
    };

    const validateStep = () => {
        if (step === 1 && (!formData.name || !formData.description)) {
            Alert.alert('Missing Info', 'Please fill in the group name and description');
            return false;
        }
        if (step === 2 && !formData.budget) {
            Alert.alert('Missing Info', 'Please set a budget');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (step < 2) setStep(step + 1);
            else handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await roommateGroupService.createGroup({
                name: formData.name,
                description: formData.description,
                budget: { min: 0, max: parseInt(formData.budget) },
                maxMembers: parseInt(formData.lookingFor) + 1, // +1 for current user
                spotsAvailable: parseInt(formData.lookingFor),
                vibe: formData.vibe,
                location: formData.location,
            });
            Alert.alert('Success', 'Group created successfully!', [
                { text: 'OK', onPress: () => navigation?.goBack?.() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Group Basics</Text>
            <Text style={styles.stepSubtitle}>Create your roommate group</Text>

            {/* Group Image */}
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                {groupImage ? (
                    <Image source={{ uri: groupImage }} style={styles.groupImage} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="people" size={40} color={COLORS.textMuted} />
                        <Text style={styles.imageText}>Add Group Photo</Text>
                    </View>
                )}
                <View style={styles.imageBadge}>
                    <Ionicons name="camera" size={16} color={COLORS.card} />
                </View>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Group Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., The Beaver Den 🦫"
                    value={formData.name}
                    onChangeText={(v) => updateForm('name', v)}
                    placeholderTextColor={COLORS.textMuted}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tell potential roommates about your group, what you're looking for, and your ideal living situation..."
                    value={formData.description}
                    onChangeText={(v) => updateForm('description', v)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor={COLORS.textMuted}
                />
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Preferences</Text>
            <Text style={styles.stepSubtitle}>Set your group's preferences</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Max Budget per Person</Text>
                <View style={styles.inputWithPrefix}>
                    <Text style={styles.prefix}>$</Text>
                    <TextInput
                        style={[styles.input, { flex: 1, borderWidth: 0 }]}
                        placeholder="1200"
                        value={formData.budget}
                        onChangeText={(v) => updateForm('budget', v)}
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.textMuted}
                    />
                    <Text style={styles.suffix}>/mo</Text>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Looking for (# more roommates)</Text>
                <View style={styles.optionRow}>
                    {['1', '2', '3', '4+'].map((num) => (
                        <TouchableOpacity
                            key={num}
                            style={[styles.optionBtn, formData.lookingFor === num && styles.optionBtnActive]}
                            onPress={() => updateForm('lookingFor', num)}
                        >
                            <Text style={[styles.optionText, formData.lookingFor === num && styles.optionTextActive]}>
                                {num}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Preferred Location</Text>
                <View style={styles.optionRow}>
                    {locationOptions.map((loc) => (
                        <TouchableOpacity
                            key={loc}
                            style={[styles.optionBtn, formData.location === loc && styles.optionBtnActive]}
                            onPress={() => updateForm('location', loc)}
                        >
                            <Text style={[styles.optionText, formData.location === loc && styles.optionTextActive]}>
                                {loc}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Group Vibe (pick up to 3)</Text>
                <View style={styles.tagsGrid}>
                    {vibeOptions.map((vibe) => (
                        <TouchableOpacity
                            key={vibe}
                            style={[styles.tagBtn, formData.vibe.includes(vibe) && styles.tagBtnActive]}
                            onPress={() => toggleVibe(vibe)}
                        >
                            <Text style={[styles.tagText, formData.vibe.includes(vibe) && styles.tagTextActive]}>
                                {vibe}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => step > 1 ? setStep(step - 1) : navigation?.goBack?.()}
                >
                    <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Group</Text>
                <Text style={styles.stepIndicator}>Step {step}/2</Text>
            </SafeAreaView>

            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(step / 2) * 100}%` }]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextButton, loading && styles.nextButtonDisabled]}
                    onPress={handleNext}
                    disabled={loading}
                >
                    <Text style={styles.nextButtonText}>
                        {loading ? 'Creating...' : step < 2 ? 'Continue' : 'Create Group'}
                    </Text>
                    {!loading && <Ionicons name="arrow-forward" size={20} color={COLORS.card} />}
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: COLORS.background,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
    stepIndicator: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '500' },
    progressBar: { height: 4, backgroundColor: COLORS.border },
    progressFill: { height: '100%', backgroundColor: COLORS.primary },
    content: { flex: 1, paddingHorizontal: SPACING.lg },
    stepContent: { paddingTop: SPACING.lg },
    stepTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
    stepSubtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.xl },

    imageContainer: { alignSelf: 'center', marginBottom: SPACING.xl, width: '100%', maxWidth: 280 },
    groupImage: { width: '100%', height: 160, borderRadius: BORDER_RADIUS.xl },
    imagePlaceholder: {
        width: '100%', height: 160, borderRadius: BORDER_RADIUS.xl, backgroundColor: COLORS.backgroundSecondary,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
    },
    imageText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: SPACING.sm },
    imageBadge: {
        position: 'absolute', bottom: 8, right: 8, width: 36, height: 36, borderRadius: 18,
        backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    },

    inputGroup: { marginBottom: SPACING.lg },
    label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
    input: {
        backgroundColor: COLORS.backgroundSecondary, borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
        fontSize: FONT_SIZES.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
    },
    textArea: { height: 100, paddingTop: SPACING.md },
    inputWithPrefix: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md,
    },
    prefix: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textSecondary },
    suffix: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },

    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    optionBtn: {
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.backgroundSecondary, borderWidth: 1, borderColor: COLORS.border,
    },
    optionBtnActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
    optionText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
    optionTextActive: { color: COLORS.card },

    tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    tagBtn: {
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.backgroundSecondary, borderWidth: 1, borderColor: COLORS.border,
    },
    tagBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    tagText: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: COLORS.text },
    tagTextActive: { color: COLORS.card },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.background,
        borderTopWidth: 1, borderTopColor: COLORS.border, padding: SPACING.lg,
    },
    nextButton: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm,
        backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg,
    },
    nextButtonDisabled: { opacity: 0.5 },
    nextButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.card },
});

export default CreateGroupScreen;
