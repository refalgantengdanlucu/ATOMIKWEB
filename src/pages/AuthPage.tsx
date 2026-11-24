import { useEffect, useMemo, useState, type FormEvent } from 'react';
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
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
  type AuthError,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAccess } from '../lib/access-context';
import { loginAsTeacherWithPassword } from '../lib/teacher-auth';
import { applySessionPersistence, auth, db, getRememberSession, isFirebaseConfigured, setRememberSession } from '../lib/firebase';
import { SkeletonBlock } from '../components/Skeleton';
import './AuthPage.css';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

const passwordRequirements = [
  { label: 'Minimal 8 karakter', test: (value: string) => value.length >= 8 },
  { label: 'Huruf besar dan kecil', test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { label: 'Minimal satu angka', test: (value: string) => /\d/.test(value) },
];

const FIREBASE_SETUP_MESSAGE =
  'Login belum dapat digunakan karena konfigurasi Firebase belum tersedia. Isi VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, dan VITE_FIREBASE_APP_ID di .env.local, lalu mulai ulang aplikasi. Untuk situs online, isi variabel yang sama pada pengaturan environment hosting.';

function isValidPassword(value: string) {
  return passwordRequirements.every(({ test }) => test(value));
}

function passwordStrength(value: string) {
  if (!value) return 0;
  return [
    value.length >= 8,
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value),
    /[^a-zA-Z0-9]/.test(value),
  ].filter(Boolean).length;
}

