import { useEffect, useState, type ReactNode } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../util/authClient';
import { AuthContext } from './auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = (session: Session | null) => {
    if (session?.access_token && session.user) {
      setToken(session.access_token);
      setUser(session.user);
    } else {
      setToken(null);
      setUser(null);
    }
  };

  const validateOrSignOut = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session ?? null;

    if (!session) {
      applySession(null);
      return;
    }

    const { data: u, error: uErr } = await supabase.auth.getUser();
    if (uErr || !u?.user) {
      await supabase.auth.signOut();
      applySession(null);
      return;
    }

    applySession({ ...session, user: u.user });
  };

  useEffect(() => {
    (async () => {
      try {
        await validateOrSignOut();
      } finally {
        setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            applySession(session);
            break;
          case 'SIGNED_OUT':
          case 'PASSWORD_RECOVERY':
            applySession(null);
            break;
          default:
            await validateOrSignOut();
            break;
        }
      }
    );

    const onVisible = async () => {
      if (document.visibilityState === 'visible') {
        await validateOrSignOut();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      sub?.subscription.unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      if (!data.session?.access_token || !data.session.user) {
        throw new Error('Login failed: No session returned');
      }
      applySession(data.session);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}` },
    });
    if (error) throw new Error(error.message);
    applySession(data.session ?? null);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    applySession(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, loginWithGoogle, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
