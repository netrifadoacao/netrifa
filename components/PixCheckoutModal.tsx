'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { buildPixPayload } from '@/utils/pixPayload';
import { FiX } from 'react-icons/fi';
import { SiWhatsapp } from 'react-icons/si';

const CHAVE_PIX = process.env.NEXT_PUBLIC_CHAVE_PIX_RECEBIMENTO || '81622570200';
const NOME_BENEFICIARIO = 'MOISES DA SILVA DUARTE';
const WHATSAPP_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_NUMERO_WHATSAPP_INTEGRACAO || '5592984759201'}`;
const EXPIRES_SEC = 30;

export default function PixCheckoutModal({
  valor,
  onClose,
  onContinue,
}: {
  valor: number;
  onClose: () => void;
  onContinue: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(EXPIRES_SEC);
  const [expired, setExpired] = useState(false);

  const payload = buildPixPayload({
    chavePix: CHAVE_PIX,
    valor,
    nomeBeneficiario: NOME_BENEFICIARIO,
  });

  useEffect(() => {
    if (secondsLeft <= 0) {
      setExpired(true);
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="glass-strong rounded-2xl max-w-md w-full p-6 border border-white/20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-xl font-bold text-white">Pagamento PIX – Adesão</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-steel-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {!expired ? (
          <>
            <p className="text-steel-300 text-sm mb-2">
              Escaneie o QR Code pelo app do seu banco para pagar <strong className="text-white">R$ {valor.toFixed(2)}</strong>.
            </p>
            <div className="flex justify-center my-4 p-4 bg-white rounded-xl">
              <QRCodeSVG value={payload} size={220} level="M" includeMargin />
            </div>
            <p className="text-steel-500 text-xs text-center mb-2">Chave PIX (CPF): {CHAVE_PIX}</p>
            <p className="text-center text-steel-400 text-sm">
              Este QR expira em <span className="font-bold text-gold-300">{secondsLeft}s</span>.
            </p>
          </>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-steel-300 text-sm">
              O QR Code expirou. Você pode gerar outro ao recarregar esta etapa ou seguir após o pagamento.
            </p>
            <p className="text-steel-300 text-sm">
              Para <strong className="text-gold-300">acelerar sua aprovação</strong>, envie o comprovante de pagamento pelo WhatsApp. A aprovação também é feita de forma automática em até <strong className="text-white">30 minutos</strong>.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] text-white font-semibold hover:brightness-110 transition-all"
            >
              <SiWhatsapp className="w-5 h-5" />
              Enviar comprovante pelo WhatsApp
            </a>
            <p className="text-steel-500 text-xs text-center">
              (92) 98475-9201
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-white/20 text-steel-300 hover:bg-white/5 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 py-2.5 px-4 rounded-xl btn-gold-metallic font-semibold transition-all"
          >
            {expired ? 'Já paguei, continuar' : 'Já paguei, continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}
