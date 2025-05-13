import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function LandmarkDetail() {
  const params = useLocalSearchParams();
  const landmarkName = params.landmarkId;
  const city = params.city;
  const country = params.country;
  const responses = JSON.parse(params.responses as string || '{}');

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title={landmarkName as string} subtitle={`${city}, ${country}`} />
        <Card.Content>
          <Text style={{ marginBottom: 8 }}>Descriptions:</Text>
          {Object.entries(responses).map(([key, value]) => (
            <Text key={key} style={{ marginLeft: 8 }}>• {key.split('_').pop()}: {value}</Text>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
