'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useFunctions } from '@/lib/supabase-functions';
import { createClient } from '@/utils/supabase/client';
import { FiUser, FiCamera } from 'react-icons/fi';
import { AvatarCropModal } from '@/components/AvatarCropModal';
import { getAvatarDisplayUrl } from '@/lib/avatar';
import { uploadAvatarWithProgress } from '@/lib/uploadAvatar';

function DadosSkeleton() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-9 w-48 bg-white/10 rounded animate-pulse" />
          <div className="mt-2 h-4 w-80 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-xl animate-pulse">
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div className="flex-1 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-16 bg-white/10 rounded mb-2" />
                    <div className="h-10 w-full bg-white/10 rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="flex-shrink-0 flex flex-col items-center sm:items-end">
                <div className="w-28 h-28 rounded-full bg-white/10" />
                <div className="mt-2 h-3 w-24 bg-white/5 rounded" />
              </div>
            </div>
            <div className="border-t border-white/10 pt-6">
              <div className="h-5 w-44 bg-white/10 rounded mb-4" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-20 bg-white/10 rounded mb-2" />
                    <div className="h-10 w-full bg-white/10 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <div className="h-10 w-24 bg-white/10 rounded-lg" />
              <div className="h-10 w-36 bg-white/15 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDadosPage() {
  const { user, profile, session, refreshProfile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cropModalFile, setCropModalFile] = useState<File | null>(null);
  const [pendingAvatarBlob, setPendingAvatarBlob] = useState<Blob | null>(null);
  const [pendingAvatarPreviewUrl, setPendingAvatarPreviewUrl] = useState<string | null>(null);
  const inputAvatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (pendingAvatarPreviewUrl) URL.revokeObjectURL(pendingAvatarPreviewUrl);
    };
  }, [pendingAvatarPreviewUrl]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    banco: '',
    agencia: '',
    conta: '',
    pix: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (profile && profile.role !== 'admin') {
      router.push('/login');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      email: profile?.email ?? user?.email ?? prev.email ?? '',
      nome: profile?.full_name ?? prev.nome ?? '',
      telefone: profile?.phone ?? prev.telefone ?? '',
      banco: profile?.bank_name ?? prev.banco ?? '',
      agencia: profile?.bank_agency ?? prev.agencia ?? '',
      conta: profile?.bank_account ?? prev.conta ?? '',
      pix: profile?.pix_key ?? prev.pix ?? '',
    }));
  }, [authLoading, user, profile, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast('Selecione uma imagem (JPG, PNG, WebP ou GIF).', { icon: '⚠️' });
      return;
    }
    setCropModalFile(file);
    if (inputAvatarRef.current) inputAvatarRef.current.value = '';
  };

  const closeCropModal = () => {
    setCropModalFile(null);
    if (inputAvatarRef.current) inputAvatarRef.current.value = '';
  };

  const handleAvatarCropConfirm = (blob: Blob) => {
    closeCropModal();
    setPendingAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
    setPendingAvatarBlob(blob);
  };

  const handleAvatarSaveFromModal = async (blob: Blob, onProgress?: (percent: number) => void) => {
    if (!user || !session?.access_token) throw new Error('Sessão inválida. Faça login novamente.');
    const path = `${user.id}.jpg`;
    await uploadAvatarWithProgress(blob, path, session.access_token, onProgress);
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    const publicUrl = base ? `${base}/storage/v1/object/public/avatars/${path}?v=${Date.now()}` : '';
    await functions.profileUpdate({ avatar_url: publicUrl });
    closeCropModal();
    setPendingAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingAvatarBlob(null);
    toast.success('Foto salva com sucesso!');
    refreshProfile().catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      let avatarUrl: string | undefined;
      if (pendingAvatarBlob) {
        const supabase = createClient();
        const path = `${user.id}.jpg`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, pendingAvatarBlob, { upsert: true, contentType: 'image/jpeg' });
        if (uploadError) throw uploadError;
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
        avatarUrl = base ? `${base}/storage/v1/object/public/avatars/${path}?v=${Date.now()}` : '';
        setPendingAvatarPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        setPendingAvatarBlob(null);
      }
      await functions.profileUpdate({
        nome: formData.nome,
        telefone: formData.telefone || undefined,
        banco: formData.banco || undefined,
        agencia: formData.agencia || undefined,
        conta: formData.conta || undefined,
        pix: formData.pix || undefined,
        ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
      });
      setLoading(false);
      toast.success('Dados atualizados com sucesso!');
      refreshProfile().catch(() => {});
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar dados';
      toast.error(msg);
    }
  };

  if (authLoading) return <DadosSkeleton />;
  if (!user || (profile && profile.role !== 'admin')) return null;

  return (
    <>
      {cropModalFile && (
        <AvatarCropModal
          file={cropModalFile}
          onSave={handleAvatarSaveFromModal}
          onSaveError={(e) => toast.error(e.message)}
          onCancel={closeCropModal}
        />
      )}
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Meus Dados</h1>
          <p className="mt-2 text-sm text-gray-400">
            Atualize suas informações pessoais e dados bancários
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div className="flex-1 space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
                  <input
                    type="text"
                    id="nome"
                    required
                    className="block w-full bg-black/20 border border-white/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 sm:text-sm transition-all"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="block w-full bg-black/20 border border-white/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 sm:text-sm transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
                  <input
                    type="tel"
                    id="telefone"
                    required
                    className="block w-full bg-black/20 border border-white/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 sm:text-sm transition-all"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-center sm:items-end">
                <input
                  ref={inputAvatarRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => inputAvatarRef.current?.click()}
                  className="relative w-28 h-28 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 flex-shrink-0 cursor-pointer transition-all hover:border-gold-500/50 hover:ring-2 hover:ring-gold-500/30 focus:outline-none focus:ring-2 focus:ring-gold-500/50 disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {pendingAvatarPreviewUrl ? (
                    <img
                      src={pendingAvatarPreviewUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  ) : profile?.avatar_url ? (
                    <img
                      src={getAvatarDisplayUrl(profile.avatar_url) ?? ''}
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-steel-400">
                      <FiUser className="w-12 h-12" />
                    </div>
                  )}
                  <span className="absolute inset-0 bg-rich-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="flex flex-col items-center text-white text-xs font-medium">
                      <FiCamera className="w-6 h-6 mb-0.5" />
                      Alterar foto
                    </span>
                  </span>
                </button>
                <span className="mt-2 text-xs text-steel-400 text-center sm:text-right">Clique para alterar</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Dados Bancários / PIX</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="banco" className="block text-sm font-medium text-gray-300 mb-1">Banco</label>
                  <input
                    type="text"
                    id="banco"
                    className="block w-full bg-black/20 border border-white/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 sm:text-sm transition-all"
                    value={formData.banco}
                    onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="agencia" className="block text-sm font-medium text-gray-300 mb-1">Agência</label>
                  <input
                    type="text"
                    id="agencia"
                    className="block w-full bg-black/20 border border-white/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 sm:text-sm transition-all"
                    value={formData.agencia}
                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="conta" className="block text-sm font-medium text-gray-300 mb-1">Conta</label>
                  <input
                    type="text"
                    id="conta"
                    className="block w-full bg-black/20 border border-white/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 sm:text-sm transition-all"
                    value={formData.conta}
                    onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="pix" className="block text-sm font-medium text-gray-300 mb-1">Chave PIX</label>
                  <input
                    type="text"
                    id="pix"
                    className="block w-full bg-black/20 border border-white/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 sm:text-sm transition-all"
                    value={formData.pix}
                    onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-white/20 shadow-sm text-sm font-medium rounded-lg text-gray-300 bg-transparent hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-lg btn-gold-metallic focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-400 disabled:opacity-50 transition-all"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
