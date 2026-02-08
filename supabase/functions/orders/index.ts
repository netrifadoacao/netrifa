import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders } from '../_shared/cors.ts'
import { requireUser, requireAdmin, createSupabaseAdmin } from '../_shared/supabase.ts'

serve(async (req) => {
  const cors = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const url = new URL(req.url)
    const supabaseAdmin = createSupabaseAdmin()

    if (req.method === 'GET') {
      const user = await requireUser(req)
      const status = url.searchParams.get('status')
      let q = supabaseAdmin.from('orders').select('id, user_id, product_id, amount, status, created_at')
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') q = q.eq('user_id', user.id)
      if (status) q = q.eq('status', status === 'pendente' ? 'pending' : status === 'aprovado' ? 'paid' : status)
      const { data: orders, error } = await q.order('created_at', { ascending: false })
      if (error) throw error
      const list = []
      for (const o of orders ?? []) {
        const [prodRes, userRes] = await Promise.all([
          supabaseAdmin.from('products').select('name, price').eq('id', o.product_id).single(),
          supabaseAdmin.from('profiles').select('full_name, email').eq('id', o.user_id).single()
        ])
        list.push({
          id: o.id,
          usuarioId: o.user_id,
          produtoId: o.product_id,
          valor: o.amount,
          status: o.status === 'paid' ? 'aprovado' : o.status === 'pending' ? 'pendente' : o.status,
          produto: prodRes.data ? { nome: prodRes.data.name, preco: prodRes.data.price } : null,
          usuario: userRes.data ? { nome: userRes.data.full_name, email: userRes.data.email } : null,
          dataCompra: o.created_at
        })
      }
      return new Response(JSON.stringify(list), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      await requireAdmin(req)
      const body = await req.json().catch(() => ({}))
      const orderId = url.searchParams.get('id') ?? body.id ?? body.compraId
      const action = url.searchParams.get('action') ?? body.action ?? (body.aprovar !== undefined ? 'approve' : body.reprovar !== undefined ? 'reject' : null)
      if (!orderId) throw new Error('order id required')
      const newStatus = action === 'approve' || action === 'aprovar' ? 'paid' : action === 'reject' || action === 'reprovar' ? 'cancelled' : null
      if (!newStatus) throw new Error('action approve or reject required')
      const { data, error } = await supabaseAdmin.from('orders').update({ status: newStatus }).eq('id', orderId).select().single()
      if (error) throw error
      return new Response(JSON.stringify({ ...data, status: newStatus === 'paid' ? 'aprovado' : 'rejeitado' }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return new Response(JSON.stringify({ error: message }), { headers: { ...cors, 'Content-Type': 'application/json' }, status })
  }
})
