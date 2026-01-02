import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Text,
    ViewStyle,
    TextStyle,
    View,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore - expo-glass-effect types
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface GlassButtonProps {
    onPress: () => void;
    title?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconSize?: number;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'small' | 'medium' | 'large' | 'icon';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    onPress,
    title,
    icon,
    iconSize,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
    fullWidth = false,
}) => {
    const { isDark } = useTheme();
    const colors = useColors();

    // Get tint color based on variant
    const getTintColor = () => {
        switch (variant) {
            case 'primary':
                return 'rgba(219, 74, 43, 0.85)'; // Orange
            case 'secondary':
                return isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
            case 'danger':
                return 'rgba(255, 59, 48, 0.85)'; // Red
            case 'ghost':
                return isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)';
            default:
                return 'rgba(219, 74, 43, 0.85)';
        }
    };

    // Get text color based on variant
    const getTextColor = () => {
        switch (variant) {
            case 'primary':
            case 'danger':
                return '#FFFFFF';
            case 'secondary':
            case 'ghost':
                return colors.text;
            default:
                return '#FFFFFF';
        }
    };

    // Get size dimensions
    const getSizeStyles = (): ViewStyle => {
        switch (size) {
            case 'small':
                return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md };
            case 'medium':
                return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg };
            case 'large':
                return { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl };
            case 'icon':
                return { width: 44, height: 44, padding: 0 };
            default:
                return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg };
        }
    };

    // Get font size based on button size
    const getFontSize = () => {
        switch (size) {
            case 'small':
                return FONT_SIZES.sm;
            case 'large':
                return FONT_SIZES.lg;
            default:
                return FONT_SIZES.md;
        }
    };

    const calculatedIconSize = iconSize || (size === 'small' ? 18 : size === 'large' ? 24 : 20);

    const styles = StyleSheet.create({
        wrapper: {
            borderRadius: size === 'icon' ? 22 : BORDER_RADIUS.lg,
            overflow: 'hidden',
            opacity: disabled ? 0.5 : 1,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        glassContent: {
            ...getSizeStyles(),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: title && icon ? SPACING.sm : 0,
            borderRadius: size === 'icon' ? 22 : BORDER_RADIUS.lg,
        },
        text: {
            fontSize: getFontSize(),
            fontWeight: '600',
            color: getTextColor(),
        },
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={[styles.wrapper, style]}
        >
            <GlassView
                style={styles.glassContent}
                tintColor={getTintColor()}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={getTextColor()} />
                ) : (
                    <>
                        {icon && (
                            <Ionicons
                                name={icon}
                                size={calculatedIconSize}
                                color={getTextColor()}
                            />
                        )}
                        {title && (
                            <Text style={[styles.text, textStyle]}>{title}</Text>
                        )}
                    </>
                )}
            </GlassView>
        </TouchableOpacity>
    );
};

export default GlassButton;
