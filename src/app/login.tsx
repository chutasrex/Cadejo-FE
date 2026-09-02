import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Login failed', error.message);
      return;
    }

    router.replace('/home');
  }

  async function signUp() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      Alert.alert('Check your email to confirm your account');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.loginCard}>
        <Text style={styles.title}>Welcome back</Text>

        <Text style={styles.subtitle}>
          Sign in to continue
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#777"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#777"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={signIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
          onPress={signUp}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>
            Create Account
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  loginCard: {
    width: '100%',
    maxWidth: 420,
    gap: 14,
  },

  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },

  subtitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 20,
  },

  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  button: {
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 8,
  },

  buttonPressed: {
    backgroundColor: '#6d28d9',
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#8b5cf6',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 15,
  },

  secondaryButtonPressed: {
    backgroundColor: '#1a1028',
    transform: [{ scale: 0.98 }],
  },

  secondaryButtonText: {
    color: '#a78bfa',
    fontSize: 16,
    fontWeight: '600',
  },
});