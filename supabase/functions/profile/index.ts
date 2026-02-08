import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { requireUser, createSupabaseAdmin } from '../_shared/supabase.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const user = await requireUser(req)
    const url = new URL(req.url)
    const userId = url.searchParams.get('id') ?? url.searchParams.get('userId') ?? user.id
    if (userId !== user.id) {
      const admin = createSupabaseAdmin()
      const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') throw new Error('Forbidden')
    }
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase.from('profiles').select('id, email, full_name, role, referral_code, wallet_balance, sponsor_id, phone, created_at').eq('id', userId).single()
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
      phone: data.phone
    }
    return new Response(JSON.stringify(out), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 404
    return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status })
  }
})
