import VoiceQueryButton from '@/components/VoiceQueryButton';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Text,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LandmarkDetail() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const [landmarkMeta, setLandmarkMeta] = useState({
    landmarkId: params.landmarkId,
    geohash: params.geohash,
    city: params.city,
    country: params.country,
  });

  const { landmarkId, geohash, city, country } = landmarkMeta;

  const [loading, setLoading] = useState(true);
  const [textResponse, setTextResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessingVoiceQuery, setIsProcessingVoiceQuery] = useState(false);

  const semanticFollowups = [
    { label: 'Learn more about architecture', key: 'architecture.style' },
    { label: 'Learn about the vibe', key: 'experience.vibe' },
    { label: 'Myths and legends', key: 'myths.legends' },
    { label: 'Crowds and access', key: 'access.crowds' },
  ];

  const fetchResponse = async (semanticKey: string = 'origin.general') => {
    try {
      console.log('🎤 Fetching landmark response for:', landmarkId);  
      console.log("semanticKey", semanticKey);
      
      // Prepare interest array - convert single interest to array
      const interestArray = user?.interestOne ? [user.interestOne] : ['Nature'];
      
      const response = await axios.get('http://192.168.1.102:8000/landmark-response', {
        params: {
          landmark: landmarkId,
          interest: interestArray,
          userCountry: user?.country || 'United States',
          semanticKey,
          age: user?.age || 25, // Add age parameter with default
        },
      });

      const semanticText = response.data?.response;

      if (!semanticText) {
        throw new Error('No "response" field found in the JSON.');
      }

      setTextResponse(semanticText);
      setError(null);
      
      // Log additional response data for debugging
      console.log('✅ Landmark response received:', {
        landmark: response.data.landmark,
        country: response.data.country,
        interest: response.data.interest,
        age: response.data.age,
        age_group: response.data.age_group,
        extracted_details: response.data.extracted_details,
        specific_youtubes: response.data.specific_youtubes
      });
      
    } catch (err: any) {
      console.error('❌ Error fetching landmark response:', err.message);
      setError('No matching response found for your preferences.');
      setTextResponse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (landmarkId && geohash && user) {
      fetchResponse();
    }
  }, [landmarkId, geohash, user]);

  const playAudioNarration = () => {
    if (!textResponse) return;

    setIsPlaying(true);
    Speech.speak(textResponse, {
      onDone: () => setIsPlaying(false),
      onStopped: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const stopAudioNarration = () => {
    Speech.stop();
    setIsPlaying(false);
  };

  const handleVoiceQuery = async (result: { query: string; audioUri?: string }) => {
    console.log('🎤 Voice query result:', result);
    console.log('🎤 Audio URI present:', !!result.audioUri);
    console.log('🎤 Audio URI value:', result.audioUri);
    
    if (result.audioUri) {
      setIsProcessingVoiceQuery(true);
      
      try {
        console.log('🎤 Sending audio query to /ask-landmark route');
        console.log('🎤 Landmark ID:', landmarkId);
        console.log('🎤 Geohash:', geohash);
        console.log('🎤 City:', city);
        console.log('🎤 Country:', country);
        
        // Create form data for audio file upload
        const formData = new FormData();
        
        // Log the audio file object being created
        const audioFile = {
          uri: result.audioUri,
          type: 'audio/m4a', // Adjust based on your recording format
          name: 'voice_query.m4a'
        };
        console.log('🎤 Audio file object:', audioFile);
        
        formData.append('audio_file', audioFile as any);
        
        // Add landmark context - match backend parameter names
        formData.append('landmark', landmarkId?.toString() || '');
        
        // Add user context if available - match backend parameter names
        if (user) {
          formData.append('userCountry', user.country || 'default');
          formData.append('interestOne', user.interestOne || '');
        } else {
          formData.append('userCountry', 'default');
          formData.append('interestOne', '');
        }

        console.log('🎤 FormData created, sending to backend...');
        console.log('🎤 Backend URL: http://192.168.1.102:8000/ask-landmark');

        const response = await axios.post('http://192.168.1.102:8000/ask-landmark', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('✅ Audio query response:', response.data);
        
        // Update the narrative with the response
        if (response.data.response) {
          setTextResponse(response.data.response);
          setError(null);
        }
        
      } catch (error: any) {
        console.error('❌ Error sending audio query:', error);
        if (error.response) {
          console.error('❌ Error response data:', error.response.data);
          console.error('❌ Error response status:', error.response.status);
        }
        setError('Failed to process audio query. Please try again.');
      } finally {
        setIsProcessingVoiceQuery(false);
      }
    } else {
      // Handle text-only query
      console.log('📝 Text query:', result.query);
      console.log('📝 No audio URI provided');
      // You can add logic here to handle text queries
      // For example, search for specific information or update the narrative
    }
  };

  const landmarkImage = `https://source.unsplash.com/600x300/?church,architecture`;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={landmarkId?.toString().replace(/_/g, ' ')}
          subtitle={`${city}, ${country}`}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ImageBackground
          source={{ uri: landmarkImage }}
          style={{ height: 220, borderRadius: 16, overflow: 'hidden' }}
          imageStyle={{ borderRadius: 16 }}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ padding: 12 }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                {landmarkId?.toString().replace(/_/g, ' ')}
              </Text>
              <Text style={{ color: 'white', fontSize: 14 }}>{`${city}, ${country}`}</Text>
            </View>
          </View>
        </ImageBackground>

        {loading ? (
          <ActivityIndicator animating size="large" style={{ marginTop: 20 }} />
        ) : isProcessingVoiceQuery ? (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <ActivityIndicator animating size="large" />
            <Text style={{ marginTop: 10, color: '#666' }}>Processing your voice query...</Text>
          </View>
        ) : error ? (
          <Text style={{ color: 'red', marginTop: 20 }}>{error}</Text>
        ) : (
          <>
            <Card style={{ marginTop: 20, backgroundColor: '#f9f4ff' }}>
              <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 8, fontWeight: '600' }}>Narrative:</Text>
                <Text style={{ lineHeight: 20 }}>{textResponse}</Text>

                <Button
                  icon="volume-high"
                  mode="contained-tonal"
                  onPress={playAudioNarration}
                  disabled={isPlaying}
                  style={{ marginTop: 16, alignSelf: 'flex-start' }}
                >
                  {isPlaying ? 'Playing...' : 'Listen to this'}
                </Button>

                {isPlaying && (
                  <Button
                    icon="stop"
                    mode="outlined"
                    onPress={stopAudioNarration}
                    style={{ marginTop: 8, alignSelf: 'flex-start' }}
                  >
                    Stop
                  </Button>
                )}
              </Card.Content>
            </Card>

            <Text variant="titleMedium" style={{ marginTop: 24, marginBottom: 10, fontWeight: '600' }}>
              Follow-up Questions:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {semanticFollowups.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => {
                    setLoading(true);
                    fetchResponse(item.key);
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    backgroundColor: '#e3f2fd',
                    margin: 4,
                  }}
                >
                  <Text style={{ color: '#1e88e5' }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      
      <VoiceQueryButton 
        onQueryResult={handleVoiceQuery}
      />
    </View>
  );
}
