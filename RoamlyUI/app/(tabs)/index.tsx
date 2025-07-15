import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import axios from 'axios';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';
// import placeholder from '../../assets/images/favicon.png';

interface Property {
  landmarkName: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  geohash: string;
  responses: Record<string, string>;
}

export default function ExploreScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLandmarks = async () => {
      if (
        !user ||
        !user.age ||
        !user.country ||
        !user.language ||
        !user.interestOne
      ) {
        setError('Missing user preferences. Please update your profile.');
        setLoading(false);
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const response = await axios.get('https://roamlyservice.onrender.com/get-properties/', {
          params: {
            lat: latitude,
            long: longitude,
            interestOne: user.interestOne,
            userAge: user.age,
            userCountry: user.country,
            userLanguage: user.language,
          },
        });

        console.log(response.data)

        setProperties(response.data.properties || []);
      } catch (err) {
        console.error('❌ Failed to fetch landmarks', err);
        setError('Failed to fetch landmarks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLandmarks();
  }, [user]);

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