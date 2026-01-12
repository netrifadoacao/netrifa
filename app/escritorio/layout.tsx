import Layout from '@/components/Layout';

export default function EscritorioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout tipo="usuario">{children}</Layout>;
}
