'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type CheckoutState = 'loading' | 'paid' | 'pending' | 'error';

export default function RegisterConfirmationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const mpPaymentId = searchParams.get('mp_payment_id');
  const mpUserId = searchParams.get('user_id');
  const [state, setState] = useState<CheckoutState>('loading');
  const [message, setMessage] = useState('Validando pagamento...');
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const hasSessionId = useMemo(() => Boolean(sessionId && sessionId.trim()), [sessionId]);
  const hasMpInfo = useMemo(
    () => Boolean(mpPaymentId && mpPaymentId.trim() && mpUserId && mpUserId.trim()),
    [mpPaymentId, mpUserId]
  );

  const checkStatus = useCallback(async () => {
    if (!hasSessionId && !hasMpInfo) {
      setState('error');
      setMessage('Dados de pagamento nao informados.');
      return;
    }
    setState('loading');
    setMessage('Validando pagamento...');

    try {
      const url = hasSessionId && sessionId
        ? `/api/checkout/adesao/status?session_id=${encodeURIComponent(sessionId)}`
        : `/api/checkout/adesao/mp-pix/status?payment_id=${encodeURIComponent(mpPaymentId ?? '')}&user_id=${encodeURIComponent(mpUserId ?? '')}`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? 'Nao foi possivel validar o pagamento.');
      }

      const paid = Boolean(data?.isPaid);
      if (paid) {
        setState('paid');
        setMessage('Pagamento confirmado! Sua adesao foi validada.');
      } else {
        setState('pending');
        setMessage('Pagamento ainda pendente. Se voce pagou via PIX, aguarde a compensacao.');
      }
      setLastCheck(new Date().toLocaleTimeString('pt-BR'));
    } catch (err: unknown) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Erro ao consultar status do checkout.');
    }
  }, [sessionId, hasSessionId, hasMpInfo, mpPaymentId, mpUserId]);

  useEffect(() => {
    if (!hasSessionId && !hasMpInfo) {
      setState('error');
      setMessage('Dados de pagamento nao informados.');
      return;
    }
    checkStatus();
  }, [hasSessionId, hasMpInfo, checkStatus]);

  useEffect(() => {
    if (state !== 'pending') return;
    const timer = setInterval(() => {
      checkStatus();
    }, 10000);
    return () => clearInterval(timer);
  }, [state, checkStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-rich-black p-6">
      <div className="max-w-lg w-full glass-strong p-8 rounded-2xl border border-white/10 space-y-5">
        <h1 className="text-2xl font-display font-bold text-white">Confirmacao de adesao</h1>
        <p className="text-steel-300">{message}</p>
        {lastCheck && <p className="text-xs text-steel-500">Ultima verificacao: {lastCheck}</p>}

        {state === 'pending' && (
          <button
            type="button"
            onClick={checkStatus}
            className="w-full py-2.5 px-4 rounded-xl btn-gold-metallic font-semibold transition-all"
          >
            Verificar novamente
          </button>
        )}

        {state === 'paid' && (
          <Link
            href="/login"
            className="block text-center w-full py-2.5 px-4 rounded-xl btn-gold-metallic font-semibold transition-all"
          >
            Ir para login
          </Link>
        )}

        {state !== 'paid' && (
          <Link
            href="/register"
            className="block text-center w-full py-2.5 px-4 rounded-xl border border-white/20 text-steel-300 hover:bg-white/5 font-medium transition-colors"
          >
            Voltar para cadastro
          </Link>
        )}
      </div>
    </div>
  );
}
