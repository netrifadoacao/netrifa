import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

const LIMIT = 10

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const admin = createAdminClient()
  const { data: orders } = await admin
    .from('orders')
    .select('id, user_id, amount, created_at')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(LIMIT)
  const paid = orders ?? []
  if (paid.length === 0) {
    return NextResponse.json({ networkActivity: [] })
  }
  const orderIds = paid.map((o) => o.id)
  const buyerIds = Array.from(new Set(paid.map((o) => o.user_id)))
  const { data: allProfiles } = await admin.from('profiles').select('id, full_name, email, avatar_url, sponsor_id, created_at')
  const profilesList = allProfiles ?? []
  const { data: txList } = await admin
    .from('transactions')
    .select('origin_order_id, amount')
    .in('origin_order_id', orderIds)
    .eq('type', 'bonus')
  const bonusByOrder: Record<string, number> = {}
  ;(txList ?? []).forEach((t) => {
    const oid = t.origin_order_id
    if (!oid) return
    bonusByOrder[oid] = (bonusByOrder[oid] ?? 0) + Number(t.amount)
  })
  const networkActivity = paid
    .map((order) => {
      const buyer = profilesList.find((p) => p.id === order.user_id)
      const sponsorId = buyer?.sponsor_id ?? null
      const upline = sponsorId ? profilesList.find((p) => p.id === sponsorId) ?? null : null
      const siblings = sponsorId
        ? profilesList
            .filter((p) => p.sponsor_id === sponsorId)
            .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
        : []
      const pos = buyer ? siblings.findIndex((p) => p.id === buyer.id) + 1 : 0
      const isPresente = pos === 2 || pos === 3
      return {
        orderId: order.id,
        createdAt: order.created_at,
        buyer: buyer
          ? { id: buyer.id, nome: buyer.full_name ?? buyer.email, email: buyer.email, avatar_url: buyer.avatar_url }
          : null,
        upline: upline
          ? { id: upline.id, nome: upline.full_name ?? upline.email, email: upline.email, avatar_url: upline.avatar_url }
          : null,
        bonusTotal: bonusByOrder[order.id] ?? 0,
        position: pos,
        isPresente,
        orderAmount: order.amount,
      }
    })
    .filter((a) => a.buyer != null)

  return NextResponse.json({ networkActivity })
}
