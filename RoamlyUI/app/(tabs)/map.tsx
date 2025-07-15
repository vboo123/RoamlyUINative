import { Colors } from '@/constants/Colors';
import { useLandmarks } from '@/context/LandmarkContext';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React from 'react';
import { Alert, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

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
  const { properties, loading, error, userLocation } = useLandmarks();

  const handleMarkerPress = (landmark: any) => {
    Alert.alert(
      landmark.landmarkName,
      undefined, // No description text
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

  // Create map region from user location
  const mapRegion: MapRegion = {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={mapRegion}
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
            description={landmark.city && landmark.country 
              ? `${landmark.city}, ${landmark.country}`
              : 'Location not available'
            }
            pinColor={colorScheme === 'dark' ? '#ff6b6b' : '#e74c3c'}
            onPress={() => handleMarkerPress(landmark)}
          />
        ))}
      </MapView>
    </View>
  );
} 