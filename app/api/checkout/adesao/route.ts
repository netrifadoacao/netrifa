import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getStripeClient } from '@/lib/stripe';

function normalizeAmountToCents(value: number) {
  return Math.round(Number(value) * 100);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = typeof body?.userId === 'string' ? body.userId : '';
    const email = typeof body?.email === 'string' ? body.email : '';

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId e email sao obrigatorios.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: configRow } = await admin
      .from('app_config')
      .select('value')
      .eq('key', 'valor_adesao')
      .single();

    const valorAdesao = Number(configRow?.value ?? 250);
    const unitAmount = normalizeAmountToCents(valorAdesao);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return NextResponse.json({ error: 'Valor de adesao invalido.' }, { status: 400 });
    }

    const stripe = getStripeClient();
    const baseUrl = req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'pix'],
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'brl',
            unit_amount: unitAmount,
            product_data: {
              name: 'Adesao - Rede de Monetizacao / Renda Universal',
              description: 'Taxa unica de adesao para ativacao da conta de membro.',
            },
          },
        },
      ],
      metadata: {
        user_id: userId,
        tipo_pagamento: 'adesao',
      },
      success_url: `${baseUrl}/register/confirmacao?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/register?payment=cancelled`,
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      amount: valorAdesao,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao criar checkout Stripe.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
