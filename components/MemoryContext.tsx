import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SupermemorySearchResult } from '../lib/supermemory';

interface MemoryContextProps {
  memoryResults?: SupermemorySearchResult[];
  usedMemorySearch?: boolean;
  showDetails?: boolean;
}

export function MemoryContext({ memoryResults, usedMemorySearch, showDetails = false }: MemoryContextProps) {
  if (!usedMemorySearch || !memoryResults || memoryResults.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🧠 Memory</Text>
        </View>
        <Text style={styles.countText}>
          {memoryResults.length} memory{memoryResults.length !== 1 ? 'ies' : 'y'} found
        </Text>
      </View>

      {showDetails && (
        <View style={styles.details}>
          {memoryResults.slice(0, 3).map((memory, index) => (
            <View key={memory.documentId || index} style={styles.memoryItem}>
              <View style={styles.memoryHeader}>
                <Text style={styles.memoryTitle}>
                  {memory.title || `Memory ${index + 1}`}
                </Text>
                <Text style={styles.memoryScore}>
                  {(memory.score * 100).toFixed(0)}% match
                </Text>
              </View>
              
              {memory.chunks && memory.chunks.length > 0 && (
                <Text style={styles.memoryContent} numberOfLines={2}>
                  {memory.chunks[0].content}
                </Text>
              )}
              
              {memory.metadata && (
                <View style={styles.metadata}>
                  {memory.metadata.speaker_name && (
                    <Text style={styles.metadataText}>
                      👤 {memory.metadata.speaker_name}
                    </Text>
                  )}
                  {memory.metadata.episode_title && (
                    <Text style={styles.metadataText}>
                      🎙️ {memory.metadata.episode_title}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
          
          {memoryResults.length > 3 && (
            <Text style={styles.moreText}>
              +{memoryResults.length - 3} more memories
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#9333ea',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  countText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  details: {
    gap: 8,
  },
  memoryItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  memoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  memoryScore: {
    fontSize: 12,
    color: '#9333ea',
    fontWeight: '600',
  },
  memoryContent: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  metadata: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metadataText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  moreText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
}); 