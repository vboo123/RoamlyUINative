import { useLocalSearchParams, router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LandmarkDetail() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { landmarkId, city, country, responses: rawResponses } = params;

  console.log(rawResponses)

  let parsedResponses: Record<string, string> = {};
  try {
    parsedResponses = JSON.parse(rawResponses as string);
  } catch (e) {
    console.error('Failed to parse responses:', e);
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={landmarkId as string} subtitle={`${city}, ${country}`} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Narratives:</Text>
            {Object.entries(parsedResponses).map(([key, value]) => (
              <Text key={key} style={{ marginBottom: 8 }}>
                • {key.split('_').pop()}: {value}
              </Text>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}
