import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { EnhancedLiquidGlass } from './EnhancedLiquidGlass';

export function LiquidGlassDemo() {
  const [selectedIntensity, setSelectedIntensity] = useState<'low' | 'medium' | 'high' | 'ultra'>('medium');
  const [selected, setSelected] = useState(false);
  const [glowEffect, setGlowEffect] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Liquid Glass Showcase</Text>
      
      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.controlTitle}>Intensity</Text>
        <View style={styles.buttonRow}>
          {(['low', 'medium', 'high', 'ultra'] as const).map((intensity) => (
            <TouchableOpacity
              key={intensity}
              style={[
                styles.controlButton,
                selectedIntensity === intensity && styles.activeControl,
              ]}
              onPress={() => setSelectedIntensity(intensity)}
            >
              <Text style={styles.controlText}>{intensity}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, selected && styles.activeToggle]}
            onPress={() => setSelected(!selected)}
          >
            <Text style={styles.controlText}>Selected State</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, glowEffect && styles.activeToggle]}
            onPress={() => setGlowEffect(!glowEffect)}
          >
            <Text style={styles.controlText}>Glow Effect</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Demo Cards */}
      <View style={styles.demoGrid}>
        {/* Basic Card */}
        <EnhancedLiquidGlass
          intensity={selectedIntensity}
          selected={selected}
          glowEffect={glowEffect}
          borderRadius={16}
          style={styles.demoCard}
        >
          <Text style={styles.cardTitle}>Dashboard</Text>
          <Text style={styles.cardText}>
            Clean greyish translucent effect with {selectedIntensity} intensity
          </Text>
        </EnhancedLiquidGlass>

        {/* Button Style */}
        <EnhancedLiquidGlass
          intensity={selectedIntensity}
          selected={selected}
          glowEffect={glowEffect}
          borderRadius={12}
          style={styles.demoButton}
        >
          <Text style={styles.buttonText}>Profile</Text>
        </EnhancedLiquidGlass>

        {/* Circular Element */}
        <EnhancedLiquidGlass
          intensity={selectedIntensity}
          selected={selected}
          glowEffect={glowEffect}
          borderRadius={60}
          style={styles.circularDemo}
        >
          <Text style={styles.emojiText}>⚙️</Text>
        </EnhancedLiquidGlass>

        {/* Panel */}
        <EnhancedLiquidGlass
          intensity={selectedIntensity}
          selected={selected}
          glowEffect={glowEffect}
          borderRadius={20}
          style={styles.panelDemo}
        >
          <Text style={styles.panelTitle}>Settings</Text>
          <Text style={styles.panelText}>
            Elegant frosted glass effect with subtle transparency and clean borders
          </Text>
          <View style={styles.panelStats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Options</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
          </View>
        </EnhancedLiquidGlass>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  controls: {
    marginBottom: 30,
  },
  controlTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeControl: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  controlText: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  demoGrid: {
    gap: 20,
  },
  demoCard: {
    padding: 20,
    minHeight: 100,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  demoButton: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  circularDemo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 40,
  },
  panelDemo: {
    padding: 24,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 12,
  },
  panelText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 20,
  },
  panelStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
}); 