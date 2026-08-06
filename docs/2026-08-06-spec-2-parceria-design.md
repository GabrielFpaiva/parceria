---
date: "2026-08-06"
type: spec
spec: 2
title: "Spec 2 — Parceria"
depends_on: "Spec 1 (Fundação)"
status: approved
---

# Spec 2 — Parceria

Convite, aceite, nascimento e ciclo de vida. Depende da Spec 1 (auth, perfil, design
system, security rules) e é pré-requisito das Specs 3 (mapa) e 4 (progressão).

Referência: `docs/2026-08-03-parceria-design.md`, §4 (Atos I e II), §5, §6, §7, §19.

---

## 1. O que esta spec entrega

| # | Entrega |
|---|---|
| 1 | `createInvite` — código de 8 caracteres, 7 dias, uso único |
| 2 | Landing estática no Firebase Hosting, com preview rico para o WhatsApp |
| 3 | Onboarding com primeiro convite (Ato I) e tela de espera com preview animado |
| 4 | Entrada por código no app + `previewInvite` |
| 5 | `acceptInvite` — nascimento atômico da parceria |
| 6 | Cerimônia de nascimento, simultânea nos dois aparelhos |
| 7 | Lista de parcerias e visão geral da parceria |
| 8 | `pausePartnership`, `resumePartnership`, `endPartnership` |
| 9 | `onUserProfileWrite` — propagação de `memberProfiles` |
| 10 | Ponte `onSnapshot → React Query` (`useFirestoreDoc` / `useFirestoreCollection`) |
| 11 | Extensão da suíte de negação das rules + suíte de fraude das callables |

### Fora de escopo

| Item | Onde entra |
|---|---|
| Hibernação (`hibernating`) | Spec 4 — depende do motor de temperatura |
| Mapa, marcadores, escrita de localização | Spec 3 |
| Emoji diário, handshake de encontro, timeline visual | Spec 4 |
| Catálogo de conquistas | Spec 5 |
| Job agendado (decaimento, limpeza de convites) | Spec 4 |
| Push remota | V1 (dev build) |

---

## 2. Decisões que se afastam do documento de produto

Três, todas verificadas contra documentação oficial antes de virarem decisão.

### 2.1 `pending` não existe como documento de parceria

O §5 desenha `PENDING → ACTIVE`, mas o `pid` é `[uidA, uidB].sort().join('_')` e o
segundo uid só existe no instante do aceite. Não há documento a criar antes disso.

**O `invites/{code}` é o estado pendente.** A parceria nasce já `active`, e `'pending'`
sai do union `PartnershipStatus` em `shared/types.ts`. Efeito colateral bem-vindo:
convite nunca aceito não deixa parceria fantasma para limpar.

### 2.2 Deep link deixa de ser o caminho primário do convite

A documentação do Expo é explícita: *"Support for incoming links in Expo Go is
limited"*, e sobre `Linking.createURL()`: *"The behavior of this method in Expo Go for
published updates is undefined and should not be relied upon. The created URL in this
case is neither stable nor predictable during the lifetime of the app."*

Um produto cujo funil inteiro passa pelo convite não pode apoiar a conversão em
comportamento indefinido. Então:

- **Primário:** código de 8 caracteres, digitado na tela "Tenho um convite".
- **Contexto:** landing https estática, que é o que aparece com preview no WhatsApp.
- **Bônus:** a rota `invite/[code]` também responde a `exp://.../--/invite/CODE` quando
  o link funcionar. Nada depende disso.

Deep link de verdade (Universal Links / App Links) entra no V1, junto com o dev build.

### 2.3 Reaceite reativa a parceria encerrada

`endPartnership` marca `ended`, e o `pid` determinístico significaria que duas pessoas
que encerraram nunca mais poderiam ser parceiras. Como *"XParceria nunca é perdido"* é
princípio fundador (§11), `acceptInvite` sobre uma parceria `ended`:

