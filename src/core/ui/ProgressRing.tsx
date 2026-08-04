import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

type Props = {
  progress: number;       // 0..1
  color: string;
  size: number;
  strokeWidth?: number;
  children?: ReactNode;
};

/**
 * Anel simples por borda. A versão animada com SVG entra na Spec 3,
 * quando o mapa precisar dela — YAGNI até lá.
 */
export function ProgressRing({ progress, color, size, strokeWidth = 3, children }: Props) {
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <View
      style={[
        styles.ring,
        {
          width: size, height: size, borderRadius: size / 2,
          borderWidth: strokeWidth, borderColor: color,
          opacity: 0.35 + clamped * 0.65,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { alignItems: 'center', justifyContent: 'center' },
});
