import type { TextStyle } from 'react-native';
import { TEMPERATURE_BANDS } from '@shared/constants';
import type { TemperatureBandId } from '@shared/types';

const tempColors = Object.fromEntries(
  TEMPERATURE_BANDS.map((b) => [b.id, b.color]),
) as Record<TemperatureBandId, string>;

// Sem `as const`: um array readonly não é atribuível a TextStyle['fontVariant'],
// e o erro só apareceria lá na frente, ao espalhar o token dentro de StyleSheet.
const numeric: { fontVariant: TextStyle['fontVariant'] } = {
  fontVariant: ['tabular-nums'],
};

export const theme = {
  colors: {
    ink:   { 900: '#0A0A0B', 700: '#2E2E33', 500: '#6B6B75', 300: '#A8A8B3', 100: '#E8E8ED' },
    paper: { 0: '#FFFFFF', 50: '#FAFAFC', 100: '#F4F4F7' },
    brand: { 600: '#4A3AFF', 500: '#5B4BFF', 400: '#7C6FFF', 100: '#EDEBFF' },
    temp: tempColors,
    success: '#22C55E', warning: '#F59E0B', danger: '#EF4444',
  },
  type: {
    display:  { fontSize: 34, fontWeight: '700', letterSpacing: -0.5, ...numeric },
    title:    { fontSize: 24, fontWeight: '700', letterSpacing: -0.3, ...numeric },
    headline: { fontSize: 18, fontWeight: '600', ...numeric },
    body:     { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    callout:  { fontSize: 15, fontWeight: '500' },
    caption:  { fontSize: 13, fontWeight: '500' },
    micro:    { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  },
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64],
  radius: { sm: 8, md: 12, lg: 20, xl: 28, sheet: 32, full: 9999 },
  glass: { intensity: 60, tint: 'light' as const, border: 'rgba(255,255,255,0.35)' },
  motion: {
    duration: { instant: 120, fast: 200, base: 300, slow: 500, ceremony: 2400 },
    spring: {
      gentle: { damping: 20, stiffness: 180 },
      bouncy: { damping: 12, stiffness: 220 },
    },
  },
};