- reativa **o mesmo documento** — XParceria, nível, conquistas e timeline intactos;
- reseta `temperature` para `TEMPERATURE.INITIAL`;
- **não** concede os +100 de novo;
- volta a contar em `stats.partnershipCount` dos dois (o encerramento havia decrementado);
- grava evento `partnership_resumed`.

Parceria já `active` ou `paused` → recusa. Retomar uma pausa é `resumePartnership`, não
convite.

Quatro membros novos no union `EventType` de `shared/types.ts`:
`partnership_paused`, `partnership_resumed`, `partnership_ended` — e
`partnership_born`, que o doc de produto já previa. `streak.lastDay` também precisa
aceitar `null`: no nascimento não existe dia anterior.

---

## 3. Modelo de dados

### 3.1 `invites/{code}`

```ts
{
  code: string;              // 8 chars, base32 Crockford sem I, L, O, U
  fromUid: string;
  fromProfile: { displayName: string; photoURL: string | null; avatarEmoji: string; handle: string };
  createdAt: Timestamp;
  expiresAt: Timestamp;      // createdAt + 7 dias
  usedBy: string | null;
  status: 'pending' | 'accepted';
  maxUses: 1;
}
```

`'expired'` **não é persistido** — é derivado de `expiresAt < now` na leitura e no
aceite. Sem scheduled function nesta spec, um status persistido ficaria mentindo até
alguém rodar um job. O campo `status` existente no §7 do doc de produto perde o valor
`'expired'` por esse motivo.

O alfabeto sem `I`, `L`, `O` e `U` existe porque o código será **digitado à mão** e lido
em voz alta no WhatsApp. `1/I/l` e `0/O` são a maior fonte de erro de digitação; `U` sai
para reduzir a chance de o gerador produzir palavras ofensivas por acaso.

### 3.2 `partnerships/{pid}` no nascimento

```ts
{
  id: pid,                                  // [uidA, uidB].sort().join('_')
  members: [uidA, uidB],                    // ordenado — array-contains depende disso
  memberProfiles: { [uid]: { displayName, photoURL, avatarEmoji } },

  status: 'active',
  createdBy: inviterUid,
  createdAt: serverTimestamp(),
  activatedAt: serverTimestamp(),           // data de aniversário

  xparceria: XP.PARTNERSHIP_BORN,           // 100
  level: 1,
  xpIntoLevel: 100,
  xpForNextLevel: 122,                      // xpForNextLevel(1) = 100 + 22

  temperature: TEMPERATURE.INITIAL,         // 50
  temperatureBand: 'mild',                  // bandForTemperature(50)

  streak: { current: 0, longest: 0, lastDay: null, freezesLeft: 2 },
  stats: {
    encounterCount: 0, totalMinutesTogether: 0, lastEncounterAt: null,
    daysSinceLastEncounter: 0, firstEncounterAt: null,
    longestEncounterMinutes: 0, maxDistanceKm: 0, placesVisited: 0,
  },

  achievements: ['o-comeco'],
  superPartnershipId: null,
  updatedAt: serverTimestamp(),
}
```

Detalhe de produto que cai de graça da curva de níveis: 100 XParceria contra os 122 do
nível 2 deixa a barra em **82% já na cerimônia**. Nasce a um passo de subir de nível, o
que é exatamente o incentivo certo no primeiro minuto.

A conquista `'o-comeco'` é gravada como literal. O catálogo de conquistas é da Spec 5;
adiantar só o id mantém a cerimônia inteira ("Conquista desbloqueada: O Começo") sem
antecipar o sistema.

### 3.3 Evento de nascimento

`partnerships/{pid}/events/{eventId}`, `type: 'partnership_born'`, `xpAwarded: 100`,
`occurredAt`. Append-only, como todo evento.

### 3.4 Escritas colaterais do aceite

| Documento | Mudança |
|---|---|
| `users/{uid}` ×2 | `stats.partnershipCount += 1`, `stats.totalXParceria += 100` |
| `presence/{uid}` ×2 | `visibleTo` recebe o uid do outro (upsert com merge) |
| `invites/{code}` | `status: 'accepted'`, `usedBy: accepterUid` |

