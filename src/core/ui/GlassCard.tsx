import { BlurView } from 'expo-blur';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { theme } from './theme';

type Props = ViewProps & { intensity?: number };

export function GlassCard({ intensity = theme.glass.intensity, style, children, ...rest }: Props) {
  return (
    <View style={[styles.wrapper, style]} {...rest}>
      <BlurView intensity={intensity} tint={theme.glass.tint} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  content: { padding: theme.space[4] },
});
