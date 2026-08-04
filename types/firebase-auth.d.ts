// O exports de @firebase/auth lista "types" antes de "react-native", então o tsc para
// em auth-public.d.ts e nunca vê getReactNativePersistence — que existe em runtime
// (dist/rn/index.rn.d.ts) e é resolvido normalmente pelo Metro.
// Declaramos aqui o que de fato existe. REMOVER quando o upstream reordenar as chaves.
import type { Persistence, ReactNativeAsyncStorage } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage,
  ): Persistence;
}
