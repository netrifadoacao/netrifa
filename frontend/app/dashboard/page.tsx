'use client';

import { useAuth } from '@/contexts/AuthContext';
import { mockRaffles } from '@/lib/mock-data';
import RaffleCard from '@/components/RaffleCard';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">{user?.name?.split(' ')[0]}</span>! 👋
        </h1>
        <p className="text-gray-400">Confira as rifas disponíveis e boa sorte!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-gray-400 mb-1">Saldo Disponível</p>
              <p className="text-3xl font-bold text-green-400">
                R$ {user?.balance.toFixed(2)}
              </p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            + R$ {user?.pendingBalance.toFixed(2)} pendente
          </p>
        </div>

        <div className="glass rounded-2xl p-6 border-l-4 border-purple-500">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total de Ganhos</p>
              <p className="text-3xl font-bold text-purple-400">
                R$ {user?.totalEarnings.toFixed(2)}
              </p>
            </div>
            <span className="text-4xl">📈</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Desde {new Date(user?.createdAt || '').toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="glass rounded-2xl p-6 border-l-4 border-cyan-500">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-gray-400 mb-1">Minha Rede</p>
              <p className="text-3xl font-bold text-cyan-400">
                {user?.networkSize} pessoas
              </p>
            </div>
            <span className="text-4xl">🌐</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ganhe com 5 níveis
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button className="glass hover:glass-strong rounded-xl p-4 transition-all text-center group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎫</div>
          <p className="text-sm font-semibold">Meus Bilhetes</p>
        </button>
        <button className="glass hover:glass-strong rounded-xl p-4 transition-all text-center group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💸</div>
          <p className="text-sm font-semibold">Solicitar Saque</p>
        </button>
        <button className="glass hover:glass-strong rounded-xl p-4 transition-all text-center group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
          <p className="text-sm font-semibold">Ver Extrato</p>
        </button>
        <button className="glass hover:glass-strong rounded-xl p-4 transition-all text-center group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔗</div>
          <p className="text-sm font-semibold">Compartilhar Link</p>
        </button>
      </div>

      {/* Rifas Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Rifas Disponíveis</h2>
          <div className="flex items-center gap-4">
            <select className="glass px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>Todas as rifas</option>
              <option>Menor preço</option>
              <option>Maior preço</option>
              <option>Finalizando em breve</option>
            </select>
            <div className="flex gap-2">
              <button className="glass hover:glass-strong px-4 py-2 rounded-xl transition-all">
                🔲
              </button>
              <button className="glass-strong px-4 py-2 rounded-xl">
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Rifas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRaffles.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>
      </div>

      {/* Banner de Indicação */}
      <div className="mt-8 glass-strong rounded-3xl p-8 border border-purple-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">
              💎 Ganhe compartilhando!
            </h3>
            <p className="text-gray-400 mb-4">
              Convide amigos e ganhe bônus automáticos em até 5 níveis de indicação.
              Quanto mais sua rede cresce, mais você ganha!
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-black/30 px-4 py-3 rounded-xl font-mono text-sm">
                rifanet.com/ref/{user?.referralCode}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://rifanet.com/ref/${user?.referralCode}`);
                  alert('Link copiado!');
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold hover:scale-105 transition-transform"
              >
                Copiar Link
              </button>
            </div>
          </div>
          <div className="text-8xl">🚀</div>
        </div>
      </div>
    </div>
  );
}

