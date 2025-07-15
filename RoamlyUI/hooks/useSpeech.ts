import * as Speech from 'expo-speech';
import { useEffect, useRef } from 'react';

export const useSpeech = () => {
  const isSpeakingRef = useRef(false);

  const speak = (text: string, options?: Speech.SpeakOptions) => {
    console.log('🔊 useSpeech.speak called with text:', text?.substring(0, 50) + '...');
    
    // Stop any existing speech first
    stop();
    
    isSpeakingRef.current = true;
    console.log('🔊 Starting expo-speech...');
    
    return Speech.speak(text, {
      onDone: () => {
        console.log('✅ Speech onDone callback');
        isSpeakingRef.current = false;
        options?.onDone?.();
      },
      onStopped: () => {
        console.log('⏹️ Speech onStopped callback');
        isSpeakingRef.current = false;
        options?.onStopped?.();
      },
      onError: (error) => {
        console.error('❌ Speech onError callback:', error);
        isSpeakingRef.current = false;
        options?.onError?.(error);
      },
      ...options,
    });
  };

  const stop = () => {
    console.log('🔊 useSpeech.stop called');
    if (isSpeakingRef.current) {
      Speech.stop();
      isSpeakingRef.current = false;
    }
  };

  const isSpeaking = () => isSpeakingRef.current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return { speak, stop, isSpeaking };
}; 