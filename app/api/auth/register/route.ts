import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

type RegisterBody = {
  nome?: string;
  email?: string;
  telefone?: string;
  senha?: string;
  patrocinadorLink?: string | null;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as RegisterBody;
    const nome = String(body.nome ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const telefone = String(body.telefone ?? '').trim();
    const senha = String(body.senha ?? '');
    const patrocinadorLink = body.patrocinadorLink ? String(body.patrocinadorLink).trim() : null;

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Nome, email e senha sao obrigatorios.' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email invalido.' }, { status: 400 });
    }
    if (senha.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: false,
      user_metadata: {
        full_name: nome,
        sponsor_referral_code: patrocinadorLink,
        phone: telefone || null,
      },
    });

    if (error) {
      const code = String((error as { code?: string }).code ?? '');
      if (code === 'email_exists') {
        return NextResponse.json({ error: 'Email ja cadastrado.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const userId = data.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Falha ao criar usuario.' }, { status: 500 });
    }

    return NextResponse.json({ userId, email }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao cadastrar usuario.' }, { status: 500 });
  }
}
