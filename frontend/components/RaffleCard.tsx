'use client';

import { useState } from 'react';
import Image from 'next/image';

interface RaffleCardProps {
  raffle: {
    id: string;
    name: string;
    description: string;
    price: number;
    totalTickets: number;
    soldTickets: number;
    availableTickets: number;
    image: string;
    drawDate: string;
    status: string;
  };
}

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const percentSold = (raffle.soldTickets / raffle.totalTickets) * 100;
  const isAlmostSoldOut = raffle.availableTickets <= 10;

  const handleBuy = () => {
    // Aqui virá a lógica de compra quando integrar com backend
    alert(`Compra simulada: ${quantity} bilhete(s) da rifa "${raffle.name}"\nTotal: R$ ${(raffle.price * quantity).toFixed(2)}`);
    setShowModal(false);
  };

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden hover:glass-strong transition-all group hover:scale-[1.02]">
        {/* Image */}
        <div className="relative h-48 bg-black/30 overflow-hidden">
          <Image
            src={raffle.image}
            alt={raffle.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {isAlmostSoldOut && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 rounded-full text-xs font-bold animate-pulse">
              🔥 Últimos bilhetes!
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">{raffle.name}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">{raffle.description}</p>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">
                {raffle.soldTickets} / {raffle.totalTickets} vendidos
              </span>
              <span className="text-purple-400 font-semibold">
                {percentSold.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${percentSold}%` }}
              />
            </div>
          </div>

          {/* Price and Date */}
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="text-gray-400 text-xs">Sorteio em:</p>
              <p className="font-semibold">
                {new Date(raffle.drawDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">Por apenas:</p>
              <p className="text-2xl font-bold text-green-400">
                R$ {raffle.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold hover:scale-105 transition-transform"
              disabled={raffle.availableTickets === 0}
            >
              {raffle.availableTickets === 0 ? 'Esgotado' : 'Comprar Agora'}
            </button>
            <button className="px-4 glass hover:glass-strong rounded-xl transition-all">
              ℹ️
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Compra */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{raffle.name}</h2>
                <p className="text-gray-400 text-sm">{raffle.description}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="relative h-48 rounded-xl overflow-hidden mb-6">
              <Image
                src={raffle.image}
                alt={raffle.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between p-4 glass rounded-xl">
                <span className="text-gray-400">Valor unitário:</span>
                <span className="font-bold text-green-400">R$ {raffle.price.toFixed(2)}</span>
              </div>

              <div className="flex justify-between p-4 glass rounded-xl">
                <span className="text-gray-400">Bilhetes disponíveis:</span>
                <span className="font-bold text-purple-400">{raffle.availableTickets}</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantidade de bilhetes:
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 glass hover:glass-strong rounded-lg font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(raffle.availableTickets, parseInt(e.target.value) || 1)))}
                    className="flex-1 text-center bg-white/5 border border-white/10 rounded-lg py-2 font-bold text-xl"
                    min="1"
                    max={raffle.availableTickets}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(raffle.availableTickets, quantity + 1))}
                    className="w-10 h-10 glass hover:glass-strong rounded-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-between p-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-xl border border-purple-500/30">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-2xl text-green-400">
                  R$ {(raffle.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleBuy}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold text-lg hover:scale-105 transition-transform glow-purple"
              >
                Confirmar Compra
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 glass hover:glass-strong rounded-xl font-semibold transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

