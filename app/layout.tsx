import type { Metadata } from 'next';
import { Inter, Poppins, Cinzel } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/server';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins'
});
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
});

export const metadata: Metadata = {
  title: 'AS Digital - Inovação e Independência Financeira',
  description: 'Descubra o futuro do mercado digital. Produtos de alta performance e um ecossistema exclusivo para você escalar seus resultados.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user: serverUser } } = await supabase.auth.getUser();
  let initialProfile: { id: string; email: string; full_name?: string; role?: 'admin' | 'member'; referral_code?: string; wallet_balance?: number; sponsor_id?: string; phone?: string } | null = null;
  if (serverUser) {
    const { data } = await supabase.from('profiles').select('*').eq('id', serverUser.id).single();
    if (data) {
      const role = data.role === 'admin' || data.role === 'member' ? data.role : undefined;
      initialProfile = { ...data, role };
    }
  }
  const initialUser = serverUser ? { id: serverUser.id, email: serverUser.email ?? undefined } : null;

  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${poppins.variable} ${cinzel.variable} font-sans`}>
        <AuthProvider initialUser={initialUser} initialProfile={initialProfile}>{children}</AuthProvider>
      </body>
    </html>
  );
}
