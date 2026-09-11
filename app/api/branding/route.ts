import { database, workspace } from '@/lib/server';
import type { State, Tenant } from '@/lib/model';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const targetTenantParam = url.searchParams.get('tenant')?.trim().toLowerCase();

  let targetTenant: Tenant | null = null;

  // 1. Try to get tenant from active session if available
  try {
    const w = await workspace();
    if (w.tenantId) {
      targetTenant = w.state.tenants.find((t) => t.id === w.tenantId) || null;
    } else if (w.state.tenants.length > 0) {
      targetTenant = w.state.tenants[0];
    }
  } catch {
    // Not logged in or no active session cookie, fallback to database read
  }

  // 2. If targetTenantParam was explicitly requested or no session tenant
  if (!targetTenant || targetTenantParam) {
    try {
      const db = database();
      const row = await db
        .prepare('SELECT data FROM workspaces ORDER BY revision DESC LIMIT 1')
        .first<{ data: string }>();

      if (row?.data) {
        const state = JSON.parse(row.data) as State;
        if (targetTenantParam) {
          targetTenant =
            state.tenants.find(
              (t) =>
                t.id.toLowerCase() === targetTenantParam ||
                t.slug.toLowerCase() === targetTenantParam,
            ) || null;
        }
        if (!targetTenant && state.tenants.length > 0) {
          targetTenant = state.tenants[0];
        }
      }
    } catch (e) {
      console.warn('[api/branding] DB read error', e);
    }
  }

  // Fallback default if nothing exists yet
  const branding = {
    id: targetTenant?.id || 'default',
    name: targetTenant?.name || 'TradingPro',
    slug: targetTenant?.slug || 'tradingpro',
    color: targetTenant?.color || '#96d600',
    secondaryColor: targetTenant?.secondaryColor || '#ffffff',
    font: targetTenant?.font || 'Inter',
    logo: targetTenant?.logo || '',
    favicon: targetTenant?.favicon || targetTenant?.logo || '',
    darkMode: targetTenant?.darkMode !== false,
    loginTemplate: targetTenant?.loginTemplate || 'split',
  };

  return Response.json(branding, { headers: CORS_HEADERS });
}
