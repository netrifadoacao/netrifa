import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe';
import { activateUserAfterAdesaoPayment } from '@/lib/adesaoActivation';

function amountFromCents(cents: number | null | undefined) {
  if (!cents || !Number.isFinite(cents)) return 0;
  return Number((cents / 100).toFixed(2));
}

async function processCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const isAdesao = session.metadata?.tipo_pagamento === 'adesao';
  if (!userId || !isAdesao) return;

  const paid = session.payment_status === 'paid';
  if (!paid) return;

  await activateUserAfterAdesaoPayment({
    userId,
    amount: amountFromCents(session.amount_total),
    externalReference: session.id,
  });
}

export async function POST(req: NextRequest) {
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signingSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET nao configurada.' }, { status: 500 });
  }

  try {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Cabecalho stripe-signature ausente.' }, { status: 400 });
    }

    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(payload, signature, signingSecret);

    if (event.type === 'checkout.session.completed') {
      await processCheckoutSession(event.data.object as Stripe.Checkout.Session);
    }

    if (event.type === 'checkout.session.async_payment_succeeded') {
      await processCheckoutSession(event.data.object as Stripe.Checkout.Session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook invalido.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
