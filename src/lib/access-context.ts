import { createContext, useContext } from 'react';

export type AccessProfile =
  | { role: 'student'; uid: string; name: string; className: string; institutionId?: string }
  | { role: 'teacher'; uid: string; name: string; institutionId: string };

export type AuthStatus = 'loading' | 'ready';

export interface AccessContextValue {
  profile: AccessProfile | null;
  status: AuthStatus;
  clearProfile: () => void;
  enter?: (profile: AccessProfile) => void;
  exit: () => Promise<void>;
}

export function isValidInstitutionId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value);
}

export const AccessContext = createContext<AccessContextValue | null>(null);

export function useAccess(): AccessContextValue {
  const context = useContext(AccessContext);
  if (!context) throw new Error('useAccess harus digunakan di dalam AccessProvider.');
  return context;
}
