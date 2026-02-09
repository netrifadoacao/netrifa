'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: 'admin' | 'member';
  referral_code?: string;
  wallet_balance?: number;
  sponsor_id?: string;
  phone?: string;
  bank_name?: string | null;
  bank_agency?: string | null;
  bank_account?: string | null;
  pix_key?: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  login: (email: string, senha: string) => Promise<{ session: { user: { id: string } } } | null>;
  loginAndGetRole: (email: string, senha: string) => Promise<'admin' | 'member' | null>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
  profileLoading: boolean;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const LOADING_TIMEOUT_MS = 2500;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type InitialUser = { id: string; email?: string } | null;
type InitialProfile = UserProfile | null;

export function AuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
}: {
  children: React.ReactNode;
  initialUser?: InitialUser;
  initialProfile?: InitialProfile;
}) {
  const [user, setUser] = useState<SupabaseUser | null>(initialUser as SupabaseUser | null);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile ?? null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!initialUser);
  const [profileLoading, setProfileLoading] = useState(!initialUser || initialProfile == null);
  const resolved = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (resolved.current) return;
    const t = setTimeout(() => {
      resolved.current = true;
      setLoading(false);
    }, LOADING_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      resolved.current = true;
      setSession(s ?? null);
      if (s?.user) {
        setUser(s.user);
        if (initialUser?.id === s.user.id && initialProfile != null) {
          setProfile(initialProfile);
          setProfileLoading(false);
        } else {
          setProfileLoading(true);
        }
        await fetchProfile(s.user.id);
      } else {
        if (!initialUser) {
          setUser(null);
          setProfile(null);
        }
        setProfileLoading(false);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s ?? null);
      setUser(s?.user ?? null);
      if (s?.user) {
        setProfileLoading(true);
        await fetchProfile(s.user.id);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const res = await fetch('/api/me/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          id: data.id,
          email: data.email ?? '',
          full_name: data.full_name ?? undefined,
          role: data.role === 'admin' || data.role === 'member' ? data.role : undefined,
          referral_code: data.referral_code ?? undefined,
          wallet_balance: Number(data.wallet_balance ?? 0),
          sponsor_id: data.sponsor_id ?? undefined,
          phone: data.phone ?? undefined,
          bank_name: data.bank_name ?? undefined,
          bank_agency: data.bank_agency ?? undefined,
          bank_account: data.bank_account ?? undefined,
          pix_key: data.pix_key ?? undefined,
          avatar_url: data.avatar_url ?? undefined,
        });
      } else {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (!error && data) setProfile(data);
      }
    } catch (err) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (!error && data) setProfile(data);
      } catch (_) {}
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id);
  }, [user?.id, fetchProfile]);

  const login = async (email: string, senha: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error) throw error;
    return data?.session ? { session: { user: { id: data.session.user.id } } } : null;
  };

  const loginAndGetRole = async (email: string, senha: string): Promise<'admin' | 'member' | null> => {
    const base = SUPABASE_URL.replace(/\/$/, '');
    const tokenUrl = `${base}/auth/v1/token?grant_type=password`;
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: senha,
        gotrue_meta_security: {},
      }),
    });
    const tokenData = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok) {
      const raw = tokenData?.msg ?? tokenData?.error_description ?? tokenData?.error ?? 'Falha no login';
      const msg = typeof raw === 'string' ? raw : 'Falha no login';
      const isUnconfirmed = /email\s*not\s*confirmed|email_not_confirmed|confirmação|confirmado/i.test(msg);
      throw new Error(isUnconfirmed ? 'Aguardando aprovação' : msg);
    }
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const userId = tokenData?.user?.id;
    if (!accessToken || !userId) return null;

    const payload = decodeJwtPayload(accessToken);
    const roleFromToken = payload?.user_role === 'admin' ? 'admin' : payload?.user_role === 'member' ? 'member' : null;

    setUser(tokenData.user ?? null);

    const fullProfileRes = await Promise.race([
      fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }).then(async (r) => {
        if (!r.ok) return null;
        const arr = await r.json().catch(() => null);
        return Array.isArray(arr) && arr[0] ? (arr[0] as UserProfile) : null;
      }),
      new Promise<UserProfile | null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]);

    const role = roleFromToken ?? (fullProfileRes?.role === 'admin' ? 'admin' : fullProfileRes?.role ? 'member' : null);
    const profileToSet: UserProfile = fullProfileRes
      ? { ...fullProfileRes, email: fullProfileRes.email ?? tokenData.user?.email ?? '', role: (fullProfileRes.role as 'admin' | 'member') ?? role ?? undefined }
      : { id: userId, email: tokenData.user?.email ?? '', role: role ?? undefined };
    setProfile(profileToSet);
    setProfileLoading(false);
    const sessionFromToken: Session = {
      access_token: accessToken,
      refresh_token: refreshToken ?? '',
      token_type: 'bearer',
      user: tokenData.user as Session['user'],
      expires_at: tokenData.expires_at ?? Math.floor(Date.now() / 1000) + (tokenData.expires_in ?? 3600),
      expires_in: tokenData.expires_in ?? 3600,
    };
    setSession(sessionFromToken);
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken ?? '' }).then(({ data: { session: s } }) => {
      if (s) setSession(s);
    }).catch(() => {});
    if (role) fetchProfile(userId).catch(() => {});
    return role;
  };

  const register = async (data: any) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
      options: {
        data: {
          full_name: data.nome,
          sponsor_referral_code: data.patrocinadorLink,
          phone: data.telefone ?? null
        }
      }
    });
    if (error) throw error;
  };

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    try {
      await fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/logout`, { method: 'POST' });
    } catch (_) {}
    if (typeof window !== 'undefined') {
      const localKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('sb-') || k.startsWith('supabase.') || k.includes('supabase'))) localKeys.push(k);
      }
      localKeys.forEach((k) => localStorage.removeItem(k));
      const sessionKeys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && (k.startsWith('sb-') || k.startsWith('supabase.') || k.includes('supabase'))) sessionKeys.push(k);
      }
      sessionKeys.forEach((k) => sessionStorage.removeItem(k));
      const cookies = document.cookie.split(';');
      for (const c of cookies) {
        const name = c.trim().split('=')[0].trim();
        if (!name) continue;
        if (name.startsWith('sb-') || name.includes('supabase')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      }
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, session, login, loginAndGetRole, register, logout, refreshProfile, loading, profileLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
