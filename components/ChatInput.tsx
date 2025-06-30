import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useVoiceRecording } from '../hooks';
import { sendQuestion } from '../lib/api';

interface ChatInputProps {
  episodeId: string;
  onResponse: (audioUrl: string) => void;
  isProcessing: boolean;
}

export default function ChatInput({ episodeId, onResponse, isProcessing }: ChatInputProps) {
  const [question, setQuestion] = useState('');
  
  const {
    isRecording,
    recordingUri,
    duration,
    startRecording,
    stopRecording,
    clearRecording,
  } = useVoiceRecording();

  const handleVoiceInput = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri) {
        // TODO: Implement speech-to-text conversion
        // For now, we'll set a placeholder message
        setQuestion('Voice input received - implement speech-to-text conversion');
        Alert.alert(
          'Voice Recording Complete',
          'Speech-to-text conversion will be implemented with a service like OpenAI Whisper or Google Speech-to-Text.'
        );
      }
    } else {
      await startRecording();
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;

    try {
      setIsProcessing(true);
      const response = await sendQuestion(episodeId, question);
      
      // Clear the input
      setQuestion('');
      
      // Notify parent with the response audio URL
      onResponse(response.audioUrl);
    } catch (error) {
      console.error('Error sending question:', error);
      Alert.alert('Error', 'Failed to process your question. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask a question about this episode..."
          value={question}
          onChangeText={setQuestion}
          multiline
          maxLength={500}
          editable={!isProcessing}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            onPress={handleVoiceInput}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isRecording ? '🔴' : '🎤'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sendButton, (!question.trim() || isProcessing) && styles.sendButtonDisabled]}
            onPress={handleSubmit}
            disabled={!question.trim() || isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? '⏳' : '📤'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Text style={styles.recordingText}>
            🔴 Recording... {formatDuration(duration)}
          </Text>
        </View>
      )}
      
      {recordingUri && !isRecording && (
        <View style={styles.recordingComplete}>
          <Text style={styles.recordingCompleteText}>
            ✅ Voice recording complete ({formatDuration(duration)})
          </Text>
          <TouchableOpacity onPress={clearRecording} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#ef4444',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    fontSize: 18,
  },
  recordingIndicator: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  recordingText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  recordingComplete: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingCompleteText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#1e40af',
    borderRadius: 4,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
}); 