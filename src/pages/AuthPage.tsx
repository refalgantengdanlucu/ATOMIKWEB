import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Atom, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAccess } from '../lib/access-context';
import { getRememberSession, isSupabaseConfigured, setRememberSession, supabase } from '../lib/supabase';
import './AuthPage.css';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

const passwordRequirements = [
  { label: 'Minimal 8 karakter', test: (value: string) => value.length >= 8 },
  { label: 'Huruf besar dan kecil', test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
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

function errorMessage(error: { message: string }) {
  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials')) return 'Email atau kata sandi tidak sesuai.';
  if (message.includes('user already registered')) return 'Email ini sudah terdaftar. Silakan login.';
  if (message.includes('password should be')) return 'Kata sandi belum memenuhi kebijakan keamanan.';
  if (message.includes('email not confirmed')) return 'Verifikasi email Anda terlebih dahulu sebelum login.';
  if (message.includes('rate limit')) return 'Terlalu banyak percobaan. Coba lagi beberapa saat.';
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
  const [remember, setRemember] = useState(getRememberSession);
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

    if (!supabase) {
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
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
        navigate(returnTo, { replace: true });
        return;
      }

      if (isRegister) {
        setRememberSession(remember);
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
        setNotice('Jika email terdaftar, tautan pemulihan akan dikirim. Silakan periksa kotak masuk Anda.');
        return;
      }

      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw authError;
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      navigate('/login', {
        replace: true,
        state: { notice: 'Kata sandi berhasil diperbarui. Silakan login kembali menggunakan kata sandi baru.' },
      });
    } catch (caught) {
      const authError = caught instanceof Error ? caught : new Error('Terjadi kesalahan autentikasi.');
      setError(errorMessage(authError));
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      setError('Layanan autentikasi belum dikonfigurasi. Hubungi administrator website.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      setRememberSession(remember);
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login?next=${encodeURIComponent(returnTo)}`,
        },
      });
      if (authError) throw authError;
    } catch (caught) {
      const authError = caught instanceof Error ? caught : new Error('Google Sign-In gagal dimulai.');
      setError(errorMessage(authError));
      setBusy(false);
    }
  };

  if (status === 'loading') {
    return <main className="auth-page"><div className="auth-loading">Memulihkan sesi...</div></main>;
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
          <Link className="auth-secondary-button" to="/forgot-password">Minta tautan baru</Link>
          <BackToLogin />
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <Brand />

        <div className="auth-heading">
          {isLogin && (
            <>
              <h1 id="auth-title">Selamat Datang Kembali!</h1>
              <p>Masuk untuk melanjutkan perjalanan belajar kimia Anda.</p>
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

        {!isSupabaseConfigured && (
          <div className="auth-message auth-message-error" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>Autentikasi belum aktif. Administrator perlu mengisi konfigurasi Supabase pada file environment.</span>
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

        {isLogin && (
          <>
            <button type="button" className="auth-google-button" onClick={() => void signInWithGoogle()} disabled={busy || !isSupabaseConfigured}>
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

          <button type="submit" className="auth-primary-button" disabled={busy || !isSupabaseConfigured}>
            {busy ? 'Memproses...' : isLogin ? 'Masuk' : isRegister ? 'Buat Akun' : isForgot ? 'Kirim Kode Verifikasi' : 'Simpan Kata Sandi'}
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
