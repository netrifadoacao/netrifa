'use client';

import React, { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Node,
  type Edge,
  type NodeProps,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  sponsor_id: string | null;
  role?: string | null;
  created_at?: string | null;
}

const NODE_W = 56;
const NODE_H = 56;
const DAGRE_DIR = 'LR';

function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: DAGRE_DIR, nodesep: 48, ranksep: 64 });
  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  const layouted = nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      sourcePosition: DAGRE_DIR === 'LR' ? Position.Right : Position.Bottom,
      targetPosition: DAGRE_DIR === 'LR' ? Position.Left : Position.Top,
    };
  });
  return layouted;
}

function RootNode({ data }: NodeProps) {
  const label = (data as { label?: string })?.label ?? 'EU';
  return (
    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-rich-black border-2 border-white/90 shadow-lg">
      <span className="text-xs font-bold text-white">{label}</span>
    </div>
  );
}

function MemberNode({ data }: NodeProps) {
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
  return (
    <div
      className={`flex flex-col items-center justify-center w-14 h-14 border-2 shadow-md ${shape} ${bg}`}
      title={d?.label}
    >
      <span className="text-xs font-semibold text-white truncate max-w-[52px] px-1">{d?.label ?? pos}</span>
    </div>
  );
}

const nodeTypes = { root: RootNode as React.ComponentType<NodeProps>, member: MemberNode as React.ComponentType<NodeProps> };

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

export default function AdminRedeGraph({ profiles }: { profiles: Profile[] }) {
  const { initialNodes, initialEdges } = useMemo(() => {
    if (profiles.length === 0) return { initialNodes: [], initialEdges: [] };
    const root = profiles.find((p) => p.role === 'admin' || !p.sponsor_id) ?? profiles[0];
    const depthPos = getDepthAndPosition(profiles, root.id);
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    profiles.forEach((p) => {
      const { depth, positionUnderSponsor } = depthPos.get(p.id) ?? { depth: 0, positionUnderSponsor: 0 };
      const isRoot = p.id === root.id;
      const label = isRoot ? 'EU' : p.full_name?.trim()?.split(/\s+/)[0] ?? p.email?.split('@')[0] ?? p.id.slice(0, 6);
      nodes.push({
        id: p.id,
        type: isRoot ? 'root' : 'member',
        position: { x: 0, y: 0 },
        data: isRoot ? { label: 'EU' } : { label, positionUnderSponsor, level: depth },
      });
      if (p.sponsor_id) {
        const isDirect = depth === 1;
        const stroke = isDirect ? '#3b82f6' : '#eab308';
        edges.push({
          id: `${p.sponsor_id}-${p.id}`,
          source: p.sponsor_id,
          target: p.id,
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: stroke },
          style: { stroke, strokeWidth: 2 },
        });
      }
    });
    const layouted = getLayoutedElements(nodes, edges);
    return { initialNodes: layouted, initialEdges: edges };
  }, [profiles]);

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
        defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 } }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.03)" gap={16} />
        <Controls className="!bg-white/5 !border-white/10 !rounded-lg [&>button]:!bg-white/5 [&>button]:!border-white/10 [&>button]:!text-gray-300" />
      </ReactFlow>
    </div>
  );
}
