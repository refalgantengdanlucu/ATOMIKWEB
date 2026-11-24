import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AccessContext, isValidInstitutionId, type AccessProfile, type AccessContextValue } from '../lib/access-context';
import { auth, db } from '../lib/firebase';

async function profileFromUser(user: User | null): Promise<AccessProfile | null> {
  if (!user) return null;

  const [profileSnapshot, teacherSnapshot] = await Promise.all([
    db ? getDoc(doc(db, 'profiles', user.uid)) : Promise.resolve(null),
    db ? getDoc(doc(db, 'teachers', user.uid)) : Promise.resolve(null),
  ]);
  const profile = profileSnapshot?.data();
  const teacher = teacherSnapshot?.data();
  const nameValue = profile?.name ?? user.displayName;
  const name = typeof nameValue === 'string' && nameValue.trim()
    ? nameValue.trim()
    : user.email ?? 'Pengguna ATOMIKA';

  if (teacherSnapshot?.exists() && isValidInstitutionId(teacher?.institutionId)) {
    return { role: 'teacher', uid: user.uid, name, institutionId: teacher.institutionId };
  }

  const classNameValue = profile?.className;
  const institutionId = isValidInstitutionId(profile?.institutionId)
    ? profile.institutionId
    : undefined;
  return {
    role: 'student',
    uid: user.uid,
    name,
    className: typeof classNameValue === 'string' && classNameValue.trim()
      ? classNameValue.trim()
      : 'Belum diatur',
    ...(institutionId ? { institutionId } : {}),
  };
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready'>(auth ? 'loading' : 'ready');
  const profileRevision = useRef(0);

  const clearProfile = useCallback(() => {
    profileRevision.current += 1;
    setProfile(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!auth) return;

    let active = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const currentRevision = ++profileRevision.current;
      if (!user) {
        setProfile(null);
        setStatus('ready');
        return;
      }

      setStatus('loading');
      setProfile(null);
      void profileFromUser(user).then((nextProfile) => {
        if (!active || currentRevision !== profileRevision.current) return;
        setProfile(nextProfile);
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
    exit: async () => {
      if (!auth) throw new Error('Autentikasi Firebase belum dikonfigurasi.');
      await signOut(auth);
      setProfile(null);
    },
  }), [clearProfile, profile, status]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}
