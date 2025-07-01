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
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'ElaraV2',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="[episode]/index" 
          options={{ 
            title: 'Podcast Assistant',
            headerShown: true
          }} 
        />
      </Stack>
    </>
  );
} 