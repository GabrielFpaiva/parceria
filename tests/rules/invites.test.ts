import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ALICE, BOB, createTestEnv } from './helpers';

let env: RulesTestEnvironment;

beforeAll(async () => { env = await createTestEnv(); });
afterAll(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

function invite(fromUid: string) {
  return {
    code: 'ABC12345',
    fromUid,
    fromProfile: { displayName: 'Alguém', photoURL: null },
    status: 'pending',
    maxUses: 1,
    usedBy: null,
  };
}

it('cria convite em nome próprio', async () => {
  const db = env.authenticatedContext(ALICE).firestore();
  await assertSucceeds(setDoc(doc(db, 'invites', 'ABC12345'), invite(ALICE)));
});

it('NEGA criar convite em nome de outro', async () => {
  const db = env.authenticatedContext(BOB).firestore();
  await assertFails(setDoc(doc(db, 'invites', 'ABC12345'), invite(ALICE)));
});

it('autenticado lê convite (precisa disso para aceitar)', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'invites', 'ABC12345'), invite(ALICE));
  });
  const db = env.authenticatedContext(BOB).firestore();
  await assertSucceeds(getDoc(doc(db, 'invites', 'ABC12345')));
});

it('NEGA anônimo ler convite', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'invites', 'ABC12345'), invite(ALICE));
  });
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, 'invites', 'ABC12345')));
});

it('NEGA marcar convite como usado pelo cliente', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'invites', 'ABC12345'), invite(ALICE));
  });
  const db = env.authenticatedContext(BOB).firestore();
  await assertFails(updateDoc(doc(db, 'invites', 'ABC12345'), { usedBy: BOB, status: 'accepted' }));
});

it('NEGA apagar convite', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'invites', 'ABC12345'), invite(ALICE));
  });
  const db = env.authenticatedContext(ALICE).firestore();
  await assertFails(deleteDoc(doc(db, 'invites', 'ABC12345')));
});
