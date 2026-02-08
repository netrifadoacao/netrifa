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
  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  })
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }
  await admin.from('profiles').update({ role: 'member' }).eq('id', userId)
  return NextResponse.json({ ok: true, userId })
}
