import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Image,
    Dimensions,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
// @ts-ignore - expo-glass-effect types
import { GlassView } from 'expo-glass-effect';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    withTiming,
    withSpring,
    withSequence,
    withDelay,
    FadeIn,
    FadeInDown,
    FadeInUp,
    ZoomIn,
    SlideInRight,
    BounceIn,
    interpolate,
    Extrapolate,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import lifestyleProfileService from '../services/lifestyleProfileService';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
    onComplete: () => void;
    onSkip?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, onSkip }) => {
    const colors = useColors();
    const { isDark } = useTheme();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [showAgePicker, setShowAgePicker] = useState(false);
    const [showMajorPicker, setShowMajorPicker] = useState(false);
    const [showGradYearPicker, setShowGradYearPicker] = useState(false);
    const [formData, setFormData] = useState({
        bio: '',
        age: '',
        gender: '',
        major: '',
        customMajor: '',
        graduationYear: '',
        cleanliness: 5,
        noiseLevel: 5,
        bedtime: 23,
        wakeup: 8,
        budgetMin: '500',
        budgetMax: '1200',
        vibeTags: [] as string[],
        lookingForRoommate: true,
        smoking: false,
        drinking: false,
        hasPets: false,
    });

    const totalSteps = 4;

    // Animation values
    const progressWidth = useSharedValue(0);
    const contentOpacity = useSharedValue(1);
    const contentScale = useSharedValue(1);
    const buttonScale = useSharedValue(1);
    const headerOpacity = useSharedValue(1);
    const scrollY = useSharedValue(0);

    // Scroll handler for collapsing header
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Animated header controls - fades as user scrolls
    const animatedHeaderStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, 80],
            [1, 0],
            Extrapolate.CLAMP
        );
        return {
            opacity,
        };
    });

    // Reset scroll position when step changes
    useEffect(() => {
        scrollY.value = 0;
    }, [step]);

    // Animate progress bar
    useEffect(() => {
        progressWidth.value = withSpring((step / (totalSteps - 1)) * 100, {
            damping: 20,
            stiffness: 90,
        });
    }, [step]);

    const vibeOptions = [
        // Personality & Social
        { id: 'Chill', icon: 'leaf-outline', label: 'Chill' },
        { id: 'Social', icon: 'people-outline', label: 'Social' },
        { id: 'Introvert', icon: 'person-outline', label: 'Introvert' },
        { id: 'Extrovert', icon: 'megaphone-outline', label: 'Extrovert' },
        { id: 'Quiet', icon: 'volume-mute-outline', label: 'Quiet' },
        { id: 'Adventurous', icon: 'compass-outline', label: 'Adventurous' },
        { id: 'Homebody', icon: 'home-outline', label: 'Homebody' },
        { id: 'Spontaneous', icon: 'flash-outline', label: 'Spontaneous' },

        // Schedule & Habits
        { id: 'Night Owl', icon: 'moon-outline', label: 'Night Owl' },
        { id: 'Early Bird', icon: 'sunny-outline', label: 'Early Bird' },
        { id: 'Studious', icon: 'library-outline', label: 'Studious' },
        { id: 'Workaholic', icon: 'briefcase-outline', label: 'Workaholic' },
        { id: 'Organized', icon: 'grid-outline', label: 'Organized' },
        { id: 'Laid-back', icon: 'bed-outline', label: 'Laid-back' },

        // Activities & Hobbies
        { id: 'Fitness', icon: 'barbell-outline', label: 'Fitness' },
        { id: 'Outdoorsy', icon: 'trail-sign-outline', label: 'Outdoorsy' },
        { id: 'Gamer', icon: 'game-controller-outline', label: 'Gamer' },
        { id: 'Foodie', icon: 'pizza-outline', label: 'Foodie' },
        { id: 'Creative', icon: 'brush-outline', label: 'Creative' },
        { id: 'Music Lover', icon: 'musical-notes-outline', label: 'Music Lover' },
        { id: 'Movie Buff', icon: 'film-outline', label: 'Movie Buff' },
        { id: 'Reader', icon: 'book-outline', label: 'Reader' },
        { id: 'Traveler', icon: 'airplane-outline', label: 'Traveler' },
        { id: 'Photographer', icon: 'camera-outline', label: 'Photographer' },
        { id: 'Yoga', icon: 'body-outline', label: 'Yoga' },
        { id: 'Sports Fan', icon: 'football-outline', label: 'Sports Fan' },
        { id: 'Hiker', icon: 'walk-outline', label: 'Hiker' },
        { id: 'Cyclist', icon: 'bicycle-outline', label: 'Cyclist' },

        // Lifestyle
        { id: 'Plant Parent', icon: 'flower-outline', label: 'Plant Parent' },
        { id: 'Pet Lover', icon: 'paw-outline', label: 'Pet Lover' },
        { id: 'Environmentalist', icon: 'earth-outline', label: 'Environmentalist' },
        { id: 'Minimalist', icon: 'remove-outline', label: 'Minimalist' },
        { id: 'Spiritual', icon: 'sparkles-outline', label: 'Spiritual' },
        { id: 'Wellness', icon: 'heart-outline', label: 'Wellness' },
        { id: 'Chef', icon: 'restaurant-outline', label: 'Chef' },
        { id: 'Coffee Lover', icon: 'cafe-outline', label: 'Coffee Lover' },
        { id: 'Wine Enthusiast', icon: 'wine-outline', label: 'Wine Enthusiast' },

        // Tech & Career
        { id: 'Tech Savvy', icon: 'desktop-outline', label: 'Tech Savvy' },
        { id: 'Entrepreneur', icon: 'rocket-outline', label: 'Entrepreneur' },
        { id: 'STEM', icon: 'flask-outline', label: 'STEM' },

        // Social & Fun
        { id: 'Party', icon: 'beer-outline', label: 'Party' },
        { id: 'Board Games', icon: 'dice-outline', label: 'Board Games' },
        { id: 'Podcast Fan', icon: 'headset-outline', label: 'Podcast Fan' },
        { id: 'Anime', icon: 'star-outline', label: 'Anime' },
        { id: 'K-Pop', icon: 'mic-outline', label: 'K-Pop' },
    ];

    const genderOptions = [
        { id: 'Male', label: 'Male' },
        { id: 'Female', label: 'Female' },
        { id: 'Non-binary', label: 'Non-binary' },
        { id: 'Transgender', label: 'Transgender' },
        { id: 'Genderqueer', label: 'Genderqueer' },
        { id: 'Agender', label: 'Agender' },
        { id: 'Two-Spirit', label: 'Two-Spirit' },
        { id: 'Prefer not to say', label: 'Prefer not to say' },
    ];

    const ageOptions = Array.from({ length: 63 }, (_, i) => ({ id: String(18 + i), label: String(18 + i) }));

    const majorOptions = [
        { id: 'Computer Science', label: 'Computer Science' },
        { id: 'Engineering', label: 'Engineering' },
        { id: 'Business', label: 'Business' },
        { id: 'Biology', label: 'Biology' },
        { id: 'Chemistry', label: 'Chemistry' },
        { id: 'Physics', label: 'Physics' },
        { id: 'Mathematics', label: 'Mathematics' },
        { id: 'Psychology', label: 'Psychology' },
        { id: 'Nursing', label: 'Nursing' },
        { id: 'Pre-Med', label: 'Pre-Med' },
        { id: 'Pre-Law', label: 'Pre-Law' },
        { id: 'Economics', label: 'Economics' },
        { id: 'Communications', label: 'Communications' },
        { id: 'Journalism', label: 'Journalism' },
        { id: 'Political Science', label: 'Political Science' },
        { id: 'English', label: 'English' },
        { id: 'History', label: 'History' },
        { id: 'Education', label: 'Education' },
        { id: 'Art', label: 'Art' },
        { id: 'Music', label: 'Music' },
        { id: 'Theater', label: 'Theater' },
        { id: 'Architecture', label: 'Architecture' },
        { id: 'Environmental Science', label: 'Environmental Science' },
        { id: 'Kinesiology', label: 'Kinesiology' },
        { id: 'Sociology', label: 'Sociology' },
        { id: 'Anthropology', label: 'Anthropology' },
        { id: 'Philosophy', label: 'Philosophy' },
        { id: 'Undeclared', label: 'Undeclared' },
        { id: 'Other', label: 'Other' },
    ];

    const currentYear = new Date().getFullYear();
    const gradYearOptions = Array.from({ length: 8 }, (_, i) => ({
        id: String(currentYear + i),
        label: String(currentYear + i)
    }));

    const updateForm = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleVibe = (vibe: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFormData(prev => ({
            ...prev,
            vibeTags: prev.vibeTags.includes(vibe)
                ? prev.vibeTags.filter((v: string) => v !== vibe)
                : [...prev.vibeTags, vibe].slice(0, 4)
        }));
    };

    const pickImage = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;

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

    const animateTransition = (callback: () => void) => {
        contentOpacity.value = withSequence(
            withTiming(0, { duration: 120 }),
            withTiming(1, { duration: 200 })
        );
        contentScale.value = withSequence(
            withTiming(0.95, { duration: 120 }),
            withTiming(1, { duration: 200, easing: Easing.out(Easing.back(1.2)) })
        );
        setTimeout(callback, 120);
    };

    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        buttonScale.value = withSequence(
            withSpring(0.92, { damping: 10 }),
            withSpring(1, { damping: 8 })
        );

        if (step < totalSteps - 1) {
            animateTransition(() => setStep(step + 1));
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (step > 0) {
            animateTransition(() => setStep(step - 1));
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
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete();
        } catch (error) {
            console.error('Onboarding error:', error);
            onComplete();
        } finally {
            setLoading(false);
        }
    };

    // Animated styles
    const progressAnimatedStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ scale: contentScale.value }],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: isDark ? colors.background : '#FAFAFA' },

        // Header with gradient accent
        headerGradient: {
            position: 'absolute', top: 0, left: 0, right: 0,
            height: step === 0 ? height * 0.12 : height * 0.18,
        },
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg,
        },
        backButton: {
            width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center',
            overflow: 'hidden',
        },
        glassButtonInner: {
            width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)',
        },
        skipButton: {
            borderRadius: BORDER_RADIUS.full,
            overflow: 'hidden',
        },
        skipButtonInner: {
            paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
            backgroundColor: 'rgba(255,255,255,0.2)',
        },
        skipText: { fontSize: FONT_SIZES.sm, color: '#FFFFFF', fontWeight: '600' },

        // Animated progress
        progressContainer: {
            paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md, paddingTop: SPACING.xs,
        },
        progressBg: {
            flexDirection: 'row', height: 8, backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: 4, overflow: 'hidden', gap: 4,
        },
        progressSegment: {
            flex: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4,
        },
        progressSegmentActive: { backgroundColor: '#FFFFFF' },
        stepIndicator: {
            flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm,
            marginTop: SPACING.sm,
        },
        stepDot: {
            width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)',
        },
        stepDotActive: { backgroundColor: '#FFFFFF', width: 24 },

        content: { flex: 1 },
        scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.06, paddingBottom: 120 },

        // Welcome step - Premium feel
        welcomeContainer: { flex: 1, alignItems: 'center', paddingTop: height * 0.06, paddingHorizontal: SPACING.xl },
        logoContainer: {
            width: 120, height: 120, borderRadius: 28, marginBottom: SPACING.xxl,
            justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
            ...SHADOWS.lg,
        },
        welcomeTitle: {
            fontSize: 32, fontWeight: '800', color: colors.text,
            marginBottom: SPACING.sm, textAlign: 'center', letterSpacing: -1,
        },
        welcomeSubtitle: {
            fontSize: FONT_SIZES.lg, color: colors.textSecondary,
            textAlign: 'center', lineHeight: 26, marginBottom: SPACING.xxl,
        },
        featureCard: {
            flexDirection: 'row', alignItems: 'center', width: '100%',
            backgroundColor: isDark ? colors.card : '#FFFFFF',
            padding: SPACING.lg, borderRadius: BORDER_RADIUS.xl, marginBottom: SPACING.md,
            ...SHADOWS.md,
        },
        featureIconBox: {
            width: 52, height: 52, borderRadius: 16, marginRight: SPACING.md,
            justifyContent: 'center', alignItems: 'center',
        },
        featureText: { flex: 1 },
        featureTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: colors.text },
        featureDesc: { fontSize: FONT_SIZES.sm, color: colors.textMuted, marginTop: 2 },
        featureArrow: { marginLeft: SPACING.sm },

        // Section titles
        sectionHeader: { marginBottom: SPACING.xl },
        questionTitle: {
            fontSize: 28, fontWeight: '800', color: colors.text,
            marginBottom: SPACING.xs, letterSpacing: -0.5,
        },
        questionSubtitle: {
            fontSize: FONT_SIZES.md, color: colors.textSecondary, lineHeight: 22,
        },

        // Photo picker - Enhanced
        photoSection: { alignItems: 'center', marginBottom: SPACING.xl },
        photoRing: {
            width: 140, height: 140, borderRadius: 70, padding: 4,
            justifyContent: 'center', alignItems: 'center',
        },
        photoInner: {
            width: '100%', height: '100%', borderRadius: 66,
            backgroundColor: isDark ? colors.card : '#FFFFFF',
            justifyContent: 'center', alignItems: 'center',
            overflow: 'hidden',
        },
        profilePhoto: { width: '100%', height: '100%' },
        photoPlaceholder: {
            justifyContent: 'center', alignItems: 'center',
        },
        photoText: { fontSize: FONT_SIZES.sm, color: colors.primary, marginTop: SPACING.xs, fontWeight: '600' },
        photoBadge: {
            position: 'absolute', bottom: 4, right: 4, width: 40, height: 40, borderRadius: 20,
            justifyContent: 'center', alignItems: 'center',
            borderWidth: 3, borderColor: isDark ? colors.background : '#FAFAFA',
            ...SHADOWS.md,
        },

        // Form inputs - Premium style
        inputGroup: { marginBottom: SPACING.lg },
        label: {
            fontSize: FONT_SIZES.sm, fontWeight: '700', color: colors.text,
            marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5,
        },
        inputWrapper: {
            backgroundColor: isDark ? colors.card : '#FFFFFF',
            borderRadius: BORDER_RADIUS.xl,
            ...SHADOWS.sm,
        },
        input: {
            paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md + 4,
            fontSize: FONT_SIZES.md, color: colors.text,
        },
        textArea: { height: 120, paddingTop: SPACING.md, textAlignVertical: 'top' },

        // Premium Glass dropdown styles
        glassContainer: {
            borderRadius: BORDER_RADIUS.xl,
            overflow: 'hidden',
            marginBottom: 0,
            // Outer glow shadow
            shadowColor: isDark ? '#FFFFFF' : colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.08 : 0.12,
            shadowRadius: 12,
            elevation: 4,
        },
        glassBlur: {
            borderRadius: BORDER_RADIUS.xl,
            overflow: 'hidden',
        },
        glassOverlay: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.75)',
            borderRadius: BORDER_RADIUS.xl,
            // Double border effect for depth
            borderWidth: 1.5,
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)',
        },
        glassInnerBorder: {
            position: 'absolute', top: 1, left: 1, right: 1, bottom: 1,
            borderRadius: BORDER_RADIUS.xl - 1,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(200,200,200,0.3)',
        },
        glassShine: {
            position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
            borderTopLeftRadius: BORDER_RADIUS.xl,
            borderTopRightRadius: BORDER_RADIUS.xl,
            // Gradient-like shine from top
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
        },
        glassShineBottom: {
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
            borderBottomLeftRadius: BORDER_RADIUS.xl,
            borderBottomRightRadius: BORDER_RADIUS.xl,
            // Subtle bottom highlight for depth
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(245,245,245,0.5)',
        },
        dropdownButton: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md + 6,
        },
        dropdownText: { fontSize: FONT_SIZES.md, color: colors.text, fontWeight: '600' },
        dropdownPlaceholder: { fontSize: FONT_SIZES.md, color: colors.textMuted, fontWeight: '500' },

        // Modal styles
        modalOverlay: {
            flex: 1, justifyContent: 'flex-end',
        },
        modalBlur: {
            ...StyleSheet.absoluteFillObject,
        },
        modalContent: {
            backgroundColor: isDark ? colors.card : '#FFFFFF',
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            paddingTop: SPACING.md,
            maxHeight: height * 0.6,
        },
        modalHandle: {
            width: 40, height: 4, backgroundColor: colors.border,
            borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.md,
        },
        modalHeader: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
            borderBottomWidth: 1, borderBottomColor: colors.border,
        },
        modalTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: colors.text },
        modalList: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
        modalOption: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingVertical: SPACING.md + 2, paddingHorizontal: SPACING.md,
            borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.xs,
        },
        modalOptionActive: {
            backgroundColor: `${colors.primary}10`,
        },
        modalOptionText: { fontSize: FONT_SIZES.md, color: colors.text, fontWeight: '500' },
        modalOptionTextActive: { color: colors.primary, fontWeight: '600' },

        // Slider section - Premium
        sliderCard: {
            backgroundColor: isDark ? colors.card : '#FFFFFF',
            padding: SPACING.lg, borderRadius: BORDER_RADIUS.xl,
            marginBottom: SPACING.lg,
            ...SHADOWS.sm,
        },
        sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
        sliderTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: colors.text },
        sliderBadge: {
            paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full,
        },
        sliderValue: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#FFFFFF' },
        sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm },
        sliderLabelText: { fontSize: FONT_SIZES.xs, color: colors.textMuted, fontWeight: '500' },

        // Vibe tags - Premium chips
        vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
        vibeChip: {
            flexDirection: 'row', alignItems: 'center', gap: 8,
            paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
            borderRadius: BORDER_RADIUS.full,
            backgroundColor: isDark ? colors.card : '#FFFFFF',
            ...SHADOWS.sm,
        },
        vibeChipActive: {
            backgroundColor: colors.primary,
        },
        vibeIcon: {},
        vibeLabel: { fontSize: FONT_SIZES.md, fontWeight: '600', color: colors.text },
        vibeLabelActive: { color: '#FFFFFF' },
        vibeCounter: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            marginTop: SPACING.xl, gap: SPACING.sm,
        },
        vibeCountText: { fontSize: FONT_SIZES.md, color: colors.textSecondary, fontWeight: '500' },
        vibeCountBold: { color: colors.primary, fontWeight: '700' },

        // Budget inputs
        budgetCard: {
            backgroundColor: isDark ? colors.card : '#FFFFFF',
            padding: SPACING.lg, borderRadius: BORDER_RADIUS.xl,
            ...SHADOWS.sm,
        },
        budgetRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
        budgetField: { flex: 1 },
        budgetLabel: { fontSize: FONT_SIZES.xs, color: colors.textMuted, marginBottom: SPACING.xs, fontWeight: '600' },
        budgetInputBox: {
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: colors.backgroundSecondary,
            borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md,
        },
        budgetPrefix: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: colors.primary },
        budgetInput: { flex: 1, paddingVertical: SPACING.md, fontSize: FONT_SIZES.lg, fontWeight: '600', color: colors.text },
        budgetDivider: {
            width: 20, height: 2, backgroundColor: colors.border, borderRadius: 1,
        },

        // Footer
        footer: {
            position: 'absolute', bottom: 0, left: 0, right: 0,
            paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.xxl,
            backgroundColor: isDark ? colors.background : '#FAFAFA',
        },
        nextButton: {
            flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm,
            paddingVertical: 18, borderRadius: BORDER_RADIUS.full,
            ...SHADOWS.lg,
        },
        nextButtonText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
    });

    const renderWelcome = () => (
        <View style={styles.welcomeContainer}>
            <Animated.View entering={ZoomIn.duration(500).springify()}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/collegio-logo.png')}
                        style={{ width: 120, height: 120, borderRadius: 28 }}
                        resizeMode="cover"
                    />
                </View>
            </Animated.View>

            <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={styles.welcomeTitle}>
                Welcome to Collegio
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(300).duration(400)} style={styles.welcomeSubtitle}>
                Let's create your profile to find your perfect roommate match and home
            </Animated.Text>

            <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ width: '100%' }}>
                <View style={styles.featureCard}>
                    <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.featureIconBox}>
                        <Ionicons name="home-outline" size={26} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>Find Your Home</Text>
                        <Text style={styles.featureDesc}>Browse verified student housing</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={styles.featureArrow} />
                </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(550).duration(400)} style={{ width: '100%' }}>
                <View style={styles.featureCard}>
                    <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.featureIconBox}>
                        <Ionicons name="people-outline" size={26} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>Match with Roommates</Text>
                        <Text style={styles.featureDesc}>Smart compatibility matching</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={styles.featureArrow} />
                </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(700).duration(400)} style={{ width: '100%' }}>
                <View style={styles.featureCard}>
                    <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.featureIconBox}>
                        <Ionicons name="chatbubbles-outline" size={26} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>Join Community</Text>
                        <Text style={styles.featureDesc}>Connect with students nearby</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={styles.featureArrow} />
                </View>
            </Animated.View>
        </View>
    );

    const renderStep1 = () => (
        <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.content}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
        >
            <View style={styles.scrollContent}>
                <Animated.View entering={FadeInDown.duration(300)} style={styles.sectionHeader}>
                    <Text style={styles.questionTitle}>About You</Text>
                    <Text style={styles.questionSubtitle}>Help potential roommates get to know you</Text>
                </Animated.View>

                <Animated.View entering={ZoomIn.delay(100).duration(400)} style={styles.photoSection}>
                    <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                        <LinearGradient
                            colors={[colors.primary, colors.primaryLight]}
                            style={styles.photoRing}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.photoInner}>
                                {profilePhoto ? (
                                    <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
                                ) : (
                                    <View style={styles.photoPlaceholder}>
                                        <Ionicons name="camera-outline" size={40} color={colors.primary} />
                                        <Text style={styles.photoText}>Add Photo</Text>
                                    </View>
                                )}
                            </View>
                        </LinearGradient>
                        <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.photoBadge}>
                            <Ionicons name="add" size={22} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200).duration(300)} style={styles.inputGroup}>
                    <Text style={styles.label}>Short Bio</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Tell us about yourself, your interests, and what you're looking for..."
                            value={formData.bio}
                            onChangeText={(v) => updateForm('bio', v)}
                            multiline
                            numberOfLines={4}
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300).duration(300)} style={styles.inputGroup}>
                    <Text style={styles.label}>Age</Text>
                    <View style={styles.glassContainer}>
                        <GlassView style={[styles.glassBlur, styles.glassOverlay, styles.dropdownButton]}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}
                                onPress={() => setShowAgePicker(true)}
                                activeOpacity={0.8}
                            >
                                <Text style={formData.age ? styles.dropdownText : styles.dropdownPlaceholder}>
                                    {formData.age || 'Select your age'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </GlassView>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(400).duration(300)} style={styles.inputGroup}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.glassContainer}>
                        <GlassView style={[styles.glassBlur, styles.glassOverlay, styles.dropdownButton]}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}
                                onPress={() => setShowGenderPicker(true)}
                                activeOpacity={0.8}
                            >
                                <Text style={formData.gender ? styles.dropdownText : styles.dropdownPlaceholder}>
                                    {formData.gender || 'Select your gender'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </GlassView>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(500).duration(300)} style={styles.inputGroup}>
                    <Text style={styles.label}>Major</Text>
                    <View style={styles.glassContainer}>
                        <GlassView style={[styles.glassBlur, styles.glassOverlay, styles.dropdownButton]}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}
                                onPress={() => setShowMajorPicker(true)}
                                activeOpacity={0.8}
                            >
                                <Text style={formData.major ? styles.dropdownText : styles.dropdownPlaceholder}>
                                    {formData.major === 'Other' && formData.customMajor
                                        ? formData.customMajor
                                        : formData.major || 'Select your major'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </GlassView>
                    </View>
                    {/* Custom major input - appears when "Other" is selected */}
                    {formData.major === 'Other' && (
                        <Animated.View entering={FadeInUp.duration(200)} style={{ marginTop: SPACING.sm }}>
                            <View style={{
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                borderRadius: BORDER_RADIUS.lg,
                                borderWidth: 1,
                                borderColor: colors.border,
                            }}>
                                <TextInput
                                    style={[styles.input, { marginBottom: 0 }]}
                                    placeholder="Type your major (e.g., Biomedical Engineering)..."
                                    placeholderTextColor={colors.textMuted}
                                    value={formData.customMajor}
                                    onChangeText={(v: string) => setFormData({ ...formData, customMajor: v })}
                                    autoFocus
                                />
                            </View>
                        </Animated.View>
                    )}
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(600).duration(300)} style={styles.inputGroup}>
                    <Text style={styles.label}>Graduation Year</Text>
                    <View style={styles.glassContainer}>
                        <GlassView style={[styles.glassBlur, styles.glassOverlay, styles.dropdownButton]}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}
                                onPress={() => setShowGradYearPicker(true)}
                                activeOpacity={0.8}
                            >
                                <Text style={formData.graduationYear ? styles.dropdownText : styles.dropdownPlaceholder}>
                                    {formData.graduationYear || 'Select graduation year'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </GlassView>
                    </View>
                </Animated.View>
            </View>
        </Animated.ScrollView>
    );

    // Lifestyle Step - Enhanced
    const renderStep2 = () => (
        <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.content}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
        >
            <View style={styles.scrollContent}>
                <Animated.View entering={FadeInDown.duration(300)} style={styles.sectionHeader}>
                    <Text style={styles.questionTitle}>Your Lifestyle</Text>
                    <Text style={styles.questionSubtitle}>Help us find compatible roommates</Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.sliderCard}>
                    <View style={styles.sliderHeader}>
                        <Text style={styles.sliderTitle}>Cleanliness</Text>
                        <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.sliderBadge}>
                            <Text style={styles.sliderValue}>{formData.cleanliness}/10</Text>
                        </LinearGradient>
                    </View>
                    <Slider
                        minimumValue={1}
                        maximumValue={10}
                        step={1}
                        value={formData.cleanliness}
                        onValueChange={(v) => updateForm('cleanliness', v)}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.border}
                        thumbTintColor={colors.primary}
                    />
                    <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabelText}>Relaxed</Text>
                        <Text style={styles.sliderLabelText}>Spotless</Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.sliderCard}>
                    <View style={styles.sliderHeader}>
                        <Text style={styles.sliderTitle}>Noise Level</Text>
                        <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.sliderBadge}>
                            <Text style={styles.sliderValue}>{formData.noiseLevel}/10</Text>
                        </LinearGradient>
                    </View>
                    <Slider
                        minimumValue={1}
                        maximumValue={10}
                        step={1}
                        value={formData.noiseLevel}
                        onValueChange={(v) => updateForm('noiseLevel', v)}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.border}
                        thumbTintColor={colors.primary}
                    />
                    <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabelText}>Quiet & Peaceful</Text>
                        <Text style={styles.sliderLabelText}>Social & Lively</Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.inputGroup}>
                    <Text style={styles.label}>Monthly Budget</Text>
                    <View style={styles.budgetCard}>
                        <View style={styles.budgetRow}>
                            <View style={styles.budgetField}>
                                <Text style={styles.budgetLabel}>MINIMUM</Text>
                                <View style={styles.budgetInputBox}>
                                    <Text style={styles.budgetPrefix}>$</Text>
                                    <TextInput
                                        style={styles.budgetInput}
                                        placeholder="500"
                                        value={formData.budgetMin}
                                        onChangeText={(v) => updateForm('budgetMin', v)}
                                        keyboardType="numeric"
                                        placeholderTextColor={colors.textMuted}
                                    />
                                </View>
                            </View>
                            <View style={styles.budgetDivider} />
                            <View style={styles.budgetField}>
                                <Text style={styles.budgetLabel}>MAXIMUM</Text>
                                <View style={styles.budgetInputBox}>
                                    <Text style={styles.budgetPrefix}>$</Text>
                                    <TextInput
                                        style={styles.budgetInput}
                                        placeholder="1500"
                                        value={formData.budgetMax}
                                        onChangeText={(v) => updateForm('budgetMax', v)}
                                        keyboardType="numeric"
                                        placeholderTextColor={colors.textMuted}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Animated.ScrollView>
    );

    // Vibes Step - Enhanced
    const renderStep3 = () => (
        <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.content}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
        >
            <View style={styles.scrollContent}>
                <Animated.View entering={FadeInDown.duration(300)} style={styles.sectionHeader}>
                    <Text style={styles.questionTitle}>Your Vibe</Text>
                    <Text style={styles.questionSubtitle}>Select up to 4 that best describe you</Text>
                </Animated.View>

                <View style={styles.vibeGrid}>
                    {vibeOptions.map((vibe, index) => {
                        const isActive = formData.vibeTags.includes(vibe.id);
                        return (
                            <Animated.View
                                key={vibe.id}
                                entering={BounceIn.delay(index * 60).duration(400)}
                            >
                                <TouchableOpacity
                                    style={[styles.vibeChip, isActive && styles.vibeChipActive]}
                                    onPress={() => toggleVibe(vibe.id)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={vibe.icon as any}
                                        size={20}
                                        color={isActive ? '#FFFFFF' : colors.textSecondary}
                                        style={styles.vibeIcon}
                                    />
                                    <Text style={[styles.vibeLabel, isActive && styles.vibeLabelActive]}>
                                        {vibe.label}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>

                <Animated.View entering={FadeIn.delay(800).duration(400)} style={styles.vibeCounter}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    <Text style={styles.vibeCountText}>
                        <Text style={styles.vibeCountBold}>{formData.vibeTags.length}</Text> of 4 selected
                    </Text>
                </Animated.View>
            </View>
        </Animated.ScrollView>
    );

    const getButtonText = () => {
        if (loading) return 'Finishing...';
        if (step === 0) return "Let's Get Started";
        if (step === totalSteps - 1) return 'Complete Profile';
        return 'Continue';
    };

    return (
        <View style={styles.container}>
            {/* Gradient Header - Fixed */}
            <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Header - Collapsing on scroll */}
            <SafeAreaView edges={['top']}>
                <View>
                    <View style={styles.header}>
                        {step > 0 ? (
                            <Animated.View entering={FadeIn.duration(200)}>
                                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                    <GlassView style={styles.glassButtonInner}>
                                        <Ionicons name="chevron-back" size={22} color="#db4a2b" />
                                    </GlassView>
                                </TouchableOpacity>
                            </Animated.View>
                        ) : (
                            <View style={{ width: 44 }} />
                        )}

                        <View style={{ flex: 1 }} />

                        {onSkip && (
                            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                                <GlassView style={styles.skipButtonInner}>
                                    <Text style={styles.skipText}>Skip</Text>
                                </GlassView>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Progress Dots */}
                    {step > 0 && (
                        <View style={styles.progressContainer}>
                            <View style={styles.stepIndicator}>
                                {[1, 2, 3].map((s) => (
                                    <Animated.View
                                        key={s}
                                        style={[
                                            styles.stepDot,
                                            step >= s && styles.stepDotActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </SafeAreaView>

            {/* Content */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
                    {step === 0 && renderWelcome()}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </Animated.View>
            </KeyboardAvoidingView>

            {/* Footer */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <Animated.View style={buttonAnimatedStyle}>
                    <TouchableOpacity onPress={handleNext} disabled={loading} activeOpacity={0.9}>
                        <LinearGradient
                            colors={[colors.primary, colors.primaryLight]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.nextButton, loading && { opacity: 0.6 }]}
                        >
                            <Text style={styles.nextButtonText}>{getButtonText()}</Text>
                            {!loading && <Ionicons name="arrow-forward" size={20} color="#fff" />}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>

            {/* Gender Picker Modal */}
            <Modal
                visible={showGenderPicker}
                animationType="slide"
                transparent
                onRequestClose={() => setShowGenderPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowGenderPicker(false)}
                >
                    <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={styles.modalBlur} />
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Gender</Text>
                                <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                                    <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalList}>
                                {genderOptions.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={[styles.modalOption, formData.gender === opt.id && styles.modalOptionActive]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            updateForm('gender', opt.id);
                                            setShowGenderPicker(false);
                                        }}
                                    >
                                        <Text style={[styles.modalOptionText, formData.gender === opt.id && styles.modalOptionTextActive]}>
                                            {opt.label}
                                        </Text>
                                        {formData.gender === opt.id && (
                                            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Age Picker Modal */}
            <Modal
                visible={showAgePicker}
                animationType="slide"
                transparent
                onRequestClose={() => setShowAgePicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowAgePicker(false)}
                >
                    <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={styles.modalBlur} />
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Age</Text>
                                <TouchableOpacity onPress={() => setShowAgePicker(false)}>
                                    <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalList}>
                                {ageOptions.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={[styles.modalOption, formData.age === opt.id && styles.modalOptionActive]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            updateForm('age', opt.id);
                                            setShowAgePicker(false);
                                        }}
                                    >
                                        <Text style={[styles.modalOptionText, formData.age === opt.id && styles.modalOptionTextActive]}>
                                            {opt.label}
                                        </Text>
                                        {formData.age === opt.id && (
                                            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Major Picker Modal */}
            <Modal
                visible={showMajorPicker}
                animationType="slide"
                transparent
                onRequestClose={() => setShowMajorPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowMajorPicker(false)}
                >
                    <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={styles.modalBlur} />
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Major</Text>
                                <TouchableOpacity onPress={() => setShowMajorPicker(false)}>
                                    <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalList}>
                                {majorOptions.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={[styles.modalOption, formData.major === opt.id && styles.modalOptionActive]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            updateForm('major', opt.id);
                                            setShowMajorPicker(false);
                                        }}
                                    >
                                        <Text style={[styles.modalOptionText, formData.major === opt.id && styles.modalOptionTextActive]}>
                                            {opt.label}
                                        </Text>
                                        {formData.major === opt.id && (
                                            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Graduation Year Picker Modal */}
            <Modal
                visible={showGradYearPicker}
                animationType="slide"
                transparent
                onRequestClose={() => setShowGradYearPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowGradYearPicker(false)}
                >
                    <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={styles.modalBlur} />
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Graduation Year</Text>
                                <TouchableOpacity onPress={() => setShowGradYearPicker(false)}>
                                    <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalList}>
                                {gradYearOptions.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={[styles.modalOption, formData.graduationYear === opt.id && styles.modalOptionActive]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            updateForm('graduationYear', opt.id);
                                            setShowGradYearPicker(false);
                                        }}
                                    >
                                        <Text style={[styles.modalOptionText, formData.graduationYear === opt.id && styles.modalOptionTextActive]}>
                                            {opt.label}
                                        </Text>
                                        {formData.graduationYear === opt.id && (
                                            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View >
    );
};

export default OnboardingScreen;
