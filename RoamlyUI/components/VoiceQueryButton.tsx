import { useAuth } from '@/hooks/useAuth';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, FAB, IconButton, Modal, Portal, Text } from 'react-native-paper';

interface VoiceQueryButtonProps {
  onQueryResult?: (result: { query: string; audioUri?: string }) => void;
}

export default function VoiceQueryButton({ onQueryResult }: VoiceQueryButtonProps) {
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [currentAudioUri, setCurrentAudioUri] = useState<string | null>(null);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Timer for recording duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (!hasPermission) {
        Alert.alert('Permission needed', 'Microphone permission is required for voice recording');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      
      // Start real-time speech recognition if available
      startSpeechRecognition();
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const startSpeechRecognition = () => {
    // Check if Web Speech API is available (works in web environment)
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          console.log('🗣️ Final transcript:', finalTranscript);
          setQueryText(finalTranscript);
        } else if (interimTranscript) {
          console.log('🗣️ Interim transcript:', interimTranscript);
          setQueryText(interimTranscript + '...');
        }
      };

      recognition.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
      };

      recognition.start();
      console.log('🎤 Real-time speech recognition started');
    } else {
      console.log('Web Speech API not available, using audio recording only');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();
      setRecording(null);

      if (uri) {
        console.log('🎤 Voice recording completed!');
        console.log('📁 Audio file URI:', uri);
        console.log('⏱️ Recording duration:', status.durationMillis, 'ms');
        console.log('📊 Audio levels:', status.metering);
        console.log('🎵 Audio format:', status.isRecording ? 'Recording' : 'Stopped');
        
        // Store the audio URI for later use
        setAudioUri(uri);
        setCurrentAudioUri(uri); // Store in local variable for immediate use
        
        // Show detailed recording info to user
        const durationSeconds = Math.round(status.durationMillis / 1000);
        const audioLevel = status.metering || 'Unknown';
        
        setQueryText(`🎤 Recording captured!\n\n📊 Details:\n• Duration: ${durationSeconds} seconds\n• Audio level: ${audioLevel}\n• File saved successfully\n\nReady to submit your question!`);
        
        // Mark as ready to submit immediately
        setIsReadyToSubmit(true);
        console.log('✅ Recording complete - ready to submit!');
        
        // Note: Removed the setTimeout that was overriding the state
        // The submit button should now appear immediately after recording
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  const processQuery = async () => {
    if (!queryText.trim() || !isReadyToSubmit) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Extract the query from "Hey Roamly, tell me about..."
      const query = queryText.toLowerCase();
      let extractedQuery = '';
      
      if (query.includes('hey roamly') || query.includes('hi roamly')) {
        // Extract everything after "tell me about" or similar phrases
        const patterns = [
          /tell me about (.+)/i,
          /what is (.+)/i,
          /tell me (.+)/i,
          /about (.+)/i
        ];
        
        for (const pattern of patterns) {
          const match = query.match(pattern);
          if (match) {
            extractedQuery = match[1].trim();
            break;
          }
        }
      }

      if (!extractedQuery) {
        // If no pattern matched, use the whole query
        extractedQuery = queryText;
      }

      console.log('Processing query:', extractedQuery);
      console.log('Audio URI at processing time:', currentAudioUri);

      // Pass the query and audio URI to the parent component
      if (onQueryResult) {
        onQueryResult({
          query: extractedQuery,
          audioUri: currentAudioUri || undefined
        });
      }

      // Close modal and reset
      setIsModalVisible(false);
      setQueryText('');
      setAudioUri(null);
      setCurrentAudioUri(null);
      setIsReadyToSubmit(false);
      
    } catch (error) {
      console.error('Error processing query:', error);
      Alert.alert('Error', 'Failed to process your query. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelQuery = () => {
    if (recording) {
      stopRecording();
    }
    setIsModalVisible(false);
    setQueryText('');
    setIsProcessing(false);
    setIsReadyToSubmit(false);
  };

  const handleSubmit = () => {
    if (queryText.trim() && isReadyToSubmit) {
      processQuery();
    }
  };

  // Check if ready to submit when query text changes
  useEffect(() => {
    console.log('🔍 isReadyToSubmit check:', { queryText: queryText.trim(), isRecording, isReadyToSubmit });
    if (queryText.trim() && !isRecording) {
      setIsReadyToSubmit(true);
      console.log('✅ Setting isReadyToSubmit to true');
    } else if (!queryText.trim()) {
      setIsReadyToSubmit(false);
      console.log('❌ Setting isReadyToSubmit to false');
    }
  }, [queryText, isRecording]);

  // Debug log for button state
  useEffect(() => {
    console.log('🔍 Button state:', {
      queryText: queryText.trim(),
      isProcessing,
      isRecording,
      isReadyToSubmit,
      buttonDisabled: !queryText.trim() || isProcessing || isRecording || !isReadyToSubmit,
      buttonText: isProcessing ? 'Processing...' : isReadyToSubmit ? 'Submit Question' : 'Not Ready'
    });
  }, [queryText, isProcessing, isRecording, isReadyToSubmit]);

  return (
    <>
      <FAB
        icon="microphone"
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
        label="Ask Roamly"
      />
      
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={cancelQuery}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalContent}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Ask Roamly
            </Text>
            
            <Text variant="bodyMedium" style={styles.instructionText}>
              Tap the mic to record your question, then submit when ready.
            </Text>

            {/* Voice Recording Section */}
            <View style={styles.voiceSection}>
              <IconButton
                icon={isRecording ? "stop" : "microphone"}
                size={40}
                mode="contained"
                containerColor={isRecording ? "#ff4444" : "#2196F3"}
                iconColor="white"
                onPress={isRecording ? stopRecording : startRecording}
                style={styles.micButton}
                disabled={isProcessing}
              />
              <Text variant="bodySmall" style={styles.recordingText}>
                {isRecording ? `Recording... ${recordingDuration}s (Tap to stop)` : 'Tap to record your question'}
              </Text>
            </View>
            
            {/* Status Text */}
            {queryText && (
              <Text variant="bodySmall" style={styles.statusText}>
                {queryText}
              </Text>
            )}

            {/* Submit Button - Always visible but disabled when not ready */}
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={[styles.button, styles.submitButton]}
                loading={isProcessing}
                disabled={!queryText.trim() || isProcessing || isRecording || !isReadyToSubmit}
                icon="send"
              >
                {isProcessing ? 'Processing...' : isReadyToSubmit ? 'Submit Question' : 'Not Ready'}
              </Button>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={cancelQuery}
                style={styles.button}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 20,
  },
  voiceSection: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  micButton: {
    marginBottom: 10,
  },
  recordingText: {
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    minHeight: 50,
  },
  statusText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
}); 