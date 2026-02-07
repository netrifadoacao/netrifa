'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { FiChevronDown, FiChevronRight, FiUser, FiMail, FiGitBranch, FiList } from 'react-icons/fi';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  sponsor_id: string | null;
  referral_code: string | null;
  role: string | null;
}

interface TreeNode {
  profile: Profile;
  children: TreeNode[];
  depth: number;
}

function buildTree(profiles: Profile[], parentId: string | null): TreeNode[] {
  return profiles
    .filter((p) => (parentId == null ? !p.sponsor_id : p.sponsor_id === parentId))
    .map((p) => ({
      profile: p,
      children: buildTree(profiles, p.id),
      depth: 0,
    }));
}

function NodeCard({ profile: p, isAdmin }: { profile: Profile; isAdmin: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 min-w-[220px] ${
        isAdmin
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary-500/20'
      }`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
        <FiUser className="w-5 h-5 text-primary-400" />
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

function OrganogramNode({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
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
  node: TreeNode;
  depth: number;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? depth < 2);
  const hasChildren = node.children.length > 0;
  const p = node.profile;
  const isAdmin = p.role === 'admin';

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
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
          <FiUser className="w-5 h-5 text-primary-400" />
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

type ViewMode = 'organogram' | 'topic';

export default function AdminRedePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('organogram');

  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') {
      setLoading(false);
      router.push('/login');
      return;
    }
    fetchProfiles();
  }, [authLoading, user, profile, router]);

  const fetchProfiles = async () => {
    try {
      setError(null);
      const supabase = createClient();
      const { data, error: e } = await supabase
        .from('profiles')
        .select('id, full_name, email, sponsor_id, referral_code, role')
        .order('created_at', { ascending: true });
      if (e) throw e;
      setProfiles(data ?? []);
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
  }] as TreeNode[] : [];

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white font-display">Rede em mapa</h1>
            <p className="mt-2 text-sm text-gray-400">
              {viewMode === 'organogram'
                ? 'Visualização em organograma. Estrutura hierárquica de indicados.'
                : 'Estrutura em tópicos. Clique na seta para expandir ou recolher.'}
            </p>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode('organogram')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
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
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                viewMode === 'topic'
                  ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                  : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
              title="Estrutura em tópicos"
            >
              <FiList className="w-4 h-4" />
              Tópicos
            </button>
          </div>
        </div>

        <div className={viewMode === 'organogram' ? 'overflow-x-auto py-6' : 'space-y-3'}>
          {displayRoots.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
              Nenhum membro na rede ainda.
            </div>
          ) : viewMode === 'organogram' ? (
            <div className="flex justify-center min-w-max pb-8">
              {displayRoots.map((node) => (
                <OrganogramNode key={node.profile.id} node={node} />
              ))}
            </div>
          ) : (
            displayRoots.map((node) => (
              <TopicNode key={node.profile.id} node={node} depth={0} defaultExpanded={true} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
