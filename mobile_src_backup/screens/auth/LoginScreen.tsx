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

interface LoginScreenProps {
    navigation?: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const colors = useColors();
    const { isDark } = useTheme();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await login(email.trim().toLowerCase(), password);
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
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
            marginBottom: SPACING.xxl,
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
        },
        form: {
            marginBottom: SPACING.xl,
        },
        inputGroup: {
            marginBottom: SPACING.lg,
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
        forgotPassword: {
            alignSelf: 'flex-end',
            marginBottom: SPACING.lg,
        },
        forgotPasswordText: {
            fontSize: FONT_SIZES.sm,
            color: colors.primary,
            fontWeight: '500',
        },
        loginButton: {
            backgroundColor: colors.primary,
            paddingVertical: SPACING.lg,
            borderRadius: BORDER_RADIUS.lg,
            alignItems: 'center',
        },
        loginButtonDisabled: {
            opacity: 0.7,
        },
        loginButtonText: {
            fontSize: FONT_SIZES.md,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        divider: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.xl,
        },
        dividerLine: {
            flex: 1,
            height: 1,
            backgroundColor: colors.border,
        },
        dividerText: {
            marginHorizontal: SPACING.md,
            fontSize: FONT_SIZES.sm,
            color: colors.textMuted,
        },
        socialButtons: {
            flexDirection: 'row',
            gap: SPACING.md,
            marginBottom: SPACING.xl,
        },
        socialButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: SPACING.sm,
            backgroundColor: colors.backgroundSecondary,
            paddingVertical: SPACING.md,
            borderRadius: BORDER_RADIUS.lg,
            borderWidth: 1,
            borderColor: colors.border,
        },
        socialButtonText: {
            fontSize: FONT_SIZES.md,
            fontWeight: '500',
            color: colors.text,
        },
        signupLink: {
            flexDirection: 'row',
            justifyContent: 'center',
        },
        signupText: {
            fontSize: FONT_SIZES.md,
            color: colors.textSecondary,
        },
        signupLinkText: {
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
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue to Collegio</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
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
                                    placeholder="Enter your password"
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

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.loginButtonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Login */}
                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={styles.socialButton}>
                            <Ionicons name="logo-google" size={20} color={colors.text} />
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Ionicons name="logo-apple" size={20} color={colors.text} />
                            <Text style={styles.socialButtonText}>Apple</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signupLink}>
                        <Text style={styles.signupText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation?.navigate?.('Signup')}>
                            <Text style={styles.signupLinkText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;
