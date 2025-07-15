import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Property {
  landmarkName: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  geohash: string;
  responses: Record<string, string>;
}

interface LandmarkContextType {
  properties: Property[];
  loading: boolean;
  error: string | null;
  userLocation: { latitude: number; longitude: number } | null;
  refreshLandmarks: () => Promise<void>;
}

const LandmarkContext = createContext<LandmarkContextType>({
  properties: [],
  loading: false,
  error: null,
  userLocation: null,
  refreshLandmarks: async () => {},
});

export const LandmarkProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchLandmarks = async (forceRefresh = false) => {
    // Don't fetch if we have recent data (within 5 minutes) unless forced
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (!forceRefresh && properties.length > 0 && (now - lastFetchTime) < fiveMinutes) {
      console.log('📍 Using cached landmark data');
      return;
    }

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
      setLoading(true);
      setError(null);

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
      setUserLocation({ latitude, longitude });

      console.log('📍 Fetching landmarks for location:', { latitude, longitude });

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

      console.log('✅ Landmarks fetched:', response.data.properties?.length || 0, 'landmarks');
      setProperties(response.data.properties || []);
      setLastFetchTime(now);
      
    } catch (err) {
      console.error('❌ Failed to fetch landmarks', err);
      setError('Failed to fetch landmarks. Please try again.');
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const refreshLandmarks = async () => {
    await fetchLandmarks(true);
  };

  useEffect(() => {
    if (user && !isInitialized) {
      fetchLandmarks();
    }
  }, [user, isInitialized]);

  return (
    <LandmarkContext.Provider 
      value={{ 
        properties, 
        loading, 
        error, 
        userLocation, 
        refreshLandmarks 
      }}
    >
      {children}
    </LandmarkContext.Provider>
  );
};

export const useLandmarks = () => {
  const context = useContext(LandmarkContext);
  if (!context) {
    throw new Error('useLandmarks must be used within a LandmarkProvider');
  }
  return context;
}; 