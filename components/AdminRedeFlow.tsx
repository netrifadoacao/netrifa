'use client';

import React, { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle,
  type Node,
  type Edge,
  type NodeProps,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { getAvatarDisplayUrl } from '@/lib/avatar';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  sponsor_id: string | null;
  referral_code: string | null;
  role: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
}

export type RedeViewMode = 'vetor' | 'avatar' | 'organogram';

const NODE_W_VETOR = 56;
const NODE_H_VETOR = 56;
const NODE_W_CARD = 220;
const NODE_H_CARD = 80;
const NODE_W_AVATAR = 48;
const NODE_H_AVATAR = 48;

function getInitials(p: Profile): string {
  if (p.full_name?.trim()) {
    const parts = p.full_name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (p.email) return p.email[0].toUpperCase();
  return '?';
}

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB',
  nodeWidth: number,
  nodeHeight: number
): Node[] {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: direction === 'LR' ? 48 : 32, ranksep: direction === 'LR' ? 64 : 48 });
  nodes.forEach((n) => g.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  const isHorizontal = direction === 'LR';
  return nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 },
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
    };
  });
}

function getDepthAndPosition(
  profiles: Profile[],
  rootId: string
): Map<string, { depth: number; positionUnderSponsor: number }> {
  const bySponsor = new Map<string | null, Profile[]>();
  profiles.forEach((p) => {
    const sid = p.sponsor_id ?? null;
    if (!bySponsor.has(sid)) bySponsor.set(sid, []);
    bySponsor.get(sid)!.push(p);
  });
  bySponsor.forEach((arr) => arr.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '')));
  const result = new Map<string, { depth: number; positionUnderSponsor: number }>();
  result.set(rootId, { depth: 0, positionUnderSponsor: 0 });
  const queue: { id: string; depth: number }[] = [{ id: rootId, depth: 0 }];
  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    const children = bySponsor.get(id) ?? [];
    children.forEach((c, idx) => {
      result.set(c.id, { depth: depth + 1, positionUnderSponsor: idx + 1 });
      queue.push({ id: c.id, depth: depth + 1 });
    });
  }
  return result;
}

function RootNode({ data, sourcePosition, targetPosition }: NodeProps) {
  const label = (data as { label?: string })?.label ?? 'EU';
  return (
    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-rich-black border-2 border-white/90 shadow-lg relative">
      <Handle type="target" position={targetPosition ?? Position.Left} />
      <Handle type="source" position={sourcePosition ?? Position.Right} />
      <span className="text-xs font-bold text-white">{label}</span>
    </div>
  );
}

function MemberNode({ data, sourcePosition, targetPosition }: NodeProps) {
  const d = data as { label?: string; positionUnderSponsor?: number; level?: number };
  const pos = d?.positionUnderSponsor ?? 0;
  const level = d?.level ?? 1;
  const isPresente = pos === 2 || pos === 3;
  const shape = isPresente ? 'rounded-lg' : 'rounded-full';
  const bg =
    level === 1
      ? 'bg-blue-600/90 border-blue-400'
      : isPresente
        ? 'bg-amber-500/90 border-amber-300'
        : 'bg-steel-600/90 border-steel-400';
  const ruleLabel = isPresente ? (pos === 2 ? '2º' : '3º') : null;
  return (
    <div
      className={`relative flex flex-col items-center justify-center w-14 h-14 border-2 shadow-md ${shape} ${bg}`}
      title={d?.label}
    >
      <Handle type="target" position={targetPosition ?? Position.Left} />
      <Handle type="source" position={sourcePosition ?? Position.Right} />
      <span className="text-xs font-semibold text-white truncate max-w-[52px] px-1">{d?.label ?? pos}</span>
      {ruleLabel && (
        <span className="absolute -top-1 -right-1 text-[10px] font-bold text-amber-900 bg-amber-300 rounded px-1">{ruleLabel}</span>
      )}
    </div>
  );
}

