import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ALICE, BOB, CAROL, createTestEnv } from './helpers';

let env: RulesTestEnvironment;

beforeAll(async () => { env = await createTestEnv(); });
afterAll(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

describe('partnerships — só Cloud Function escreve', () => {
  it('membro lê a própria parceria', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'partnerships', `${ALICE}_${BOB}`), {
        members: [ALICE, BOB], status: 'active', xparceria: 100, level: 1,
      });
    });
    const db = env.authenticatedContext(ALICE).firestore();
    await assertSucceeds(getDoc(doc(db, 'partnerships', `${ALICE}_${BOB}`)));
  });

  it('NEGA leitura de quem não é membro', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'partnerships', `${ALICE}_${BOB}`), {
        members: [ALICE, BOB], status: 'active', xparceria: 100, level: 1,
      });
    });
    const db = env.authenticatedContext(CAROL).firestore();
    await assertFails(getDoc(doc(db, 'partnerships', `${ALICE}_${BOB}`)));
  });

  it('NEGA criação de parceria pelo cliente', async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    await assertFails(setDoc(doc(db, 'partnerships', `${ALICE}_${BOB}`), {
      members: [ALICE, BOB], status: 'active', xparceria: 0, level: 1,
    }));
  });

  it('NEGA o membro inflar o próprio XParceria', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'partnerships', `${ALICE}_${BOB}`), {
        members: [ALICE, BOB], status: 'active', xparceria: 100, level: 1,
      });
    });
    const db = env.authenticatedContext(ALICE).firestore();
    await assertFails(updateDoc(doc(db, 'partnerships', `${ALICE}_${BOB}`), { xparceria: 999999 }));
  });

  it('NEGA leitura de subcoleção por quem não é membro', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const fs = ctx.firestore();
      await setDoc(doc(fs, 'partnerships', `${ALICE}_${BOB}`), { members: [ALICE, BOB], status: 'active' });
      await setDoc(doc(fs, 'partnerships', `${ALICE}_${BOB}`, 'days', '2026-08-04'), { date: '2026-08-04' });
    });
    const db = env.authenticatedContext(CAROL).firestore();
    await assertFails(getDoc(doc(db, 'partnerships', `${ALICE}_${BOB}`, 'days', '2026-08-04')));
  });

  it('NEGA anônimo ler parceria', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'partnerships', `${ALICE}_${BOB}`), {
        members: [ALICE, BOB], status: 'active', xparceria: 100, level: 1,
      });
    });
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'partnerships', `${ALICE}_${BOB}`)));
  });
});

describe('presence — visibleTo é a única porta', () => {
  it('parceiro em visibleTo lê a localização', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'presence', ALICE), { uid: ALICE, visibleTo: [BOB] });
    });
    const db = env.authenticatedContext(BOB).firestore();
    await assertSucceeds(getDoc(doc(db, 'presence', ALICE)));
  });

  it('NEGA quem não está em visibleTo — sem parceria, a localização não existe', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'presence', ALICE), { uid: ALICE, visibleTo: [BOB] });
    });
    const db = env.authenticatedContext(CAROL).firestore();
    await assertFails(getDoc(doc(db, 'presence', ALICE)));
  });

  it('NEGA escrever a localização de outro', async () => {
    const db = env.authenticatedContext(BOB).firestore();
    await assertFails(setDoc(doc(db, 'presence', ALICE), { uid: ALICE, visibleTo: [BOB] }));
  });

  it('NEGA um estranho se adicionar ao visibleTo alheio', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'presence', ALICE), { uid: ALICE, visibleTo: [] });
    });
    const db = env.authenticatedContext(CAROL).firestore();
    await assertFails(updateDoc(doc(db, 'presence', ALICE), { visibleTo: [CAROL] }));
  });

  it('o dono escreve a própria localização', async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    await assertSucceeds(setDoc(doc(db, 'presence', ALICE), { uid: ALICE, visibleTo: [] }));
  });

  // ⭐ O teste mais importante do produto: nem o DONO pode mexer no próprio visibleTo.
  // Sem ele, `allow update: if isOwner(uid)` sozinho passaria na suíte inteira — e
  // qualquer um se adicionaria à própria lista de visibilidade para ler quem quisesse.
  it('NEGA o próprio dono alterar o próprio visibleTo', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'presence', ALICE), { uid: ALICE, visibleTo: [] });
    });
    const db = env.authenticatedContext(ALICE).firestore();
    await assertFails(updateDoc(doc(db, 'presence', ALICE), { visibleTo: [CAROL] }));
  });

  it('permite o dono atualizar a localização mantendo o visibleTo', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'presence', ALICE), { uid: ALICE, visibleTo: [BOB] });
    });
    const db = env.authenticatedContext(ALICE).firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'presence', ALICE), { visibleTo: [BOB], isStale: false }),
    );
  });

  it('NEGA anônimo ler presença', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'presence', ALICE), { uid: ALICE, visibleTo: [BOB] });
    });
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'presence', ALICE)));
  });
});
