import { cookies } from 'next/headers';
import { demoEnabled } from '@/lib/demo';
import { sameOrigin } from '@/lib/auth';

export async function POST(request: Request) {
  if (!demoEnabled()) return new Response(null, { status: 404 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const body = await request.json().catch(() => null);
  if (body?.role !== 'admin' && body?.role !== 'tenant')
    return Response.json({ error: 'Perfil inválido.' }, { status: 400 });
  (await cookies()).set('tradingpro_demo_role', body.role, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/',
  });
  return Response.json({ ok: true });
}
