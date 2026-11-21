import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { AccessContext, type AccessProfile, type AccessContextValue } from '../lib/access-context';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { getUserProfile, getUserProfileByEmail, isAuthorizedTeacherEmail, toAccessProfile } from '../lib/firebase-db';
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
          // Hanya hapus profile jika tidak ada sesi teacher lokal yang aktif
          const local = readProfile();
          if (!local) {
            setProfile(null);
          }
          setStatus('ready');
          return;
        }

        try {
          const userEmail = firebaseUser.email || '';

          // Cek khusus untuk akun guru terotorisasi
          const isTeacher =
            userEmail.toLowerCase() === 'guru.atomika@atomika.id' ||
            (await isAuthorizedTeacherEmail(userEmail));

          // Cari profil di database users berdasarkan UID atau Email
          let userDoc = await getUserProfile(firebaseUser.uid);
          if (!userDoc && userEmail) {
            userDoc = await getUserProfileByEmail(userEmail);
          }

          if (isTeacher || userDoc?.role === 'teacher') {
            const teacherProfile: AccessProfile = {
              role: 'teacher',
              name: userDoc?.name || firebaseUser.displayName || 'Guru ATOMIKA',
            };
            if (active) {
              setProfile(teacherProfile);
              try {
                window.sessionStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(teacherProfile));
              } catch (e) {
                console.warn('Gagal menyimpan sesi guru ke sessionStorage:', e);
              }
              setStatus('ready');
            }
            return;
          }

          if (userDoc) {
            if (userDoc.status === 'inactive') {
              if (active) {
                setProfile(null);
                try {
                  window.sessionStorage.removeItem(ACCESS_STORAGE_KEY);
                } catch {
                  // ignore
                }
                setStatus('ready');
              }
              return;
            }

            if (active) {
              const studentProfile = toAccessProfile(userDoc);
              setProfile(studentProfile);
              try {
                window.sessionStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(studentProfile));
              } catch (e) {
                console.warn('Gagal menyimpan sesi siswa ke sessionStorage:', e);
              }
              setStatus('ready');
            }
          } else {
            // Sesi lokal mungkin ada
            const local = readProfile();
            if (active) {
              setProfile(local);
              setStatus('ready');
            }
          }
        } catch (error) {
          console.error('Gagal mengambil profil pengguna dari Firebase:', error);
          if (active) {
            const local = readProfile();
            setProfile(local);
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
        const nextProfile = profileFromSupabaseUser(session?.user ?? null);
        setProfile(nextProfile);
        if (nextProfile) {
          try {
            window.sessionStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(nextProfile));
          } catch {
            // ignore
          }
        }
        setStatus('ready');
      });

      void supabase.auth
        .getSession()
        .then(({ data, error }) => {
          if (!active) return;
          if (error) console.error('Gagal memulihkan sesi autentikasi Supabase:', error);
          const nextProfile = profileFromSupabaseUser(data.session?.user ?? null) || readProfile();
          setProfile(nextProfile);
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
      enter: (nextProfile: AccessProfile) => {
        try {
          window.sessionStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(nextProfile));
        } catch (error) {
          console.error('Gagal menyimpan sesi akses ATOMIKA:', error);
        }
        setProfile(nextProfile);
      },
      exit: async () => {
        try {
          window.sessionStorage.removeItem(ACCESS_STORAGE_KEY);
        } catch (error) {
          console.error('Gagal menghapus sesi akses ATOMIKA:', error);
        }

        if (isFirebaseConfigured && auth) {
          try {
            await firebaseSignOut(auth);
          } catch (e) {
            console.warn('Gagal signout Firebase:', e);
          }
        }

        if (supabase) {
          try {
            const { error } = await supabase.auth.signOut();
            if (error) console.warn('Gagal signout Supabase:', error);
          } catch (e) {
            console.warn('Gagal signout Supabase:', e);
          }
        }

        setProfile(null);
      },
    }),
    [profile, status]
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}
