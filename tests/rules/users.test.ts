import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ALICE, BOB, createTestEnv, validProfile } from './helpers';

let env: RulesTestEnvironment;

beforeAll(async () => { env = await createTestEnv(); });
afterAll(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

describe('users — permitido', () => {
  it('o dono cria o próprio perfil com stats zerados', async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    await assertSucceeds(setDoc(doc(db, 'users', ALICE), validProfile(ALICE, 'alice')));
  });

  it('o dono edita displayName', async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    await setDoc(doc(db, 'users', ALICE), validProfile(ALICE, 'alice'));
    await assertSucceeds(updateDoc(doc(db, 'users', ALICE), { displayName: 'Gabriel' }));
  });

  it('qualquer autenticado lê perfil alheio (necessário para o mapa)', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', ALICE), validProfile(ALICE, 'alice'));
    });
    const db = env.authenticatedContext(BOB).firestore();
    await assertSucceeds(getDoc(doc(db, 'users', ALICE)));
  });
});

describe('users — NEGADO', () => {
  it('anônimo não lê perfil', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'users', ALICE)));
  });

  it('não cria perfil no uid de outro', async () => {
    const db = env.authenticatedContext(BOB).firestore();
    await assertFails(setDoc(doc(db, 'users', ALICE), validProfile(ALICE, 'alice')));
  });

  it('não cria perfil com stats inflados', async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    const cheat = { ...validProfile(ALICE, 'alice'), stats: { ...validProfile(ALICE, 'a').stats, totalXParceria: 999999 } };
    await assertFails(setDoc(doc(db, 'users', ALICE), cheat));
  });

  it('não altera stats depois de criado', async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    await setDoc(doc(db, 'users', ALICE), validProfile(ALICE, 'alice'));
    await assertFails(updateDoc(doc(db, 'users', ALICE), {
      stats: { ...validProfile(ALICE, 'a').stats, totalXParceria: 500 },
    }));
  });

  it('não troca o handle por escrita direta', async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    await setDoc(doc(db, 'users', ALICE), validProfile(ALICE, 'alice'));
    await assertFails(updateDoc(doc(db, 'users', ALICE), { handle: 'outro' }));
  });

  it('não edita perfil alheio', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', ALICE), validProfile(ALICE, 'alice'));
    });
    const db = env.authenticatedContext(BOB).firestore();
    await assertFails(updateDoc(doc(db, 'users', ALICE), { displayName: 'invadido' }));
  });

  it('ninguém apaga perfil pelo cliente', async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    await setDoc(doc(db, 'users', ALICE), validProfile(ALICE, 'alice'));
    await assertFails(deleteDoc(doc(db, 'users', ALICE)));
  });
});
