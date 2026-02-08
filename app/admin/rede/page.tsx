'use client';

import { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useFunctions } from '@/lib/supabase-functions';
import { FiChevronDown, FiChevronRight, FiUser, FiMail, FiGitBranch, FiList, FiCircle, FiPlus, FiMinus } from 'react-icons/fi';

const AvatarTreeChart = dynamic(() => import('@/components/AvatarTreeChart'), { ssr: false });

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  sponsor_id: string | null;
  referral_code: string | null;
  role: string | null;
  avatar_url?: string | null;
}

function getInitials(p: Profile): string {
  if (p.full_name?.trim()) {
    const parts = p.full_name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (p.email) return p.email[0].toUpperCase();
  return '?';
}

function getFirstName(p: Profile): string {
  if (p.full_name?.trim()) {
    return p.full_name.trim().split(/\s+/)[0];
  }
  if (p.email) return p.email.split('@')[0] || '?';
  return '?';
}

interface TreeProfileNode {
  profile: Profile;
  children: TreeProfileNode[];
  depth: number;
}

function buildTree(profiles: Profile[], parentId: string | null): TreeProfileNode[] {
  return profiles
    .filter((p) => (parentId == null ? !p.sponsor_id : p.sponsor_id === parentId))
    .map((p) => ({
      profile: p,
      children: buildTree(profiles, p.id),
      depth: 0,
    }));
}

function NodeCard({ profile: p, isAdmin }: { profile: Profile; isAdmin: boolean }) {
  const initials = getInitials(p);
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 min-w-[220px] ${
        isAdmin
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary-500/20'
      }`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 ${isAdmin ? 'border-amber-500/50 bg-amber-500/20' : 'border-primary-500/40 bg-primary-500/20'}`}>
        {p.avatar_url ? (
          <img src={p.avatar_url} alt={p.full_name || ''} className="w-full h-full object-cover" />
        ) : (
          <span className="text-primary-300 font-bold text-sm">{initials}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white truncate">
          {p.full_name || 'Sem nome'}
          {isAdmin && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300">Admin</span>}
        </p>
        <p className="text-sm text-gray-400 truncate flex items-center gap-1">
          <FiMail className="w-3 h-3 flex-shrink-0" />
          {p.email}
        </p>
        {p.referral_code && (
          <p className="text-xs text-primary-400/80 mt-0.5">Código: {p.referral_code}</p>
        )}
      </div>
    </div>
  );
}

function OrganogramNode({ node, depth = 0 }: { node: TreeProfileNode; depth?: number }) {
  const hasChildren = node.children.length > 0;
  const p = node.profile;
  const isAdmin = p.role === 'admin';

  return (
    <div className="flex flex-col items-center">
      <NodeCard profile={p} isAdmin={isAdmin} />
      {hasChildren && (
        <>
          <div className="w-0.5 h-6 bg-white/20" />
          <div className="flex border-t-2 border-white/20 pt-6 gap-8">
            {node.children.map((child) => (
              <div key={child.profile.id} className="flex flex-col items-center">
                <OrganogramNode node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TopicNode({
  node,
  depth,
  defaultExpanded,
}: {
  node: TreeProfileNode;
  depth: number;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? depth < 2);
  const hasChildren = node.children.length > 0;
  const p = node.profile;
  const isAdmin = p.role === 'admin';
  const initials = getInitials(p);

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
          isAdmin
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary-500/20'
        }`}
        style={{ marginLeft: depth * 24 }}
      >
        <button
          type="button"
          onClick={() => hasChildren && setExpanded((e) => !e)}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white"
        >
          {hasChildren ? expanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" /> : <span className="w-4" />}
        </button>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 ${isAdmin ? 'border-amber-500/50 bg-amber-500/20' : 'border-primary-500/40 bg-primary-500/20'}`}>
          {p.avatar_url ? (
            <img src={p.avatar_url} alt={p.full_name || ''} className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary-300 font-bold text-sm">{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white truncate">
            {p.full_name || 'Sem nome'}
            {isAdmin && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300">Admin</span>}
          </p>
          <p className="text-sm text-gray-400 truncate flex items-center gap-1">
            <FiMail className="w-3 h-3 flex-shrink-0" />
            {p.email}
          </p>
          {p.referral_code && (
            <p className="text-xs text-primary-400/80 mt-0.5">Código: {p.referral_code}</p>
          )}
        </div>
        {hasChildren && (
          <span className="flex-shrink-0 text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
            {node.children.length} indicado(s)
          </span>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="mt-2 space-y-2 border-l-2 border-white/10 ml-5 pl-4">
          {node.children.map((child) => (
            <TopicNode key={child.profile.id} node={child} depth={depth + 1} defaultExpanded={depth < 1} />
          ))}
        </div>
      )}
    </div>
  );
}

type ViewMode = 'organogram' | 'topic' | 'avatar';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.15;
const DEFAULT_ZOOM = 0.75;

export default function AdminRedePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const router = useRouter();
  const pathname = usePathname();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('organogram');
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const transformWrapperRef = useRef<HTMLDivElement>(null);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP)), []);

  useEffect(() => {
    setZoom(DEFAULT_ZOOM);
  }, [viewMode]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const wrapper = transformWrapperRef.current;
    const content = wrapper?.firstElementChild as HTMLElement | null;
    if (!viewport || !content) return;
    const vw = viewport.clientWidth;
    const cw = content.offsetWidth;
    const panX = vw / 2 - (cw * zoom) / 2;
    setPan({ x: panX, y: 0 });
  }, [viewMode, zoom, profiles.length]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: dragStartRef.current.panX + e.clientX - dragStartRef.current.x,
      y: dragStartRef.current.panY + e.clientY - dragStartRef.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    setPan({
      x: dragStartRef.current.panX + e.touches[0].clientX - dragStartRef.current.x,
      y: dragStartRef.current.panY + e.touches[0].clientY - dragStartRef.current.y,
    });
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd]);

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
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar rede');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }
  if (!user || profile?.role !== 'admin') return null;
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const roots = buildTree(profiles, null);
  const displayRoots = roots.length > 0 ? roots : profiles.length > 0 ? [{
    profile: profiles.find((p) => p.role === 'admin') || profiles[0],
    children: buildTree(profiles, profiles.find((p) => p.role === 'admin')?.id ?? profiles[0]?.id ?? ''),
    depth: 0,
  }] as TreeProfileNode[] : [];

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white font-display">Rede em mapa</h1>
            <p className="mt-2 text-sm text-gray-400">
              {viewMode === 'organogram'
                ? 'Visualização em organograma. Arraste para navegar.'
                : viewMode === 'topic'
                  ? 'Estrutura em tópicos. Clique na seta para expandir ou recolher.'
                  : 'Avatares. Clique nos círculos para expandir ou recolher.'}
            </p>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode('organogram')}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  viewMode === 'organogram'
                    ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                    : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
                title="Organograma"
              >
                <FiGitBranch className="w-4 h-4" />
                Organograma
              </button>
              <button
                type="button"
                onClick={() => setViewMode('topic')}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  viewMode === 'topic'
                    ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                    : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
                title="Estrutura em tópicos"
              >
                <FiList className="w-4 h-4" />
                Tópicos
              </button>
              <button
                type="button"
                onClick={() => setViewMode('avatar')}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  viewMode === 'avatar'
                    ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                    : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
                title="Avatares"
              >
                <FiCircle className="w-4 h-4" />
                Avatares
              </button>
            </div>
            <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= MIN_ZOOM}
                className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Diminuir zoom"
              >
                <FiMinus className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-300 min-w-[52px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM}
                className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Aumentar zoom"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={viewportRef}
          className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] min-h-[420px] select-none"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div
            ref={transformWrapperRef}
            className="absolute top-0 left-0 py-6 px-2 origin-top-left transition-transform will-change-transform"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              minWidth: viewMode === 'organogram' ? '100%' : undefined,
              minHeight: viewMode === 'avatar' ? 300 : undefined,
            }}
          >
            {displayRoots.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400 w-full">
                Nenhum membro na rede ainda.
              </div>
            ) : viewMode === 'organogram' ? (
              <div className="flex justify-center min-w-max pb-8">
                {displayRoots.map((node) => (
                  <OrganogramNode key={node.profile.id} node={node} />
                ))}
              </div>
            ) : viewMode === 'avatar' ? (
              <AvatarTreeChart roots={displayRoots} />
            ) : (
              <div className="space-y-3 max-w-3xl">
                {displayRoots.map((node) => (
                  <TopicNode key={node.profile.id} node={node} depth={0} defaultExpanded={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
