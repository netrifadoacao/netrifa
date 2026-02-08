import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders } from '../_shared/cors.ts'
import { requireUser, requireAdmin, createSupabaseAdmin } from '../_shared/supabase.ts'

serve(async (req) => {
  const cors = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const supabase = createSupabaseAdmin()

    if (req.method === 'GET') {
      await requireUser(req)
      const { data, error } = await supabase.from('bonus_config').select('*').order('level')
      if (error) throw error
      const config: Record<string, number> = {}
      ;(data ?? []).forEach((r: { level: number; percentage: number }) => {
        if (r.level === 1) config.indicacaoDireta = Number(r.percentage)
        else config[`nivel${r.level - 1}`] = Number(r.percentage)
      })
      config.valorMinimoSaque = 50
      const { data: appRows } = await supabase.from('app_config').select('key, value')
      ;(appRows ?? []).forEach((r: { key: string; value: number }) => {
        if (r.key === 'valor_adesao') config.valorAdesao = Number(r.value)
        if (r.key === 'limite_maximo_saque') config.limiteMaximoSaque = Number(r.value)
        if (r.key === 'valor_minimo_saque') config.valorMinimoSaque = Number(r.value)
      })
      return new Response(JSON.stringify(config), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      await requireAdmin(req)
      const body = await req.json()
      const levels = [
        { level: 1, percentage: body.indicacaoDireta ?? 10 },
        { level: 2, percentage: body.nivel1 ?? 5 },
        { level: 3, percentage: body.nivel2 ?? 3 },
        { level: 4, percentage: body.nivel3 ?? 2 },
        { level: 5, percentage: body.nivel4 ?? 1 }
      ]
      for (const row of levels) {
        await supabase.from('bonus_config').upsert(row, { onConflict: 'level' })
      }
      if (body.valorAdesao != null) {
        await supabase.from('app_config').upsert({ key: 'valor_adesao', value: Number(body.valorAdesao) }, { onConflict: 'key' })
      }
      if (body.limiteMaximoSaque != null) {
        await supabase.from('app_config').upsert({ key: 'limite_maximo_saque', value: Number(body.limiteMaximoSaque) }, { onConflict: 'key' })
      }
      if (body.valorMinimoSaque != null) {
        await supabase.from('app_config').upsert({ key: 'valor_minimo_saque', value: Number(body.valorMinimoSaque) }, { onConflict: 'key' })
      }
      return new Response(JSON.stringify(body), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return new Response(JSON.stringify({ error: message }), { headers: { ...cors, 'Content-Type': 'application/json' }, status })
  }
})
