import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Atom,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updatePassword as updateFirebasePassword,
  updateProfile,
} from 'firebase/auth';
import { useAccess } from '../lib/access-context';
import {
  auth,
  getRememberSession as getFirebaseRememberSession,
  isFirebaseConfigured,
  setRememberSession as setFirebaseRememberSession,
} from '../lib/firebase';
import { getUserProfile, saveUserProfile } from '../lib/firebase-db';
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
  const message = error.message.toLowerCase();
  const code = error.code ? error.code.toLowerCase() : '';

  if (
    message.includes('invalid login credentials') ||
    code.includes('invalid-credential') ||
    code.includes('wrong-password') ||
    code.includes('user-not-found')
  ) {
    return 'Email atau kata sandi tidak sesuai.';
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
  const { profile, status } = useAccess();
  const mode = location.pathname.replace(/^\//, '') as AuthMode;
  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot-password';
  const isReset = mode === 'reset-password';
  const stateFrom = (location.state as { from?: unknown } | null)?.from;
  const queryFrom = new URLSearchParams(location.search).get('next');
  const returnTo = safeReturnPath(stateFrom ?? queryFrom);

  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [remember, setRemember] = useState(() =>
    isFirebaseConfigured ? getFirebaseRememberSession() : getSupabaseRememberSession()
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const routeNotice = (location.state as { notice?: string } | null)?.notice ?? '';

  const strength = useMemo(() => passwordStrength(password), [password]);

  useEffect(() => {
    if (status === 'ready' && profile && !isReset) navigate(returnTo, { replace: true });
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
          await signInWithEmailAndPassword(auth, email.trim(), password);
          navigate(returnTo, { replace: true });
          return;
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

  const signInWithGoogle = async () => {
    setError('');
    setBusy(true);

    try {
      if (isFirebaseConfigured && auth) {
        setFirebaseRememberSession(remember);
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        const existing = await getUserProfile(cred.user.uid);
        if (!existing) {
          await saveUserProfile({
            uid: cred.user.uid,
            email: cred.user.email ?? '',
            name: cred.user.displayName ?? cred.user.email?.split('@')[0] ?? 'Pengguna ATOMIKA',
            className: 'Belum diatur',
            role: 'student',
            updatedAt: new Date().toISOString(),
          });
        }
        navigate(returnTo, { replace: true });
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
        <div className="auth-heading">
          <h1>
            {isLogin && 'Selamat Datang Kembali'}
            {isRegister && 'Buat Akun Siswa Baru'}
            {isForgot && 'Atur Ulang Kata Sandi'}
            {isReset && 'Buat Kata Sandi Baru'}
          </h1>
          <p>
            {isLogin && 'Masuk untuk melanjutkan pembelajaran interaktif kimia Anda.'}
            {isRegister && 'Daftar untuk mengakses modul, laboratorium virtual, dan kuis.'}
            {isForgot && 'Masukkan email yang terdaftar untuk menerima tautan pemulihan kata sandi.'}
            {isReset && 'Masukkan kata sandi baru untuk mengamankan akun Anda.'}
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

        <form onSubmit={submit} className="auth-form" noValidate>
          {isRegister && (
            <>
              <label className="auth-field" htmlFor="name">
                <span>Nama Lengkap</span>
                <span className="auth-input-wrap">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    autoComplete="name"
                    required
                  />
                </span>
              </label>

              <label className="auth-field" htmlFor="className">
                <span>Kelas</span>
                <span className="auth-input-wrap">
                  <input
                    id="className"
                    name="className"
                    type="text"
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    placeholder="Contoh: X MIPA 1"
                    autoComplete="organization"
                  />
                </span>
              </label>
            </>
          )}

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

          {!isForgot && (
            <PasswordField
              id="password"
              label={isReset ? 'Kata Sandi Baru' : 'Kata Sandi'}
              value={password}
              onChange={setPassword}
              autoComplete={isRegister || isReset ? 'new-password' : 'current-password'}
            />
          )}

          {(isRegister || isReset) && (
            <>
              <div className="auth-strength" aria-live="polite">
                <div className="auth-strength-bars">
                  {[1, 2, 3, 4].map((level) => (
                    <span
                      key={level}
                      className={strength >= level ? `auth-strength-${strength}` : ''}
                    />
                  ))}
                </div>
                <div className="auth-strength-checklist">
                  {passwordRequirements.map(({ label, test }) => (
                    <span
                      key={label}
                      className={test(password) ? 'is-satisfied' : 'is-unsatisfied'}
                    >
                      <ShieldCheck size={14} aria-hidden="true" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <PasswordField
                id="confirmation"
                label="Konfirmasi Kata Sandi"
                value={confirmation}
                onChange={setConfirmation}
                autoComplete="new-password"
              />
            </>
          )}

          {isLogin && (
            <div className="auth-row-between">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
              <Link to="/forgot-password" className="auth-link-subtle">
                Lupa kata sandi?
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="auth-button auth-button-primary"
            disabled={busy}
          >
            {busy ? (
              <span>Memproses...</span>
            ) : (
              <span>
                {isLogin && 'Masuk ke Akun'}
                {isRegister && 'Daftar Sekarang'}
                {isForgot && 'Kirim Tautan Pemulihan'}
                {isReset && 'Simpan Kata Sandi'}
              </span>
            )}
          </button>
        </form>

        {(isLogin || isRegister) && (
          <>
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
              <span>Lanjutkan dengan Google</span>
            </button>
          </>
        )}

        <div className="auth-foot">
          {isLogin && (
            <p>
              Belum memiliki akun? <Link to="/register">Daftar di sini</Link>
            </p>
          )}
          {isRegister && (
            <p>
              Sudah memiliki akun? <Link to="/login">Masuk sekarang</Link>
            </p>
          )}
          {(isForgot || isReset) && (
            <Link to="/login" className="auth-foot-back">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Kembali ke halaman login</span>
            </Link>
          )}
        </div>
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
