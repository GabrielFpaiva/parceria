// `profile.ts` importa `firebase/firestore` (ESM) e o client real do Firebase.
// Como este arquivo só testa as funções puras de handle, mockamos as duas
// dependências — mesmo padrão de `AuthProvider.test.tsx` — para não pagar o
// custo (e o erro de parse) de carregar o SDK de verdade.
jest.mock('@/core/firebase/client', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  runTransaction: jest.fn(),
  serverTimestamp: jest.fn(),
}));

import { normalizeHandle, validateHandle } from '../services/profile';

describe('normalizeHandle', () => {
  it.each([
    ['Gabriel', 'gabriel'],
    ['  G7  ', 'g7'],
    ['@gabriel', 'gabriel'],
    ['Gabriel.Paiva', 'gabriel.paiva'],
  ])('normaliza %s em %s', (input, expected) => {
    expect(normalizeHandle(input)).toBe(expected);
  });
});

describe('validateHandle', () => {
  // 'g7' (2 chars) foi corrigido para 'g7a' (3 chars): o brief original listava
  // 'g7' como aceito e 'ab' (mesmo tamanho) como recusado por "curto demais" —
  // contraditório com HANDLE_PATTERN {3,20}. Mantém a intenção (dígito no handle).
  it.each(['gabriel', 'g7a', 'gabriel_paiva', 'ab1'])('aceita %s', (h) => {
    expect(validateHandle(h).ok).toBe(true);
  });

  it.each([
    ['ab', 'curto demais'],
    ['a'.repeat(21), 'longo demais'],
    ['gabriel paiva', 'espaço'],
    ['gabriel!', 'caractere inválido'],
    ['', 'vazio'],
  ])('recusa %s (%s)', (h) => {
    expect(validateHandle(h).ok).toBe(false);
  });

  it('devolve motivo em português quando recusa', () => {
    const result = validateHandle('ab');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/[a-záéíóúâêôãõç]/i);
  });
});
