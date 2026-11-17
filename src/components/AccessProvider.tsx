import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { AccessContext, type AccessProfile, type AccessContextValue } from '../lib/access-context';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { getUserProfile, saveUserProfile, toAccessProfile, type FirebaseUserProfile } from '../lib/firebase-db';
import { supabase } from '../lib/supabase';

function profileFromSupabaseUser(user: SupabaseUser | null): AccessProfile | null {
  if (!user) return null;

  const nameValue = user.user_metadata.full_name ?? user.user_metadata.name;
  const name =
    typeof nameValue === 'string' && nameValue.trim()
      ? nameValue.trim()
      : user.email ?? 'Pengguna ATOMIKA';

  if (user.app_metadata.role === 'teacher') {
    return { role: 'teacher', name };
  }

  const classNameValue = user.user_metadata.class_name;
  return {
    role: 'student',
    name,
    className:
      typeof classNameValue === 'string' && classNameValue.trim()
        ? classNameValue.trim()
        : 'Belum diatur',
  };
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready'>(
    isFirebaseConfigured || Boolean(supabase) ? 'loading' : 'ready'
  );

  useEffect(() => {
    let active = true;

    // Prioritas 1: Gunakan Firebase jika sudah dikonfigurasi
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (!active) return;
        if (!firebaseUser) {
          setProfile(null);
          setStatus('ready');
          return;
        }

        try {
          const userDoc = await getUserProfile(firebaseUser.uid);
          if (userDoc) {
            if (active) {
              setProfile(toAccessProfile(userDoc));
              setStatus('ready');
            }
          } else {
            // Pengguna baru (misal login via Google), buatkan profil awal
            const defaultName =
              firebaseUser.displayName ||
              firebaseUser.email?.split('@')[0] ||
              'Pengguna ATOMIKA';
            const initialDoc: FirebaseUserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              name: defaultName,
              className: 'Belum diatur',
              role: 'student',
              updatedAt: new Date().toISOString(),
            };
            void saveUserProfile(initialDoc);
            if (active) {
              setProfile(toAccessProfile(initialDoc));
              setStatus('ready');
            }
          }
        } catch (error) {
          console.error('Gagal mengambil profil pengguna dari Firebase:', error);
          if (active) {
            setProfile({
              role: 'student',
              name: firebaseUser.displayName || firebaseUser.email || 'Pengguna ATOMIKA',
              className: 'Belum diatur',
            });
            setStatus('ready');
          }
        }
      });

      return () => {
        active = false;
        unsubscribe();
      };
    }

    // Prioritas 2: Fallback ke Supabase jika Firebase belum diset
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        setProfile(profileFromSupabaseUser(session?.user ?? null));
        setStatus('ready');
      });

      void supabase.auth
        .getSession()
        .then(({ data, error }) => {
          if (!active) return;
          if (error) console.error('Gagal memulihkan sesi autentikasi Supabase:', error);
          setProfile(profileFromSupabaseUser(data.session?.user ?? null));
          setStatus('ready');
        })
        .catch((error: unknown) => {
          if (!active) return;
          console.error('Gagal memulihkan sesi autentikasi Supabase:', error);
          setStatus('ready');
        });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    }

    setStatus('ready');
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AccessContextValue>(
    () => ({
      profile,
      status,
      exit: async () => {
        if (isFirebaseConfigured && auth) {
          await firebaseSignOut(auth);
          setProfile(null);
          return;
        }

        if (supabase) {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          setProfile(null);
          return;
        }

        throw new Error('Layanan autentikasi belum dikonfigurasi.');
      },
    }),
    [profile, status]
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}
