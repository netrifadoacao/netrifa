const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');

export function getAvatarDisplayUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) return null;
  const url = avatarUrl.startsWith('http')
    ? avatarUrl
    : SUPABASE_URL
      ? `${SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`
      : avatarUrl;
  if (!url) return null;
  return url.includes('?') ? url : `${url}?v=0`;
}
