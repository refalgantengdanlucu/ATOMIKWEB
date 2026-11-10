import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { AccessContext, type AccessProfile, type AccessContextValue } from '../lib/access-context';
import { supabase } from '../lib/supabase';

function profileFromUser(user: User | null): AccessProfile | null {
  if (!user) return null;

  const nameValue = user.user_metadata.full_name ?? user.user_metadata.name;
  const name = typeof nameValue === 'string' && nameValue.trim()
    ? nameValue.trim()
    : user.email ?? 'Pengguna ATOMIKA';

  if (user.app_metadata.role === 'teacher') {
    return { role: 'teacher', name };
  }

  const classNameValue = user.user_metadata.class_name;
  return {
    role: 'student',
    name,
    className: typeof classNameValue === 'string' && classNameValue.trim()
      ? classNameValue.trim()
      : 'Belum diatur',
  };
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready'>(supabase ? 'loading' : 'ready');

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setProfile(profileFromUser(session?.user ?? null));
      setStatus('ready');
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error('Gagal memulihkan sesi autentikasi:', error);
      setProfile(profileFromUser(data.session?.user ?? null));
      setStatus('ready');
    }).catch((error: unknown) => {
      if (!active) return;
      console.error('Gagal memulihkan sesi autentikasi:', error);
      setStatus('ready');
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AccessContextValue>(() => ({
    profile,
    status,
    exit: async () => {
      if (!supabase) throw new Error('Autentikasi belum dikonfigurasi.');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setProfile(null);
    },
  }), [profile, status]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}
