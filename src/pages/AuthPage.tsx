import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Atom,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updatePassword as updateFirebasePassword,
  updateProfile,
} from 'firebase/auth';
import { useAccess, type AccessProfile } from '../lib/access-context';
import {
  auth,
  getRememberSession as getFirebaseRememberSession,
  isFirebaseConfigured,
  setRememberSession as setFirebaseRememberSession,
} from '../lib/firebase';
import { getUserProfile, getUserProfileByEmail, isAuthorizedTeacherEmail, saveUserProfile, toAccessProfile } from '../lib/firebase-db';
import { loginAsTeacherWithPassword } from '../lib/teacher-auth';
import {
  getRememberSession as getSupabaseRememberSession,
  setRememberSession as setSupabaseRememberSession,
  supabase,
} from '../lib/supabase';
import './AuthPage.css';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

const passwordRequirements = [
  { label: 'Minimal 8 karakter', test: (value: string) => value.length >= 8 },
  {
    label: 'Huruf besar dan kecil',
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { label: 'Minimal satu angka', test: (value: string) => /\d/.test(value) },
];

function isValidPassword(value: string) {
  return passwordRequirements.every(({ test }) => test(value));
}

function errorMessage(error: { message: string; code?: string }) {
  const message = error.message.toLowerCase();
  const code = error.code ? error.code.toLowerCase() : '';

  if (code.includes('user-not-found') || message.includes('user-not-found')) {
    return 'Email belum terdaftar. Silakan periksa kembali email Anda.';
  }
  if (code.includes('wrong-password') || message.includes('wrong-password')) {
    return 'Password yang Anda masukkan tidak sesuai.';
  }
  if (code.includes('user-disabled') || message.includes('user-disabled')) {
    return 'Akun belum aktif atau telah dinonaktifkan.';
  }
  if (
    message.includes('invalid login credentials') ||
    code.includes('invalid-credential')
  ) {
    return 'Password yang Anda masukkan tidak sesuai atau email belum terdaftar.';
  }
  if (message.includes('user already registered') || code.includes('email-already-in-use')) {
    return 'Email ini sudah terdaftar. Silakan login.';
  }
  if (message.includes('password should be') || code.includes('weak-password')) {
    return 'Kata sandi belum memenuhi kebijakan keamanan (minimal 8 karakter, huruf besar/kecil, dan angka).';
  }
  if (message.includes('email not confirmed')) {
    return 'Verifikasi email Anda terlebih dahulu sebelum login.';
  }
  if (message.includes('rate limit') || code.includes('too-many-requests')) {
    return 'Terlalu banyak percobaan. Coba lagi beberapa saat.';
  }
  if (code.includes('popup-closed-by-user')) {
    return 'Masuk dengan Google dibatalkan.';
  }
  return error.message;
}

function safeReturnPath(value: unknown) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/';
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <span className="auth-input-wrap">
        <LockKeyhole size={18} aria-hidden="true" />
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          className="auth-icon-button"
          type="button"
          aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
        transform="translate(0 5)"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.72 7.18l7.64 5.93c4.46-4.13 7.12-10.22 7.12-17.58Z"
        transform="translate(0 0)"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19Z"
        transform="translate(0 5)"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.64-5.93c-2.13 1.43-4.86 2.28-8.26 2.28-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
        transform="translate(0 0)"
      />
    </svg>
  );
}

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, status, enter } = useAccess();
  const mode = location.pathname.replace(/^\//, '') as AuthMode;
  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot-password';
  const isReset = mode === 'reset-password';
  const stateFrom = (location.state as { from?: unknown } | null)?.from;
  const queryFrom = new URLSearchParams(location.search).get('next');
  const returnTo = safeReturnPath(stateFrom ?? queryFrom);
  const queryRole = new URLSearchParams(location.search).get('role');

  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'student' | 'teacher'>(
    queryRole === 'teacher' ? 'teacher' : 'student'
  );
  const [confirmation, setConfirmation] = useState('');
  const [remember] = useState(() =>
    isFirebaseConfigured ? getFirebaseRememberSession() : getSupabaseRememberSession()
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const routeNotice = (location.state as { notice?: string } | null)?.notice ?? '';

  useEffect(() => {
    if (status === 'ready' && profile && !isReset) {
      const dest =
        returnTo && returnTo !== '/'
          ? returnTo
          : profile.role === 'teacher'
            ? '/kelas'
            : '/materi';
      navigate(dest, { replace: true });
    }
  }, [isReset, navigate, profile, returnTo, status]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!isFirebaseConfigured && !supabase) {
      setError(
        'Layanan database/autentikasi belum dikonfigurasi. Silakan isi konfigurasi Firebase pada file .env.local terlebih dahulu.'
      );
      return;
    }

    if ((isRegister || isReset) && !isValidPassword(password)) {
      setError(
        'Kata sandi harus memiliki minimal 8 karakter, kombinasi huruf besar dan kecil, serta angka.'
      );
      return;
    }
    if ((isRegister || isReset) && password !== confirmation) {
      setError('Konfirmasi kata sandi belum sama.');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }

    setBusy(true);
    try {
      // ----------------------------------------------------------------------
      // ALUR 1: FIREBASE (Utama)
      // ----------------------------------------------------------------------
      if (isFirebaseConfigured && auth) {
        setFirebaseRememberSession(remember);

        if (isLogin) {
          if (!email.trim() || !password) {
            setError('Silakan masukkan email dan kata sandi Anda.');
            return;
          }

          let cred;
          try {
            cred = await signInWithEmailAndPassword(auth, email.trim(), password);
          } catch (authErr: any) {
            const code = authErr?.code || '';
            const msg = (authErr?.message || '').toLowerCase();

            if (code === 'auth/user-not-found' || msg.includes('user-not-found')) {
              throw new Error('Email belum terdaftar. Silakan periksa kembali email Anda.');
            }
            if (code === 'auth/wrong-password' || msg.includes('wrong-password')) {
              throw new Error('Password yang Anda masukkan tidak sesuai.');
            }
            if (code === 'auth/invalid-credential' || msg.includes('invalid-credential')) {
              const exists = await getUserProfileByEmail(email.trim());
              if (!exists) {
                throw new Error('Email belum terdaftar. Silakan periksa kembali email Anda.');
              }
              throw new Error('Password yang Anda masukkan tidak sesuai.');
            }
            if (code === 'auth/user-disabled' || msg.includes('user-disabled')) {
              throw new Error('Akun belum aktif atau telah dinonaktifkan.');
            }
            if (code === 'auth/too-many-requests' || msg.includes('too-many-requests')) {
              throw new Error('Terlalu banyak percobaan masuk yang gagal. Silakan coba lagi beberapa saat.');
            }
            throw authErr;
          }

          // Ambil profil akun dari database Firestore
          let userDoc = await getUserProfile(cred.user.uid);
          if (!userDoc && cred.user.email) {
            userDoc = await getUserProfileByEmail(cred.user.email);
          }

          if (!userDoc) {
            await firebaseSignOut(auth);
            throw new Error('Email belum terdaftar. Silakan periksa kembali email Anda.');
          }

          if (userDoc.status === 'inactive') {
            await firebaseSignOut(auth);
            throw new Error('Akun belum aktif atau telah dinonaktifkan.');
          }

          // Otomatis deteksi role berdasarkan data akun di database
          if (userDoc.role === 'teacher') {
            const isAuth = await isAuthorizedTeacherEmail(cred.user.email || userDoc.email);
            if (!isAuth) {
              await firebaseSignOut(auth);
              throw new Error('Akun guru ini belum diotorisasi. Silakan hubungi admin sekolah.');
            }
            enter({ role: 'teacher', name: userDoc.name || cred.user.displayName || 'Guru ATOMIKA' });
            const dest = returnTo && returnTo !== '/' ? returnTo : '/kelas';
            navigate(dest, { replace: true });
            return;
          }

          if (userDoc.role === 'student') {
            enter(toAccessProfile(userDoc));
            const dest = returnTo && returnTo !== '/' ? returnTo : '/materi';
            navigate(dest, { replace: true });
            return;
          }

          await firebaseSignOut(auth);
          throw new Error('Peran akun tidak valid. Hubungi administrator.');
        }

        if (isRegister) {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
          await updateProfile(cred.user, { displayName: name.trim() });
          await saveUserProfile({
            uid: cred.user.uid,
            email: email.trim(),
            name: name.trim().replace(/\s+/g, ' '),
            className: className.trim().replace(/\s+/g, ' '),
            role: 'student',
            updatedAt: new Date().toISOString(),
          });
          await firebaseSignOut(auth);
          navigate('/login', {
            replace: true,
            state: { notice: 'Akun berhasil dibuat. Silakan login kembali menggunakan akun Anda.' },
          });
          return;
        }

        if (isForgot) {
          await sendPasswordResetEmail(auth, email.trim());
          setNotice(
            'Jika email terdaftar, tautan pemulihan akan dikirim. Silakan periksa kotak masuk Anda.'
          );
          return;
        }

        if (isReset) {
          if (auth.currentUser) {
            await updateFirebasePassword(auth.currentUser, password);
            await firebaseSignOut(auth);
            navigate('/login', {
              replace: true,
              state: {
                notice:
                  'Kata sandi berhasil diperbarui. Silakan login kembali menggunakan kata sandi baru.',
              },
            });
            return;
          }
          throw new Error('Sesi reset kata sandi tidak ditemukan atau sudah kedaluwarsa.');
        }
      }

      // ----------------------------------------------------------------------
      // ALUR 2: SUPABASE (Fallback)
      // ----------------------------------------------------------------------
      if (supabase) {
        setSupabaseRememberSession(remember);

        if (isLogin) {
          const { error: authError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (authError) throw authError;
          navigate(returnTo, { replace: true });
          return;
        }

        if (isRegister) {
          const { data, error: authError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: name.trim().replace(/\s+/g, ' '),
                class_name: className.trim().replace(/\s+/g, ' '),
              },
              emailRedirectTo: `${window.location.origin}/login`,
            },
          });
          if (authError) throw authError;
          if (data.session) {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) throw signOutError;
          }
          navigate('/login', {
            replace: true,
            state: { notice: 'Akun berhasil dibuat. Silakan login kembali menggunakan akun Anda.' },
          });
          return;
        }

        if (isForgot) {
          const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          if (authError) throw authError;
          setNotice(
            'Jika email terdaftar, tautan pemulihan akan dikirim. Silakan periksa kotak masuk Anda.'
          );
          return;
        }

        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        navigate('/login', {
          replace: true,
          state: {
            notice:
              'Kata sandi berhasil diperbarui. Silakan login kembali menggunakan kata sandi baru.',
          },
        });
      }
    } catch (caught) {
      const authError =
        caught instanceof Error
          ? (caught as { message: string; code?: string })
          : { message: 'Terjadi kesalahan autentikasi.' };
      setError(errorMessage(authError));
    } finally {
      setBusy(false);
    }
  };

  const submitStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    const trimmedName = name.trim().replace(/\s+/g, ' ');
    const trimmedClass = className.trim().replace(/\s+/g, ' ');

    if (!trimmedName) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!trimmedClass) {
      setError('Kelas wajib diisi.');
      return;
    }

    setBusy(true);
    try {
      const studentProfile: AccessProfile = {
        role: 'student',
        name: trimmedName,
        className: trimmedClass,
      };

      // 1. Simpan sesi siswa langsung di context & sessionStorage
      enter(studentProfile);

      // 2. Sinkronkan sesi siswa ke Firebase jika terkonfigurasi
      if (isFirebaseConfigured && auth) {
        let studentUid = auth.currentUser?.uid;
        if (!studentUid) {
          try {
            const anonCred = await signInAnonymously(auth);
            studentUid = anonCred.user.uid;
          } catch (e) {
            console.warn('Anonymous student session warning:', e);
          }
        }
        if (studentUid) {
          try {
            await saveUserProfile({
              uid: studentUid,
              email: auth.currentUser?.email || '',
              name: trimmedName,
              className: trimmedClass,
              role: 'student',
              status: 'active',
              updatedAt: new Date().toISOString(),
            });
          } catch (e) {
            console.warn('Gagal menyimpan data siswa ke Firestore:', e);
          }
        }
      }

      // 3. Arahkan murid ke materi belajar
      const dest = returnTo && returnTo !== '/' ? returnTo : '/materi';
      navigate(dest, { replace: true });
    } catch (caught: any) {
      setError(caught?.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setBusy(false);
    }
  };

  const submitTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!teacherPassword.trim()) {
      setError('Silakan masukkan sandi khusus guru.');
      return;
    }

    setBusy(true);
    try {
      await loginAsTeacherWithPassword(teacherPassword.trim());
      enter({ role: 'teacher', name: 'Guru ATOMIKA' });
      const dest = returnTo && returnTo !== '/' ? returnTo : '/kelas';
      navigate(dest, { replace: true });
    } catch (caught: any) {
      setError(caught?.message || 'Sandi guru tidak sesuai');
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setError('');
    setBusy(true);

    try {
      if (isFirebaseConfigured && auth) {
        setFirebaseRememberSession(remember);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const cred = await signInWithPopup(auth, provider);
        const googleEmail = cred.user.email || '';

        if (!googleEmail) {
          await firebaseSignOut(auth);
          throw new Error('Gagal mendapatkan informasi email dari akun Google.');
        }

        // Cari akun di database Firestore berdasarkan UID atau Email
        let userDoc = await getUserProfile(cred.user.uid);
        if (!userDoc) {
          userDoc = await getUserProfileByEmail(googleEmail);
        }

        // Cek jika akun guru terotorisasi
        if (userDoc?.role === 'teacher' || (await isAuthorizedTeacherEmail(googleEmail))) {
          const isAuth = await isAuthorizedTeacherEmail(googleEmail);
          if (!isAuth) {
            await firebaseSignOut(auth);
            throw new Error('Akun guru Google ini belum diotorisasi. Hubungi administrator.');
          }
          enter({ role: 'teacher', name: userDoc?.name || cred.user.displayName || 'Guru ATOMIKA' });
          const dest = returnTo && returnTo !== '/' ? returnTo : '/kelas';
          navigate(dest, { replace: true });
          return;
        }

        if (userDoc && userDoc.status === 'inactive') {
          await firebaseSignOut(auth);
          throw new Error('Akun belum aktif atau telah dinonaktifkan.');
        }

        // Akses Murid: tidak memerlukan sandi atau registrasi manual
        const studentName =
          userDoc?.name || cred.user.displayName || googleEmail.split('@')[0] || 'Siswa ATOMIKA';
        const studentClass = userDoc?.className || 'X MIPA';
        const studentProfile: AccessProfile = {
          role: 'student',
          name: studentName,
          className: studentClass,
        };

        if (!userDoc) {
          try {
            await saveUserProfile({
              uid: cred.user.uid,
              email: googleEmail,
              name: studentName,
              className: studentClass,
              role: 'student',
              status: 'active',
              updatedAt: new Date().toISOString(),
            });
          } catch (e) {
            console.warn('Gagal menyimpan profil murid Google ke Firestore:', e);
          }
        }

        enter(studentProfile);
        const dest = returnTo && returnTo !== '/' ? returnTo : '/materi';
        navigate(dest, { replace: true });
        return;
      }

      if (supabase) {
        setSupabaseRememberSession(remember);
        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/login?next=${encodeURIComponent(returnTo)}`,
          },
        });
        if (authError) throw authError;
        return;
      }

      setError(
        'Layanan database/autentikasi belum dikonfigurasi. Silakan isi konfigurasi Firebase pada file .env.local terlebih dahulu.'
      );
    } catch (caught) {
      const authError =
        caught instanceof Error
          ? (caught as { message: string; code?: string })
          : { message: 'Google Sign-In gagal dimulai.' };
      setError(errorMessage(authError));
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className="auth-page">
        <div className="auth-loading">Memulihkan sesi...</div>
      </main>
    );
  }

  if (isReset && !profile && status === 'ready') {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <Brand />
          <div className="auth-heading">
            <h1>Tautan tidak tersedia</h1>
            <p>Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan pemulihan yang baru.</p>
          </div>
          <Link to="/forgot-password" className="auth-button auth-button-secondary">
            Kirim ulang tautan pemulihan
          </Link>
          <div className="auth-foot">
            <Link to="/login">Kembali ke halaman login</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Brand />

        {isLogin && (
          <div className="flex rounded-xl bg-[#FFF8F0] p-1 border border-[#F1E5D8] my-4 gap-1">
            <button
              type="button"
              onClick={() => {
                setLoginRole('student');
                setError('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                loginRole === 'student'
                  ? 'bg-[#C2410C] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#172033] hover:bg-orange-50/70'
              }`}
            >
              <UserRound className="w-4 h-4" aria-hidden="true" />
              <span>Masuk sebagai Murid</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginRole('teacher');
                setError('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                loginRole === 'teacher'
                  ? 'bg-[#C2410C] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#172033] hover:bg-orange-50/70'
              }`}
            >
              <GraduationCap className="w-4 h-4" aria-hidden="true" />
              <span>Masuk sebagai Guru</span>
            </button>
          </div>
        )}

        <div className="auth-heading">
          <h1>
            {loginRole === 'teacher' ? 'Portal Akses Guru' : 'Akses Siswa ATOMIKA'}
            {isForgot && ' · Atur Ulang Kata Sandi'}
            {isReset && ' · Buat Kata Sandi Baru'}
          </h1>
          <p>
            {loginRole === 'teacher'
              ? 'Masukkan sandi khusus guru untuk membuka Dashboard Guru dan manajemen kelas.'
              : 'Masukkan nama lengkap dan kelas untuk langsung mulai belajar Struktur Atom tanpa perlu kata sandi.'}
          </p>
        </div>

        {routeNotice && (
          <div className="auth-alert auth-alert-success" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{routeNotice}</span>
          </div>
        )}
        {notice && (
          <div className="auth-alert auth-alert-success" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{notice}</span>
          </div>
        )}
        {error && (
          <div className="auth-alert auth-alert-error" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {isLogin && loginRole === 'teacher' ? (
          <>
            <form onSubmit={submitTeacher} className="auth-form" noValidate>
              <PasswordField
                id="teacherPassword"
                label="Sandi Khusus Guru"
                value={teacherPassword}
                onChange={setTeacherPassword}
                autoComplete="current-password"
              />

              <div className="rounded-xl bg-[#FFF8F0] border border-[#F1E5D8] p-3 text-xs text-[#64748B] leading-relaxed">
                🔑 Guru dapat langsung mengakses Dashboard Guru menggunakan sandi otorisasi tanpa perlu mendaftarkan email satu per satu.
              </div>

              <button
                type="submit"
                className="auth-button auth-button-primary"
                disabled={busy}
              >
                {busy ? (
                  <span>Memvalidasi sandi...</span>
                ) : (
                  <span>Masuk sebagai Guru</span>
                )}
              </button>
            </form>

            <div className="auth-foot">
              <button
                type="button"
                onClick={() => {
                  setLoginRole('student');
                  setError('');
                }}
                className="auth-link-subtle text-xs"
              >
                Bukan guru? Masuk sebagai Murid di sini
              </button>
            </div>
          </>
        ) : !isForgot && !isReset ? (
          <>
            <form onSubmit={submitStudent} className="auth-form" noValidate>
              <label className="auth-field" htmlFor="studentName">
                <span>Nama Lengkap</span>
                <span className="auth-input-wrap">
                  <UserRound size={18} aria-hidden="true" />
                  <input
                    id="studentName"
                    name="studentName"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Contoh: Anisa Putri"
                    autoComplete="name"
                    maxLength={80}
                    required
                  />
                </span>
              </label>

              <label className="auth-field" htmlFor="studentClass">
                <span>Kelas</span>
                <span className="auth-input-wrap">
                  <GraduationCap size={18} aria-hidden="true" />
                  <input
                    id="studentClass"
                    name="studentClass"
                    type="text"
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    placeholder="Contoh: X MIPA 1"
                    autoComplete="organization"
                    maxLength={40}
                    required
                  />
                </span>
              </label>

              <div className="rounded-xl bg-[#FFF8F0] border border-[#F1E5D8] p-3 text-xs text-[#64748B] leading-relaxed">
                ✨ Akses Murid tidak memerlukan kata sandi. Cukup masukkan nama dan kelas untuk langsung mulai belajar dan bereksplorasi.
              </div>

              <button
                type="submit"
                className="auth-button auth-button-primary"
                disabled={busy}
              >
                {busy ? <span>Menyiapkan sesi belajar...</span> : <span>Mulai Belajar</span>}
              </button>
            </form>

            <div className="auth-divider">
              <span>atau</span>
            </div>

            <button
              type="button"
              className="auth-button auth-button-oauth"
              onClick={signInWithGoogle}
              disabled={busy}
            >
              <GoogleMark />
              <span>Masuk dengan Akun Google</span>
            </button>

            <div className="auth-foot">
              <button
                type="button"
                onClick={() => {
                  setLoginRole('teacher');
                  setError('');
                }}
                className="auth-link-subtle text-xs"
              >
                Bapak/Ibu Guru? Masuk dengan Sandi Guru di sini
              </button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={submit} className="auth-form" noValidate>
              {!isReset && (
                <label className="auth-field" htmlFor="email">
                  <span>Alamat Email</span>
                  <span className="auth-input-wrap">
                    <Mail size={18} aria-hidden="true" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="nama@sekolah.sch.id"
                      autoComplete="email"
                      required
                    />
                  </span>
                </label>
              )}

              {isReset && (
                <>
                  <PasswordField
                    id="password"
                    label="Kata Sandi Baru"
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                  />
                  <PasswordField
                    id="confirmation"
                    label="Konfirmasi Kata Sandi"
                    value={confirmation}
                    onChange={setConfirmation}
                    autoComplete="new-password"
                  />
                </>
              )}

              <button
                type="submit"
                className="auth-button auth-button-primary"
                disabled={busy}
              >
                {busy ? (
                  <span>Memproses...</span>
                ) : (
                  <span>{isForgot ? 'Kirim Tautan Pemulihan' : 'Simpan Kata Sandi'}</span>
                )}
              </button>
            </form>

            <div className="auth-foot">
              <Link to="/login" className="auth-foot-back">
                <ArrowLeft size={16} aria-hidden="true" />
                <span>Kembali ke halaman login</span>
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Brand() {
  return (
    <Link to="/" className="auth-brand" aria-label="Beranda ATOMIKA">
      <span className="auth-brand-badge">
        <Atom size={24} aria-hidden="true" />
      </span>
      <div>
        <span className="auth-brand-title">ATOMIKA</span>
        <span className="auth-brand-sub">Platform Kimia Fase E</span>
      </div>
    </Link>
  );
}
