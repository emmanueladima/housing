import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import TabNavigator from './src/navigation/TabNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import RoommateDetailScreen from './src/screens/RoommateDetailScreen';
import GroupDetailScreen from './src/screens/GroupDetailScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import ChatScreen from './src/screens/ChatScreen';
import ApplicationsScreen from './src/screens/ApplicationsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ToolkitScreen from './src/screens/ToolkitScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LegalScreen from './src/screens/LegalScreen';
import CreateListingScreen from './src/screens/CreateListingScreen';
import CreateProfileScreen from './src/screens/CreateProfileScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import ApplyScreen from './src/screens/ApplyScreen';
import CompatibilityTestScreen from './src/screens/CompatibilityTestScreen';
import LandlordDashboardScreen from './src/screens/LandlordDashboardScreen';
import EditListingScreen from './src/screens/EditListingScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import SavedScreen from './src/screens/SavedScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import { COLORS } from './src/constants/theme';
import SplashScreen from './src/components/SplashScreen';
import { config } from './src/config';

// Initialize Mapbox
Mapbox.setAccessToken(config.MAPBOX_ACCESS_TOKEN);

const Stack = createNativeStackNavigator();

// Auth Stack for unauthenticated users
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

// Main Stack for authenticated users
const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen
      name="ListingDetail"
      component={ListingDetailScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="RoommateDetail"
      component={RoommateDetailScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="GroupDetail"
      component={GroupDetailScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="PostDetail"
      component={PostDetailScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="CreateListing"
      component={CreateListingScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen
      name="CreateProfile"
      component={CreateProfileScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen
      name="CreateGroup"
      component={CreateGroupScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen
      name="CreatePost"
      component={CreatePostScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="Applications"
      component={ApplicationsScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="Toolkit"
      component={ToolkitScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="Legal"
      component={LegalScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="Apply"
      component={ApplyScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen
      name="CompatibilityTest"
      component={CompatibilityTestScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen
      name="LandlordDashboard"
      component={LandlordDashboardScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="EditListing"
      component={EditListingScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen
      name="Feedback"
      component={FeedbackScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="Saved"
      component={SavedScreen}
      options={{
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
  </Stack.Navigator>
);

// Navigation wrapper that switches between auth, onboarding, and main stacks
const Navigation = () => {
  const { isAuthenticated, isLoading, needsOnboarding, completeOnboarding } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // Logged in but needs onboarding
  if (needsOnboarding) {
    return (
      <OnboardingScreen
        onComplete={completeOnboarding}
        onSkip={completeOnboarding}
      />
    );
  }

  // Logged in and onboarding complete
  return <MainStack />;
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <SplashScreen onFinish={() => setShowSplash(false)} />
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Navigation />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
