import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import TabNavigator from './src/navigation/TabNavigator';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import RoommateDetailScreen from './src/screens/RoommateDetailScreen';
import GroupDetailScreen from './src/screens/GroupDetailScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import CreateListingScreen from './src/screens/CreateListingScreen';
import CreateProfileScreen from './src/screens/CreateProfileScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import { COLORS } from './src/constants/theme';
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
  </Stack.Navigator>
);

// Navigation wrapper that switches between auth and main stacks
const Navigation = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return isAuthenticated ? <MainStack /> : <AuthStack />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Navigation />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
