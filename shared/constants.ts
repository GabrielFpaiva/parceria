export const LEVEL = {
  BASE: 100,
  SLOPE: 22,
} as const;

export const XP = {
  DAILY_DIGITAL_CAP: 15,
  OPEN_APP: 3,
  EMOJI_SENT: 6,
  EMOJI_RECIPROCAL: 6,
  ENCOUNTER_BASE: 60,
  ENCOUNTER_PER_MINUTE: 1,
  ENCOUNTER_MAX_MINUTES: 240,
  ENCOUNTER_CAP: 300,
  DAILY_ENCOUNTER_CAP: 500,
  ENCOUNTER_COOLDOWN_HOURS: 6,
  PARTNERSHIP_BORN: 100,
  CHALLENGE_RESCUE: 500,
  ANNIVERSARY: 365,
} as const;

export const TEMPERATURE = {
  MIN: 0,
  MAX: 100,
  INITIAL: 50,
  /** Interação digital sozinha nunca passa daqui — só encontro real. */
  DIGITAL_CEILING: 70,
  /** Toda aresta precisa disso para nascer uma Super Parceria. */
  SUPER_PARTNERSHIP_THRESHOLD: 75,
  DECAY_PER_DAY: 1.5,
  DECAY_HIBERNATING: 0.5,
} as const;

export const TEMPERATURE_BANDS = [
  { id: 'burning', min: 85, emoji: '🔥', label: 'Em chamas', color: '#FF4D4D' },
  { id: 'warm', min: 60, emoji: '☀️', label: 'Aquecida', color: '#FF9A3C' },
  { id: 'mild', min: 35, emoji: '🌤', label: 'Morna', color: '#FFD166' },
  { id: 'cooling', min: 15, emoji: '🌧', label: 'Esfriando', color: '#7CC4FF' },
  { id: 'hibernating', min: 0, emoji: '❄️', label: 'Hibernando', color: '#B8C4D9' },
] as const;
