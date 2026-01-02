import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewProps } from 'react-native';

interface GradientBackgroundProps extends ViewProps {
    children?: React.ReactNode;
}

export function GradientBackground({ children, style, ...props }: GradientBackgroundProps) {
    return (
        <LinearGradient
            // Simple liquid gradient: Orange/Pink/Blue/Purple hints
            colors={['#fdf4ff', '#e0f2fe', '#fff7ed']} // Very light pastel for Light Mode default
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, style]}
            {...props}
        >
            {children}
        </LinearGradient>
    );
}
