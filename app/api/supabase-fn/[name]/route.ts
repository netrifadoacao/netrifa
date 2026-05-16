import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/** Edge Functions chamadas pelo app; proxy evita CORS no browser. */
const ALLOWED_FN = new Set([
  'create-checkout',
  'admin-dashboard',
  'products',
  'orders',
  'network',
  'network-activity',
  'bonus',
  'bonus-config',
  'withdrawals',
  'profile',
])

const UPSTREAM_TIMEOUT_MS = 25_000

async function proxy(req: NextRequest, name: string) {
  if (!ALLOWED_FN.has(name)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anon) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headerAuth = req.headers.get('authorization')
  let accessToken = session?.access_token
  if (headerAuth?.startsWith('Bearer ')) {
    accessToken = headerAuth.slice(7)
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const target = new URL(`${supabaseUrl}/functions/v1/${name}`)
  const incoming = new URL(req.url)
  incoming.searchParams.forEach((v, k) => target.searchParams.set(k, v))

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    apikey: anon,
  }

  let body: BodyInit | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const text = await req.text()
    if (text.length > 0) {
      headers['Content-Type'] = 'application/json'
      body = text
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(target.toString(), {
      method: req.method,
      headers,
      body,
      signal: controller.signal,
    })
  } catch (e) {
    clearTimeout(timeoutId)
    const msg = e instanceof Error && e.name === 'AbortError' ? 'Timeout ao chamar o backend' : 'Falha ao conectar ao backend'
    return NextResponse.json({ error: msg }, { status: 502 })
  } finally {
    clearTimeout(timeoutId)
  }

  const ct = res.headers.get('content-type') ?? 'application/json'
  const buf = await res.arrayBuffer()
  return new NextResponse(buf, {
    status: res.status,
    headers: { 'Content-Type': ct },
  })
}

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  return proxy(req, params.name)
}

export async function POST(req: NextRequest, { params }: { params: { name: string } }) {
  return proxy(req, params.name)
}

export async function PATCH(req: NextRequest, { params }: { params: { name: string } }) {
  return proxy(req, params.name)
}

export async function PUT(req: NextRequest, { params }: { params: { name: string } }) {
  return proxy(req, params.name)
}
