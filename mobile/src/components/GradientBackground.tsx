import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface GradientBackgroundProps {
    children?: React.ReactNode;
    style?: any;
}

// Matches the website's ModernBackground EXACTLY
// Website uses: from-orange-500 via-red-600 to-orange-700
// With subtle yellow/amber orbs
export const GradientBackground: React.FC<GradientBackgroundProps> = ({
    children,
    style
}) => {
    return (
        <View style={[styles.container, style]}>
            {/* Base gradient - matching website exactly */}
            <LinearGradient
                colors={['#f97316', '#dc2626', '#c2410c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative orbs matching website's ModernBackground */}
            {/* Orb 1 - Large yellow-gold, top right, very soft */}
            <View style={styles.orb1} />

            {/* Orb 2 - Medium amber, bottom left */}
            <View style={styles.orb2} />

            {/* Orb 3 - Small light yellow, middle */}
            <View style={styles.orb3} />

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    // Website orbs use blur-3xl and specific opacity
    // rgba(250, 204, 21, 1) = yellow-400 with 0.5 opacity
    orb1: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: 'rgba(250, 204, 21, 0.4)', // Yellow-400
        top: -width * 0.5,
        right: -width * 0.5,
    },
    // rgba(245, 158, 11, 1) = amber-500 with 0.45 opacity
    orb2: {
        position: 'absolute',
        width: width * 1.0,
        height: width * 1.0,
        borderRadius: width * 0.5,
        backgroundColor: 'rgba(245, 158, 11, 0.35)', // Amber-500
        bottom: -width * 0.3,
        left: -width * 0.4,
    },
    // rgba(253, 224, 71, 1) = yellow-300 with 0.55 opacity
    orb3: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(253, 224, 71, 0.3)', // Yellow-300
        top: height * 0.2,
        right: -width * 0.3,
    },
});

export default GradientBackground;
