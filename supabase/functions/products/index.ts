import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { requireUser, requireAdmin, createSupabaseAdmin, getUserFromRequest } from '../_shared/supabase.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const supabaseAdmin = createSupabaseAdmin()
    const url = new URL(req.url)

    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin.from('products').select('*').eq('active', true)
      if (error) throw error
      return new Response(JSON.stringify(data ?? []), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'POST') {
      await requireAdmin(req)
      const body = await req.json()
      const { name, description, price, image_url } = body
      const { data, error } = await supabaseAdmin.from('products').insert({
        name: name ?? body.nome,
        description: description ?? body.descricao,
        price: Number(price ?? body.preco),
        image_url: image_url ?? body.image_url,
        active: true
      }).select().single()
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      await requireAdmin(req)
      const id = url.searchParams.get('id') ?? (await req.json()).id
      if (!id) throw new Error('id required')
      const body = await req.json().catch(() => ({}))
      const updates: Record<string, unknown> = {}
      if (typeof body.ativo !== 'undefined') updates.active = body.ativo
      if (typeof body.active !== 'undefined') updates.active = body.active
      if (typeof body.name !== 'undefined') updates.name = body.name
      if (typeof body.nome !== 'undefined') updates.name = body.nome
      if (typeof body.description !== 'undefined') updates.description = body.description
      if (typeof body.price !== 'undefined') updates.price = body.price
      if (Object.keys(updates).length === 0) throw new Error('No updates')
      const { data, error } = await supabaseAdmin.from('products').update(updates).eq('id', id).select().single()
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status })
  }
})
