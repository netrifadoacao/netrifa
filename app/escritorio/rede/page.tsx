'use client';

import { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useFunctions } from '@/lib/supabase-functions';
import toast from 'react-hot-toast';
import { FiChevronDown, FiChevronRight, FiMail, FiGitBranch, FiList, FiCircle, FiPlus, FiMinus, FiCopy } from 'react-icons/fi';
import { getAvatarDisplayUrl } from '@/lib/avatar';

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

interface TreeProfileNode {
  profile: Profile;
  children: TreeProfileNode[];
  depth: number;
}

type ApiDownlineNode = { profile: Profile; children: ApiDownlineNode[] };

function apiNodeToTree(node: ApiDownlineNode, depth: number): TreeProfileNode {
  return {
    profile: node.profile,
    children: node.children.map((c) => apiNodeToTree(c, depth + 1)),
    depth,
  };
}

type RedeNode = { id: string; nome?: string | null; email: string; nivel?: number; indicados?: RedeNode[] };

function redeToTreeNodes(nodes: RedeNode[], depth: number): TreeProfileNode[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((n) => ({
    profile: {
      id: n.id,
      full_name: n.nome ?? null,
      email: n.email,
      sponsor_id: null,
      referral_code: null,
      role: null,
      avatar_url: null,
    },
    children: redeToTreeNodes(n.indicados ?? [], depth + 1),
    depth,
  }));
}

