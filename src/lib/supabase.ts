import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const rememberSessionKey = 'atomika-remember-session-v1';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function setRememberSession(remember: boolean) {
  try {
    window.localStorage.setItem(rememberSessionKey, String(remember));
  } catch (error) {
    console.error('Preferensi sesi tidak dapat disimpan:', error);
    throw new Error('Pengaturan sesi tidak dapat disimpan pada browser ini.');
  }
}

export function getRememberSession() {
  try {
    return window.localStorage.getItem(rememberSessionKey) === 'true';
  } catch (error) {
    console.error('Preferensi sesi tidak dapat dibaca:', error);
    return false;
  }
}

function shouldRememberSession() {
  return getRememberSession();
}

function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storage: {
          getItem: (key) => shouldRememberSession()
            ? window.localStorage.getItem(key)
            : window.sessionStorage.getItem(key),
          setItem: (key, value) => {
            if (shouldRememberSession()) {
              window.localStorage.setItem(key, value);
              window.sessionStorage.removeItem(key);
            } else {
              window.sessionStorage.setItem(key, value);
              window.localStorage.removeItem(key);
            }
          },
          removeItem: (key) => {
            window.localStorage.removeItem(key);
            window.sessionStorage.removeItem(key);
          },
        },
      },
    })
}

export const supabase = createSupabaseClient();
