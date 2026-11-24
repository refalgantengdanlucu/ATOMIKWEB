import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { isValidInstitutionId } from '../lib/access-context';
import { auth, db } from '../lib/firebase';

export type TeacherAccessStatus = 'checking' | 'allowed' | 'denied';

export function useTeacherAccess() {
  const [status, setStatus] = useState<TeacherAccessStatus>(auth && db ? 'checking' : 'denied');

  useEffect(() => {
    const firebaseAuth = auth;
    const firestore = db;
    if (!firebaseAuth || !firestore) {
      return;
    }

    let active = true;
    let revision = 0;
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      const currentRevision = ++revision;
      if (!user) {
        setStatus('denied');
        return;
      }

      setStatus('checking');
      void getDoc(doc(firestore, 'teachers', user.uid)).then((teacherDocument) => {
        if (!active || currentRevision !== revision) return;
        setStatus(
          teacherDocument.exists() && isValidInstitutionId(teacherDocument.data().institutionId)
            ? 'allowed'
            : 'denied',
        );
      }).catch((error: unknown) => {
        if (!active || currentRevision !== revision) return;
        console.error('Gagal memverifikasi keanggotaan Panel Guru:', error);
        setStatus('denied');
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return status;
}
