import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders } from '../_shared/cors.ts'
import { requireUser, createSupabaseAdmin } from '../_shared/supabase.ts'

serve(async (req) => {
  const cors = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const user = await requireUser(req)
    const url = new URL(req.url)
    const userId = url.searchParams.get('id') ?? url.searchParams.get('userId') ?? user.id

    if (req.method === 'PATCH' || req.method === 'PUT') {
      if (userId !== user.id) throw new Error('Forbidden')
      const body = await req.json().catch(() => ({}))
      const updates: Record<string, unknown> = {}
      if (typeof body.full_name !== 'undefined') updates.full_name = body.full_name
      if (typeof body.nome !== 'undefined') updates.full_name = body.nome
      if (typeof body.phone !== 'undefined') updates.phone = body.phone
      if (typeof body.telefone !== 'undefined') updates.phone = body.telefone
      if (typeof body.bank_name !== 'undefined') updates.bank_name = body.bank_name
      if (typeof body.banco !== 'undefined') updates.bank_name = body.banco
      if (typeof body.bank_agency !== 'undefined') updates.bank_agency = body.bank_agency
      if (typeof body.agencia !== 'undefined') updates.bank_agency = body.agencia
      if (typeof body.bank_account !== 'undefined') updates.bank_account = body.bank_account
      if (typeof body.conta !== 'undefined') updates.bank_account = body.conta
      if (typeof body.pix_key !== 'undefined') updates.pix_key = body.pix_key
      if (typeof body.pix !== 'undefined') updates.pix_key = body.pix
      if (typeof body.avatar_url !== 'undefined') updates.avatar_url = body.avatar_url
      if (Object.keys(updates).length === 0) throw new Error('Nenhum campo para atualizar')
      const supabase = createSupabaseAdmin()
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single()
      if (error) throw error
      return new Response(JSON.stringify({ id: data.id, email: data.email, full_name: data.full_name, phone: data.phone, bank_name: data.bank_name, bank_agency: data.bank_agency, bank_account: data.bank_account, pix_key: data.pix_key, avatar_url: data.avatar_url }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    if (userId !== user.id) {
      const admin = createSupabaseAdmin()
      const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') throw new Error('Forbidden')
    }
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase.from('profiles').select('id, email, full_name, role, referral_code, wallet_balance, sponsor_id, phone, created_at, bank_name, bank_agency, bank_account, pix_key, avatar_url').eq('id', userId).single()
    if (error || !data) throw new Error('Perfil não encontrado')
    const out = {
      id: data.id,
      email: data.email,
      nome: data.full_name,
      full_name: data.full_name,
      role: data.role,
      referral_code: data.referral_code,
      wallet_balance: Number(data.wallet_balance ?? 0),
      saldo: Number(data.wallet_balance ?? 0),
      sponsor_id: data.sponsor_id,
      phone: data.phone,
      bank_name: data.bank_name,
      bank_agency: data.bank_agency,
      bank_account: data.bank_account,
      pix_key: data.pix_key,
      avatar_url: data.avatar_url
    }
    return new Response(JSON.stringify(out), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 404
    return new Response(JSON.stringify({ error: message }), { headers: { ...cors, 'Content-Type': 'application/json' }, status })
  }
})
