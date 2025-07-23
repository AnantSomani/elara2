import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MemoryStatsProps {
  totalSearches: number;
  memorySearches: number;
  fallbackSearches: number;
  averageMemoryResults: number;
  showDetails?: boolean;
}

export function MemoryStats({ 
  totalSearches, 
  memorySearches, 
  fallbackSearches, 
  averageMemoryResults,
  showDetails = false 
}: MemoryStatsProps) {
  if (totalSearches === 0) {
    return null;
  }

  const memoryPercentage = totalSearches > 0 ? (memorySearches / totalSearches * 100).toFixed(0) : '0';
  const fallbackPercentage = totalSearches > 0 ? (fallbackSearches / totalSearches * 100).toFixed(0) : '0';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧠 Memory Search Stats</Text>
        <Text style={styles.totalSearches}>{totalSearches} total searches</Text>
      </View>

      {showDetails && (
        <View style={styles.details}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Memory Searches</Text>
              <Text style={styles.statValue}>{memorySearches}</Text>
              <Text style={styles.statPercentage}>{memoryPercentage}%</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Fallback Searches</Text>
              <Text style={styles.statValue}>{fallbackSearches}</Text>
              <Text style={styles.statPercentage}>{fallbackPercentage}%</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg Results</Text>
              <Text style={styles.statValue}>{averageMemoryResults.toFixed(1)}</Text>
              <Text style={styles.statPercentage}>per search</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.summary}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${memoryPercentage}%` as any }
            ]} 
          />
        </View>
        <Text style={styles.summaryText}>
          {memoryPercentage}% memory success rate
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalSearches: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  details: {
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 2,
  },
  statPercentage: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  summary: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  summaryText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
}); 