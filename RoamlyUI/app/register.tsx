import PaperDropdown from '@/components/PaperDropdown';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

const countries = [
  { label: 'United States', value: 'United States' },
  { label: 'India', value: 'India' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Mexico', value: 'Mexico' },
];

const languages = [
  { label: 'English', value: 'English' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'Hindi', value: 'Hindi' },
];

const interests = [
  'Nature',
  'History',
  'Food',
  'Museums',
  'Adventure',
  'Beaches',
  'Architecture',
  'Fitness',
  'Travel',
  'Technology',
];

export default function Register() {
  const theme = useTheme();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    country: '',
    language: '',
  });

  const [selectedInterest, setSelectedInterest] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleRegister = async () => {
    setFormError('');

    if (!form.name || !form.email || !form.country || !form.language || !form.age) {
      setFormError('Please fill out all fields');
      return;
    }

    if (emailError) {
      setFormError('Fix the email field before proceeding');
      return;
    }

    if (!selectedInterest) {
      setFormError('Please select one interest');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        email: form.email.toLowerCase().trim(),
        country: form.country,
        language: form.language,
        age: form.age,
        interestOne: selectedInterest,
      };

      console.log(payload);

      const res = await axios.post('https://roamlyservice.onrender.com/register-user/', payload);

      const userWithId = { ...payload, user_id: res.data.user_id };
      await login(userWithId.name, userWithId.email);
      router.replace('/');
    } catch (err) {
      console.error(err);
      setFormError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
      <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 20 }}>
        Create a Roamly Account
      </Text>

      <TextInput
        label="Name"
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
        label="Age"
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
