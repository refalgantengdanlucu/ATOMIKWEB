import { createContext, useContext } from 'react';

export type AccessProfile =
  | { role: 'student'; name: string; className: string }
  | { role: 'teacher'; name: string };

export interface AccessContextValue {
  profile: AccessProfile | null;
  enter: (profile: AccessProfile) => void;
  exit: () => void;
}

export const AccessContext = createContext<AccessContextValue | null>(null);

export function useAccess(): AccessContextValue {
  const context = useContext(AccessContext);
  if (!context) throw new Error('useAccess harus digunakan di dalam AccessProvider.');
  return context;
}
