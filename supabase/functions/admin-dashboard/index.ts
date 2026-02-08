import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { requireAdmin, createSupabaseAdmin } from '../_shared/supabase.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    await requireAdmin(req)
    const supabase = createSupabaseAdmin()
    const [ordersRes, profilesRes, productsRes] = await Promise.all([
      supabase.from('orders').select('id, status, amount'),
      supabase.from('profiles').select('id, role'),
      supabase.from('products').select('id, active')
    ])
    const orders = ordersRes.data ?? []
    const profiles = profilesRes.data ?? []
    const products = productsRes.data ?? []
    const comprasAprovadas = orders.filter((o: { status: string }) => o.status === 'paid')
    const totalVendidos = comprasAprovadas.length
    const faturamento = comprasAprovadas.reduce((acc: number, o: { amount: number }) => acc + Number(o.amount), 0)
    const quantidadeUsuarios = profiles.filter((p: { role: string }) => p.role === 'member').length
    const produtosAtivos = products.filter((p: { active: boolean }) => p.active).length
    const comprasPendentes = orders.filter((o: { status: string }) => o.status === 'pending').length
    return new Response(JSON.stringify({
      totalVendidos,
      faturamento,
      quantidadeUsuarios,
      produtosAtivos,
      comprasPendentes
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status })
  }
})
