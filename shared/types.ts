import type { TEMPERATURE_BANDS } from './constants';

export type TemperatureBandId = (typeof TEMPERATURE_BANDS)[number]['id'];
export type TemperatureBand = (typeof TEMPERATURE_BANDS)[number];

export type PartnershipStatus =
  | 'pending' | 'active' | 'hibernating' | 'paused' | 'ended';

export interface UserStats {
  partnershipCount: number;
  totalXParceria: number;
  totalEncounters: number;
  daysUsing: number;
  strongestPartnershipId: string | null;
}

export interface UserSettings {
  shareLocation: boolean;
  ritualHour: number;
  notifications: { ritual: boolean; challenges: boolean; encounters: boolean };
}

export interface UserDoc {
  uid: string;
  displayName: string;
  handle: string;
  photoURL: string | null;
  avatarEmoji: string;
  timezone: string;
  createdAt: unknown; // Timestamp — o tipo concreto difere entre SDK e admin
  lastActiveAt: unknown;
  stats: UserStats;
  settings: UserSettings;
}

export const INITIAL_USER_STATS: UserStats = {
  partnershipCount: 0,
  totalXParceria: 0,
  totalEncounters: 0,
  daysUsing: 0,
  strongestPartnershipId: null,
};

export const INITIAL_USER_SETTINGS: UserSettings = {
  shareLocation: true,
  ritualHour: 19,
  notifications: { ritual: true, challenges: true, encounters: true },
};
