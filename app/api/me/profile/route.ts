import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, referral_code, wallet_balance, sponsor_id, phone, bank_name, bank_agency, bank_account, pix_key, avatar_url, created_at')
    .eq('id', user.id)
    .single()
  if (error || !data) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  }
  return NextResponse.json({
    ...data,
    saldo: Number(data.wallet_balance ?? 0),
    wallet_balance: Number(data.wallet_balance ?? 0),
  })
}
