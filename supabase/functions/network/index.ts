import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders } from '../_shared/cors.ts'
import { requireUser, createSupabaseAdmin } from '../_shared/supabase.ts'

serve(async (req) => {
  const cors = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const user = await requireUser(req)
    const url = new URL(req.url)
    const userId = url.searchParams.get('id') ?? url.searchParams.get('userId') ?? user.id
    const flat = url.searchParams.get('flat') === 'true' || url.searchParams.get('flat') === '1'
    const admin = createSupabaseAdmin()
    const { data: myProfile } = await admin.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = myProfile?.role === 'admin'
    if (userId !== user.id && !isAdmin) throw new Error('Forbidden')
    const supabase = createSupabaseAdmin()
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, full_name, email, sponsor_id, referral_code, role, avatar_url, created_at').order('created_at', { ascending: true })
    if (profilesError) throw profilesError
    if (flat && isAdmin) {
      const list = (profiles ?? []).map((p: { id: string; full_name: string | null; email: string; sponsor_id: string | null; referral_code?: string; role?: string; avatar_url?: string | null }) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        sponsor_id: p.sponsor_id,
        referral_code: p.referral_code ?? null,
        role: p.role ?? null,
        avatar_url: p.avatar_url ?? null,
      }))
      return new Response(JSON.stringify({ profiles: list }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }
    type P = { id: string; full_name: string | null; email: string; sponsor_id: string | null; referral_code?: string | null; role?: string | null; avatar_url?: string | null; created_at?: string | null }
    const list = (profiles ?? []) as P[]
    if (!isAdmin && userId === user.id) {
      const me = list.find((p) => p.id === user.id)
      const upline = me?.sponsor_id ? list.find((p) => p.id === me.sponsor_id) ?? null : null
      const getDirectsReal = (sid: string): P[] => list.filter((p) => p.sponsor_id === sid)
      const buildDown = (sid: string, nivel: number): { profile: P; children: unknown[] }[] => {
        if (nivel > 5) return []
        return getDirectsReal(sid).map((p) => ({ profile: p, children: buildDown(p.id, nivel + 1) }))
      }
      const downline = me ? buildDown(user.id, 1) : []
      return new Response(
        JSON.stringify({
          upline: upline ? { id: upline.id, full_name: upline.full_name, email: upline.email, sponsor_id: upline.sponsor_id, referral_code: upline.referral_code ?? null, role: upline.role ?? null, avatar_url: upline.avatar_url ?? null } : null,
          me: me ? { id: me.id, full_name: me.full_name, email: me.email, sponsor_id: me.sponsor_id, referral_code: me.referral_code ?? null, role: me.role ?? null, avatar_url: me.avatar_url ?? null } : null,
          downline,
        }),
        { headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }
    const build = (sid: string | null, nivel: number): unknown[] => {
      if (nivel > 5) return []
      const indicados = list.filter((p) => p.sponsor_id === sid)
      return indicados.map((p) => ({
        id: p.id,
        nome: p.full_name,
        email: p.email,
        nivel,
        indicados: build(p.id, nivel + 1)
      }))
    }
    const rede = build(userId, 1)
    return new Response(JSON.stringify({ rede, niveis: 5 }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return new Response(JSON.stringify({ error: message }), { headers: { ...cors, 'Content-Type': 'application/json' }, status })
  }
})
