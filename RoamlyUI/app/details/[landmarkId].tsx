import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Appbar, Card, Text, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';

export default function LandmarkDetail() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { landmarkId, geohash } = params;

  const [loading, setLoading] = useState(true);
  const [textResponse, setTextResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const response = await axios.get('https://roamlyservice.onrender.com/landmark-response', {
          params: {
            landmark: landmarkId,
            geohash,
            userCountry: user.country,
            interestOne: user.interestOne,
            interestTwo: user.interestTwo,
            interestThree: user.interestThree,
          },
        });

        setTextResponse(response.data.text);
      } catch (err) {
        console.error('Failed to fetch landmark response:', err);
        setError('Could not load landmark description.');
      } finally {
        setLoading(false);
      }
    };

    if (landmarkId && geohash) {
      fetchResponse();
    }
  }, [landmarkId, geohash]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={landmarkId as string} />
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
