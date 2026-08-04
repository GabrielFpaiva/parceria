import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/core/ui/Button';
import { theme } from '@/core/ui/theme';
import { useAuth } from '@/core/auth/useAuth';
import { authErrorMessage } from '@/core/firebase/errors';

export function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (email.trim() === '' || password === '') return;
    setBusy(true);
    setError(null);
    try {
      await (mode === 'signIn' ? signIn(email, password) : signUp(email, password));
    } catch (e) {
      setError(authErrorMessage((e as { code?: string }).code ?? ''));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Toda amizade tem uma história.</Text>
      <TextInput
        accessibilityLabel="E-mail"
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        accessibilityLabel="Senha"
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      {error !== null && <Text style={styles.error}>{error}</Text>}
      <Button
        label={mode === 'signIn' ? 'Entrar' : 'Criar conta'}
        onPress={() => void submit()}
        loading={busy}
      />
      <Button
        label={mode === 'signIn' ? 'Ainda não tenho conta' : 'Já tenho conta'}
        variant="ghost"
        onPress={() => { setMode(mode === 'signIn' ? 'signUp' : 'signIn'); setError(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: theme.space[5], gap: theme.space[3] },
  // `fontWeight` não vem espalhado do theme: `theme.type.title.fontWeight` é
  // tipado como `string` (sem `as const`), incompatível com o union estrito de
  // TextStyle. Mesmo padrão já usado em Button.tsx e XParceriaBar.tsx.
  title: {
    fontSize: theme.type.title.fontSize,
    fontWeight: '700',
    letterSpacing: theme.type.title.letterSpacing,
    color: theme.colors.ink[900],
    marginBottom: theme.space[4],
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.paper[100],
    paddingHorizontal: theme.space[4],
    fontSize: theme.type.body.fontSize,
  },
  error: { color: theme.colors.danger, fontSize: theme.type.caption.fontSize },
});