function CardNode({ data, sourcePosition, targetPosition }: NodeProps) {
  const { profile, isAdmin } = data as { profile: Profile; isAdmin: boolean };
  const p = profile;
  const initials = getInitials(p);
  return (
    <div
      className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 min-w-[200px] max-w-[220px] ${
        isAdmin
          ? 'bg-steel-800 border-steel-600'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-steel-500/50'
      }`}
    >
      <Handle type="target" position={targetPosition ?? Position.Top} />
      <Handle type="source" position={sourcePosition ?? Position.Bottom} />
      <div className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 ${isAdmin ? 'border-steel-500 bg-steel-800' : 'border-steel-600 bg-steel-800'}`}>
        {p.avatar_url ? (
          <img src={getAvatarDisplayUrl(p.avatar_url) ?? ''} alt={p.full_name || ''} className="w-full h-full object-cover" />
        ) : (
          <span className="text-steel-300 font-bold text-sm">{initials}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white truncate text-sm">
          {p.full_name || 'Sem nome'}
          {isAdmin && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-steel-700 text-steel-200">Admin</span>}
        </p>
        <p className="text-xs text-gray-400 truncate flex items-center gap-1">
          {p.email}
        </p>
        {p.referral_code && (
          <p className="text-xs text-steel-400 mt-0.5">Código: {p.referral_code}</p>
        )}
      </div>
    </div>
  );
}

function AvatarNode({ data, sourcePosition, targetPosition }: NodeProps) {
  const { profile } = data as { profile: Profile };
  const initials = getInitials(profile);
  return (
    <div className="relative flex items-center justify-center w-12 h-12 rounded-full border-2 border-steel-500 bg-steel-800 overflow-hidden shadow-md">
      <Handle type="target" position={targetPosition ?? Position.Left} />
      <Handle type="source" position={sourcePosition ?? Position.Right} />
      {profile.avatar_url ? (
        <img src={getAvatarDisplayUrl(profile.avatar_url) ?? ''} alt={profile.full_name || ''} className="w-full h-full object-cover" />
      ) : (
        <span className="text-steel-300 font-bold text-sm">{initials}</span>
      )}
    </div>
  );
}

const nodeTypes = {
  root: RootNode as React.ComponentType<NodeProps>,
  member: MemberNode as React.ComponentType<NodeProps>,
  card: CardNode as React.ComponentType<NodeProps>,
  avatar: AvatarNode as React.ComponentType<NodeProps>,
};

export default function AdminRedeFlow({ viewMode, profiles }: { viewMode: RedeViewMode; profiles: Profile[] }) {
  const { initialNodes, initialEdges } = useMemo(() => {
    if (profiles.length === 0) return { initialNodes: [], initialEdges: [] };
    const root = profiles.find((p) => p.role === 'admin' || !p.sponsor_id) ?? profiles[0];
    const depthPos = getDepthAndPosition(profiles, root.id);
    const rawNodes: Node[] = [];
    const edges: Edge[] = [];
    profiles.forEach((p) => {
      const { depth, positionUnderSponsor } = depthPos.get(p.id) ?? { depth: 0, positionUnderSponsor: 0 };
      const isRoot = p.id === root.id;
      const label = isRoot ? 'EU' : p.full_name?.trim()?.split(/\s+/)[0] ?? p.email?.split('@')[0] ?? p.id.slice(0, 6);
      let type: string;
      let data: Record<string, unknown>;
      if (viewMode === 'vetor') {
        type = isRoot ? 'root' : 'member';
        data = isRoot ? { label: 'EU' } : { label, positionUnderSponsor, level: depth };
      } else if (viewMode === 'organogram') {
        type = 'card';
        data = { profile: p, isAdmin: p.role === 'admin' };
      } else {
        type = 'avatar';
        data = { profile: p };
      }
      rawNodes.push({
        id: p.id,
        type,
        position: { x: 0, y: 0 },
        data,
      });
      if (p.sponsor_id) {
        const isDirect = depth === 1;
        const stroke = isDirect ? '#3b82f6' : '#eab308';
        edges.push({
          id: `${p.sponsor_id}-${p.id}`,
          source: p.sponsor_id,
          target: p.id,
          markerEnd: viewMode === 'vetor' ? { type: MarkerType.ArrowClosed, width: 20, height: 20, color: stroke } : undefined,
          style: viewMode === 'vetor' ? { stroke, strokeWidth: 2 } : { stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 },
        });
      }
    });
    const direction = viewMode === 'organogram' ? 'TB' : 'LR';
    const nodeWidth = viewMode === 'vetor' ? NODE_W_VETOR : viewMode === 'organogram' ? NODE_W_CARD : NODE_W_AVATAR;
    const nodeHeight = viewMode === 'vetor' ? NODE_H_VETOR : viewMode === 'organogram' ? NODE_H_CARD : NODE_H_AVATAR;
    const layouted = getLayoutedElements(rawNodes, edges, direction, nodeWidth, nodeHeight);
    return { initialNodes: layouted, initialEdges: edges };
  }, [profiles, viewMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (profiles.length === 0) return null;

  return (
    <div className="w-full h-[420px] rounded-xl overflow-hidden border border-white/10 bg-steel-950/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={viewMode === 'vetor' ? { markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 } } : undefined}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.03)" gap={16} />
        <Controls className="!bg-white/5 !border-white/10 !rounded-lg [&>button]:!bg-white/5 [&>button]:!border-white/10 [&>button]:!text-gray-300" />
      </ReactFlow>
    </div>
  );
}
