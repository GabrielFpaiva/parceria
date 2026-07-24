import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { bandForTemperature } from '@shared/temperature';
import { ProgressRing } from './ProgressRing';
import { theme } from './theme';

type Props = {
  photoURL: string | null;
  fallbackEmoji: string;
  size?: number;
  temperature?: number;
};

export function Avatar({ photoURL, fallbackEmoji, size = 48, temperature }: Props) {
  const inner = (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      {photoURL !== null
        ? <Image source={{ uri: photoURL }} style={StyleSheet.absoluteFill} contentFit="cover" />
        : <Text style={{ fontSize: size * 0.5 }}>{fallbackEmoji}</Text>}
    </View>
  );

  if (temperature === undefined) return inner;

  const band = bandForTemperature(temperature);
  return (
    <View accessibilityLabel={`Parceria ${band.label.toLowerCase()}`}>
      <ProgressRing progress={temperature / 100} color={band.color} size={size + 10}>
        {inner}
      </ProgressRing>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.paper[100],
  },
});
