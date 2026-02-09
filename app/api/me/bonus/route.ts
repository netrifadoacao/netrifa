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
  const { data: txList, error } = await supabase
    .from('transactions')
    .select('id, amount, type, description, origin_order_id, created_at')
    .eq('user_id', user.id)
    .eq('type', 'bonus')
    .order('created_at', { ascending: false })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  const list = (txList ?? []).map((t) => ({
    id: t.id,
    usuarioId: user.id,
    tipo: 'rede',
    valor: Number(t.amount),
    data: t.created_at,
    origemCompraId: t.origin_order_id,
    origemUsuario: null,
  }))
  return NextResponse.json(list)
}
