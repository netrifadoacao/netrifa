import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

type P = {
  id: string
  full_name: string | null
  email: string
  sponsor_id: string | null
  referral_code?: string | null
  role?: string | null
  avatar_url?: string | null
  created_at?: string | null
}

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const admin = createAdminClient()
  const { data: myProfile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (myProfile?.role === 'admin') {
    return NextResponse.json({ error: 'Use /admin/rede for full network' }, { status: 403 })
  }
  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id, full_name, email, sponsor_id, referral_code, role, avatar_url, created_at')
    .order('created_at', { ascending: true })
  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 })
  }
  const list = (profiles ?? []) as P[]
  const me = list.find((p) => p.id === user.id)
  const upline = me?.sponsor_id ? list.find((p) => p.id === me.sponsor_id) ?? null : null

  function getDirectsReal(sid: string): P[] {
    return list.filter((p) => p.sponsor_id === sid)
  }

  function buildDown(sid: string, nivel: number): { profile: P; children: { profile: P; children: unknown[] }[] }[] {
    if (nivel > 5) return []
    return getDirectsReal(sid).map((p) => ({ profile: p, children: buildDown(p.id, nivel + 1) }))
  }

  const downline = me ? buildDown(user.id, 1) : []

  return NextResponse.json({
    upline: upline
      ? {
          id: upline.id,
          full_name: upline.full_name,
          email: upline.email,
          sponsor_id: upline.sponsor_id,
          referral_code: upline.referral_code ?? null,
          role: upline.role ?? null,
          avatar_url: upline.avatar_url ?? null,
        }
      : null,
    me: me
      ? {
          id: me.id,
          full_name: me.full_name,
          email: me.email,
          sponsor_id: me.sponsor_id,
          referral_code: me.referral_code ?? null,
          role: me.role ?? null,
          avatar_url: me.avatar_url ?? null,
        }
      : null,
    downline,
  })
}
