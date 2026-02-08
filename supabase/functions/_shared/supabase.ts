import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export function createSupabaseClient(authHeader: string | null): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: authHeader ? { Authorization: authHeader } : {} } }
  )
}

export function createSupabaseAdmin(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

export async function getUserFromRequest(req: Request): Promise<{ id: string; email?: string } | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const supabase = createSupabaseClient(authHeader)
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireUser(req: Request): Promise<{ id: string; email?: string }> {
  const user = await getUserFromRequest(req)
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requireAdmin(req: Request): Promise<{ id: string }> {
  const user = await requireUser(req)
  const admin = createSupabaseAdmin()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')
  return user
}
