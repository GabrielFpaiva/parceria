import { LEVEL } from './constants';

/** XParceria necessário para sair do nível informado. */
export function xpForNextLevel(level: number): number {
  return LEVEL.BASE + LEVEL.SLOPE * level;
}

/** XParceria acumulado necessário para ter atingido o nível informado. */
export function totalXpForLevel(level: number): number {
  const n = level - 1;
  return LEVEL.BASE * n + (LEVEL.SLOPE * n * (n + 1)) / 2;
}
