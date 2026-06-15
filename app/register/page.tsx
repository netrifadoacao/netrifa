'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { TERMOS_TITULO, TERMOS_CONTEUDO } from '@/content/termos-adesao';

const VALOR_ADESAO = 1;
type CheckoutMethod = 'card' | 'pix';
type RegisteredUser = { userId: string; email: string } | null;
type PixData = {
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string;
  expiresAt: string | null;
};

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<RegisteredUser>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<CheckoutMethod>('card');
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixChecking, setPixChecking] = useState(false);
  const [pixMessage, setPixMessage] = useState('');
  const [copiedPixCode, setCopiedPixCode] = useState(false);
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const patrocinadorLink = searchParams.get('ref');
  const pagamentoCancelado = searchParams.get('payment') === 'cancelled';

  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
    setPixData(null);
    setPixMessage('');
    setCopiedPixCode(false);
    setSelectedMethod('card');
  };

  const startCardCheckout = async (user: { userId: string; email: string }) => {
    const checkoutRes = await fetch('/api/checkout/adesao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.userId,
        email: user.email,
      }),
    });

    const checkoutData = await checkoutRes.json().catch(() => ({}));
    if (!checkoutRes.ok) {
      throw new Error(checkoutData?.error ?? 'Nao foi possivel iniciar o checkout Stripe.');
    }
    if (!checkoutData?.checkoutUrl || typeof checkoutData.checkoutUrl !== 'string') {
      throw new Error('Checkout Stripe retornou sem URL valida.');
    }
    window.location.href = checkoutData.checkoutUrl;
  };

  const generatePixQrCode = async (user: { userId: string; email: string }) => {
    setPixLoading(true);
    setPixMessage('');
    try {
      const res = await fetch('/api/checkout/adesao/mp-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          email: user.email,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? 'Falha ao gerar pagamento PIX.');
      }
      setPixData({
        paymentId: String(data.paymentId),
        qrCode: String(data.qrCode),
        qrCodeBase64: String(data.qrCodeBase64),
        expiresAt: typeof data.expiresAt === 'string' ? data.expiresAt : null,
      });
      setPixMessage('QR Code gerado. Pague via app do banco e aguarde a confirmacao.');
    } catch (err: unknown) {
      setPixMessage(err instanceof Error ? err.message : 'Erro ao gerar PIX.');
    } finally {
      setPixLoading(false);
    }
  };

  const checkPixStatus = async (paymentId: string, userId: string) => {
    setPixChecking(true);
    try {
      const res = await fetch(
        `/api/checkout/adesao/mp-pix/status?payment_id=${encodeURIComponent(paymentId)}&user_id=${encodeURIComponent(userId)}`,
        { cache: 'no-store' }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? 'Falha ao consultar status PIX.');
      }
      if (Boolean(data?.isPaid)) {
        window.location.href = `/register/confirmacao?mp_payment_id=${encodeURIComponent(paymentId)}&user_id=${encodeURIComponent(userId)}`;
        return;
      }
      setPixMessage('Pagamento ainda pendente. Assim que aprovar, seguiremos automaticamente.');
    } catch (err: unknown) {
      setPixMessage(err instanceof Error ? err.message : 'Falha ao verificar pagamento PIX.');
    } finally {
      setPixChecking(false);
    }
  };

  useEffect(() => {
    if (!showCheckoutModal || selectedMethod !== 'pix' || !pixData?.paymentId || !registeredUser?.userId) return;
    const timer = setInterval(() => {
      checkPixStatus(pixData.paymentId, registeredUser.userId);
    }, 10000);
    return () => clearInterval(timer);
  }, [showCheckoutModal, selectedMethod, pixData?.paymentId, registeredUser?.userId]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!aceiteTermos) {
      setError('É obrigatório aceitar os termos do contrato para continuar.');
      return;
    }
    setLoading(true);
    try {
      const signUp = await register({
        nome,
        email,
        telefone,
        senha,
        patrocinadorLink,
      });
      setRegisteredUser({ userId: signUp.userId, email: signUp.email });
      setShowCheckoutModal(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rich-black relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-15" />
      <div className="max-w-md w-full space-y-8 relative z-10 glass-strong p-8 rounded-2xl border border-white/10 shadow-glass my-8">
        <div className="text-center">
          <div className="logo-circle-gold w-24 h-24 mx-auto mb-4">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-rich-black">
              <Image
                src="/logo-as.png"
                alt="AS Digital"
                fill
                sizes="96px"
                className="object-contain p-2"
              />
            </div>
          </div>
          <h2 className="mt-2 text-3xl font-display font-black text-white">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-steel-400">
            Comece sua jornada na <span className="brand-logo-text font-semibold">AS Digital</span>
          </p>
          <p className="mt-2 text-sm text-steel-500">
            Já tem uma conta?{' '}
            <Link href={patrocinadorLink ? `/login?ref=${patrocinadorLink}` : '/login'} className="font-medium text-steel-300 hover:text-white transition-colors">
              Faça login
            </Link>
          </p>
          {patrocinadorLink && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-steel-300">
                Patrocinador: <span className="font-semibold text-white">{patrocinadorLink}</span>
              </p>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmitForm}>
          {error && (
            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <div className="text-sm text-steel-300">{error}</div>
            </div>
          )}
          {pagamentoCancelado && !error && (
            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <div className="text-sm text-steel-300">
                Pagamento cancelado. Revise os dados e tente novamente.
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-steel-300 mb-1">Nome</label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-white/15 placeholder-steel-500 text-white bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/40 sm:text-sm transition-all"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-steel-300 mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-white/15 placeholder-steel-500 text-white bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/40 sm:text-sm transition-all"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-steel-300 mb-1">Telefone</label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-white/15 placeholder-steel-500 text-white bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/40 sm:text-sm transition-all"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-steel-300 mb-1">Senha</label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-white/15 placeholder-steel-500 text-white bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/40 sm:text-sm transition-all"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg bg-white/5 border border-white/10 p-4 max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-steel-300 mb-2">{TERMOS_TITULO}</p>
            <pre className="text-xs text-steel-400 whitespace-pre-wrap font-sans">{TERMOS_CONTEUDO}</pre>
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={aceiteTermos}
              onChange={(e) => setAceiteTermos(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-gold-500 focus:ring-gold-400/50"
            />
            <span className="text-sm text-steel-300 group-hover:text-steel-200">
              Li e aceito os termos do contrato
            </span>
          </label>

          <p className="text-sm text-steel-500">
            Valor da adesão: <span className="font-semibold text-white">R$ {VALOR_ADESAO.toFixed(2)}</span> (escolha PIX ou cartao no proximo passo).
          </p>

          <button
            type="submit"
            disabled={loading || !aceiteTermos}
            className="group relative w-full flex justify-center py-3 px-4 text-sm font-bold rounded-xl btn-gold-metallic focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-400 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Criando checkout...' : 'Continuar para pagamento'}
          </button>
        </form>
      </div>

      {showCheckoutModal && registeredUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-strong rounded-2xl border border-white/10 p-6 space-y-4">
            <h3 className="text-xl font-display font-bold text-white">Escolha como deseja pagar</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod('pix')}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  selectedMethod === 'pix'
                    ? 'border-gold-400 bg-gold-500/20 text-white'
                    : 'border-white/20 text-steel-300 hover:bg-white/5'
                }`}
              >
                PIX (Mercado Pago)
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  selectedMethod === 'card'
                    ? 'border-gold-400 bg-gold-500/20 text-white'
                    : 'border-white/20 text-steel-300 hover:bg-white/5'
                }`}
              >
                Cartao (Stripe)
              </button>
            </div>

            {selectedMethod === 'pix' && !pixData && (
              <button
                type="button"
                disabled={pixLoading}
                onClick={() => generatePixQrCode(registeredUser)}
                className="w-full py-3 px-4 rounded-xl btn-gold-metallic font-semibold disabled:opacity-50"
              >
                {pixLoading ? 'Gerando QR Code...' : 'Gerar QR Code PIX'}
              </button>
            )}

            {selectedMethod === 'pix' && pixData && (
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-steel-300">Escaneie o QR Code no app do seu banco para pagar.</p>
                <div className="flex justify-center">
                  <img
                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="w-60 h-60 rounded-lg bg-white p-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(pixData.qrCode);
                    setCopiedPixCode(true);
                    setTimeout(() => setCopiedPixCode(false), 1800);
                  }}
                  className="w-full rounded-xl border border-white/20 px-4 py-2 text-sm text-steel-300 hover:bg-white/5"
                >
                  {copiedPixCode ? 'Codigo PIX copiado!' : 'Copiar codigo PIX'}
                </button>
                {pixData.expiresAt && <p className="text-xs text-steel-500">Expira em: {new Date(pixData.expiresAt).toLocaleString('pt-BR')}</p>}
                <button
                  type="button"
                  disabled={pixChecking}
                  onClick={() => checkPixStatus(pixData.paymentId, registeredUser.userId)}
                  className="w-full rounded-xl btn-gold-metallic px-4 py-2 font-semibold disabled:opacity-50"
                >
                  {pixChecking ? 'Verificando pagamento...' : 'Ja paguei, verificar agora'}
                </button>
              </div>
            )}

            {selectedMethod === 'card' && (
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  try {
                    setLoading(true);
                    await startCardCheckout(registeredUser);
                  } catch (err: unknown) {
                    setPixMessage(err instanceof Error ? err.message : 'Falha ao abrir checkout de cartao.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full py-3 px-4 rounded-xl btn-gold-metallic font-semibold disabled:opacity-50"
              >
                {loading ? 'Abrindo checkout...' : 'Continuar com cartao'}
              </button>
            )}

            {pixMessage && <p className="text-sm text-steel-300">{pixMessage}</p>}

            <button
              type="button"
              onClick={closeCheckoutModal}
              className="w-full rounded-xl border border-white/20 px-4 py-2 text-sm text-steel-300 hover:bg-white/5"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
