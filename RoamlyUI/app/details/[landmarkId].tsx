import { useLocalSearchParams, router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Card, Text, Appbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LandmarkDetail() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const landmarkName = params.landmarkId;
  const city = params.city;
  const country = params.country;
  const responses = JSON.parse(params.responses as string || '{}');

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={landmarkName as string} subtitle={`${city}, ${country}`} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Descriptions:</Text>
            {Object.entries(responses).map(([key, value]) => (
              <Text key={key} style={{ marginLeft: 8, marginBottom: 4 }}>
                • {key.split('_').pop()}: {value}
              </Text>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}
