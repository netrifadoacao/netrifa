import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createClient();
  await supabase.auth.signOut();
  const cookieStore = cookies();
  const res = NextResponse.json({ ok: true });
  cookieStore.getAll().forEach((c) => {
    if (c.name.startsWith('sb-')) {
      res.cookies.set(c.name, '', { maxAge: 0, path: '/' });
    }
  });
  return res;
}
