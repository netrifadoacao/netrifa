import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { requireUser, createSupabaseAdmin } from '../_shared/supabase.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const user = await requireUser(req)
    const url = new URL(req.url)
    const userId = url.searchParams.get('id') ?? url.searchParams.get('userId') ?? user.id
    if (userId !== user.id) {
      const admin = createSupabaseAdmin()
      const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') throw new Error('Forbidden')
    }
    const supabase = createSupabaseAdmin()
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, sponsor_id')
    const build = (sid: string | null, nivel: number): unknown[] => {
      if (nivel > 5) return []
      const indicados = (profiles ?? []).filter((p: { sponsor_id: string | null }) => p.sponsor_id === sid)
      return indicados.map((p: { id: string; full_name: string; email: string }) => ({
        id: p.id,
        nome: p.full_name,
        email: p.email,
        nivel,
        indicados: build(p.id, nivel + 1)
      }))
    }
    const rede = build(userId, 1)
    return new Response(JSON.stringify({ rede, niveis: 5 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status })
  }
})