O `visibleTo` nascer correto faz a regra mais importante do app (§7 — *sem parceria
aceita, a localização não existe para você*) valer desde o primeiro segundo. A Spec 3
encontra o terreno pronto e só escreve coordenada.

O documento de `presence` pode ainda não existir no aceite — a function usa `merge`, e
o Admin SDK ignora as rules, então o documento nasce com `visibleTo` preenchido e sem
`location`. A regra de update do cliente continua exigindo `visibleTo` inalterado.

---

## 4. Cloud Functions

### 4.1 Estrutura

`functions/` na raiz, com `package.json`, `tsconfig.json` e configuração de Jest
próprios. O Expo e o Node do servidor não compartilham resolução de módulos, e misturar
os dois é a origem clássica de conflito de peer dependency neste projeto.

- `firebase-functions` v2 — `onCall`, `onDocumentUpdated`
- Região **`southamerica-east1`**, a mesma do Firestore
- `shared/` importado por path relativo: as fórmulas de nível e as constantes de XP
  existem em **um** lugar, usado por cliente e servidor

### 4.2 As funções

| Função | Tipo | Contrato |
|---|---|---|
| `createInvite` | callable | Exige auth e perfil existente. Gera código único (retry no `create`, que falha em documento existente). Teto de 10 convites pendentes não expirados por usuário. Retorna `{ code, url }`. |
| `previewInvite` | callable | Recebe `code`. Retorna `{ fromProfile, canAccept, reason }` com `reason ∈ {expired, used, self, already-partners}`. Nunca devolve o documento cru. |
| `acceptInvite` | callable | A transação da §3. Idempotente por construção: o segundo aceite encontra `status: 'accepted'`. |
| `pausePartnership` | callable | `active → paused`. **Remove os dois do `visibleTo` um do outro** — é o que "só desliga o mapa" significa. Evento `partnership_paused`. |
| `resumePartnership` | callable | `paused → active`. Restaura o `visibleTo`. Evento `partnership_resumed`. |
| `endPartnership` | callable | Qualquer status → `ended`. Limpa `visibleTo`, decrementa `stats.partnershipCount` dos dois, evento `partnership_ended`. Não apaga nada. |
| `onUserProfileWrite` | trigger `onDocumentUpdated('users/{uid}')` | Se `displayName`, `photoURL` ou `avatarEmoji` mudaram, propaga para `memberProfiles[uid]` de todas as parcerias do usuário, em lote. Sai cedo se nada relevante mudou — senão a própria escrita de `lastActiveAt` dispararia a propagação. |

Todas as callables validam **associação** antes de qualquer escrita: quem não é membro
da parceria recebe `permission-denied`, não `not-found` — vazar existência já é vazar.

### 4.3 Erros

`HttpsError` tem um **enum fechado** de códigos — `already-partners` não existe e seria
rejeitado pelo SDK. O código carrega a categoria, e `details.reason` carrega o caso
específico, que é o que o cliente usa para escolher a mensagem:

| Situação | `code` | `details.reason` |
|---|---|---|
| Sem sessão | `unauthenticated` | — |
| Sem perfil criado | `failed-precondition` | `no-profile` |
| Teto de 10 convites pendentes | `failed-precondition` | `invite-limit` |
| Código inexistente | `not-found` | — |
| Convite expirado | `deadline-exceeded` | `expired` |
| Convite já usado | `already-exists` | `used` |
| Aceitar o próprio convite | `invalid-argument` | `self` |
| Já são parceiros | `already-exists` | `already-partners` |
| Não é membro da parceria | `permission-denied` | — |

---

## 5. Security rules

### 5.1 Mudança

```js
match /invites/{code} {
  allow read, write: if false;   // era: read se autenticado, create pelo próprio
}
```

A regra atual permite que qualquer autenticado leia qualquer convite e crie convites
diretamente — inclusive forjando `fromProfile`. Com tudo passando por callable, o
cliente perde acesso direto à coleção e o problema deixa de existir.

