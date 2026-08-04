import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ALICE, BOB, createTestEnv } from './helpers';

let env: RulesTestEnvironment;

beforeAll(async () => { env = await createTestEnv(); });
afterAll(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

it('reivindica um handle livre apontando para si', async () => {
  const db = env.authenticatedContext(ALICE).firestore();
  await assertSucceeds(setDoc(doc(db, 'handles', 'gabriel'), { uid: ALICE }));
});

it('qualquer autenticado consulta disponibilidade', async () => {
  const db = env.authenticatedContext(BOB).firestore();
  await assertSucceeds(getDoc(doc(db, 'handles', 'gabriel')));
});

it('NEGA reivindicar handle apontando para outro uid', async () => {
  const db = env.authenticatedContext(BOB).firestore();
  await assertFails(setDoc(doc(db, 'handles', 'gabriel'), { uid: ALICE }));
});

it('NEGA roubar handle já reivindicado', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'handles', 'gabriel'), { uid: ALICE });
  });
  const db = env.authenticatedContext(BOB).firestore();
  await assertFails(setDoc(doc(db, 'handles', 'gabriel'), { uid: BOB }));
  await assertFails(updateDoc(doc(db, 'handles', 'gabriel'), { uid: BOB }));
  await assertFails(deleteDoc(doc(db, 'handles', 'gabriel')));
});

it('NEGA anônimo reivindicar', async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(setDoc(doc(db, 'handles', 'gabriel'), { uid: ALICE }));
});
