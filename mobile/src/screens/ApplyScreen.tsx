import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import applicationService from '../services/applicationService';

interface ApplyScreenProps {
    navigation?: any;
    route?: any;
}

const LEASE_TERMS = [
    { value: 'month-to-month', label: 'Month to Month' },
    { value: '6-months', label: '6 Months' },
    { value: '1-year', label: '1 Year' },
    { value: 'flexible', label: 'Flexible' },
];

const ApplyScreen: React.FC<ApplyScreenProps> = ({ navigation, route }) => {
    const colors = useColors();
    const { isDark } = useTheme();
    const { listingId, listingTitle, listingPrice } = route?.params || {};

    const [moveInDate, setMoveInDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [leaseTerm, setLeaseTerm] = useState('1-year');
    const [coverLetter, setCoverLetter] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setMoveInDate(selectedDate);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleSubmit = async () => {
        if (!listingId) {
            Alert.alert('Error', 'Missing listing information');
            return;
        }

        setIsSubmitting(true);
        try {
            await applicationService.submitApplication({
                listingId,
                moveInDate: moveInDate.toISOString(),
                leaseTerm,
                coverLetter: coverLetter.trim() || undefined,
            });
            Alert.alert(
                'Application Submitted! 🎉',
                'Your application has been sent to the landlord. You can track its status in the Applications section.',
                [
                    {
                        text: 'View Applications',
                        onPress: () => navigation?.navigate('Applications'),
                    },
                    {
                        text: 'Done',
                        onPress: () => navigation?.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error submitting application:', error);
            const message = error.response?.data?.error || error.response?.data?.message || 'Failed to submit application. Please try again.';
            Alert.alert('Error', message);
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
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: FONT_SIZES.lg,
            fontWeight: '700',
            color: colors.text,
        },
        placeholder: {
            width: 40,
        },
        content: {
            flex: 1,
            paddingHorizontal: SPACING.lg,
        },
        listingInfo: {
            backgroundColor: colors.card,
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.lg,
            marginTop: SPACING.lg,
            borderWidth: 1,
            borderColor: colors.border,
        },
        listingTitle: {
            fontSize: FONT_SIZES.lg,
            fontWeight: '700',
            color: colors.text,
            marginBottom: SPACING.xs,
        },
        listingPrice: {
            fontSize: FONT_SIZES.md,
            color: colors.primary,
            fontWeight: '600',
        },
        section: {
            marginTop: SPACING.xl,
        },
        sectionTitle: {
            fontSize: FONT_SIZES.md,
            fontWeight: '600',
            color: colors.text,
            marginBottom: SPACING.md,
        },
        dateButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.backgroundSecondary,
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: colors.border,
        },
        dateText: {
            fontSize: FONT_SIZES.md,
            color: colors.text,
        },
        leaseTermsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: SPACING.sm,
        },
        leaseTermButton: {
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
            borderRadius: BORDER_RADIUS.full,
            borderWidth: 2,
            borderColor: colors.border,
            backgroundColor: colors.background,
        },
        leaseTermButtonActive: {
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}10`,
        },
        leaseTermText: {
            fontSize: FONT_SIZES.sm,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        leaseTermTextActive: {
            color: colors.primary,
        },
        textArea: {
            backgroundColor: colors.backgroundSecondary,
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: colors.border,
            fontSize: FONT_SIZES.md,
            color: colors.text,
            minHeight: 120,
            textAlignVertical: 'top',
        },
        charCount: {
            fontSize: FONT_SIZES.xs,
            color: colors.textMuted,
            textAlign: 'right',
            marginTop: SPACING.xs,
        },
        footer: {
            padding: SPACING.lg,
            paddingBottom: SPACING.xl,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
        },
        submitButton: {
            backgroundColor: colors.primary,
            borderRadius: BORDER_RADIUS.lg,
            paddingVertical: SPACING.lg,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: SPACING.sm,
        },
        submitButtonDisabled: {
            opacity: 0.6,
        },
        submitButtonText: {
            fontSize: FONT_SIZES.md,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        helperText: {
            fontSize: FONT_SIZES.sm,
            color: colors.textMuted,
            marginTop: SPACING.sm,
            lineHeight: 18,
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation?.goBack()}
                    >
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Apply</Text>
                    <View style={styles.placeholder} />
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Listing Info */}
                <View style={styles.listingInfo}>
                    <Text style={styles.listingTitle}>{listingTitle || 'Listing'}</Text>
                    <Text style={styles.listingPrice}>
                        ${listingPrice?.toLocaleString() || '0'}/mo
                    </Text>
                </View>

                {/* Move-in Date */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferred Move-in Date</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateText}>{formatDate(moveInDate)}</Text>
                        <Ionicons name="calendar" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={moveInDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                    />
                )}

                {/* Lease Term */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferred Lease Term</Text>
                    <View style={styles.leaseTermsGrid}>
                        {LEASE_TERMS.map((term) => (
                            <TouchableOpacity
                                key={term.value}
                                style={[
                                    styles.leaseTermButton,
                                    leaseTerm === term.value && styles.leaseTermButtonActive,
                                ]}
                                onPress={() => setLeaseTerm(term.value)}
                            >
                                <Text
                                    style={[
                                        styles.leaseTermText,
                                        leaseTerm === term.value && styles.leaseTermTextActive,
                                    ]}
                                >
                                    {term.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Cover Letter */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Message to Landlord (Optional)</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Introduce yourself and explain why you'd be a great tenant..."
                        placeholderTextColor={colors.textMuted}
                        value={coverLetter}
                        onChangeText={setCoverLetter}
                        multiline
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{coverLetter.length}/500</Text>
                    <Text style={styles.helperText}>
                        A personal message can help your application stand out!
                    </Text>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Submit Button */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        isSubmitting && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                            <Text style={styles.submitButtonText}>Submit Application</Text>
                        </>
                    )}
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

export default ApplyScreen;
