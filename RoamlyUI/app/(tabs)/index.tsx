import { Colors } from '@/constants/Colors';
import { useLandmarks } from '@/context/LandmarkContext';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';
// import placeholder from '../../assets/images/favicon.png';

export default function ExploreScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { properties, loading, error, refreshLandmarks } = useLandmarks();

  if (loading) {
    return (
      <ActivityIndicator 
        animating={true} 
        size="large" 
        style={{ marginTop: 100 }} 
        color={colors.tint}
      />
    );
  }

  if (error) {
    return (
      <Text style={{ 
        marginTop: 100, 
        textAlign: 'center', 
        color: colors.error 
      }}>
        {error}
      </Text>
    );
  }

  if (properties.length === 0) {
    return (
      <Text style={{ 
        marginTop: 100, 
        textAlign: 'center',
        color: colors.text 
      }}>
        No landmarks found near you.
      </Text>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={{ 
        padding: 16,
        backgroundColor: colors.background 
      }}
      style={{ backgroundColor: colors.background }}
    >
      {properties.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() =>
            router.push({
              pathname: '/details/[landmarkId]',
              params: { landmarkId: item.landmarkName, geohash: item.geohash, country: item.country, city: item.city },
            })
          }            
                  >
          <Card 
            style={{ 
              marginBottom: 16,
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderWidth: 1,
            }}
          >
            <Card.Cover source={{ uri: 'https://source.unsplash.com/600x300/?landmark,architecture' }} />
            <Card.Title 
              title={item.landmarkName}
              titleStyle={{ color: colors.text }}
            />
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}