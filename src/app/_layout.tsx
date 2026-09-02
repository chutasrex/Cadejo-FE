import { Stack, Redirect, useSegments } from 'expo-router';
import { useSession } from '@/hooks/useSession';

export default function RootLayout() {
  const { session, loading } = useSession();
  const segments = useSegments();

  if (loading) return null; // or a splash/loading screen

  const inLoginScreen = segments[0] === 'login';

  if (!session && !inLoginScreen) {
    return <Redirect href="/login" />;
  }
  if (session && inLoginScreen) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}