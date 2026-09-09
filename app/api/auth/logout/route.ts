import { revokeSession, sameOrigin } from '@/lib/auth';
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json({ error: 'Origem inválida.' }, { status: 403 });
  await revokeSession();
  return Response.json({ ok: true });
}
