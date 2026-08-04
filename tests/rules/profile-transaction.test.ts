import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { ALICE, BOB, createTestEnv, validProfile } from './helpers';

// `.firestore()' devolve o tipo compat (`firebase.firestore.Firestore`), não o
// `Firestore` modular de `firebase/firestore`. Passar direto pra `doc()`/
// `runTransaction()` funciona (é o que os outros arquivos de teste fazem
// inline), mas anotar o parâmetro de uma função com o `Firestore` importado
// explicitamente quebra o tsc — duas identidades nominais de módulos @firebase
// duplicados. Derivar o tipo por `ReturnType` em vez de importar evita o problema.
type TestFirestore = ReturnType<ReturnType<RulesTestEnvironment['authenticatedContext']>['firestore']>;

let env: RulesTestEnvironment;

beforeAll(async () => { env = await createTestEnv(); });
afterAll(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

/**
 * Espelha createProfile() sem depender do cliente do app (que importa expo-*).
 *
 * Sem o `tx.get` de pré-checagem que `createProfile()` usa para uma mensagem de
 * erro mais amigável: aqui queremos exercitar a garantia de verdade, que é a
 * regra de segurança negando `update` em `handles/{handle}` já existente — não
 * um `throw` local. Com a pré-checagem, a segunda reivindicação falharia por um
 * `Error` genérico do cliente antes mesmo de chegar na regra, e `assertFails`
 * (que exige especificamente PERMISSION_DENIED) nunca veria a negação real.
 */
async function claim(db: TestFirestore, uid: string, handle: string) {
  return runTransaction(db, async (tx) => {
    tx.set(doc(db, 'handles', handle), { uid });
    tx.set(doc(db, 'users', uid), validProfile(uid, handle));
  });
}

it('a primeira reivindicação cria handle e perfil juntos', async () => {
  const db = env.authenticatedContext(ALICE).firestore();
  await assertSucceeds(claim(db, ALICE, 'gabriel'));

  await env.withSecurityRulesDisabled(async (ctx) => {
    const handleDoc = await getDoc(doc(ctx.firestore(), 'handles', 'gabriel'));
    const userDoc = await getDoc(doc(ctx.firestore(), 'users', ALICE));
    expect(handleDoc.data()).toEqual({ uid: ALICE });
    expect(userDoc.data()?.handle).toBe('gabriel');
  });
});

it('a segunda reivindicação do mesmo handle falha', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'handles', 'gabriel'), { uid: ALICE });
  });
  const db = env.authenticatedContext(BOB).firestore();
  await assertFails(claim(db, BOB, 'gabriel'));
});

it('perfil do BOB não é criado quando o handle falha', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'handles', 'gabriel'), { uid: ALICE });
  });
  const db = env.authenticatedContext(BOB).firestore();
  await claim(db, BOB, 'gabriel').catch(() => undefined);

  await env.withSecurityRulesDisabled(async (ctx) => {
    const userDoc = await getDoc(doc(ctx.firestore(), 'users', BOB));
    expect(userDoc.exists()).toBe(false);
  });
});
