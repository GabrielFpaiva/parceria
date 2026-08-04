import { useContext } from 'react';
import { AuthContext, type AuthValue } from './AuthProvider';

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (value === null) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return value;
}
