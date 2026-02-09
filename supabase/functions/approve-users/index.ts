import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders } from '../_shared/cors.ts'
import { requireAdmin, createSupabaseAdmin } from '../_shared/supabase.ts'

serve(async (req) => {
  const cors = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    await requireAdmin(req)
    const admin = createSupabaseAdmin()

    if (req.method === 'GET') {
      const { data: listData, error: listError } = await admin.auth.admin.listUsers({ perPage: 500 })
      if (listError) throw listError
      const users = listData?.users ?? []
      const pending = users.filter((u: { email_confirmed_at?: string | null }) => !u.email_confirmed_at)
      const ids = pending.map((u: { id: string }) => u.id)
      let profiles: { id: string; full_name?: string | null; email?: string; phone?: string | null }[] = []
      if (ids.length > 0) {
        const { data: profData } = await admin.from('profiles').select('id, full_name, email, phone').in('id', ids)
        profiles = profData ?? []
      }
      const byId = Object.fromEntries(profiles.map((p) => [p.id, p]))
      const result = pending.map((u: { id: string; email?: string; created_at?: string }) => ({
        id: u.id,
        email: byId[u.id]?.email ?? u.email ?? '',
        full_name: byId[u.id]?.full_name ?? null,
        phone: byId[u.id]?.phone ?? null,
        created_at: u.created_at,
      }))
      return new Response(JSON.stringify({ users: result }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      const userId = body.userId ?? body.user_id ?? body.id
      if (!userId || typeof userId !== 'string') throw new Error('userId obrigatório')
      const { data: profile } = await admin.from('profiles').select('sponsor_id').eq('id', userId).single()
      const referrerId = profile?.sponsor_id ?? null
      let sponsorIdToSet: string | null = null
      if (referrerId) {
        const { data: siblings } = await admin.from('profiles').select('id').eq('sponsor_id', referrerId).order('created_at', { ascending: true })
        const list = siblings ?? []
        const pos = list.findIndex((p: { id: string }) => p.id === userId)
        if (pos === 1 || pos === 2) {
          const firstId = list[0]?.id
          if (firstId) sponsorIdToSet = firstId
        }
      }
      const { error: updateError } = await admin.auth.admin.updateUserById(userId, { email_confirm: true })
      if (updateError) throw updateError
      if (sponsorIdToSet !== null) {
        await admin.from('profiles').update({ role: 'member', sponsor_id: sponsorIdToSet }).eq('id', userId)
      } else {
        await admin.from('profiles').update({ role: 'member' }).eq('id', userId)
      }
      return new Response(JSON.stringify({ ok: true, userId }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return new Response(JSON.stringify({ error: message }), { headers: { ...cors, 'Content-Type': 'application/json' }, status })
  }
})