function NodeCard({ profile: p, isAdmin, highlightMe }: { profile: Profile; isAdmin: boolean; highlightMe?: boolean }) {
  const initials = getInitials(p);
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 min-w-[220px] ${
        highlightMe
          ? 'bg-gold-900/30 border-gold-500/60 ring-1 ring-gold-400/40'
          : isAdmin
            ? 'bg-steel-800 border-steel-600'
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-steel-500/50'
      }`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 ${highlightMe ? 'border-gold-500' : isAdmin ? 'border-steel-500 bg-steel-800' : 'border-steel-600 bg-steel-800'}`}>
        {p.avatar_url ? (
          <img src={getAvatarDisplayUrl(p.avatar_url) ?? ''} alt={p.full_name || ''} className="w-full h-full object-cover" />
        ) : (
          <span className="text-steel-300 font-bold text-sm">{initials}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white truncate">
          {p.full_name || 'Sem nome'}
          {highlightMe && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gold-600/50 text-gold-100">Você</span>}
          {isAdmin && !highlightMe && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-steel-700 text-steel-200">Admin</span>}
        </p>
        <p className="text-sm text-gray-400 truncate flex items-center gap-1">
          <FiMail className="w-3 h-3 flex-shrink-0" />
          {p.email}
        </p>
        {p.referral_code && (
          <p className="text-xs text-steel-400 mt-0.5">Código: {p.referral_code}</p>
        )}
      </div>
    </div>
  );
}

function OrganogramNode({ node, depth = 0, currentUserId }: { node: TreeProfileNode; depth?: number; currentUserId?: string }) {
  const hasChildren = node.children.length > 0;
  const p = node.profile;
  const isAdmin = p.role === 'admin';
  const highlightMe = currentUserId ? p.id === currentUserId : false;

  return (
    <div className="flex flex-col items-center">
      <NodeCard profile={p} isAdmin={isAdmin} highlightMe={highlightMe} />
      {hasChildren && (
        <>
          <div className="w-0.5 h-6 bg-white/20" />
          <div className="flex border-t-2 border-white/20 pt-6 gap-8">
            {node.children.map((child) => (
              <div key={child.profile.id} className="flex flex-col items-center">
                <OrganogramNode node={child} depth={depth + 1} currentUserId={currentUserId} />
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
  currentUserId,
}: {
  node: TreeProfileNode;
  depth: number;
  defaultExpanded?: boolean;
  currentUserId?: string;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? depth < 2);
  const hasChildren = node.children.length > 0;
  const p = node.profile;
  const isAdmin = p.role === 'admin';
  const initials = getInitials(p);
  const highlightMe = currentUserId ? p.id === currentUserId : false;

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
          highlightMe ? 'bg-gold-900/30 border-gold-500/60' : isAdmin ? 'bg-steel-800 border-steel-600' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-steel-500/50'
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
        <div className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 ${highlightMe ? 'border-gold-500' : isAdmin ? 'border-steel-500 bg-steel-800' : 'border-steel-600 bg-steel-800'}`}>
          {p.avatar_url ? (
            <img src={getAvatarDisplayUrl(p.avatar_url) ?? ''} alt={p.full_name || ''} className="w-full h-full object-cover" />
          ) : (
            <span className="text-steel-300 font-bold text-sm">{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white truncate">
            {p.full_name || 'Sem nome'}
            {highlightMe && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gold-600/50 text-gold-100">Você</span>}
            {isAdmin && !highlightMe && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-steel-700 text-steel-200">Admin</span>}
          </p>
          <p className="text-sm text-gray-400 truncate flex items-center gap-1">
            <FiMail className="w-3 h-3 flex-shrink-0" />
            {p.email}
          </p>
          {p.referral_code && (
            <p className="text-xs text-steel-400 mt-0.5">Código: {p.referral_code}</p>
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
            <TopicNode key={child.profile.id} node={child} depth={depth + 1} defaultExpanded={depth < 1} currentUserId={currentUserId} />
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

export default function RedePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const router = useRouter();
  const pathname = usePathname();
  const [displayRoots, setDisplayRoots] = useState<TreeProfileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('organogram');
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [linkIndicacao, setLinkIndicacao] = useState('');
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
  }, [viewMode, zoom, displayRoots.length]);

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

  useEffect(() => {
    if (pathname !== '/escritorio/rede') return;
    if (authLoading) return;
    if (!user || profile?.role === 'admin') {
      router.push('/login');
      return;
    }
    if (profile?.referral_code) setLinkIndicacao(`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${profile.referral_code}`);
    setLoading(true);
    setError(null);
    functions
      .network(user.id)
      .then((data) => {
        const rede = data.rede;
        if (Array.isArray(rede)) {
          const meProfile: Profile = {
            id: profile?.id ?? user.id,
            full_name: profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? null,
            email: user.email ?? '',
            sponsor_id: null,
            referral_code: profile?.referral_code ?? null,
            role: profile?.role ?? null,
            avatar_url: profile?.avatar_url ?? null,
          };
          const downlineNodes = redeToTreeNodes(rede as RedeNode[], 0);
          const meNode: TreeProfileNode = { profile: meProfile, children: downlineNodes, depth: 0 };
          setDisplayRoots([meNode]);
          return;
        }
        const upline = data.upline ?? null;
        const me = data.me ?? null;
        const downline = (data.downline ?? []) as ApiDownlineNode[];
        if (!me) {
          setDisplayRoots([]);
          return;
        }
        const meProfile: Profile = {
          id: me.id,
          full_name: me.full_name,
          email: me.email,
          sponsor_id: me.sponsor_id,
          referral_code: me.referral_code ?? null,
          role: me.role ?? null,
          avatar_url: me.avatar_url ?? null,
        };
        const downlineNodes: TreeProfileNode[] = downline.map((n) => apiNodeToTree(n, 0));
        const meNode: TreeProfileNode = { profile: meProfile, children: downlineNodes, depth: 0 };
        if (upline) {
          const uplineProfile: Profile = {
            id: upline.id,
            full_name: upline.full_name,
            email: upline.email,
            sponsor_id: upline.sponsor_id,
            referral_code: upline.referral_code ?? null,
            role: upline.role ?? null,
            avatar_url: upline.avatar_url ?? null,
          };
          const root: TreeProfileNode = { profile: uplineProfile, children: [meNode], depth: 0 };
          setDisplayRoots([root]);
        } else {
          setDisplayRoots([meNode]);
        }
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Erro ao carregar rede');
        setDisplayRoots([]);
      })
      .finally(() => setLoading(false));
  }, [pathname, authLoading, user, profile, router, functions]);

  const copyLink = () => {
    navigator.clipboard.writeText(linkIndicacao);
    toast.success('Link copiado para a área de transferência!');
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-steel-500 border-t-transparent" />
      </div>
    );
  }
  if (!user || profile?.role === 'admin') return null;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Minha Rede</h1>
          <p className="mt-2 text-sm text-gray-400">
            Seu indicador (upline), você e seus afiliados (downline)
          </p>
        </div>

        <div className="mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4">Meu Link de Indicação</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={linkIndicacao}
              className="flex-1 block border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-steel-500 focus:border-steel-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg btn-gold-metallic"
            >
              <FiCopy className="w-4 h-4" />
              Copiar
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">
              {viewMode === 'organogram'
                ? 'Organograma. Arraste para navegar.'
                : viewMode === 'topic'
                  ? 'Estrutura em tópicos. Clique na seta para expandir ou recolher.'
                  : 'Avatares. Clique nos círculos para expandir ou recolher.'}
            </p>
            {error && <p className="mt-2 text-sm text-steel-400">{error}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode('organogram')}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  viewMode === 'organogram' ? 'bg-steel-800 border-steel-600 text-steel-300' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <FiGitBranch className="w-4 h-4" />
                Organograma
              </button>
              <button
                type="button"
                onClick={() => setViewMode('topic')}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  viewMode === 'topic' ? 'bg-steel-800 border-steel-600 text-steel-300' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <FiList className="w-4 h-4" />
                Tópicos
              </button>
              <button
                type="button"
                onClick={() => setViewMode('avatar')}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  viewMode === 'avatar' ? 'bg-steel-800 border-steel-600 text-steel-300' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
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
                className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiMinus className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-300 min-w-[52px] text-center">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM}
                className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
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
                Nenhum dado de rede para exibir.
              </div>
            ) : viewMode === 'organogram' ? (
              <div className="flex justify-center min-w-max pb-8">
                {displayRoots.map((node) => (
                  <OrganogramNode key={node.profile.id} node={node} currentUserId={user.id} />
                ))}
              </div>
            ) : viewMode === 'avatar' ? (
              <AvatarTreeChart roots={displayRoots} />
            ) : (
              <div className="space-y-3 max-w-3xl">
                {displayRoots.map((node) => (
                  <TopicNode key={node.profile.id} node={node} depth={0} defaultExpanded={true} currentUserId={user.id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
