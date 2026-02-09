'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useFunctions } from '@/lib/supabase-functions';
import { FiChevronDown, FiGitBranch, FiCircle } from 'react-icons/fi';
import type { RedeViewMode } from '@/components/AdminRedeFlow';

const AdminRedeFlow = dynamic(() => import('@/components/AdminRedeFlow'), { ssr: false });

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  sponsor_id: string | null;
  referral_code: string | null;
  role: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
}

type ViewMode = RedeViewMode;

export default function AdminRedePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const router = useRouter();
  const pathname = usePathname();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('vetor');
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const viewDropdownRef = useRef<HTMLDivElement>(null);

  const fetchStarted = useRef(false);
  useEffect(() => {
    if (pathname !== '/admin/rede') return;
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') {
      setLoading(false);
      router.push('/login');
      return;
    }
    if (fetchStarted.current) return;
    fetchStarted.current = true;
    setLoading(true);
    fetchProfiles().finally(() => { fetchStarted.current = false; });
  }, [pathname, authLoading, user, profile, router]);

  const fetchProfiles = async () => {
    try {
      setError(null);
      const res = await functions.network(undefined, { flat: true });
      const list = res.profiles ?? [];
      setProfiles(list.map((p) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        sponsor_id: p.sponsor_id,
        referral_code: p.referral_code ?? null,
        role: p.role ?? null,
        avatar_url: p.avatar_url ?? null,
        created_at: (p as { created_at?: string | null }).created_at ?? null,
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar rede');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(e.target as Node)) setViewDropdownOpen(false);
    };
    if (viewDropdownOpen) {
      document.addEventListener('click', onOutside);
      return () => document.removeEventListener('click', onOutside);
    }
  }, [viewDropdownOpen]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-steel-500 border-t-transparent" />
      </div>
    );
  }
  if (!user || profile?.role !== 'admin') return null;
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-steel-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white font-display">Rede em mapa</h1>
            <p className="mt-2 text-sm text-gray-400">
              {viewMode === 'vetor'
                ? 'Vetor horizontal: seta azul = indicação direta, amarela = bônus. 2º e 3º sob o mesmo sponsor sinalizados.'
                : viewMode === 'avatar'
                  ? 'Avatares em grafo. Use os controles para zoom e pan.'
                  : 'Organograma em árvore. Use os controles para zoom e pan.'}
            </p>
            {error && <p className="mt-2 text-sm text-steel-400">{error}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative" ref={viewDropdownRef}>
              <button
                type="button"
                onClick={() => setViewDropdownOpen((o) => !o)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-medium transition-all min-w-[140px] justify-between"
                title="Tipo de visualização"
              >
                <span className="flex items-center gap-2">
                  {viewMode === 'vetor' && <FiGitBranch className="w-4 h-4" />}
                  {viewMode === 'avatar' && <FiCircle className="w-4 h-4" />}
                  {viewMode === 'organogram' && <FiGitBranch className="w-4 h-4" />}
                  {viewMode === 'vetor' && 'Vetor'}
                  {viewMode === 'avatar' && 'Avatares'}
                  {viewMode === 'organogram' && 'Organograma'}
                </span>
                <FiChevronDown className={`w-4 h-4 transition-transform ${viewDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {viewDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 py-1 rounded-lg border border-white/10 bg-rich-black shadow-xl z-50 min-w-[160px]">
                  <button
                    type="button"
                    onClick={() => { setViewMode('vetor'); setViewDropdownOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'vetor' ? 'bg-steel-800 text-steel-200' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                  >
                    <FiGitBranch className="w-4 h-4 flex-shrink-0" />
                    Vetor
                  </button>
                  <button
                    type="button"
                    onClick={() => { setViewMode('avatar'); setViewDropdownOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'avatar' ? 'bg-steel-800 text-steel-200' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                  >
                    <FiCircle className="w-4 h-4 flex-shrink-0" />
                    Avatares
                  </button>
                  <button
                    type="button"
                    onClick={() => { setViewMode('organogram'); setViewDropdownOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'organogram' ? 'bg-steel-800 text-steel-200' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                  >
                    <FiGitBranch className="w-4 h-4 flex-shrink-0" />
                    Organograma
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] min-h-[420px]">
          {profiles.length === 0 ? (
            <div className="flex items-center justify-center h-[420px] rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
              Nenhum membro na rede ainda.
            </div>
          ) : (
            <AdminRedeFlow viewMode={viewMode} profiles={profiles} />
          )}
        </div>
      </div>
    </div>
  );
}
