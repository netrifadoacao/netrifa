'use client';

import { useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const getFunctionsUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  return `${url.replace(/\/$/, '')}/functions/v1`
}

const EDGE_FUNCTION_TIMEOUT_MS = 20000

export async function invokeFunction<T = unknown>(
  name: string,
  options: { method?: string; body?: unknown; params?: Record<string, string> } = {},
  accessToken?: string | null
): Promise<T> {
  let token = accessToken
  if (token == null) {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    token = session?.access_token ?? undefined
  }
  const base = getFunctionsUrl()
  const url = new URL(`${base}/${name}`)
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), EDGE_FUNCTION_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(url.toString(), {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      signal: controller.signal,
    })
  } catch (e) {
    clearTimeout(timeoutId)
    if (e instanceof Error) {
      if (e.name === 'AbortError') throw new Error('Timeout ao chamar o backend. Verifique se as Edge Functions estão em deploy no Supabase.')
      throw new Error(e.message || 'Falha ao conectar ao backend. Verifique CORS e se as Edge Functions estão publicadas.')
    }
    throw e
  } finally {
    clearTimeout(timeoutId)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText)
  return data as T
}

export type DashboardChartPoint = { data: string; quantidade: number }
export type DashboardTopProduct = { nome: string; vendas: number }

export type NetworkActivityItem = {
  orderId?: string
  createdAt: string
  buyer: { id: string; nome: string; email: string; avatar_url: string | null } | null
  upline: { id: string; nome: string; email: string; avatar_url: string | null } | null
  bonusTotal: number
  position: number
  isPresente: boolean
  orderAmount: number
}

export type AdminDashboardResponse = {
  totalVendidos: number
  faturamento: number
  quantidadeUsuarios: number
  produtosAtivos: number
  comprasPendentes: number
  membersByDay: DashboardChartPoint[]
  withdrawalsByDay: DashboardChartPoint[]
  topProducts: DashboardTopProduct[]
  networkActivity?: NetworkActivityItem[]
}

export type NetworkProfile = { id: string; full_name: string | null; email: string; sponsor_id: string | null; referral_code?: string | null; role?: string | null; avatar_url?: string | null }

function createFunctions(accessToken: string | null | undefined) {
  const token = accessToken ?? undefined
  return {
    createCheckout: (productId: string) =>
      invokeFunction<{ url: string; preferenceId: string }>('create-checkout', { method: 'POST', body: { productId } }, token),
    adminDashboard: () => invokeFunction<AdminDashboardResponse>('admin-dashboard', {}, token),
    products: {
      list: (opts?: { all?: boolean }) =>
        invokeFunction<{ id: string; name: string; description?: string; price: number; active: boolean }[]>('products', { params: opts?.all ? { all: 'true' } : {} }, token),
      create: (body: { nome: string; descricao?: string; preco: number }) =>
        invokeFunction('products', { method: 'POST', body: { name: body.nome, description: body.descricao, price: body.preco } }, token),
      update: (id: string, body: { ativo?: boolean }) =>
        invokeFunction('products', { method: 'PATCH', body: { id, ativo: body.ativo }, params: { id } }, token),
    },
    orders: {
      list: (status?: string) => invokeFunction('orders', { params: status ? { status } : {} }, token),
      approve: (compraId: string) => invokeFunction('orders', { method: 'PATCH', body: { orderId: compraId, action: 'approve' } }, token),
      reject: (compraId: string) => invokeFunction('orders', { method: 'PATCH', body: { orderId: compraId, action: 'reject' } }, token),
    },
    network: (userId?: string, opts?: { flat?: boolean }) =>
      invokeFunction<{
        rede?: unknown[];
        niveis?: number;
        profiles?: NetworkProfile[];
        upline?: NetworkProfile | null;
        me?: NetworkProfile | null;
        downline?: { profile: NetworkProfile; children: unknown[] }[];
      }>('network', {
        params: { ...(userId ? { id: userId } : {}), ...(opts?.flat ? { flat: 'true' } : {}) },
      }, token),
    bonus: (userId?: string) => invokeFunction('bonus', { params: userId ? { id: userId } : {} }, token),
    bonusConfig: {
      get: () => invokeFunction<Record<string, number>>('bonus-config', {}, token),
      update: (body: Record<string, number>) => invokeFunction('bonus-config', { method: 'PUT', body }, token),
    },
    withdrawals: {
      list: (usuarioId?: string) => invokeFunction('withdrawals', { params: usuarioId ? { usuarioId } : {} }, token),
      create: (body: { valor: number; metodoPagamento?: string; dadosPagamento?: unknown }) =>
        invokeFunction('withdrawals', { method: 'POST', body }, token),
      approve: (saqueId: string) => invokeFunction('withdrawals', { method: 'PATCH', body: { id: saqueId, action: 'approve' }, params: { id: saqueId } }, token),
      pay: (saqueId: string) => invokeFunction('withdrawals', { method: 'PATCH', body: { id: saqueId, action: 'pay' }, params: { id: saqueId } }, token),
      reject: (saqueId: string) => invokeFunction('withdrawals', { method: 'PATCH', body: { id: saqueId, action: 'reject' }, params: { id: saqueId } }, token),
    },
    profile: (userId?: string) => invokeFunction<{ id: string; email: string; nome?: string; saldo: number; referral_code?: string }>('profile', { params: userId ? { id: userId } : {} }, token),
    profileUpdate: (body: { nome?: string; full_name?: string; telefone?: string; phone?: string; banco?: string; agencia?: string; conta?: string; pix?: string; avatar_url?: string }) =>
      invokeFunction('profile', { method: 'PATCH', body: { full_name: body.nome ?? body.full_name, phone: body.telefone ?? body.phone, banco: body.banco, agencia: body.agencia, conta: body.conta, pix: body.pix, avatar_url: body.avatar_url } }, token),
    approveUsers: {
      list: async () => {
        const res = await fetch('/api/admin/approve-users')
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText)
        return data as { users: { id: string; email: string; full_name?: string | null; phone?: string | null; created_at?: string }[] }
      },
      approve: async (userId: string) => {
        const res = await fetch('/api/admin/approve-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText)
        return data
      },
    },
  }
}

export const functions = createFunctions(undefined)

export function useFunctions() {
  const { session } = useAuth()
  return useMemo(() => createFunctions(session?.access_token), [session?.access_token])
}
