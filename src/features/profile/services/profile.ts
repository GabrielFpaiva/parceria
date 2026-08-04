import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '@/core/firebase/client';
import { INITIAL_USER_SETTINGS, INITIAL_USER_STATS } from '@shared/types';

const HANDLE_PATTERN = /^[a-z0-9._]{3,20}$/;

export class HandleTakenError extends Error {
  constructor() {
    super('Esse @ já está em uso.');
    this.name = 'HandleTakenError';
  }
}

export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, '');
}

export function validateHandle(raw: string): { ok: true } | { ok: false; reason: string } {
  const handle = normalizeHandle(raw);
  if (handle.length < 3) return { ok: false, reason: 'Use pelo menos 3 caracteres.' };
  if (handle.length > 20) return { ok: false, reason: 'Use no máximo 20 caracteres.' };
  if (!HANDLE_PATTERN.test(handle)) {
    return { ok: false, reason: 'Use apenas letras, números, ponto e underline.' };
  }
  return { ok: true };
}

export type CreateProfileInput = {
  uid: string;
  displayName: string;
  handle: string;
  avatarEmoji: string;
  timezone: string;
};

/**
 * Reivindica o handle e cria o perfil na MESMA transação.
 * A unicidade vem da semântica de `create` do Firestore: a regra proíbe update
 * em `handles/{handle}`, então a segunda transação a chegar falha sozinha.
 * A leitura abaixo (tx.get) é só para devolver um erro amigável mais cedo —
 * quem garante a unicidade de verdade é a regra de segurança, não esta leitura.
 */
export async function createProfile(input: CreateProfileInput): Promise<void> {
  const handle = normalizeHandle(input.handle);
  const handleRef = doc(db, 'handles', handle);
  const userRef = doc(db, 'users', input.uid);

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(handleRef);
    if (existing.exists()) throw new HandleTakenError();

    tx.set(handleRef, { uid: input.uid });
    tx.set(userRef, {
      uid: input.uid,
      displayName: input.displayName.trim(),
      handle,
      photoURL: null,
      avatarEmoji: input.avatarEmoji,
      timezone: input.timezone,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
      stats: INITIAL_USER_STATS,
      settings: INITIAL_USER_SETTINGS,
    });
  });
}
