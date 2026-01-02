import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';

interface GlassBackButtonProps {
    onPress: () => void;
    style?: ViewStyle;
    iconColor?: string;
    size?: number;
}

export const GlassBackButton: React.FC<GlassBackButtonProps> = ({
    onPress,
    style,
    iconColor = '#db4a2b',
    size = 48,
}) => {
    return (
        <TouchableOpacity
            style={[styles.wrapper, { width: size, height: size, borderRadius: size / 2 }, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <GlassView style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}>
                <Ionicons name="chevron-back" size={22} color={iconColor} />
            </GlassView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        overflow: 'hidden',
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
});

export default GlassBackButton;
