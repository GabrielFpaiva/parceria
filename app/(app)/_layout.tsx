import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/core/auth/useAuth';
import { useProfile } from '@/features/profile/hooks/useProfile';

// Guarda de sessão + guarda de perfil: sem perfil criado, não entra no app.
export default function AppLayout() {
  const { status, user } = useAuth();
  const profile = useProfile(user?.uid ?? null);

  if (status === 'loading' || (status === 'signedIn' && profile.isLoading)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (status === 'signedOut') return <Redirect href="/sign-in" />;
  if (profile.data === null) return <Redirect href="/profile-setup" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
