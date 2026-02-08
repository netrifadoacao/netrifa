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
      let q = supabaseAdmin.from('withdrawals').select('*')
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
      const usuarioId = url.searchParams.get('usuarioId')
      if (profile?.role !== 'admin' && usuarioId && usuarioId !== user.id) throw new Error('Forbidden')
      if (profile?.role !== 'admin') q = q.eq('user_id', user.id)
      else if (usuarioId) q = q.eq('user_id', usuarioId)
      const { data: list, error } = await q.order('created_at', { ascending: false })
      if (error) throw error
      const withUser = []
      for (const s of list ?? []) {
        const { data: u } = await supabaseAdmin.from('profiles').select('full_name, email').eq('id', s.user_id).single()
        const statusMap: Record<string, string> = { pending: 'pendente', approved: 'aprovado', paid: 'pago', rejected: 'recusado' }
        withUser.push({
          ...s,
          usuarioId: s.user_id,
          valor: s.amount,
          status: statusMap[s.status] ?? s.status,
          metodoPagamento: s.pix_key ? 'pix' : 'banco',
          dadosPagamento: s.pix_key ? { pix: s.pix_key } : {},
          dataSolicitacao: s.created_at,
          dataAprovacao: s.approved_at,
          dataPagamento: s.paid_at,
          usuario: u ? { nome: u.full_name, email: u.email } : null
        })
      }
      return new Response(JSON.stringify(withUser), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'POST') {
      const user = await requireUser(req)
      const body = await req.json()
      const valor = Number(body.valor)
      const { data: configRows } = await supabaseAdmin.from('bonus_config').select('level, percentage')
      const minSaque = 50
      if (valor < minSaque) throw new Error(`Valor mínimo de saque é R$ ${minSaque.toFixed(2)}`)
      const { data: profile } = await supabaseAdmin.from('profiles').select('wallet_balance').eq('id', user.id).single()
      const saldo = Number(profile?.wallet_balance ?? 0)
      if (saldo < valor) throw new Error('Saldo insuficiente')
      const { data: novoSaque, error } = await supabaseAdmin.from('withdrawals').insert({
        user_id: user.id,
        amount: valor,
        status: 'pending',
        pix_key: body.pix_key ?? body.dadosPagamento?.chave,
        pix_key_type: body.pix_key_type ?? body.dadosPagamento?.tipo
      }).select().single()
      if (error) throw error
      await supabaseAdmin.from('profiles').update({ wallet_balance: saldo - valor }).eq('id', user.id)
      return new Response(JSON.stringify({
        id: novoSaque.id,
        usuarioId: user.id,
        valor: novoSaque.amount,
        status: 'pendente',
        dataSolicitacao: novoSaque.created_at
      }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      await requireAdmin(req)
      const body = await req.json().catch(() => ({}))
      const saqueId = url.searchParams.get('id') ?? body.id ?? body.saqueId
      const action = url.searchParams.get('action') ?? body.action
      if (!saqueId) throw new Error('id required')
      const { data: saque } = await supabaseAdmin.from('withdrawals').select('*').eq('id', saqueId).single()
      if (!saque) throw new Error('Saque não encontrado')
      if (action === 'approve' || action === 'aprovar') {
        await supabaseAdmin.from('withdrawals').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', saqueId)
      } else if (action === 'pay' || action === 'pagar') {
        await supabaseAdmin.from('withdrawals').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', saqueId)
      } else if (action === 'reject' || action === 'recusar') {
        await supabaseAdmin.from('withdrawals').update({ status: 'rejected' }).eq('id', saqueId)
        const saldo = Number((await supabaseAdmin.from('profiles').select('wallet_balance').eq('id', saque.user_id).single()).data?.wallet_balance ?? 0)
        await supabaseAdmin.from('profiles').update({ wallet_balance: saldo + Number(saque.amount) }).eq('id', saque.user_id)
      } else throw new Error('action required: approve, pay, reject')
      const { data: updated } = await supabaseAdmin.from('withdrawals').select('*').eq('id', saqueId).single()
      return new Response(JSON.stringify(updated), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return new Response(JSON.stringify({ error: message }), { headers: { ...cors, 'Content-Type': 'application/json' }, status })
  }
})
