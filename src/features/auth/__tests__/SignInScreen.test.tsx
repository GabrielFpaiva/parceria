import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SignInScreen } from '../SignInScreen';

// Prefixo `mock` é obrigatório: babel-plugin-jest-hoist bloqueia qualquer
// variável fora do escopo do factory de jest.mock() que não comece com "mock".
const mockSignIn = jest.fn();
jest.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({ signIn: mockSignIn, signUp: jest.fn(), signOut: jest.fn(), user: null, status: 'signedOut' }),
}));

beforeEach(() => mockSignIn.mockReset());

describe('SignInScreen', () => {
  it('envia e-mail e senha', async () => {
    mockSignIn.mockResolvedValue(undefined);
    await render(<SignInScreen />);
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'gabriel@exemplo.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo123');
    await fireEvent.press(screen.getByLabelText('Entrar'));
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith('gabriel@exemplo.com', 'segredo123'));
  });

  it('mostra a mensagem traduzida quando o Firebase recusa', async () => {
    mockSignIn.mockRejectedValue({ code: 'auth/invalid-credential' });
    await render(<SignInScreen />);
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'a@b.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'errada');
    await fireEvent.press(screen.getByLabelText('Entrar'));
    await waitFor(() => expect(screen.getByText('E-mail ou senha incorretos.')).toBeTruthy());
  });

  it('não chama signIn com campos vazios', async () => {
    await render(<SignInScreen />);
    await fireEvent.press(screen.getByLabelText('Entrar'));
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
