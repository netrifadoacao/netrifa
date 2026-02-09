import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders } from '../_shared/cors.ts'
import { requireAdmin, createSupabaseAdmin } from '../_shared/supabase.ts'

const DAYS = 14

function formatDay(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function byDay(arr: { created_at?: string }[], days: number) {
  const map = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    map.set(d.toISOString().slice(0, 10), 0)
  }
  arr.forEach((r) => {
    if (!r.created_at) return
    const key = r.created_at.slice(0, 10)
    if (!map.has(key)) map.set(key, 0)
    map.set(key, map.get(key)! + 1)
  })
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([data, quantidade]) => ({ data: formatDay(new Date(data)), quantidade }))
}

serve(async (req) => {
  const cors = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    await requireAdmin(req)
    const supabase = createSupabaseAdmin()
    const from = new Date()
    from.setDate(from.getDate() - DAYS)
    const fromIso = from.toISOString()

    const [
      ordersRes,
      profilesRes,
      productsRes,
      withdrawalsRes,
      profilesCountRes,
    ] = await Promise.all([
      supabase.from('orders').select('id, user_id, status, amount, product_id, created_at'),
      supabase.from('profiles').select('id, role, created_at').gte('created_at', fromIso),
      supabase.from('products').select('id, name, active'),
      supabase.from('withdrawals').select('id, created_at').gte('created_at', fromIso),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ])

    const orders = ordersRes.data ?? []
    const profiles = profilesRes.data ?? []
    const products = productsRes.data ?? []
    const withdrawals = withdrawalsRes.data ?? []
    const totalUsuarios = profilesCountRes.count ?? 0
    const paid = orders.filter((o: { status: string }) => o.status === 'paid')
    const pending = orders.filter((o: { status: string }) => o.status === 'pending')
    const totalVendidos = paid.length
    const faturamento = paid.reduce((acc: number, o: { amount: number }) => acc + Number(o.amount), 0)
    const quantidadeUsuarios = totalUsuarios
    const produtosAtivos = products.filter((p: { active: boolean }) => p.active).length
    const comprasPendentes = pending.length

    const membersByDay = byDay(profiles, DAYS)
    const withdrawalsByDay = byDay(withdrawals, DAYS)

    const productCount: Record<string, number> = {}
    paid.forEach((o: { product_id?: string }) => {
      const id = o.product_id ?? 'sem-produto'
      productCount[id] = (productCount[id] ?? 0) + 1
    })
    const topProducts = Object.entries(productCount)
      .map(([id, vendas]) => ({
        nome: id === 'sem-produto' ? 'Sem produto' : (products.find((p: { id: string }) => p.id === id) as { name?: string } | undefined)?.name ?? id.slice(0, 8),
        vendas,
      }))
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 8)

    const recentPaid = (paid as { id: string; user_id: string; amount: number; created_at: string }[])
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .slice(0, 20)
    const orderIds = recentPaid.map((o) => o.id)
    const buyerIds = [...new Set(recentPaid.map((o) => o.user_id))]
    const { data: allProfiles } = await supabase.from('profiles').select('id, full_name, email, avatar_url, sponsor_id, created_at')
    const profilesList = (allProfiles ?? []) as { id: string; full_name: string | null; email: string; avatar_url: string | null; sponsor_id: string | null; created_at: string | null }[]
    const sponsorIds = [...new Set(profilesList.filter((p) => buyerIds.includes(p.id)).map((p) => p.sponsor_id).filter(Boolean) as string[])]
    const { data: txList } = await supabase.from('transactions').select('origin_order_id, amount').in('origin_order_id', orderIds).eq('type', 'bonus')
    const bonusByOrder: Record<string, number> = {}
    ;(txList ?? []).forEach((t: { origin_order_id: string; amount: number }) => {
      const oid = t.origin_order_id
      if (!oid) return
      bonusByOrder[oid] = (bonusByOrder[oid] ?? 0) + Number(t.amount)
    })
    const networkActivity = recentPaid.map((order) => {
      const buyer = profilesList.find((p) => p.id === order.user_id)
      const sponsorId = buyer?.sponsor_id ?? null
      const upline = sponsorId ? profilesList.find((p) => p.id === sponsorId) ?? null : null
      const siblings = sponsorId ? profilesList.filter((p) => p.sponsor_id === sponsorId).sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '')) : []
      const pos = buyer ? siblings.findIndex((p) => p.id === buyer.id) + 1 : 0
      const isPresente = pos === 2 || pos === 3
      return {
        orderId: order.id,
        createdAt: order.created_at,
        buyer: buyer ? { id: buyer.id, nome: buyer.full_name ?? buyer.email, email: buyer.email, avatar_url: buyer.avatar_url } : null,
        upline: upline ? { id: upline.id, nome: upline.full_name ?? upline.email, email: upline.email, avatar_url: upline.avatar_url } : null,
        bonusTotal: bonusByOrder[order.id] ?? 0,
        position: pos,
        isPresente,
        orderAmount: order.amount,
      }
    }).filter((a) => a.buyer != null)

    return new Response(JSON.stringify({
      totalVendidos,
      faturamento,
      quantidadeUsuarios,
      produtosAtivos,
      comprasPendentes,
      membersByDay,
      withdrawalsByDay,
      topProducts,
      networkActivity,
    }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return new Response(JSON.stringify({ error: message }), { headers: { ...cors, 'Content-Type': 'application/json' }, status })
  }
})