function errorMessage(error: { message: string; code?: string }) {
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Email atau kata sandi tidak sesuai.',
    'auth/email-already-in-use': 'Email ini sudah terdaftar. Silakan login.',
    'auth/weak-password': 'Kata sandi belum memenuhi kebijakan keamanan.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa saat.',
    'auth/popup-closed-by-user': 'Jendela login Google ditutup sebelum proses selesai.',
    'auth/unauthorized-domain': 'Domain website belum diizinkan pada konfigurasi Firebase Authentication.',
    'auth/operation-not-allowed': 'Metode autentikasi ini belum diaktifkan pada Firebase.',
    'auth/expired-action-code': 'Tautan reset kata sandi sudah kedaluwarsa. Minta tautan baru.',
    'auth/invalid-action-code': 'Tautan reset kata sandi tidak valid atau sudah digunakan.',
    'auth/network-request-failed': 'Tidak dapat terhubung ke Firebase. Periksa koneksi internet, lalu coba lagi.',
  };
  return (error.code && messages[error.code]) || error.message;
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
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 5)" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.72 7.18l7.64 5.93c4.46-4.13 7.12-10.22 7.12-17.58Z" transform="translate(0 0)" />
      <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 5)" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.64-5.93c-2.13 1.43-4.86 2.28-8.26 2.28-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 0)" />
    </svg>
  );
}

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, status, clearProfile, enter } = useAccess();
  const mode = location.pathname.replace(/^\//, '') as AuthMode;
  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot-password';
  const isReset = mode === 'reset-password';
  const resetCode = new URLSearchParams(location.search).get('oobCode');
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
  const [remember, setRemember] = useState(getRememberSession);
  const [busy, setBusy] = useState(false);
  const [resetCodeValid, setResetCodeValid] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const routeNotice = (location.state as { notice?: string } | null)?.notice ?? '';
  const checkingResetCode = Boolean(isReset && resetCode && auth && isFirebaseConfigured && !error);

  const strength = useMemo(() => passwordStrength(password), [password]);

  useEffect(() => {
    if (!isReset || !resetCode || !auth) return;
    void verifyPasswordResetCode(auth, resetCode).then(() => {
      setResetCodeValid(true);
    }).catch((caught: AuthError) => {
      setError(errorMessage(caught));
    });
  }, [isReset, resetCode]);

  useEffect(() => {
    if (status === 'ready' && profile && (auth?.currentUser || profile.role === 'teacher') && !isReset) {
      const dest =
        returnTo && returnTo !== '/'
          ? returnTo
          : profile.role === 'teacher'
            ? '/kelas'
            : '/materi';
      navigate(dest, { replace: true });
    }
  }, [isReset, navigate, profile, returnTo, status]);

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
      const teacherUid = await loginAsTeacherWithPassword(teacherPassword.trim());
      if (enter) {
        enter({
          role: 'teacher',
          uid: teacherUid,
          name: 'Guru ATOMIKA',
          institutionId: 'atomika-sma',
        });
      }
      const dest = returnTo && returnTo !== '/' ? returnTo : '/kelas';
      navigate(dest, { replace: true });
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : 'Sandi guru tidak sesuai';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!auth) {
      setError('Layanan autentikasi belum dikonfigurasi. Hubungi administrator website.');
      return;
    }

    if ((isRegister || isReset) && !isValidPassword(password)) {
      setError('Kata sandi harus memiliki minimal 8 karakter, huruf besar dan kecil, serta angka.');
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
      if (isLogin) {
        setRememberSession(remember);
        clearProfile();
        if (auth.currentUser) await signOut(auth);
        await applySessionPersistence();
        const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (!user.emailVerified) {
          await signOut(auth);
          throw new Error('Verifikasi email Anda terlebih dahulu sebelum login.');
        }
        const dest = returnTo && returnTo !== '/' ? returnTo : '/materi';
        navigate(dest, { replace: true });
        return;
      }

      if (isRegister) {
        setRememberSession(remember);
        await applySessionPersistence();
        const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const fullName = name.trim().replace(/\s+/g, ' ');
        try {
          await updateProfile(user, { displayName: fullName });
          if (!db) throw new Error('Database Firebase belum dikonfigurasi.');
          await setDoc(doc(db, 'profiles', user.uid), {
            name: fullName,
            className: className.trim().replace(/\s+/g, ' '),
          });
          await sendEmailVerification(user, {
            url: `${window.location.origin}/login`,
            handleCodeInApp: true,
          });
        } catch (caught) {
          await signOut(auth);
          throw caught;
        }
        await signOut(auth);
        navigate('/login', {
          replace: true,
          state: { notice: 'Akun berhasil dibuat. Verifikasi email dari kotak masuk sebelum login.' },
        });
        return;
      }

      if (isForgot) {
        await sendPasswordResetEmail(auth, email.trim(), {
          url: `${window.location.origin}/reset-password`,
          handleCodeInApp: true,
        });
        setNotice('Jika email terdaftar, tautan pemulihan akan dikirim. Silakan periksa kotak masuk Anda.');
        return;
      }

      if (!resetCode) throw new Error('Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.');
      await confirmPasswordReset(auth, resetCode, password);
      navigate('/login', {
        replace: true,
        state: { notice: 'Kata sandi berhasil diperbarui. Silakan login kembali menggunakan kata sandi baru.' },
      });
    } catch (caught) {
      const authError = caught instanceof Error ? caught : new Error('Terjadi kesalahan autentikasi.');
      let message = errorMessage(authError);
      if (isLogin) {
        clearProfile();
        if (auth.currentUser) {
          try {
            await signOut(auth);
          } catch (cleanupError) {
            console.error('Gagal membersihkan sesi Firebase setelah login gagal:', cleanupError);
            message += ' Sesi lama belum dapat dibersihkan, tetapi Anda dapat mencoba login kembali.';
          }
        }
      }
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      setError('Layanan autentikasi belum dikonfigurasi. Hubungi administrator website.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      setRememberSession(remember);
      await applySessionPersistence();
      await signInWithPopup(auth, new GoogleAuthProvider());
      const dest = returnTo && returnTo !== '/' ? returnTo : '/materi';
      navigate(dest, { replace: true });
    } catch (caught) {
      const authError = caught instanceof Error ? caught : new Error('Google Sign-In gagal dimulai.');
      setError(errorMessage(authError));
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className="auth-page">
        <section className="auth-card" role="status" aria-busy="true">
          <span className="sr-only">Memulihkan sesi...</span>
          <div className="mb-7 flex items-center gap-3">
            <SkeletonBlock className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-32 rounded" />
              <SkeletonBlock className="h-3 w-44 max-w-full rounded" />
            </div>
          </div>
          <SkeletonBlock className="mb-3 h-7 w-3/4 rounded" />
          <SkeletonBlock className="mb-8 h-4 w-full rounded" />
          <SkeletonBlock className="mb-4 h-12 w-full rounded-xl" />
          <SkeletonBlock className="mb-4 h-12 w-full rounded-xl" />
          <SkeletonBlock className="h-12 w-full rounded-xl" />
        </section>
      </main>
    );
  }

  if (isReset && !resetCodeValid) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <Brand />
          <div className="auth-heading">
            {checkingResetCode ? (
              <div role="status" aria-busy="true" className="space-y-3">
                <span className="sr-only">Memeriksa tautan reset...</span>
                <SkeletonBlock className="h-8 w-56 max-w-full rounded" />
                <SkeletonBlock className="h-4 w-full rounded" />
                <SkeletonBlock className="h-4 w-4/5 rounded" />
              </div>
            ) : (
              <>
                <h1>Tautan tidak tersedia</h1>
                <p>{!isFirebaseConfigured
                  ? FIREBASE_SETUP_MESSAGE
                  : resetCode
                    ? 'Tautan pemulihan tidak dapat diverifikasi. Periksa koneksi, lalu minta tautan baru.'
                    : 'Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan pemulihan yang baru.'}</p>
              </>
            )}
          </div>
          {error && <div className="auth-message auth-message-error" role="alert"><AlertCircle size={18} aria-hidden="true" /><span>{error}</span></div>}
          {!resetCode && isFirebaseConfigured && <Link className="auth-secondary-button" to="/forgot-password">Minta tautan baru</Link>}
          <BackToLogin />
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <Brand />

        {isLogin && (
          <div className="mb-4 mt-6 flex rounded-xl border border-[#F1E5D8] bg-[#FFF8F0] p-1">
            <button
              type="button"
              onClick={() => {
                setLoginRole('student');
                setError('');
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all sm:text-sm ${
                loginRole === 'student'
                  ? 'bg-[#C2410C] text-white shadow-xs'
                  : 'text-[#475569] hover:bg-orange-50/70 hover:text-[#172033]'
              }`}
            >
              <UserRound size={16} aria-hidden="true" />
              <span>Masuk sebagai Murid</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginRole('teacher');
                setError('');
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all sm:text-sm ${
                loginRole === 'teacher'
                  ? 'bg-[#C2410C] text-white shadow-xs'
                  : 'text-[#475569] hover:bg-orange-50/70 hover:text-[#172033]'
              }`}
            >
              <GraduationCap size={16} aria-hidden="true" />
              <span>Masuk sebagai Guru</span>
            </button>
          </div>
        )}

        <div className="auth-heading">
          {isLogin && (
            <>
              <h1 id="auth-title">
                {loginRole === 'teacher' ? 'Portal Akses Guru' : 'Selamat Datang Kembali!'}
              </h1>
              <p>
                {loginRole === 'teacher'
                  ? 'Masukkan sandi khusus guru untuk membuka Dashboard Guru.'
                  : 'Masuk untuk melanjutkan perjalanan belajar kimia Anda.'}
              </p>
            </>
          )}
          {isRegister && (
            <>
              <h1 id="auth-title">Buat Akun Baru</h1>
              <p>Daftar sekarang untuk mulai menggunakan website.</p>
            </>
          )}
          {isForgot && (
            <>
              <h1 id="auth-title">Lupa Kata Sandi?</h1>
              <p>Masukkan email akun Anda. Kami akan mengirim tautan untuk memulihkan akses.</p>
            </>
          )}
          {isReset && (
            <>
              <h1 id="auth-title">Buat Kata Sandi Baru</h1>
              <p>Pilih kata sandi baru yang kuat untuk melindungi akun Anda.</p>
            </>
          )}
        </div>

        {!isFirebaseConfigured && (
          <div className="auth-message auth-message-error" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{FIREBASE_SETUP_MESSAGE}</span>
          </div>
        )}
        {(notice || routeNotice) && (
          <div className="auth-message auth-message-success" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{notice || routeNotice}</span>
          </div>
        )}
        {error && (
          <div className="auth-message auth-message-error" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {isLogin && loginRole === 'teacher' ? (
          <>
            <form className="auth-form" onSubmit={(event) => void submitTeacher(event)}>
              <PasswordField
                id="teacher-password"
                label="Sandi Khusus Guru"
                value={teacherPassword}
                onChange={setTeacherPassword}
                autoComplete="current-password"
              />

              <div className="rounded-xl border border-[#F1E5D8] bg-[#FFF8F0] p-3 text-xs leading-relaxed text-[#64748B]">
                🔑 Guru dapat langsung mengakses Dashboard Guru menggunakan sandi otorisasi tanpa perlu mendaftarkan email satu per satu.
              </div>

              <button
                type="submit"
                className="auth-primary-button"
                disabled={busy || !isFirebaseConfigured}
                aria-busy={busy}
              >
                {busy ? (
                  <>
                    <span className="sr-only">Memvalidasi sandi...</span>
                    <SkeletonBlock className="skeleton-on-brand h-3.5 w-24 rounded" />
                  </>
                ) : (
                  'Masuk sebagai Guru'
                )}
              </button>
            </form>

            <p className="auth-switch">
              <button
                type="button"
                onClick={() => {
                  setLoginRole('student');
                  setError('');
                }}
                className="text-xs font-semibold text-[#B53C0B] hover:underline"
              >
                Bukan guru? Masuk sebagai Murid di sini
              </button>
            </p>
          </>
        ) : (
          <>
            {isLogin && (
              <>
                <button type="button" className="auth-google-button" onClick={() => void signInWithGoogle()} disabled={busy || !isFirebaseConfigured}>
                  <GoogleMark />
                  <span>Login dengan Google</span>
                </button>
                <div className="auth-divider"><span>Atau masuk menggunakan email</span></div>
              </>
            )}

            <form className="auth-form" onSubmit={(event) => void submit(event)}>
              {isRegister && (
                <label className="auth-field" htmlFor="full-name">
                  <span>Nama lengkap</span>
                  <span className="auth-input-wrap">
                    <span className="auth-user-icon" aria-hidden="true">A</span>
                    <input id="full-name" name="name" type="text" autoComplete="name" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} required />
                  </span>
                </label>
              )}

              {isRegister && (
                <label className="auth-field" htmlFor="class-name">
                  <span>Kelas <span className="auth-optional">(opsional)</span></span>
                  <span className="auth-input-wrap">
                    <span className="auth-user-icon" aria-hidden="true">K</span>
                    <input id="class-name" name="className" type="text" autoComplete="off" maxLength={40} placeholder="Contoh: XI IPA 1" value={className} onChange={(event) => setClassName(event.target.value)} />
                  </span>
                </label>
              )}

              {(isLogin || isRegister || isForgot) && (
                <label className="auth-field" htmlFor="email">
                  <span>Alamat email</span>
                  <span className="auth-input-wrap">
                    <Mail size={18} aria-hidden="true" />
                    <input id="email" name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required />
                  </span>
                </label>
              )}

              {(isLogin || isRegister || isReset) && (
                <PasswordField
                  id={isReset ? 'new-password' : 'password'}
                  label={isReset ? 'Kata sandi baru' : 'Kata sandi'}
                  value={password}
                  onChange={setPassword}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              )}

              {(isRegister || isReset) && (
                <>
                  <div className="auth-password-rules" aria-live="polite">
                    {passwordRequirements.map(({ label, test }) => (
                      <span key={label} className={test(password) ? 'is-valid' : ''}>
                        <CheckCircle2 size={14} aria-hidden="true" /> {label}
                      </span>
                    ))}
                  </div>
                  <PasswordField
                    id="confirm-password"
                    label="Konfirmasi kata sandi"
                    value={confirmation}
                    onChange={setConfirmation}
                    autoComplete="new-password"
                  />
                  <div className="auth-strength" aria-label={`Kekuatan kata sandi: ${strength} dari 4`}>
                    <div className="auth-strength-bars">
                      {[1, 2, 3, 4].map((level) => <span key={level} className={strength >= level ? `strength-${strength}` : ''} />)}
                    </div>
                    <span>{password ? ['Lemah', 'Lemah', 'Cukup', 'Baik', 'Kuat'][strength] : 'Kekuatan kata sandi'}</span>
                  </div>
                </>
              )}

              {isRegister && (
                <label className="auth-checkbox">
                  <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                  <span>Ingat kata sandi saya</span>
                  <span className="auth-checkbox-note">Sesi diingat di perangkat ini; kata sandi tidak disimpan.</span>
                </label>
              )}

              {isLogin && (
                <div className="auth-form-options">
                  <label className="auth-checkbox">
                    <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                    <span>Ingat saya di perangkat ini</span>
                  </label>
                  <Link to="/forgot-password">Lupa kata sandi?</Link>
                </div>
              )}

              <button type="submit" className="auth-primary-button" disabled={busy || !isFirebaseConfigured} aria-busy={busy}>
                {busy ? (
                  <>
                    <span className="sr-only">Memproses...</span>
                    <SkeletonBlock className="skeleton-on-brand h-3.5 w-24 rounded" />
                  </>
                ) : isLogin ? 'Masuk' : isRegister ? 'Buat Akun' : isForgot ? 'Kirim Tautan Pemulihan' : 'Simpan Kata Sandi'}
              </button>
            </form>

            {isLogin && (
              <p className="auth-switch">Belum memiliki akun? <Link to="/register">Daftar Sekarang</Link></p>
            )}
            {isRegister && (
              <p className="auth-switch">Sudah memiliki akun? <Link to="/login">Login</Link></p>
            )}
            {isForgot && <BackToLogin />}
            {isReset && (
              <p className="auth-security-note"><ShieldCheck size={16} aria-hidden="true" /> Kata sandi dienkripsi dan dikelola oleh sistem autentikasi.</p>
            )}
          </>
        )}
      </section>
      <p className="auth-footer">ATOMIKA · Belajar kimia dengan cara yang lebih interaktif</p>
    </main>
  );
}

function Brand() {
  return (
    <Link to="/login" className="auth-brand" aria-label="ATOMIKA">
      <span className="auth-brand-icon"><Atom size={25} aria-hidden="true" /></span>
      <span><strong>ATOMIKA</strong><small>Struktur Atom Interaktif</small></span>
    </Link>
  );
}

function BackToLogin() {
  return <Link to="/login" className="auth-back-link"><ArrowLeft size={16} aria-hidden="true" /> Kembali ke halaman login</Link>;
}
