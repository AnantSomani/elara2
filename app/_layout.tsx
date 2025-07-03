import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen once the app is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Elara',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="youtube" 
          options={{ 
            title: 'Add YouTube Podcast',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="continue" 
          options={{ 
            title: 'Continue Podcasts',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="[episode]/index" 
          options={{ 
            title: 'Podcast Assistant',
            headerShown: false
          }} 
        />
      </Stack>
    </>
  );
} 