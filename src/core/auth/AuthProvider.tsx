import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/core/firebase/client';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

export type AuthValue = {
  user: User | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // A sessão vem do AsyncStorage de forma assíncrona: sem o estado `loading`,
  // quem já está logado veria um flash da tela de login antes da confirmação.
  useEffect(() => onAuthStateChanged(auth, (next) => {
    setUser(next);
    setStatus(next !== null ? 'signedIn' : 'signedOut');
  }), []);

  const value = useMemo<AuthValue>(() => ({
    user,
    status,
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },
    signUp: async (email, password) => {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    },
    signOut: async () => { await fbSignOut(auth); },
  }), [user, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
