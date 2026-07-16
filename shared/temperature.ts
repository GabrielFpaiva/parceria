import { TEMPERATURE, TEMPERATURE_BANDS } from './constants';
import type { TemperatureBand } from './types';

export function clampTemperature(value: number): number {
  return Math.min(TEMPERATURE.MAX, Math.max(TEMPERATURE.MIN, value));
}

/** TEMPERATURE_BANDS está ordenado do maior `min` para o menor. */
export function bandForTemperature(temp: number): TemperatureBand {
  const value = clampTemperature(temp);
  const band = TEMPERATURE_BANDS.find((b) => value >= b.min);
  // O último elemento tem min = 0, então sempre há correspondência.
  return band ?? TEMPERATURE_BANDS[TEMPERATURE_BANDS.length - 1]!;
}
