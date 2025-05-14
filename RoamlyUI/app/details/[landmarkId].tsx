import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Appbar, Card, Text, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

export default function LandmarkDetail() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { landmarkId, geohash, city, country } = params;

  const [loading, setLoading] = useState(true);
  const [textResponse, setTextResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const response = await axios.get('https://roamlyservice.onrender.com/landmark-response', {
          params: {
            landmark: landmarkId,
            userCountry: user?.country || "default",
            interestOne: user?.interestOne || "",
            interestTwo: user?.interestTwo || "",
            interestThree: user?.interestThree || "",
          },
        });

        console.log('✅ Response:', response.data);

        // Extract new key from response
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

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={landmarkId as string} subtitle={`${city}, ${country}`} />
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
