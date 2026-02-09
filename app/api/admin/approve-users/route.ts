import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function requireAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized', status: 401 as const }
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return { error: 'Forbidden', status: 403 as const }
  }
  return { admin: createAdminClient() }
}

export async function GET() {
  const result = await requireAdmin()
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  const admin = result.admin
  const { data: listData, error: listError } = await admin.auth.admin.listUsers({ perPage: 500 })
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 })
  }
  const users = listData?.users ?? []
  const pending = users.filter((u: { email_confirmed_at?: string | null }) => !u.email_confirmed_at)
  const ids = pending.map((u: { id: string }) => u.id)
  let profiles: { id: string; full_name?: string | null; email?: string; phone?: string | null }[] = []
  if (ids.length > 0) {
    const { data: profData } = await admin
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', ids)
    profiles = profData ?? []
  }
  const byId = Object.fromEntries(profiles.map((p) => [p.id, p]))
  const list = pending.map((u: { id: string; email?: string; created_at?: string }) => ({
    id: u.id,
    email: byId[u.id]?.email ?? u.email ?? '',
    full_name: byId[u.id]?.full_name ?? null,
    phone: byId[u.id]?.phone ?? null,
    created_at: u.created_at,
  }))
  return NextResponse.json({ users: list })
}

export async function POST(req: NextRequest) {
  const result = await requireAdmin()
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  const admin = result.admin
  let body: { userId?: string; user_id?: string; id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }
  const userId = body.userId ?? body.user_id ?? body.id
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })
  }
  const { data: profile } = await admin
    .from('profiles')
    .select('sponsor_id')
    .eq('id', userId)
    .single()
  const referrerId = profile?.sponsor_id ?? null
  let sponsorIdToSet: string | null = null
  if (referrerId) {
    const { data: siblings } = await admin
      .from('profiles')
      .select('id')
      .eq('sponsor_id', referrerId)
      .order('created_at', { ascending: true })
    const list = siblings ?? []
    const pos = list.findIndex((p: { id: string }) => p.id === userId)
    if (pos === 1 || pos === 2) {
      const firstId = list[0]?.id
      if (firstId) sponsorIdToSet = firstId
    }
  }
  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  })
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }
  if (sponsorIdToSet !== null) {
    await admin.from('profiles').update({ role: 'member', sponsor_id: sponsorIdToSet }).eq('id', userId)
  } else {
    await admin.from('profiles').update({ role: 'member' }).eq('id', userId)
  }

  const { data: configRow } = await admin
    .from('app_config')
    .select('value')
    .eq('key', 'valor_adesao')
    .single()
  const valorAdesao = Number(configRow?.value ?? 250)
  const { data: existingOrder } = await admin
    .from('orders')
    .select('id')
    .eq('user_id', userId)
    .eq('amount', valorAdesao)
    .eq('status', 'paid')
    .limit(1)
    .maybeSingle()
  if (!existingOrder) {
    const { data: newOrder, error: insertErr } = await admin
      .from('orders')
      .insert({ user_id: userId, product_id: null, amount: valorAdesao, status: 'pending' })
      .select('id')
      .single()
    if (!insertErr && newOrder?.id) {
      await admin.from('orders').update({ status: 'paid' }).eq('id', newOrder.id)
    }
  }
  return NextResponse.json({ ok: true, userId })
}