`partnerships` mantém `read: if isMember(resource.data)` e `write: if false`, agora
exercitado de verdade. `presence` e `users` ficam como estão.

### 5.2 Novos testes de negação

- não-membro **não lê** `partnerships/{pid}`
- membro **não escreve** `partnerships/{pid}` (mutação específica em `xparceria`)
- membro **não escreve** `partnerships/{pid}/events/{id}`
- autenticado **não lê** `invites/{code}`
- autenticado **não cria** `invites/{code}`

Aplicando a lição da Spec 1 — *uma mutação não valida uma suíte* —, cada regra ganha uma
mutação própria, e o teste tem de ser visto falhando antes de contar.

---

## 6. Cliente

### 6.1 Rotas

```
app/(auth)/onboarding/
    first-invite.tsx      "Quem é o seu parceiro?" → gera e compartilha
    waiting.tsx           espera com preview animado

app/(app)/
    index.tsx             lista de parcerias        ← temporário
    invite/enter.tsx      "Tenho um convite" → digita o código
    invite/[code].tsx     preview + aceitar          (também atende exp://)
    partnership/[id]/index.tsx   visão geral + pausar / encerrar

app/(modals)/
    partnership-born.tsx  cerimônia
```

**A raiz é a lista, não o mapa.** O §5 manda o mapa ser a raiz, e ele será — na Spec 3,
quando existir. Montar um tab bar de três abas com duas vazias agora é andaime a
demolir depois; a Spec 3 move a lista para `(tabs)/partnerships.tsx`.

O onboarding não termina sem um convite enviado ou um código aceito — é o que faz o
funil existir, e o Ato I é explícito quanto a isso.

### 6.2 Módulos

```
src/features/invite/
    services/invites.ts       wrappers das callables
    hooks/useInvite.ts
    CreateInviteScreen.tsx · WaitingScreen.tsx · EnterCodeScreen.tsx · AcceptInviteScreen.tsx
src/features/partnership/
    services/partnerships.ts
    hooks/usePartnerships.ts · hooks/usePartnership.ts
    PartnershipListScreen.tsx · PartnershipCard.tsx · PartnershipOverviewScreen.tsx
src/features/ceremony/
    PartnershipBornCeremony.tsx
src/core/firebase/
    functions.ts              cliente de callables + wiring do emulador
    useFirestoreDoc.ts        ponte onSnapshot → queryClient.setQueryData
    useFirestoreCollection.ts
```

Mesmo padrão da Spec 1: `services/` puro sobre o SDK, `hooks/` com React Query, telas
sem lógica de negócio.

A ponte do §6 do doc de produto é necessária pela primeira vez aqui. **Nenhum componente
chama `onSnapshot` diretamente** — um ponto único de integração, testável isolado.

### 6.3 A cerimônia simultânea

Os dois aparelhos escutam a mesma query (`members array-contains uid`, `status` ativo).
Quando uma parceria aparece e o aparelho ainda não marcou aquele `pid` como visto no
AsyncStorage (`ceremony:born:{pid}`), o modal sobe.

Quem aceitou vê ao retornar da callable. Quem convidou vê na tela de espera, no mesmo
instante, sem push e sem polling. A flag persistida é o que impede a cerimônia de
reprisar a cada abertura do app — sem ela, a magia vira incômodo no segundo dia.

### 6.4 Estados de tela

Toda tela desta spec tem estado vazio, de carregamento (skeleton, nunca spinner) e de
erro, como manda o §19. A lista vazia é a mais importante: é onde mora o convite.

---

## 7. Landing

Pasta `hosting/`, HTML estático publicado no Firebase Hosting (dentro do free tier).

- Nome de quem convida por query string: `?de=Gabriel`
- `og:title` / `og:image` para o preview rico no WhatsApp
- Instrução de instalar o Expo Go
- Código grande, com botão de copiar
- **Zero leitura do Firestore** — sendo estática, não tem o que vazar nem o que autenticar

A personalização real ("O Gabriel quer construir uma parceria com você", com foto)
acontece no app, depois do `previewInvite`, onde há autenticação.

