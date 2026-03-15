import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { activateUserAfterAdesaoPayment } from '@/lib/adesaoActivation';

function amountFromCents(cents: number | null | undefined) {
  if (!cents || !Number.isFinite(cents)) return 0;
  return Number((cents / 100).toFixed(2));
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({ error: 'session_id obrigatorio.' }, { status: 400 });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const userId = session.metadata?.user_id;
    const paid = session.payment_status === 'paid';

    if (paid && userId) {
      const amount = amountFromCents(session.amount_total);
      await activateUserAfterAdesaoPayment({
        userId,
        amount,
        externalReference: session.id,
      });
    }

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      isPaid: paid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao consultar checkout.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
