import { createClient } from '@/utils/supabase/client'

const getFunctionsUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  return `${url.replace(/\/$/, '')}/functions/v1`
}

export async function invokeFunction<T = unknown>(
  name: string,
  options: { method?: string; body?: unknown; params?: Record<string, string> } = {}
): Promise<T> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const base = getFunctionsUrl()
  const url = new URL(`${base}/${name}`)
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText)
  return data as T
}

export const functions = {
  createCheckout: (productId: string) =>
    invokeFunction<{ url: string; preferenceId: string }>('create-checkout', { method: 'POST', body: { productId } }),
  adminDashboard: () => invokeFunction<{ totalVendidos: number; faturamento: number; quantidadeUsuarios: number; produtosAtivos: number; comprasPendentes: number }>('admin-dashboard'),
  products: {
    list: () => invokeFunction<{ id: string; name: string; description?: string; price: number; active: boolean }[]>('products'),
    create: (body: { nome: string; descricao?: string; preco: number }) =>
      invokeFunction('products', { method: 'POST', body: { name: body.nome, description: body.descricao, price: body.preco } }),
    update: (id: string, body: { ativo?: boolean }) =>
      invokeFunction('products', { method: 'PATCH', body: { id, ativo: body.ativo }, params: { id } }),
  },
  orders: {
    list: (status?: string) => invokeFunction('orders', { params: status ? { status } : {} }),
    approve: (compraId: string) => invokeFunction('orders', { method: 'PATCH', body: { orderId: compraId, action: 'approve' } }),
    reject: (compraId: string) => invokeFunction('orders', { method: 'PATCH', body: { orderId: compraId, action: 'reject' } }),
  },
  network: (userId?: string) => invokeFunction<{ rede: unknown[]; niveis: number }>('network', { params: userId ? { id: userId } : {} }),
  bonus: (userId?: string) => invokeFunction('bonus', { params: userId ? { id: userId } : {} }),
  bonusConfig: {
    get: () => invokeFunction<Record<string, number>>('bonus-config'),
    update: (body: Record<string, number>) => invokeFunction('bonus-config', { method: 'PUT', body }),
  },
  withdrawals: {
    list: (usuarioId?: string) => invokeFunction('withdrawals', { params: usuarioId ? { usuarioId } : {} }),
    create: (body: { valor: number; metodoPagamento?: string; dadosPagamento?: unknown }) =>
      invokeFunction('withdrawals', { method: 'POST', body }),
    approve: (saqueId: string) => invokeFunction('withdrawals', { method: 'PATCH', body: { id: saqueId, action: 'approve' }, params: { id: saqueId } }),
    pay: (saqueId: string) => invokeFunction('withdrawals', { method: 'PATCH', body: { id: saqueId, action: 'pay' }, params: { id: saqueId } }),
    reject: (saqueId: string) => invokeFunction('withdrawals', { method: 'PATCH', body: { id: saqueId, action: 'reject' }, params: { id: saqueId } }),
  },
  profile: (userId?: string) => invokeFunction<{ id: string; email: string; nome?: string; saldo: number; referral_code?: string }>('profile', { params: userId ? { id: userId } : {} }),
}
