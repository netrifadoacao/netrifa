'use client';

import { Tree, TreeNode } from 'react-organizational-chart';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  sponsor_id: string | null;
  referral_code: string | null;
  role: string | null;
  avatar_url?: string | null;
}

interface TreeProfileNode {
  profile: Profile;
  children: TreeProfileNode[];
  depth: number;
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

function AvatarCard({ profile: p, size = 64, childCount }: { profile: Profile; size?: number; childCount?: number }) {
  const isAdmin = p.role === 'admin';
  const initials = getInitials(p);
  const displayName = isAdmin ? 'Admin' : getFirstName(p);
  const fontSize = size <= 44 ? 'text-[8px]' : size <= 52 ? 'text-[9px]' : 'text-[10px]';
  return (
    <div className="relative inline-flex flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className={`absolute inset-0 rounded-full overflow-hidden border-2 ${
          isAdmin ? 'bg-amber-500/20 border-amber-500/50' : 'bg-primary-500/20 border-primary-500/40'
        }`}
      >
        {p.avatar_url ? (
          <img src={p.avatar_url} alt={p.full_name || ''} className="absolute inset-0 object-cover w-full h-full" />
        ) : (
          <span className="text-primary-300 font-bold flex items-center justify-center w-full h-full" style={{ fontSize: size * 0.35 }}>{initials}</span>
        )}
        <div className="absolute inset-x-0 bottom-0 py-1 bg-gradient-to-t from-black/85 to-transparent flex items-center justify-center w-full">
          <span className={`${fontSize} font-medium text-white truncate max-w-[85%] px-1`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }} title={p.full_name || p.email}>
            {displayName}
          </span>
        </div>
      </div>
      {(childCount ?? 0) > 0 && (
        <span className="absolute -bottom-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-primary-500 text-white text-xs font-semibold border-2 border-rich-black z-10">
          {childCount}
        </span>
      )}
    </div>
  );
}

function OrgTreeNodes({ node, size = 64 }: { node: TreeProfileNode; size?: number }) {
  const childSize = Math.max(44, size - 10);
  if (node.children.length === 0) {
    return <TreeNode label={<AvatarCard profile={node.profile} size={size} />} />;
  }
  return (
    <TreeNode label={<AvatarCard profile={node.profile} size={size} childCount={node.children.length} />}>
      {node.children.map((child) => (
        <OrgTreeNodes key={child.profile.id} node={child} size={childSize} />
      ))}
    </TreeNode>
  );
}

export default function AvatarTreeChart({ roots }: { roots: TreeProfileNode[] }) {
  return (
    <div className="flex justify-center min-w-max pb-8 [&_.org-chart]:!bg-transparent">
      {roots.map((root) => (
        <Tree
          key={root.profile.id}
          label={<AvatarCard profile={root.profile} size={64} childCount={root.children.length} />}
          lineWidth="2px"
          lineColor="rgba(255,255,255,0.4)"
          lineBorderRadius="4px"
          nodePadding="32px"
          lineHeight="24px"
        >
          {root.children.map((child) => (
            <OrgTreeNodes key={child.profile.id} node={child} size={54} />
          ))}
        </Tree>
      ))}
    </div>
  );
}
