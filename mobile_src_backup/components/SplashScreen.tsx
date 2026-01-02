import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    Easing,
    runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const logoScale = useSharedValue(0.3);
    const logoOpacity = useSharedValue(0);
    const containerOpacity = useSharedValue(1);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    useEffect(() => {
        // Animate logo in with a nice scale + fade
        logoScale.value = withSequence(
            withTiming(1.1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
            withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
        );
        logoOpacity.value = withTiming(1, { duration: 400 });

        // After delay, fade out the entire splash screen
        const timer = setTimeout(() => {
            containerOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
                if (finished) {
                    runOnJS(onFinish)();
                }
            });
        }, 1800); // Show for 1.8 seconds total

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
            <Animated.View style={logoAnimatedStyle}>
                <Image
                    source={require('../../assets/collegio-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e4e2dd', // Beige background matching the logo
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 140,
        height: 140,
    },
});

export default SplashScreen;
