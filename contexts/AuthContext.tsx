'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: 'admin' | 'member';
  referral_code?: string;
  wallet_balance?: number;
  sponsor_id?: string;
  phone?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  login: (email: string, senha: string) => Promise<{ session: { user: { id: string } } } | null>;
  loginAndGetRole: (email: string, senha: string) => Promise<'admin' | 'member' | null>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      if (event !== 'INITIAL_SESSION') {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar perfil:', error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Exceção ao buscar perfil:', err);
    }
  };

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
      const msg = tokenData?.msg ?? tokenData?.error_description ?? tokenData?.error ?? 'Falha no login';
      throw new Error(typeof msg === 'string' ? msg : 'Falha no login');
    }
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const userId = tokenData?.user?.id;
    if (!accessToken || !userId) return null;

    const profileUrl = `${base}/rest/v1/profiles?id=eq.${userId}&select=role`;
    const profileRes = await fetch(profileUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const profileJson = await profileRes.json().catch(() => []);
    const profileRow = Array.isArray(profileJson) && profileJson.length > 0 ? profileJson[0] : null;
    const role = profileRow?.role === 'admin' ? 'admin' : profileRow?.role ? 'member' : null;

    setUser(tokenData.user ?? null);
    if (profileRow) setProfile({ role: profileRow.role, id: userId, email: tokenData.user?.email ?? '' } as UserProfile);
    const sessionPayload = { access_token: accessToken, refresh_token: refreshToken ?? '' };
    await Promise.race([
      supabase.auth.setSession(sessionPayload),
      new Promise<void>((resolve) => setTimeout(resolve, 2500)),
    ]);
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

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, login, loginAndGetRole, register, logout, refreshProfile: async () => { if (user?.id) await fetchProfile(user.id); }, loading }}>
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
