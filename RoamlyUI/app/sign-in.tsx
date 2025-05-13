// app/sign-in.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  useTheme
} from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';

export default function SignIn() {
  const { login, loading } = useAuth();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    setEmailError(isValid ? '' : 'Please enter a valid email');
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) return;
    try {
      await login(name, email);
      router.replace('/');
    } catch {
      setLoginError('Login failed. Please check your credentials.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 20, textAlign: 'center' }}>
        Sign In to Roamly
      </Text>

      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={{ marginBottom: 16 }}
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          validateEmail(value);
        }}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!emailError}
        style={{ marginBottom: 4 }}
      />
      {emailError ? <Text style={{ color: theme.colors.error, marginBottom: 12 }}>{emailError}</Text> : null}

      {loginError ? <Text style={{ color: theme.colors.error, marginBottom: 12 }}>{loginError}</Text> : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading || !name || !email || !!emailError}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>

      {loading && <ActivityIndicator animating={true} style={{ marginTop: 20 }} />}
    </View>
  );
}
