import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Avatar } from '@/core/ui/Avatar';
import { Button } from '@/core/ui/Button';
import { theme } from '@/core/ui/theme';
import { useAuth } from '@/core/auth/useAuth';
import { HandleTakenError, createProfile, validateHandle } from './services/profile';

const EMOJIS = ['🦊', '🐻', '🐼', '🦁', '🐸', '🐧', '🦉', '🐙'];

export function ProfileSetupScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState(EMOJIS[0]!);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (user === null) return;
    const check = validateHandle(handle);
    if (!check.ok) { setError(check.reason); return; }
    if (displayName.trim() === '') { setError('Como a gente te chama?'); return; }

    setBusy(true);
    setError(null);
    try {
      await createProfile({
        uid: user.uid,
        displayName,
        handle,
        avatarEmoji,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      await queryClient.invalidateQueries({ queryKey: ['user', user.uid] });
      router.replace('/');
    } catch (e) {
      setError(e instanceof HandleTakenError ? e.message : 'Algo deu errado. Tenta de novo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quem é você por aqui?</Text>
      <View style={styles.avatarRow}>
        {EMOJIS.map((emoji) => (
          <View key={emoji} onTouchEnd={() => setAvatarEmoji(emoji)}>
            <Avatar
              photoURL={null}
              fallbackEmoji={emoji}
              size={emoji === avatarEmoji ? 56 : 44}
            />
          </View>
        ))}
      </View>
      <TextInput
        accessibilityLabel="Nome"
        placeholder="Seu nome"
        value={displayName}
        onChangeText={setDisplayName}
        style={styles.input}
      />
      <TextInput
        accessibilityLabel="Apelido"
        placeholder="@seuapelido"
        autoCapitalize="none"
        value={handle}
        onChangeText={setHandle}
        style={styles.input}
      />
      {error !== null && <Text style={styles.error}>{error}</Text>}
      <Button label="Continuar" onPress={() => void submit()} loading={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: theme.space[5], gap: theme.space[3] },
  // Campos explícitos em vez de `...theme.type.title`: espalhar o token inteiro quebra o
  // tsc, porque `fontWeight` vem como `string` e não como o literal que TextStyle exige.
  title: {
    fontSize: theme.type.title.fontSize,
    fontWeight: '700',
    color: theme.colors.ink[900],
    marginBottom: theme.space[4],
  },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2], marginBottom: theme.space[4] },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.paper[100],
    paddingHorizontal: theme.space[4],
    fontSize: theme.type.body.fontSize,
  },
  error: { color: theme.colors.danger, fontSize: theme.type.caption.fontSize },
});
