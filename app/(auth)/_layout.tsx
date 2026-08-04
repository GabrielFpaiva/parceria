import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/core/auth/useAuth';
import { useProfile } from '@/features/profile/hooks/useProfile';

// Só manda pra "/" quando o perfil já existe: sem essa checagem, quem chega
// aqui via /profile-setup (perfil ainda não criado) seria jogado de volta
// para "/" por este guard — que o guard de perfil em (app)/_layout manda de
// volta pra cá, formando um loop entre os dois layouts.
export default function AuthLayout() {
  const { status, user } = useAuth();
  const profile = useProfile(user?.uid ?? null);
  if (status === 'signedIn' && profile.data != null) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
