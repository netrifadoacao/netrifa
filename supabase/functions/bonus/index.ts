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
    if (userId !== user.id) {
      const admin = createSupabaseAdmin()
      const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') throw new Error('Forbidden')
    }
    const supabase = createSupabaseAdmin()
    const { data: txList, error } = await supabase
      .from('transactions')
      .select('id, amount, type, description, origin_order_id, created_at')
      .eq('user_id', userId)
      .eq('type', 'bonus')
      .order('created_at', { ascending: false })
    if (error) throw error
    const list = (txList ?? []).map((t: Record<string, unknown>) => ({
      id: t.id,
      usuarioId: userId,
      tipo: 'rede',
      valor: t.amount,
      data: t.created_at,
      origemCompraId: t.origin_order_id,
      origemUsuario: null
    }))
    return new Response(JSON.stringify(list), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return new Response(JSON.stringify({ error: message }), { headers: { ...cors, 'Content-Type': 'application/json' }, status })
  }
})
