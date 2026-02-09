import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders } from '../_shared/cors.ts'
import { requireUser, createSupabaseAdmin } from '../_shared/supabase.ts'

const LIMIT = 10

serve(async (req) => {
  const cors = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    await requireUser(req)
    const supabase = createSupabaseAdmin()
    const { data: orders } = await supabase
      .from('orders')
      .select('id, user_id, amount, created_at')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(LIMIT)
    const paid = orders ?? []
    if (paid.length === 0) {
      return new Response(JSON.stringify({ networkActivity: [] }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }
    const orderIds = paid.map((o: { id: string }) => o.id)
    const buyerIds = [...new Set(paid.map((o: { user_id: string }) => o.user_id))]
    const { data: allProfiles } = await supabase.from('profiles').select('id, full_name, email, avatar_url, sponsor_id, created_at')
    const profilesList = (allProfiles ?? []) as { id: string; full_name: string | null; email: string; avatar_url: string | null; sponsor_id: string | null; created_at: string | null }[]
    const { data: txList } = await supabase.from('transactions').select('origin_order_id, amount').in('origin_order_id', orderIds).eq('type', 'bonus')
    const bonusByOrder: Record<string, number> = {}
    ;(txList ?? []).forEach((t: { origin_order_id: string; amount: number }) => {
      const oid = t.origin_order_id
      if (!oid) return
      bonusByOrder[oid] = (bonusByOrder[oid] ?? 0) + Number(t.amount)
    })
    const networkActivity = paid.map((order: { id: string; user_id: string; amount: number; created_at: string }) => {
      const buyer = profilesList.find((p: { id: string }) => p.id === order.user_id)
      const sponsorId = buyer?.sponsor_id ?? null
      const upline = sponsorId ? profilesList.find((p: { id: string }) => p.id === sponsorId) ?? null : null
      const siblings = sponsorId ? profilesList.filter((p: { sponsor_id: string | null }) => p.sponsor_id === sponsorId).sort((a: { created_at: string | null }, b: { created_at: string | null }) => (a.created_at || '').localeCompare(b.created_at || '')) : []
      const pos = buyer ? siblings.findIndex((p: { id: string }) => p.id === buyer.id) + 1 : 0
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
    }).filter((a: { buyer: unknown }) => a.buyer != null)

    return new Response(JSON.stringify({ networkActivity }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return new Response(JSON.stringify({ error: message }), { headers: { ...cors, 'Content-Type': 'application/json' }, status })
  }
})
