'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';
import { FiCheckCircle, FiUsers } from 'react-icons/fi';
import { useFunctions } from '@/lib/supabase-functions';

interface PendingUser {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  created_at?: string;
}

export default function AprovarUsuariosPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== '/admin/usuarios') return;
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') {
      router.push('/login');
      return;
    }
    setLoading(true);
    fetchUsers();
  }, [pathname, authLoading, user, profile, router]);

  const fetchUsers = async () => {
    try {
      const data = await functions.approveUsers.list();
      setUsers(data?.users ?? []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar lista de usuários');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (userId: string) => {
    setApprovingId(userId);
    try {
      await functions.approveUsers.approve(userId);
      toast.success('Usuário aprovado. Ele já pode fazer login.');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao aprovar usuário');
    } finally {
      setApprovingId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-steel-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display flex items-center gap-2">
            <FiUsers className="w-8 h-8 text-gold-400" />
            Aprovar usuários
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Usuários que se cadastraram e ainda não tiveram o e-mail confirmado. Aprove para liberar o acesso.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden sm:rounded-xl">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gold-500 border-t-transparent mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              Nenhum usuário aguardando aprovação.
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {users.map((u) => (
                <li key={u.id} className="px-6 py-4 hover:bg-white/5 transition-colors flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{u.full_name || '—'}</p>
                    <p className="text-sm text-gray-400">{u.email}</p>
                    {u.phone && <p className="text-xs text-gray-500">{u.phone}</p>}
                    <p className="text-xs text-gray-500 mt-1">Cadastro: {formatDate(u.created_at)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAprovar(u.id)}
                    disabled={approvingId === u.id}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg btn-gold-metallic transition-all disabled:opacity-50"
                  >
                    {approvingId === u.id ? (
                      'Aprovando...'
                    ) : (
                      <>
                        <FiCheckCircle className="mr-2" />
                        Aprovar
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
