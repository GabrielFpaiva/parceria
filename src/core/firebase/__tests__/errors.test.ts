import { authErrorMessage } from '../errors';

describe('authErrorMessage', () => {
  it.each([
    ['auth/invalid-email', 'E-mail inválido.'],
    ['auth/email-already-in-use', 'Esse e-mail já está em uso.'],
    ['auth/weak-password', 'A senha precisa ter pelo menos 6 caracteres.'],
    ['auth/invalid-credential', 'E-mail ou senha incorretos.'],
    ['auth/network-request-failed', 'Sem conexão. Tenta de novo.'],
  ])('traduz %s', (code, expected) => {
    expect(authErrorMessage(code)).toBe(expected);
  });

  it('cai numa mensagem genérica para código desconhecido', () => {
    expect(authErrorMessage('auth/algo-novo')).toBe('Algo deu errado. Tenta de novo.');
  });

  it('nunca vaza o código cru do Firebase para o usuário', () => {
    for (const code of ['auth/invalid-email', 'auth/algo-novo', '']) {
      expect(authErrorMessage(code)).not.toContain('auth/');
    }
  });
});
