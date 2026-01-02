import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface SignupScreenProps {
    navigation?: any;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
    const colors = useColors();
    const { isDark } = useTheme();
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const result = await signup(name.trim(), email.trim().toLowerCase(), password);
            if (result.needsVerification) {
                Alert.alert(
                    'Verify Your Email',
                    'We\'ve sent a verification link to your email. Please verify your email before logging in.',
                    [{ text: 'OK', onPress: () => navigation?.navigate?.('Login') }]
                );
            }
        } catch (error: any) {
            Alert.alert('Signup Failed', error.message || 'Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        keyboardView: {
            flex: 1,
        },
        scrollContent: {
            flexGrow: 1,
            padding: SPACING.lg,
            justifyContent: 'center',
        },
        header: {
            alignItems: 'center',
            marginBottom: SPACING.xl,
        },
        logoContainer: {
            width: 80,
            height: 80,
            borderRadius: 20,
            backgroundColor: `${colors.primary}15`,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: SPACING.lg,
        },
        title: {
            fontSize: FONT_SIZES.xxxl,
            fontWeight: '700',
            color: colors.text,
            marginBottom: SPACING.xs,
        },
        subtitle: {
            fontSize: FONT_SIZES.md,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        form: {
            marginBottom: SPACING.lg,
        },
        inputGroup: {
            marginBottom: SPACING.md,
        },
        label: {
            fontSize: FONT_SIZES.sm,
            fontWeight: '600',
            color: colors.text,
            marginBottom: SPACING.sm,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.backgroundSecondary,
            borderRadius: BORDER_RADIUS.lg,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        inputError: {
            borderColor: '#EF4444',
        },
        input: {
            flex: 1,
            marginLeft: SPACING.sm,
            fontSize: FONT_SIZES.md,
            color: colors.text,
        },
        errorText: {
            fontSize: FONT_SIZES.sm,
            color: '#EF4444',
            marginTop: SPACING.xs,
        },
        signupButton: {
            backgroundColor: colors.primary,
            paddingVertical: SPACING.lg,
            borderRadius: BORDER_RADIUS.lg,
            alignItems: 'center',
            marginTop: SPACING.sm,
        },
        signupButtonDisabled: {
            opacity: 0.7,
        },
        signupButtonText: {
            fontSize: FONT_SIZES.md,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        termsText: {
            fontSize: FONT_SIZES.sm,
            color: colors.textMuted,
            textAlign: 'center',
            marginBottom: SPACING.lg,
        },
        termsLink: {
            color: colors.primary,
            fontWeight: '500',
        },
        loginLink: {
            flexDirection: 'row',
            justifyContent: 'center',
        },
        loginText: {
            fontSize: FONT_SIZES.md,
            color: colors.textSecondary,
        },
        loginLinkText: {
            fontSize: FONT_SIZES.md,
            fontWeight: '600',
            color: colors.primary,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="home" size={40} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join Collegio to find your perfect home</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                                <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your full name"
                                    placeholderTextColor={colors.textMuted}
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        if (errors.name) setErrors({ ...errors, name: undefined });
                                    }}
                                    autoCapitalize="words"
                                />
                            </View>
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your .edu email"
                                    placeholderTextColor={colors.textMuted}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errors.email) setErrors({ ...errors, email: undefined });
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Create a password"
                                    placeholderTextColor={colors.textMuted}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (errors.password) setErrors({ ...errors, password: undefined });
                                    }}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm your password"
                                    placeholderTextColor={colors.textMuted}
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                                    }}
                                    secureTextEntry={!showPassword}
                                />
                            </View>
                            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                        </View>

                        {/* Signup Button */}
                        <TouchableOpacity
                            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.signupButtonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Terms */}
                    <Text style={styles.termsText}>
                        By signing up, you agree to our{' '}
                        <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>

                    {/* Login Link */}
                    <View style={styles.loginLink}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation?.navigate?.('Login')}>
                            <Text style={styles.loginLinkText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignupScreen;
