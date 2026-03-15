import { NextRequest, NextResponse } from 'next/server';
import { activateUserAfterAdesaoPayment } from '@/lib/adesaoActivation';

function parseAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Number(amount.toFixed(2));
}

export async function GET(req: NextRequest) {
  try {
    const paymentId = req.nextUrl.searchParams.get('payment_id') ?? '';
    const userId = req.nextUrl.searchParams.get('user_id') ?? '';

    if (!paymentId || !userId) {
      return NextResponse.json({ error: 'payment_id e user_id sao obrigatorios.' }, { status: 400 });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'MP_ACCESS_TOKEN nao configurado.' }, { status: 500 });
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });
    const mpData = await mpRes.json().catch(() => ({}));
    if (!mpRes.ok) {
      const errMessage = (mpData as { message?: string })?.message ?? 'Falha ao consultar pagamento PIX.';
      return NextResponse.json({ error: errMessage }, { status: 400 });
    }

    const status = String((mpData as { status?: string }).status ?? 'pending');
    const externalReference = String((mpData as { external_reference?: string }).external_reference ?? '');
    const expectedPrefix = `adesao:${userId}:`;
    if (!externalReference.startsWith(expectedPrefix)) {
      return NextResponse.json({ error: 'Pagamento PIX nao pertence a este usuario.' }, { status: 403 });
    }

    const paid = status === 'approved';
    if (paid) {
      const amount = parseAmount((mpData as { transaction_amount?: number }).transaction_amount);
      await activateUserAfterAdesaoPayment({
        userId,
        amount,
        externalReference: `mp_payment_${paymentId}`,
      });
    }

    return NextResponse.json({
      paymentId,
      status,
      isPaid: paid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao consultar status PIX.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
