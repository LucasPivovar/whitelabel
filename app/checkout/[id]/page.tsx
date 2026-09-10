import { notFound } from 'next/navigation';
import { database } from '@/lib/server';
import { type State, type Checkout } from '@/lib/model';
import CheckoutDocument from '@/components/checkout-document';
export const dynamic = 'force-dynamic';
async function getCheckoutData(id: string) {
  let row = await database()
    .prepare(
      "SELECT data FROM workspaces WHERE EXISTS (SELECT 1 FROM json_each(json_extract(data,'$.checkouts')) WHERE json_extract(value,'$.id')=?) LIMIT 1",
    )
    .bind(id)
    .first<{ data: string }>();
  if (!row) {
    const all = await database()
      .prepare('SELECT data FROM workspaces')
      .first<{ data: string }>();
    if (all) {
      const s = JSON.parse(all.data) as State;
      if (s.checkouts?.some((x) => x.id === id)) {
        row = all;
      }
    }
  }
  if (!row) return null;
  const s = JSON.parse(row.data) as State;
  const c = s.checkouts.find((c) => c.id === id);
  if (!c) return null;
  const tenant = s.tenants.find((t) => t.id === c.tenantId) || s.tenants[0];
  if (!tenant) return null;
  const isDraft = !c.published || !c.publishedData;
  const checkout =
    !isDraft && c.publishedData
      ? (JSON.parse(c.publishedData) as Checkout)
      : c;
  return { c: checkout, tenant, isDraft };
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await getCheckoutData((await params).id);
  return {
    title: p?.c.name
      ? `${p.c.name} | ${p.tenant.name}`
      : p?.c.metaTitle || 'Checkout',
    description: p?.c.metaDescription || p?.c.subtitle || '',
    robots: { index: false, follow: false },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await getCheckoutData((await params).id);
  if (!p) notFound();
  return (
    <main
      style={{
        minHeight: '100dvh',
        background: p.c.background || '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        width: '100%',
        margin: 0,
        padding: 0,
      }}
    >
      {p.isDraft && (
        <aside
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #181d15, #141712)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '7px 16px',
            fontSize: '12px',
            color: '#a3b899',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 10,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#eab308',
              display: 'inline-block',
            }}
          />
          <span>Modo de visualização rápida · Esta oferta está em modo rascunho.</span>
        </aside>
      )}
      <div
        className="checkout-isolated-viewport"
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '0 16px 40px',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="checkout-isolated-container"
          style={{
            width: '100%',
            maxWidth: p.c.design?.maxWidth ? `${p.c.design.maxWidth}px` : '780px',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          <CheckoutDocument checkout={p.c} tenant={p.tenant} />
        </div>
      </div>
    </main>
  );
}
