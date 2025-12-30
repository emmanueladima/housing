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
import Slider from '@react-native-community/slider';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import lifestyleProfileService from '../services/lifestyleProfileService';

interface CreateProfileScreenProps {
    navigation?: any;
}

const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        bio: '',
        age: '',
        gender: '',
        cleanliness: 5,
        noiseLevel: 5,
        bedtime: 23,
        wakeup: 8,
        budgetMin: '500',
        budgetMax: '1200',
        vibeTags: [] as string[],
        lookingForRoommate: true,
        // House rules
        smoking: false,
        drinking: false,
        hasPets: false,
    });

    // Vibes exactly matching website (expanded list)
    const vibeOptions = [
        'Chill', 'Social', 'Studious', 'Party', 'Quiet', 'Artsy',
        'Outdoorsy', 'Night Owl', 'Early Bird', 'Fitness', 'Gamer', 'Foodie',
        'Music Lover', 'Movie Buff', 'Pet Lover', 'Traveler', 'Homebody',
        'Clean Freak', 'Minimalist', 'Eco-Friendly', 'Spiritual', 'Adventurous'
    ];

    // Bedtime/wakeup hours
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

    const updateForm = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleVibe = (vibe: string) => {
        setFormData(prev => ({
            ...prev,
            vibeTags: prev.vibeTags.includes(vibe)
                ? prev.vibeTags.filter((v: string) => v !== vibe)
                : [...prev.vibeTags, vibe].slice(0, 4)
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
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setProfilePhoto(result.assets[0].uri);
        }
    };

    const validateStep = () => {
        if (step === 1 && (!formData.bio || !formData.gender)) {
            Alert.alert('Missing Info', 'Please add a bio and select your gender');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (step < 3) setStep(step + 1);
            else handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await lifestyleProfileService.updateMyProfile({
                ...formData,
                age: parseInt(formData.age) || undefined,
                budgetMin: parseInt(formData.budgetMin),
                budgetMax: parseInt(formData.budgetMax),
            });
            Alert.alert('Success', 'Profile created successfully!', [
                { text: 'OK', onPress: () => navigation?.goBack?.() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>About You</Text>
            <Text style={styles.stepSubtitle}>Let potential roommates know who you are</Text>

            {/* Profile Photo */}
            <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
                {profilePhoto ? (
                    <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Ionicons name="camera" size={32} color={COLORS.textMuted} />
                        <Text style={styles.photoText}>Add Photo</Text>
                    </View>
                )}
                <View style={styles.photoBadge}>
                    <Ionicons name="pencil" size={14} color={COLORS.card} />
                </View>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tell us about yourself, your hobbies, and what you're looking for..."
                    value={formData.bio}
                    onChangeText={(v) => updateForm('bio', v)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor={COLORS.textMuted}
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="21"
                        value={formData.age}
                        onChangeText={(v) => updateForm('age', v)}
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 2, marginLeft: SPACING.md }]}>
                    <Text style={styles.label}>Gender *</Text>
                    <View style={styles.optionRow}>
                        {genderOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.optionBtn, formData.gender === opt && styles.optionBtnActive]}
                                onPress={() => updateForm('gender', opt)}
                            >
                                <Text style={[styles.optionText, formData.gender === opt && styles.optionTextActive]}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Lifestyle</Text>
            <Text style={styles.stepSubtitle}>Help us find compatible roommates</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Cleanliness Level</Text>
                <View style={styles.sliderRow}>
                    <Text style={styles.sliderLabel}>Relaxed</Text>
                    <View style={styles.sliderContainer}>
                        <Slider
                            style={{ flex: 1 }}
                            minimumValue={1}
                            maximumValue={10}
                            step={1}
                            value={formData.cleanliness}
                            onValueChange={(v) => updateForm('cleanliness', v)}
                            minimumTrackTintColor={COLORS.primary}
                            maximumTrackTintColor={COLORS.border}
                            thumbTintColor={COLORS.primary}
                        />
                    </View>
                    <Text style={styles.sliderLabel}>Spotless</Text>
                </View>
                <Text style={styles.sliderValue}>{formData.cleanliness}/10</Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Noise Tolerance</Text>
                <View style={styles.sliderRow}>
                    <Text style={styles.sliderLabel}>Quiet</Text>
                    <View style={styles.sliderContainer}>
                        <Slider
                            style={{ flex: 1 }}
                            minimumValue={1}
                            maximumValue={10}
                            step={1}
                            value={formData.noiseLevel}
                            onValueChange={(v) => updateForm('noiseLevel', v)}
                            minimumTrackTintColor={COLORS.primary}
                            maximumTrackTintColor={COLORS.border}
                            thumbTintColor={COLORS.primary}
                        />
                    </View>
                    <Text style={styles.sliderLabel}>Lively</Text>
                </View>
                <Text style={styles.sliderValue}>{formData.noiseLevel}/10</Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Budget Range ($/mo)</Text>
                <View style={styles.row}>
                    <View style={[styles.inputWithPrefix, { flex: 1 }]}>
                        <Text style={styles.prefix}>$</Text>
                        <TextInput
                            style={[styles.input, { flex: 1, borderWidth: 0 }]}
                            placeholder="500"
                            value={formData.budgetMin}
                            onChangeText={(v) => updateForm('budgetMin', v)}
                            keyboardType="numeric"
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>
                    <Text style={styles.budgetDash}>—</Text>
                    <View style={[styles.inputWithPrefix, { flex: 1 }]}>
                        <Text style={styles.prefix}>$</Text>
                        <TextInput
                            style={[styles.input, { flex: 1, borderWidth: 0 }]}
                            placeholder="1200"
                            value={formData.budgetMax}
                            onChangeText={(v) => updateForm('budgetMax', v)}
                            keyboardType="numeric"
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>
                </View>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Vibe & Rules</Text>
            <Text style={styles.stepSubtitle}>Pick what represents you best</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Vibe (pick up to 4)</Text>
                <View style={styles.tagsGrid}>
                    {vibeOptions.map((vibe) => (
                        <TouchableOpacity
                            key={vibe}
                            style={[styles.tagBtn, formData.vibeTags.includes(vibe) && styles.tagBtnActive]}
                            onPress={() => toggleVibe(vibe)}
                        >
                            <Text style={[styles.tagText, formData.vibeTags.includes(vibe) && styles.tagTextActive]}>
                                {vibe}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* House Rules */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>House Rules</Text>

                <TouchableOpacity
                    style={[styles.ruleRow, formData.smoking && styles.ruleRowActive]}
                    onPress={() => updateForm('smoking', !formData.smoking)}
                >
                    <Ionicons name="flame-outline" size={20} color={formData.smoking ? COLORS.primary : COLORS.textMuted} />
                    <Text style={styles.ruleText}>Smoking Allowed</Text>
                    <View style={[styles.checkbox, formData.smoking && styles.checkboxActive]}>
                        {formData.smoking && <Ionicons name="checkmark" size={14} color={COLORS.card} />}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.ruleRow, formData.drinking && styles.ruleRowActive]}
                    onPress={() => updateForm('drinking', !formData.drinking)}
                >
                    <Ionicons name="wine-outline" size={20} color={formData.drinking ? COLORS.primary : COLORS.textMuted} />
                    <Text style={styles.ruleText}>Drinking Allowed</Text>
                    <View style={[styles.checkbox, formData.drinking && styles.checkboxActive]}>
                        {formData.drinking && <Ionicons name="checkmark" size={14} color={COLORS.card} />}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.ruleRow, formData.hasPets && styles.ruleRowActive]}
                    onPress={() => updateForm('hasPets', !formData.hasPets)}
                >
                    <Ionicons name="paw-outline" size={20} color={formData.hasPets ? COLORS.primary : COLORS.textMuted} />
                    <Text style={styles.ruleText}>I Have Pets</Text>
                    <View style={[styles.checkbox, formData.hasPets && styles.checkboxActive]}>
                        {formData.hasPets && <Ionicons name="checkmark" size={14} color={COLORS.card} />}
                    </View>
                </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.toggleRow]}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Show on Roommates Page</Text>
                    <Text style={styles.toggleDescription}>Let others find you as a potential roommate</Text>
                </View>
                <TouchableOpacity
                    style={[styles.toggle, formData.lookingForRoommate && styles.toggleActive]}
                    onPress={() => updateForm('lookingForRoommate', !formData.lookingForRoommate)}
                >
                    <View style={[styles.toggleKnob, formData.lookingForRoommate && styles.toggleKnobActive]} />
                </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Create Profile</Text>
                <Text style={styles.stepIndicator}>Step {step}/3</Text>
            </SafeAreaView>

            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
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
                        {loading ? 'Creating...' : step < 3 ? 'Continue' : 'Create Profile'}
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

    photoContainer: { alignSelf: 'center', marginBottom: SPACING.xl },
    profilePhoto: { width: 120, height: 120, borderRadius: 60 },
    photoPlaceholder: {
        width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.backgroundSecondary,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
    },
    photoText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: SPACING.xs },
    photoBadge: {
        position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16,
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
    row: { flexDirection: 'row' },
    inputWithPrefix: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, paddingLeft: SPACING.md,
    },
    prefix: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textSecondary },
    budgetDash: { fontSize: FONT_SIZES.lg, color: COLORS.textMuted, marginHorizontal: SPACING.sm, alignSelf: 'center' },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    optionBtn: {
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.backgroundSecondary, borderWidth: 1, borderColor: COLORS.border,
    },
    optionBtnActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
    optionText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.text },
    optionTextActive: { color: COLORS.card },

    sliderRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm },
    sliderLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, width: 50 },
    sliderContainer: { flex: 1, marginHorizontal: SPACING.sm },
    sliderValue: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '700', textAlign: 'center', marginTop: SPACING.xs },

    tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    tagBtn: {
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.backgroundSecondary, borderWidth: 1, borderColor: COLORS.border,
    },
    tagBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    tagText: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: COLORS.text },
    tagTextActive: { color: COLORS.card },

    // House rules styles
    ruleRow: {
        flexDirection: 'row', alignItems: 'center', padding: SPACING.md,
        backgroundColor: COLORS.backgroundSecondary, borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm, gap: SPACING.md,
    },
    ruleRowActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}10` },
    ruleText: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '500', color: COLORS.text },
    checkbox: {
        width: 24, height: 24, borderRadius: BORDER_RADIUS.sm, borderWidth: 2,
        borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center',
    },
    checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

    toggleRow: { flexDirection: 'row', alignItems: 'center' },
    toggleDescription: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
    toggle: {
        width: 50, height: 28, borderRadius: 14, backgroundColor: COLORS.border,
        padding: 2, justifyContent: 'center',
    },
    toggleActive: { backgroundColor: COLORS.primary },
    toggleKnob: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.card, ...SHADOWS.sm,
    },
    toggleKnobActive: { alignSelf: 'flex-end' },

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

export default CreateProfileScreen;
