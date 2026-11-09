import { useMemo, useState, type ReactNode } from 'react';
import { AccessContext, type AccessProfile, type AccessContextValue } from '../lib/access-context';

const ACCESS_STORAGE_KEY = 'atomika-access-v1';

function readProfile(): AccessProfile | null {
  try {
    const raw = window.sessionStorage.getItem(ACCESS_STORAGE_KEY);
    if (!raw) return null;
    const profile: unknown = JSON.parse(raw);
    if (
      typeof profile === 'object' &&
      profile !== null &&
      'role' in profile &&
      profile.role === 'student' &&
      'name' in profile &&
      typeof profile.name === 'string' &&
      'className' in profile &&
      typeof profile.className === 'string'
    ) {
      return { role: 'student', name: profile.name, className: profile.className };
    }
    if (
      typeof profile === 'object' &&
      profile !== null &&
      'role' in profile &&
      profile.role === 'teacher' &&
      'name' in profile &&
      typeof profile.name === 'string'
    ) {
      return { role: 'teacher', name: profile.name };
    }
    window.sessionStorage.removeItem(ACCESS_STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Gagal membaca sesi akses ATOMIKA:', error);
    return null;
  }
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AccessProfile | null>(readProfile);

  const value = useMemo<AccessContextValue>(() => ({
    profile,
    enter: (nextProfile) => {
      try {
        window.sessionStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(nextProfile));
      } catch (error) {
        console.error('Gagal menyimpan sesi akses ATOMIKA:', error);
      }
      setProfile(nextProfile);
    },
    exit: () => {
      try {
        window.sessionStorage.removeItem(ACCESS_STORAGE_KEY);
      } catch (error) {
        console.error('Gagal menghapus sesi akses ATOMIKA:', error);
      }
      setProfile(null);
    },
  }), [profile]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}
