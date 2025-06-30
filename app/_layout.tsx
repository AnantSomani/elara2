import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'ElaraV2',
            headerStyle: { backgroundColor: '#f4f4f5' },
            headerTitleStyle: { fontWeight: 'bold' }
          }} 
        />
        <Stack.Screen 
          name="[episode]/index" 
          options={{ 
            title: 'Podcast Assistant',
            headerStyle: { backgroundColor: '#f4f4f5' },
            headerBackTitle: 'Back'
          }} 
        />
      </Stack>
    </>
  );
} 