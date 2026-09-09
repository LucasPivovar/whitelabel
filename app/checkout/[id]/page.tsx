import { notFound } from 'next/navigation';
import { database } from '@/lib/server';
import { type State, type Checkout } from '@/lib/model';
import CheckoutDocument from '@/components/checkout-document';
export const dynamic = 'force-dynamic';
async function published(id: string) {
  const row = await database()
    .prepare(
      "SELECT data FROM workspaces WHERE EXISTS (SELECT 1 FROM json_each(json_extract(data,'$.checkouts')) WHERE json_extract(value,'$.id')=?) LIMIT 1",
    )
    .bind(id)
    .first<{ data: string }>();
  if (!row) return null;
  const s = JSON.parse(row.data) as State;
  const c = s.checkouts.find((c) => c.id === id && c.published);
  const tenant = s.tenants.find(
    (t) => t.id === c?.tenantId && t.status === 'active',
  );
  if (!c?.publishedData || !tenant) return null;
  return { c: JSON.parse(c.publishedData) as Checkout, tenant };
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await published((await params).id);
  return {
    title: p?.c.metaTitle || 'Checkout indisponível',
    description: p?.c.metaDescription || '',
    robots: { index: false, follow: false },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await published((await params).id);
  if (!p) notFound();
  return (
    <main style={{ minHeight: '100dvh', background: p.c.background }}>
      <CheckoutDocument checkout={p.c} tenant={p.tenant} />
    </main>
  );
}
