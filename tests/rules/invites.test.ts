import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { Timestamp } from 'firebase/firestore';
import { ALICE, BOB, CAROL, createTestEnv } from './helpers';
import { seedInvite, seedUsers, validInvite } from './factories';

let env: RulesTestEnvironment;

beforeAll(async () => { env = await createTestEnv(); });
afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await seedUsers(env, [ALICE, BOB, CAROL]);
});

describe('invites — create', () => {
  it('PERMITE que a pessoa crie o próprio convite', async () => {
    const alice = env.authenticatedContext(ALICE).firestore();
    await assertSucceeds(alice.doc('invites/AB3D4F7H').set(validInvite(ALICE)));
  });

  it('NEGA criar convite em nome de outra pessoa', async () => {
    // Uma variável só: o fromProfile continua sendo o da Alice, então a
    // negação prova `isOwner(fromUid)` e não `matchesOwnProfile`. Trocar os
    // dois de uma vez faria o teste passar por qualquer um dos dois motivos.
    const alice = env.authenticatedContext(ALICE).firestore();
    await assertFails(alice.doc('invites/AB3D4F7H').set(validInvite(ALICE, { fromUid: BOB })));
  });

  it('NEGA forjar o displayName no fromProfile', async () => {
    // O vetor de engenharia social: convite que diz vir de outra pessoa.
    const alice = env.authenticatedContext(ALICE).firestore();
    const forged = validInvite(ALICE);
    forged.fromProfile.displayName = 'Bob';
    await assertFails(alice.doc('invites/AB3D4F7H').set(forged));
  });

  it('NEGA forjar o handle no fromProfile', async () => {
    const alice = env.authenticatedContext(ALICE).firestore();
    const forged = validInvite(ALICE);
    forged.fromProfile.handle = 'bob';
    await assertFails(alice.doc('invites/AB3D4F7H').set(forged));
  });

  it('NEGA createdAt escolhido pelo cliente', async () => {
    // Sem isso, dava para criar um convite com data futura e nunca expirar.
    const alice = env.authenticatedContext(ALICE).firestore();
    const future = Timestamp.fromMillis(Date.now() + 30 * 86_400_000);
    await assertFails(alice.doc('invites/AB3D4F7H').set(validInvite(ALICE, { createdAt: future })));
  });

  it('NEGA nascer já usado', async () => {
    const alice = env.authenticatedContext(ALICE).firestore();
    await assertFails(alice.doc('invites/AB3D4F7H').set(validInvite(ALICE, { usedBy: BOB })));
  });

  it('NEGA nascer com status accepted', async () => {
    const alice = env.authenticatedContext(ALICE).firestore();
    await assertFails(alice.doc('invites/AB3D4F7H').set(validInvite(ALICE, { status: 'accepted' })));
  });

  it('NEGA maxUses diferente de 1', async () => {
    const alice = env.authenticatedContext(ALICE).firestore();
    await assertFails(alice.doc('invites/AB3D4F7H').set(validInvite(ALICE, { maxUses: 99 })));
  });

  it('NEGA criação a quem não está autenticado', async () => {
    const anon = env.unauthenticatedContext().firestore();
    await assertFails(anon.doc('invites/AB3D4F7H').set(validInvite(ALICE)));
  });
});

describe('invites — read', () => {
  beforeEach(() => seedInvite(env, 'AB3D4F7H', validInvite(ALICE)));

  it('PERMITE ler um convite específico — é assim que o convidado vê quem o chamou', async () => {
    const bob = env.authenticatedContext(BOB).firestore();
    await assertSucceeds(bob.doc('invites/AB3D4F7H').get());
  });

  it('NEGA listar a coleção — com o código se lê um; sem ele não se varre', async () => {
    const bob = env.authenticatedContext(BOB).firestore();
    await assertFails(bob.collection('invites').get());
  });

  it('NEGA leitura a quem não está autenticado', async () => {
    await assertFails(env.unauthenticatedContext().firestore().doc('invites/AB3D4F7H').get());
  });
});

describe('invites — update', () => {
  beforeEach(() => seedInvite(env, 'AB3D4F7H', validInvite(ALICE)));

  it('PERMITE que o convidado marque como usado', async () => {
    const bob = env.authenticatedContext(BOB).firestore();
    await assertSucceeds(bob.doc('invites/AB3D4F7H').update({ usedBy: BOB, status: 'accepted' }));
  });

  it('NEGA marcar como usado em nome de outra pessoa', async () => {
    const bob = env.authenticatedContext(BOB).firestore();
    await assertFails(bob.doc('invites/AB3D4F7H').update({ usedBy: CAROL, status: 'accepted' }));
  });

  it('NEGA que o dono aceite o próprio convite', async () => {
    const alice = env.authenticatedContext(ALICE).firestore();
    await assertFails(alice.doc('invites/AB3D4F7H').update({ usedBy: ALICE, status: 'accepted' }));
  });

  it('NEGA reusar convite já aceito', async () => {
    await seedInvite(env, 'USED1234', validInvite(ALICE, { usedBy: CAROL, status: 'accepted' }));
    const bob = env.authenticatedContext(BOB).firestore();
    await assertFails(bob.doc('invites/USED1234').update({ usedBy: BOB, status: 'accepted' }));
  });

  it('NEGA mexer em qualquer campo além de usedBy e status', async () => {
    const bob = env.authenticatedContext(BOB).firestore();
    await assertFails(
      bob.doc('invites/AB3D4F7H').update({ usedBy: BOB, status: 'accepted', fromUid: BOB }),
    );
  });

  it('NEGA delete', async () => {
    const alice = env.authenticatedContext(ALICE).firestore();
    await assertFails(alice.doc('invites/AB3D4F7H').delete());
  });
});
