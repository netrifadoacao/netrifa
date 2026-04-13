/** Origens explícitas + previews Vercel (*.vercel.app). Opcional: ALLOWED_CORS_ORIGINS=url1,url2 no Supabase. */
const DEFAULT_ALLOW = [
  'https://netrifa.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
] as const

function extraAllowedFromEnv(): string[] {
  const raw = Deno.env.get('ALLOWED_CORS_ORIGINS')
  if (!raw?.trim()) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

function isAllowedOrigin(origin: string): boolean {
  if ((DEFAULT_ALLOW as readonly string[]).includes(origin)) return true
  if (extraAllowedFromEnv().includes(origin)) return true
  try {
    const u = new URL(origin)
    if (u.protocol === 'https:' && u.hostname.endsWith('.vercel.app')) return true
  } catch {
    /* ignore */
  }
  return false
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin')
  const allowOrigin =
    origin && isAllowedOrigin(origin) ? origin : origin ? DEFAULT_ALLOW[0] : '*'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  }
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}
