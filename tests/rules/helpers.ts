import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';

export const ALICE = 'alice-uid';
export const BOB = 'bob-uid';
export const CAROL = 'carol-uid';

export async function createTestEnv(): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId: 'parceria-rules-test',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
}

// Duplicado de propósito em relação a shared/types.ts (INITIAL_USER_STATS) e
// à função zeroStats() em firestore.rules: os três precisam bater
// exatamente. Se alguém mudar um sem os outros, o teste de criação de
// perfil quebra — isso é o comportamento desejado, não um bug.
export const INITIAL_STATS = {
  partnershipCount: 0,
  totalXParceria: 0,
  totalEncounters: 0,
  daysUsing: 0,
  strongestPartnershipId: null,
};

export function validProfile(uid: string, handle: string) {
  return {
    uid,
    displayName: 'Alguém',
    handle,
    photoURL: null,
    avatarEmoji: '🦊',
    timezone: 'America/Sao_Paulo',
    stats: INITIAL_STATS,
    settings: {
      shareLocation: true,
      ritualHour: 19,
      notifications: { ritual: true, challenges: true, encounters: true },
    },
  };
}
