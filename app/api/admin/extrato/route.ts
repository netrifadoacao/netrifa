import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function requireAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 as const }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Forbidden', status: 403 as const }
  return { admin: createAdminClient() }
}

export async function GET() {
  const result = await requireAdmin()
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  const admin = result.admin
  const limit = 100
  const [ordersRes, txRes, withdrawalsRes] = await Promise.all([
    admin.from('orders').select('id, user_id, amount, status, created_at').order('created_at', { ascending: false }).limit(limit),
    admin.from('transactions').select('id, user_id, amount, type, description, created_at').eq('type', 'bonus').order('created_at', { ascending: false }).limit(limit),
    admin.from('withdrawals').select('id, user_id, amount, status, created_at').order('created_at', { ascending: false }).limit(limit),
  ])
  const orderIds = (ordersRes.data ?? []).map((o: { user_id: string }) => o.user_id)
  const txUserIds = (txRes.data ?? []).map((t: { user_id: string }) => t.user_id)
  const wUserIds = (withdrawalsRes.data ?? []).map((w: { user_id: string }) => w.user_id)
  const allUserIds = Array.from(new Set([...orderIds, ...txUserIds, ...wUserIds]))
  let profiles: { id: string; full_name?: string | null; email?: string }[] = []
  if (allUserIds.length > 0) {
    const { data: p } = await admin.from('profiles').select('id, full_name, email').in('id', allUserIds)
    profiles = p ?? []
  }
  const byId = Object.fromEntries(profiles.map((p) => [p.id, p]))
  const entradas = (ordersRes.data ?? []).map((o: { id: string; user_id: string; amount: number; status: string; created_at: string }) => ({
    id: o.id,
    tipo: 'venda',
    user_id: o.user_id,
    usuario: byId[o.user_id] ? { nome: byId[o.user_id].full_name, email: byId[o.user_id].email } : null,
    valor: Number(o.amount),
    status: o.status,
    created_at: o.created_at,
  }))
  const saidasBonus = (txRes.data ?? []).map((t: { id: string; user_id: string; amount: number; description?: string | null; created_at: string }) => ({
    id: t.id,
    tipo: 'comissao',
    user_id: t.user_id,
    usuario: byId[t.user_id] ? { nome: byId[t.user_id].full_name, email: byId[t.user_id].email } : null,
    valor: Number(t.amount),
    description: t.description ?? null,
    created_at: t.created_at,
  }))
  const saques = (withdrawalsRes.data ?? []).map((w: { id: string; user_id: string; amount: number; status: string; created_at: string }) => ({
    id: w.id,
    tipo: 'saque',
    user_id: w.user_id,
    usuario: byId[w.user_id] ? { nome: byId[w.user_id].full_name, email: byId[w.user_id].email } : null,
    valor: Number(w.amount),
    status: w.status,
    created_at: w.created_at,
  }))
  return NextResponse.json({ entradas, saidasBonus, saques })
}
