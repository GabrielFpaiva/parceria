import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/core/auth/useAuth';

// Guarda de sessão apenas. A checagem de perfil (useProfile) entra na Task 8.
export default function AppLayout() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (status === 'signedOut') return <Redirect href="/sign-in" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
