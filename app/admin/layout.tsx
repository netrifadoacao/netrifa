import Layout from '@/components/Layout';

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout tipo="admin">{children}</Layout>;
}
