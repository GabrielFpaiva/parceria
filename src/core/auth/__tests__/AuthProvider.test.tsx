import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider } from '../AuthProvider';
import { useAuth } from '../useAuth';

const listeners: Array<(user: unknown) => void> = [];

jest.mock('@/core/firebase/client', () => ({ auth: {}, db: {} }));
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, cb: (u: unknown) => void) => {
    listeners.push(cb);
    return () => {};
  },
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

function Probe() {
  const { status, user } = useAuth();
  return <Text>{`${status}:${user?.uid ?? 'none'}`}</Text>;
}

beforeEach(() => { listeners.length = 0; });

describe('AuthProvider', () => {
  it('começa em loading', async () => {
    await render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByText('loading:none')).toBeTruthy();
  });

  it('vai para signedOut quando não há sessão', async () => {
    await render(<AuthProvider><Probe /></AuthProvider>);
    listeners[0]!(null);
    await waitFor(() => expect(screen.getByText('signedOut:none')).toBeTruthy());
  });

  it('vai para signedIn e expõe o uid', async () => {
    await render(<AuthProvider><Probe /></AuthProvider>);
    listeners[0]!({ uid: 'alice-uid' });
    await waitFor(() => expect(screen.getByText('signedIn:alice-uid')).toBeTruthy());
  });

  it('useAuth fora do provider dá erro claro', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // render é assíncrono: o erro chega como rejeição, não como throw síncrono
    await expect(render(<Probe />)).rejects.toThrow(
      'useAuth precisa estar dentro de AuthProvider',
    );
    spy.mockRestore();
  });
});
