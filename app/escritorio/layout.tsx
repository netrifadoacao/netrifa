import Layout from '@/components/Layout';

export const dynamic = 'force-dynamic';

export default function EscritorioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout tipo="usuario">{children}</Layout>;
}
