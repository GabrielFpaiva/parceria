import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/core/firebase/client';
import type { UserDoc } from '@shared/types';

export function useProfile(uid: string | null) {
  return useQuery<UserDoc | null>({
    queryKey: ['user', uid],
    enabled: uid !== null,
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'users', uid!));
      return snap.exists() ? (snap.data() as UserDoc) : null;
    },
  });
}
