import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

const FORCED_TEST_PAYER_FIRST_NAME = 'Teste';
const FORCED_TEST_PAYER_LAST_NAME = 'Comprador';
const FORCED_TEST_PAYER_CPF = '19119119100';

function normalizeAmount(value: number) {
  return Number(Number(value).toFixed(2));
}

type MpCreatePaymentResult = {
  ok: boolean;
  status: number;
  data: Record<string, unknown>;
};

async function createPixPayment(params: {
  accessToken: string;
  amount: number;
  payerEmail: string;
  payerFirstName: string;
  payerLastName: string;
  payerCpf: string;
  externalReference: string;
}) {
  const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      transaction_amount: params.amount,
      description: 'Taxa unica de adesao para ativacao da conta de membro.',
      payment_method_id: 'pix',
      payer: {
        email: params.payerEmail,
        first_name: params.payerFirstName,
        last_name: params.payerLastName,
        identification: {
          type: 'CPF',
          number: params.payerCpf,
        },
      },
      external_reference: params.externalReference,
    }),
  });

  const mpData = (await mpRes.json().catch(() => ({}))) as Record<string, unknown>;
  return {
    ok: mpRes.ok,
    status: mpRes.status,
    data: mpData,
  } satisfies MpCreatePaymentResult;
}

function extractErrorMessage(data: Record<string, unknown>) {
  const message = data.message;
  return typeof message === 'string' && message.trim() ? message : 'Falha ao criar pagamento PIX.';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = typeof body?.userId === 'string' ? body.userId : '';

    if (!userId) {
      return NextResponse.json({ error: 'userId e obrigatorio.' }, { status: 400 });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'MP_ACCESS_TOKEN nao configurado.' }, { status: 500 });
    }

    const admin = createAdminClient();
    const { data: configRow } = await admin
      .from('app_config')
      .select('value')
      .eq('key', 'valor_adesao')
      .single();

    const valorAdesao = normalizeAmount(Number(configRow?.value ?? 1));
    if (!Number.isFinite(valorAdesao) || valorAdesao <= 0) {
      return NextResponse.json({ error: 'Valor de adesao invalido.' }, { status: 400 });
    }

    const externalReference = `adesao:${userId}:${Date.now()}`;
    const forcedTestPayerEmail = `comprador.teste+${Date.now()}@gmail.com`;
    let result = await createPixPayment({
      accessToken,
      amount: valorAdesao,
      payerEmail: forcedTestPayerEmail,
      payerFirstName: FORCED_TEST_PAYER_FIRST_NAME,
      payerLastName: FORCED_TEST_PAYER_LAST_NAME,
      payerCpf: FORCED_TEST_PAYER_CPF,
      externalReference,
    });

    if (!result.ok) {
      const finalErrorMessage = extractErrorMessage(result.data);
      if (finalErrorMessage.toLowerCase().includes('payer email forbidden')) {
        return NextResponse.json(
          {
            error:
              'Pagador de teste bloqueado pelo Mercado Pago. Ajuste os dados FORCED_TEST_PAYER_* no backend.',
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: finalErrorMessage }, { status: 400 });
    }

    const paymentId = String((result.data as { id?: string | number }).id ?? '');
    const txData = (result.data as { point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string } } })
      .point_of_interaction?.transaction_data;
    const qrCode = txData?.qr_code ?? '';
    const qrCodeBase64 = txData?.qr_code_base64 ?? '';

    if (!paymentId || !qrCode || !qrCodeBase64) {
      return NextResponse.json({ error: 'Mercado Pago nao retornou dados de QR Code PIX.' }, { status: 500 });
    }

    return NextResponse.json({
      paymentId,
      qrCode,
      qrCodeBase64,
      expiresAt: (result.data as { date_of_expiration?: string | null }).date_of_expiration ?? null,
      amount: valorAdesao,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao iniciar pagamento PIX.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
