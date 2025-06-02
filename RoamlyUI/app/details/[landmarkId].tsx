import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Appbar, Card, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LandmarkDetail() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { landmarkId, geohash, city, country } = params;

  const [loading, setLoading] = useState(true);
  const [textResponse, setTextResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const response = await axios.get('https://roamlyservice.onrender.com/landmark-response', {
          params: {
            landmark: landmarkId,
            userCountry: user?.country || "default",
            interestOne: user?.interestOne || "",
          },
        });

        setTextResponse(response.data.assembled_text);
      } catch (err: any) {
        console.error('❌ Error fetching landmark response:', err.response?.data || err.message);
        setError('No matching response found for your preferences.');
      } finally {
        setLoading(false);
      }
    };

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
      "origin.general",
      "origin.name",
      "culture.symbolism",
      "myths.legends",
      "architecture.style",
      "experience.vibe",
      "access.crowds",
      "access.hours",
    ];

    setIsPlaying(true);
    try {
      for (const key of semanticKeys) {
        const audioUrl = `https://your-audio-cdn.com/audio/${landmarkId}/${key}#${user.country || "default"}.mp3`;
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
      console.error("🔈 Audio playback error:", error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={landmarkId as string} subtitle={`${city}, ${country}`} />
        <Appbar.Action icon="volume-high" onPress={playAudioNarration} disabled={isPlaying} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <ActivityIndicator animating size="large" />
        ) : error ? (
          <Text style={{ color: 'red' }}>{error}</Text>
        ) : (
          <Card>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>Narrative:</Text>
              <Text>{textResponse}</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
