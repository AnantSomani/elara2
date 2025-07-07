import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LiquidGlassContainer } from './LiquidGlassContainer';

interface EpisodeData {
  description: string;
  publishedDate: string;
  status: string;
  lastWatched: string;
  tags: string[];
}

interface EpisodeDropdownProps {
  episode: EpisodeData;
  getTagColor: (tag: string) => {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  };
  style?: any;
}

export const EpisodeDropdown: React.FC<EpisodeDropdownProps> = ({
  episode,
  getTagColor,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleDropdown = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const dropdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 350], // Increased height to show all tags
  });



  return (
    <View style={[styles.container, style]}>
      <LiquidGlassContainer borderRadius={20} intensity="high" style={styles.dropdownContainer}>
        {/* Dropdown Header Button */}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={toggleDropdown}
          activeOpacity={0.8}
        >
          <Text style={styles.headerButtonText}>More on this Episode</Text>
        </TouchableOpacity>
        
        {/* Animated Dropdown Content */}
        <Animated.View style={[styles.contentContainer, { height: dropdownHeight }]}>
          <View style={styles.content}>
            {/* Description */}
            <Text style={styles.description}>{episode.description}</Text>
            
            {/* Details Section */}
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Published:</Text>
              <Text style={styles.detailValue}>
                {new Date(episode.publishedDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.detailValue}>
                {episode.status === 'watching' ? 'In Progress' : episode.status}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Watched:</Text>
              <Text style={styles.detailValue}>{episode.lastWatched}</Text>
            </View>
            
            {/* Tags Section */}
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {episode.tags.map((tag, index) => {
                const tagColors = getTagColor(tag);
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.coloredTag,
                      {
                        backgroundColor: tagColors.backgroundColor,
                        borderColor: tagColors.borderColor,
                      }
                    ]}
                  >
                    <Text style={[styles.coloredTagText, { color: tagColors.textColor }]}>
                      {tag}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </LiquidGlassContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  dropdownContainer: {
    overflow: 'hidden',
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 80,
  },
  headerButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
  },

  contentContainer: {
    overflow: 'hidden',
  },
  content: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 12,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  coloredTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  coloredTagText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 