import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from './theme';

type Variant = 'primary' | 'glass' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
};

const BACKGROUND: Record<Variant, string> = {
  primary: theme.colors.brand[500],
  glass: 'rgba(255,255,255,0.6)',
  ghost: 'transparent',
  danger: theme.colors.danger,
};

const FOREGROUND: Record<Variant, string> = {
  primary: theme.colors.paper[0],
  glass: theme.colors.ink[900],
  ghost: theme.colors.ink[700],
  danger: theme.colors.paper[0],
};

export function Button({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  const blocked = disabled === true || loading === true;

  function handlePress() {
    if (blocked) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked, busy: loading === true }}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: BACKGROUND[variant], opacity: blocked ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading === true
        ? <ActivityIndicator color={FOREGROUND[variant]} />
        : <Text style={[styles.label, { color: FOREGROUND[variant] }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space[5],
  },
  label: { fontSize: theme.type.callout.fontSize, fontWeight: '600' },
});
