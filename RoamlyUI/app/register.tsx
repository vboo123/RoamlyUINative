import PaperDropdown from '@/components/PaperDropdown';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

// Types for API responses
interface OptionItem {
  label: string;
  value: string;
}

interface ApiResponse {
  status: string;
  data: OptionItem[] | string[];
  timestamp: string;
}

export default function Register() {
  const theme = useTheme();
  const { login } = useAuth();

  // State for form data
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    country: '',
    language: '',
  });

  // State for options from API
  const [countries, setCountries] = useState<OptionItem[]>([]);
  const [languages, setLanguages] = useState<OptionItem[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  
  // State for UI
  const [selectedInterest, setSelectedInterest] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Fetch options from API
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setOptionsLoading(true);
        
        // Fetch all options in parallel
        const [countriesRes, languagesRes, interestsRes] = await Promise.all([
          axios.get<ApiResponse>('https://roamlyservice.onrender.com/countries/'),
          axios.get<ApiResponse>('https://roamlyservice.onrender.com/languages/'),
          axios.get<ApiResponse>('https://roamlyservice.onrender.com/interests/')
        ]);

        // Map string arrays to { label, value } objects
        setCountries(
          (countriesRes.data.data as string[]).map((c) => ({ label: c, value: c }))
        );
        setLanguages(
          (languagesRes.data.data as string[]).map((l) => ({ label: l, value: l }))
        );
        setInterests(interestsRes.data.data as string[]);
        
      } catch (error) {
        console.error('Failed to fetch options:', error);
        setFormError('Failed to load registration options. Please try again.');
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    if (key === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailRegex.test(value) ? '' : 'Please enter a valid email');
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterest((prev) => (prev === interest ? '' : interest));
  };

  const validateForm = () => {
    // Name validation (minimum 2 characters)
    if (!form.name || form.name.trim().length < 2) {
      setFormError('Name must be at least 2 characters long');
      return false;
    }

    // Email validation
    if (!form.email || emailError) {
      setFormError('Please enter a valid email address');
      return false;
    }

    // Age validation (13-120 years)
    const age = parseInt(form.age);
    if (!form.age || isNaN(age) || age < 13 || age > 120) {
      setFormError('Age must be between 13 and 120 years');
      return false;
    }

    // Country validation
    if (!form.country) {
      setFormError('Please select a country');
      return false;
    }

    // Language validation
    if (!form.language) {
      setFormError('Please select a language');
      return false;
    }

    // Interest validation
    if (!selectedInterest) {
      setFormError('Please select one interest');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    setFormError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare payload with only the fields the endpoint accepts
      const payload = {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        age: parseInt(form.age),
        country: form.country,
        language: form.language,
        interestOne: selectedInterest,
      };

      console.log('Sending registration payload:', payload);

      const res = await axios.post('https://roamlyservice.onrender.com/register-user/', payload);

      const userWithId = { ...payload, user_id: res.data.user_id };
      await login(userWithId.name, userWithId.email);
      router.replace('/');
    } catch (err: any) {
      if (err.response) {
        const { status, data } = err.response;

        switch (status) {
          case 409:
            setFormError('An account with this email already exists. Please sign in instead.');
            break;
          case 422:
            // New error format: { detail: { message, errors: [...] } }
            if (data?.detail?.errors && Array.isArray(data.detail.errors)) {
              setFormError(
                data.detail.errors.map((e: any) => `${e.field}: ${e.msg}`).join('\n')
              );
            } else if (typeof data?.detail === 'string') {
              setFormError(data.detail);
            } else {
              setFormError('Please check your input and try again.');
            }
            break;
          case 429:
            setFormError('Too many registration attempts. Please wait a minute and try again.');
            break;
          case 500:
            setFormError('Server error. Please try again later.');
            break;
          default:
            setFormError('Registration failed. Please try again.');
        }
      } else {
        setFormError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (optionsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading registration options...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
      <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 20 }}>
        Create a Roamly Account
      </Text>

      <TextInput
        label="Name (minimum 2 characters)"
        value={form.name}
        onChangeText={(val) => handleChange('name', val)}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Email"
        value={form.email}
        onChangeText={(val) => handleChange('email', val)}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!emailError}
        style={{ marginBottom: 4 }}
      />
      {emailError ? (
        <Text style={{ color: theme.colors.error, marginBottom: 12 }}>{emailError}</Text>
      ) : null}

      <TextInput
        label="Age (13-120 years)"
        value={form.age}
        onChangeText={(val) => handleChange('age', val)}
        keyboardType="numeric"
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <PaperDropdown
        label="Country"
        value={form.country}
        onChange={(val) => handleChange('country', val)}
        options={countries}
      />
      <PaperDropdown
        label="Language"
        value={form.language}
        onChange={(val) => handleChange('language', val)}
        options={languages}
      />

      <Text style={{ marginTop: 16, marginBottom: 4 }}>Select 1 Interest</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {interests.map((interest) => (
          <Chip
            key={interest}
            mode="outlined"
            selected={selectedInterest === interest}
            onPress={() => toggleInterest(interest)}
            style={{ margin: 4 }}
          >
            {interest}
          </Chip>
        ))}
      </View>

      {formError ? (
        <Text style={{ color: theme.colors.error, marginBottom: 12 }}>{formError}</Text>
      ) : null}

      <Button
        mode="contained"
        onPress={handleRegister}
        disabled={loading}
        loading={loading}
      >
        {loading ? 'Registering...' : 'Register'}
      </Button>

      <View style={{ marginTop: 24, alignItems: 'center' }}>
        <Text>
          Already have an account?{' '}
          <Text
            onPress={() => router.replace('/sign-in')}
            style={{ color: theme.colors.primary, textDecorationLine: 'underline' }}
          >
            Log in
          </Text>
        </Text>
      </View>

      {loading && <ActivityIndicator animating={true} style={{ marginTop: 20 }} />}
    </ScrollView>
  );
}
