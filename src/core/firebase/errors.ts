/**
 * Traduz códigos de erro do Firebase Auth para mensagens em português
 * seguras de exibir ao usuário — nunca vaza o código cru (`auth/...`).
 */
const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/email-already-in-use': 'Esse e-mail já está em uso.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas. Espera um pouco.',
  'auth/network-request-failed': 'Sem conexão. Tenta de novo.',
};

export function authErrorMessage(code: string): string {
  return MESSAGES[code] ?? 'Algo deu errado. Tenta de novo.';
}
