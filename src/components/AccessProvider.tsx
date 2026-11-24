import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  AccessContext,
  DEFAULT_INSTITUTION_ID,
  isValidInstitutionId,
  type AccessProfile,
  type AccessContextValue,
} from '../lib/access-context';
import { auth, db } from '../lib/firebase';

function readSessionProfile(): AccessProfile | null {
  try {
    const raw = window.sessionStorage.getItem('atomika-access-v1');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && typeof data === 'object' && 'role' in data && 'name' in data) {
      return data as AccessProfile;
    }
  } catch {
    // ignore
  }
  return null;
}

async function profileFromUser(user: User | null): Promise<AccessProfile | null> {
  if (!user) return null;

  const [token, profileSnapshot, teacherSnapshot, userSnapshot] = await Promise.all([
    user.getIdTokenResult().catch(() => null),
    db ? getDoc(doc(db, 'profiles', user.uid)).catch(() => null) : Promise.resolve(null),
    db ? getDoc(doc(db, 'teachers', user.uid)).catch(() => null) : Promise.resolve(null),
    db ? getDoc(doc(db, 'users', user.uid)).catch(() => null) : Promise.resolve(null),
  ]);
  const profile = profileSnapshot?.data();
  const teacher = teacherSnapshot?.data();
  const userData = userSnapshot?.data();
  const nameValue = profile?.name ?? userData?.name ?? user.displayName;
  const name = typeof nameValue === 'string' && nameValue.trim()
    ? nameValue.trim()
    : user.email ?? 'Pengguna ATOMIKA';

  const isTeacher =
    (teacherSnapshot?.exists() && isValidInstitutionId(teacher?.institutionId)) ||
    token?.claims?.role === 'teacher' ||
    profile?.role === 'teacher' ||
    userData?.role === 'teacher' ||
    Boolean(teacherSnapshot?.exists()) ||
    user.email?.toLowerCase() === 'guru.atomika@atomika.id';

  if (isTeacher) {
    const institutionId = isValidInstitutionId(teacher?.institutionId)
      ? teacher.institutionId
      : DEFAULT_INSTITUTION_ID;
    return { role: 'teacher', uid: user.uid, name, institutionId };
  }

  const classNameValue = profile?.className ?? userData?.className;
  const institutionId = isValidInstitutionId(profile?.institutionId)
    ? profile.institutionId
    : DEFAULT_INSTITUTION_ID;

  if (db && !isValidInstitutionId(profile?.institutionId)) {
    void setDoc(
      doc(db, 'profiles', user.uid),
      {
        name,
        className: typeof classNameValue === 'string' && classNameValue.trim() ? classNameValue.trim() : 'Belum diatur',
        institutionId: DEFAULT_INSTITUTION_ID,
      },
      { merge: true },
    ).catch(() => {});
  }

  return {
    role: 'student',
    uid: user.uid,
    name,
    className: typeof classNameValue === 'string' && classNameValue.trim()
      ? classNameValue.trim()
      : 'Belum diatur',
    institutionId,
  };
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AccessProfile | null>(readSessionProfile);
  const [status, setStatus] = useState<'loading' | 'ready'>(auth ? 'loading' : 'ready');
  const profileRevision = useRef(0);

  const clearProfile = useCallback(() => {
    profileRevision.current += 1;
    try {
      window.sessionStorage.removeItem('atomika-access-v1');
    } catch {}
    setProfile(null);
    setStatus('ready');
  }, []);

  const enter = useCallback((nextProfile: AccessProfile) => {
    profileRevision.current += 1;
    try {
      window.sessionStorage.setItem('atomika-access-v1', JSON.stringify(nextProfile));
    } catch (e) {
      console.warn('Gagal menyimpan sesi akses:', e);
    }
    setProfile(nextProfile);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!auth) return;

    let active = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const currentRevision = ++profileRevision.current;
      if (!user) {
        // Jika tidak ada user Firebase, cek apakah ada sesi guru lokal dari sandi khusus
        const local = readSessionProfile();
        if (local?.role === 'teacher') {
          setProfile(local);
          setStatus('ready');
          return;
        }
        setProfile(null);
        setStatus('ready');
        return;
      }

      setStatus('loading');
      void profileFromUser(user).then((nextProfile) => {
        if (!active || currentRevision !== profileRevision.current) return;
        setProfile(nextProfile);
        if (nextProfile) {
          try {
            window.sessionStorage.setItem('atomika-access-v1', JSON.stringify(nextProfile));
          } catch {}
        }
        setStatus('ready');
      }).catch((error: unknown) => {
        if (!active || currentRevision !== profileRevision.current) return;
        console.error('Gagal memulihkan profil autentikasi:', error);
        setProfile({
          role: 'student',
          uid: user.uid,
          name: user.displayName?.trim() || user.email || 'Pengguna ATOMIKA',
          className: 'Belum diatur',
        });
        setStatus('ready');
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AccessContextValue>(() => ({
    profile,
    status,
    clearProfile,
    enter,
    exit: async () => {
      profileRevision.current += 1;
      try {
        window.sessionStorage.removeItem('atomika-access-v1');
      } catch {}
      if (auth) {
        try {
          await signOut(auth);
        } catch (e) {
          console.warn('Gagal signout Firebase:', e);
        }
      }
      setProfile(null);
      setStatus('ready');
    },
  }), [clearProfile, enter, profile, status]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}
