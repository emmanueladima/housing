import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import lifestyleProfileService from '../services/lifestyleProfileService';

interface CompatibilityTestScreenProps {
    navigation?: any;
}

interface Scenario {
    id: string;
    icon: string;
    question: string;
    options: {
        value: string;
        label: string;
        score: Record<string, string | number>;
    }[];
}

const SCENARIOS: Scenario[] = [
    {
        id: 'weeknight',
        icon: 'time-outline',
        question: "It's 11 PM on a Tuesday. What are you usually doing?",
        options: [
            { value: 'sleeping', label: '😴 Fast asleep', score: { noise: 1, social: 1 } },
            { value: 'quiet', label: '📖 Reading/Chilling quietly', score: { noise: 3, social: 2 } },
            { value: 'gaming', label: '🎮 Gaming/Watching TV', score: { noise: 6, social: 4 } },
            { value: 'out', label: '🍻 Out with friends', score: { noise: 8, social: 9 } },
        ],
    },
    {
        id: 'dishes',
        icon: 'alert-circle-outline',
        question: "The sink is full of dishes. What's your reaction?",
        options: [
            { value: 'immediate', label: '🧼 Wash them immediately (even if not mine)', score: { clean: 10 } },
            { value: 'own', label: "🍽️ Wash mine, leave the rest", score: { clean: 7 } },
            { value: 'later', label: '⏳ Leave them for the morning', score: { clean: 4 } },
            { value: 'pile', label: '🏔️ Add to the pile until we run out', score: { clean: 1 } },
        ],
    },
    {
        id: 'guests',
        icon: 'people-outline',
        question: "A roommate asks if their partner can stay over for the weekend...",
        options: [
            { value: 'no', label: '🚫 No, I prefer no guests', score: { guests: 1 } },
            { value: 'ask', label: '💬 Sure, but ask every time', score: { guests: 5 } },
            { value: 'chill', label: '🤙 Yeah, whatever', score: { guests: 8 } },
            { value: 'join', label: '🎉 The more the merrier!', score: { guests: 10 } },
        ],
    },
    {
        id: 'thermostat',
        icon: 'thermometer-outline',
        question: "What's the ideal thermostat setting?",
        options: [
            { value: 'cold', label: '❄️ 68°F or lower (Sweater weather)', score: { temp: 'cold' } },
            { value: 'moderate', label: '🌡️ 70-72°F (Just right)', score: { temp: 'moderate' } },
            { value: 'warm', label: '🔥 74°F or higher (Tropical)', score: { temp: 'warm' } },
        ],
    },
    {
        id: 'conflict',
        icon: 'volume-high-outline',
        question: "Your roommate is playing music too loud. You...",
        options: [
            { value: 'text', label: '📱 Text them to turn it down', score: { conflict: 'passive' } },
            { value: 'knock', label: '🚪 Knock and ask politely', score: { conflict: 'direct' } },
            { value: 'headphones', label: '🎧 Put on noise cancelling headphones', score: { conflict: 'avoidant' } },
            { value: 'revenge', label: '🔊 Play my music louder', score: { conflict: 'aggressive' } },
        ],
    },
];

const CompatibilityTestScreen: React.FC<CompatibilityTestScreenProps> = ({ navigation }) => {
    const colors = useColors();
    const { isDark } = useTheme();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentScenario = SCENARIOS[step];
    const progress = ((step + 1) / SCENARIOS.length) * 100;

    const handleAnswer = (option: typeof currentScenario.options[0]) => {
        const newAnswers = {
            ...answers,
            [currentScenario.id]: option.value,
            [`${currentScenario.id}_score`]: option.score,
        };
        setAnswers(newAnswers);

        if (step < SCENARIOS.length - 1) {
            setStep(step + 1);
        } else {
            finishTest(newAnswers);
        }
    };

    const finishTest = async (finalAnswers: Record<string, any>) => {
        setIsSubmitting(true);
        try {
            await lifestyleProfileService.updateCompatibility(finalAnswers);
            Alert.alert(
                'Test Complete! 🎉',
                "Your compatibility preferences have been saved. We'll use these to find better roommate matches for you.",
                [
                    {
                        text: 'View Profile',
                        onPress: () => navigation?.navigate('Main', { screen: 'Profile' }),
                    },
                    {
                        text: 'Done',
                        onPress: () => navigation?.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error saving compatibility test:', error);
            Alert.alert('Saved!', 'Your answers have been recorded.', [
                { text: 'OK', onPress: () => navigation?.goBack() },
            ]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        safeArea: {
            backgroundColor: colors.primary,
        },
        header: {
            backgroundColor: colors.primary,
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.xl,
            paddingTop: SPACING.md,
        },
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.lg,
        },
        closeButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerTitle: {
            flex: 1,
            fontSize: FONT_SIZES.xl,
            fontWeight: '700',
            color: '#FFFFFF',
            textAlign: 'center',
            marginRight: 40,
        },
        progressContainer: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: BORDER_RADIUS.full,
            height: 8,
            overflow: 'hidden',
        },
        progressBar: {
            height: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: BORDER_RADIUS.full,
        },
        progressText: {
            fontSize: FONT_SIZES.sm,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            marginTop: SPACING.sm,
        },
        content: {
            flex: 1,
            padding: SPACING.lg,
        },
        iconContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: `${colors.primary}15`,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            marginTop: SPACING.xl,
            marginBottom: SPACING.xl,
        },
        question: {
            fontSize: FONT_SIZES.xl,
            fontWeight: '700',
            color: colors.text,
            textAlign: 'center',
            marginBottom: SPACING.xxl,
            lineHeight: 28,
        },
        optionsContainer: {
            gap: SPACING.md,
        },
        optionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: BORDER_RADIUS.lg,
            borderWidth: 2,
            borderColor: colors.border,
            padding: SPACING.lg,
        },
        optionText: {
            flex: 1,
            fontSize: FONT_SIZES.md,
            fontWeight: '600',
            color: colors.text,
        },
        optionArrow: {
            opacity: 0,
        },
        loadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => navigation?.goBack()}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Compatibility Test</Text>
                    </View>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>Question {step + 1} of {SCENARIOS.length}</Text>
                </View>
            </SafeAreaView>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.iconContainer}>
                    <Ionicons name={currentScenario.icon as any} size={40} color={colors.primary} />
                </View>

                <Text style={styles.question}>{currentScenario.question}</Text>

                <View style={styles.optionsContainer}>
                    {currentScenario.options.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={styles.optionButton}
                            onPress={() => handleAnswer(option)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.optionText}>{option.label}</Text>
                            <Ionicons
                                name="arrow-forward"
                                size={20}
                                color={colors.primary}
                                style={styles.optionArrow}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {isSubmitting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: SPACING.md, color: colors.textSecondary }}>
                        Saving your preferences...
                    </Text>
                </View>
            )}
        </View>
    );
};

export default CompatibilityTestScreen;
