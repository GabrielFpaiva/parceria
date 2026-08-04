import { StyleSheet, Text, View } from 'react-native';
import { xpForNextLevel } from '@shared/level';
import { theme } from './theme';

type Props = { level: number; xpIntoLevel: number };

export function XParceriaBar({ level, xpIntoLevel }: Props) {
  const target = xpForNextLevel(level);
  const progress = Math.min(1, Math.max(0, xpIntoLevel / target));

  return (
    <View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Progresso de XParceria"
        accessibilityValue={{ min: 0, max: target, now: xpIntoLevel }}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.label}>{`${xpIntoLevel} / ${target} XParceria`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.ink[100],
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: theme.colors.brand[500] },
  label: {
    marginTop: theme.space[2],
    fontSize: theme.type.caption.fontSize,
    color: theme.colors.ink[500],
    fontVariant: theme.type.title.fontVariant,
  },
});
