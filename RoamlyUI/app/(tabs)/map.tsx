import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import axios from 'axios';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

interface Property {
  landmarkName: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  geohash: string;
  responses: Record<string, string>;
}

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function MapScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [userLocation, setUserLocation] = useState<MapRegion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLandmarksAndLocation = async () => {
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
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        const { latitude, longitude } = location.coords;
        
        // Set initial map region
        setUserLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        // Fetch nearby landmarks
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

        console.log('Map landmarks response:', response.data);
        setProperties(response.data.properties || []);
        
      } catch (err) {
        console.error('❌ Failed to fetch landmarks or location', err);
        setError('Failed to load map data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLandmarksAndLocation();
  }, [user]);

  const handleMarkerPress = (landmark: Property) => {
    Alert.alert(
      landmark.landmarkName,
      `Located in ${landmark.city}, ${landmark.country}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'View Details',
          onPress: () => {
            router.push({
              pathname: '/details/[landmarkId]',
              params: { 
                landmarkId: landmark.landmarkName, 
                geohash: landmark.geohash, 
                country: landmark.country, 
                city: landmark.city 
              },
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator 
          animating={true} 
          size="large" 
          color={colors.tint}
        />
        <Text style={{ marginTop: 16, color: colors.text }}>
          Loading map...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        <Text style={{ 
          textAlign: 'center', 
          color: colors.error,
          padding: 20 
        }}>
          {error}
        </Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        <Text style={{ 
          textAlign: 'center', 
          color: colors.text,
          padding: 20 
        }}>
          Unable to get your location
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={userLocation}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={true}
      >
        {/* User location marker */}
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="You are here"
          description="Your current location"
          pinColor={colors.tint}
        />

        {/* Landmark markers */}
        {properties.map((landmark, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: landmark.latitude,
              longitude: landmark.longitude,
            }}
            title={landmark.landmarkName}
            description={`${landmark.city}, ${landmark.country}`}
            pinColor={colorScheme === 'dark' ? '#ff6b6b' : '#e74c3c'}
            onPress={() => handleMarkerPress(landmark)}
          />
        ))}
      </MapView>
    </View>
  );
} 