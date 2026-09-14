import { Stack, Redirect, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { configureApiAuthToken } from '@/lib/api-client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootLayoutContent() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
  configureApiAuthToken(() => session?.access_token ?? null);
  }, [session]);

  if (loading) return null;

  const inLoginScreen = segments[0] === 'login';

  if (!session && !inLoginScreen) {
    return <Redirect href="/login" />;
  }

  if (session && inLoginScreen) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}