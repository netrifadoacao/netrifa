import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createClient();
  await supabase.auth.signOut();
  const cookieStore = cookies();
  cookieStore.getAll().forEach((c) => {
    if (c.name.startsWith('sb-')) cookieStore.delete(c.name);
  });
  return NextResponse.json({ ok: true });
}