---

## 8. Testes

Três camadas, nesta ordem.

### 8.1 Puro, sem Firebase

`shared/` e `functions/src/domain/`:

- `partnershipId(uidA, uidB)` — comutatividade e ordenação
- `buildBirthPartnership(inviter, accepter)` — devolve o documento inteiro; é a decisão
  de negócio do nascimento como função pura, reutilizada na reativação
- `isInviteUsable(invite, now, accepterUid)` — expiração, uso, auto-convite
- gerador de código — comprimento, alfabeto, ausência de caracteres ambíguos

### 8.2 Callables contra o emulador

`firebase emulators:exec --only firestore,auth,functions`, chamando as callables com
token real do Auth emulator.

**O caminho de fraude é obrigatório, não o feliz:**

| Caso | Esperado |
|---|---|
| aceitar o próprio convite | `invalid-argument` / `self` |
| aceitar duas vezes | `already-exists` / `used` |
| convite expirado | `deadline-exceeded` / `expired` |
| convite de terceiro já usado | `already-exists` / `used` |
| aceitar sem perfil criado | `failed-precondition` / `no-profile` |
| já são parceiros (`active` ou `paused`) | `already-exists` / `already-partners` |
| já foram parceiros (`ended`) | reativa, preserva XParceria, não reconcede +100, `partnershipCount` volta a contar |
| não-membro chama `endPartnership` | `permission-denied` |
| cliente escreve `partnerships` direto | negado pelas rules |
| 11º convite pendente | `failed-precondition` / `invite-limit` |
| `lastActiveAt` muda sozinho | trigger **não** propaga |

### 8.3 Rules e UI

Suíte de negação estendida (§5.2). RNTL para as telas e para a cerimônia, lembrando que
`render` e `fireEvent` do RNTL v14 são **assíncronos** — armadilha já paga na Spec 1.

`npm run validate` passa a ser
`typecheck && test && test:rules && test:functions`.

---

## 9. Pré-requisitos manuais

| # | Tarefa | Por quê |
|---|---|---|
| 1 | Ativar o **Blaze** no `parceria-db699` | Deploy de Cloud Functions exige plano Blaze — a documentação do Firebase é explícita |
| 2 | Criar **alerta de orçamento em R$ 5** | Blaze sem teto é a única forma de este projeto custar dinheiro de verdade. Não é opcional |
| 3 | Habilitar Firebase Hosting no projeto | Landing |

Com 50 usuários, o consumo fica ordens de grandeza abaixo do free tier (2 milhões de
invocações/mês). O custo esperado é R$ 0; o alerta existe contra erro de código, não
contra uso.

---

## 10. Riscos aceitos

| Risco | Situação |
|---|---|
| **Spec 1 nunca foi aberta num celular** | Decisão do Gabriel: verificar no aceite final da Spec 2. Concentra todas as surpresas de runtime (Reanimated, gesture-handler, worklets) num só momento, e a cerimônia de nascimento é justamente animação de tela cheia. Foi assim que a Spec 1 ficou sem aceite |
| Convite por código é mais friccional que link | Aceito — a alternativa depende de comportamento que a doc do Expo chama de indefinido. Medir a conversão no teste de campo |
| Blaze ativo | Mitigado pelo alerta de orçamento, não eliminado |
| `memberProfiles` stale entre a mudança de perfil e a propagação | Janela de segundos, em operação rara. Aceito |

---

## 11. Critério de aceite

1. Duas pessoas, em dois aparelhos, viram parceiras via código de convite — e **os dois
   veem a cerimônia de nascimento**.
2. A parceria aparece na lista dos dois com nível 1, 100 XParceria e temperatura 50.
3. Pausar remove do `visibleTo`; retomar devolve; encerrar preserva XParceria e nível.
4. `npm run validate` verde nas quatro camadas.
5. **O app roda no Expo Go num celular real** — o aceite pendente da Spec 1, cobrado
   aqui.

---

*Próximo passo: plano de implementação em `docs/plans/`.*
