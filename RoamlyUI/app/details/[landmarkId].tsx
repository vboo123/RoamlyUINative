import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
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
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const semanticFollowups = [
    { label: 'Learn more about architecture', key: 'architecture.style' },
    { label: 'Learn about the vibe', key: 'experience.vibe' },
    { label: 'Myths and legends', key: 'myths.legends' },
    { label: 'Crowds and access', key: 'access.crowds' },
  ];

  const fetchResponse = async (semanticKey: string = 'origin.general') => {
    try {
      const response = await axios.get('http://192.168.1.78:8000/landmark-response', {
        params: {
          landmark: landmarkId,
          userCountry: user?.country || 'default',
          interestOne: user?.interestOne || '',
          semanticKey,
        },
      });

      const jsonUrl = response.data?.json_url;
      if (!jsonUrl) {
        throw new Error('No semantic JSON URL provided by backend.');
      }

      const jsonRes = await axios.get(jsonUrl);
      const semanticText = jsonRes.data?.response;

      if (!semanticText) {
        throw new Error('No "response" field found in the JSON.');
      }

      setTextResponse(semanticText);
      setError(null);
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

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playAudioNarration = async () => {
    if (!landmarkId || !user) return;

    const semanticKeys = [
      'origin.general',
      'origin.name',
      'culture.symbolism',
      'myths.legends',
      'architecture.style',
      'experience.vibe',
      'access.crowds',
      'access.hours',
    ];

    setIsPlaying(true);
    try {
      for (const key of semanticKeys) {
        const audioUrl = `https://your-audio-cdn.com/audio/${landmarkId}/${key}#${user.country || 'default'}.mp3`;
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUrl });
        setSound(newSound);
        await newSound.playAsync();
        await new Promise((resolve) =>
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) resolve(true);
          })
        );
        await newSound.unloadAsync();
      }
    } catch (error) {
      console.error('🔈 Audio playback error:', error);
    } finally {
      setIsPlaying(false);
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
    </View>
  );
}