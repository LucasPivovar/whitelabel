import { requireUser, hashPassword, sameOrigin } from '@/lib/auth';
import { query } from '@/lib/database';
import { workspace } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ error: 'Origem inválida.' }, { status: 403 });
  }

  try {
    const user = await requireUser();
    const body = await request.json();
    const { name, email, newPassword } = body;

    const w = await workspace();
    const s = w.state;
    let modified = false;

    // 1. Password update
    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return Response.json(
          { error: 'A nova senha deve ter no mínimo 8 caracteres.' },
          { status: 400 },
        );
      }
      const hashed = await hashPassword(newPassword);
      await query('UPDATE accounts SET password=? WHERE id=?', [hashed, user.id]);
    }

    // 2. Email update
    const nextEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (nextEmail && nextEmail !== user.email.toLowerCase()) {
      if (!nextEmail.includes('@') || nextEmail.length < 5) {
        return Response.json({ error: 'E-mail inválido.' }, { status: 400 });
      }

      // Check if email taken in accounts
      const existing = (
        await query('SELECT id FROM accounts WHERE lower(email)=? AND id!=?', [
          nextEmail,
          user.id,
        ])
      ).rows[0];
      if (existing) {
        return Response.json(
          { error: 'Este e-mail já está sendo utilizado por outra conta.' },
          { status: 409 },
        );
      }

      await query('UPDATE accounts SET email=? WHERE id=?', [nextEmail, user.id]);

      // Update in tenant state if applicable
      if (w.role === 'tenant' && w.tenantId) {
        const tenant = s.tenants.find((t) => t.id === w.tenantId);
        if (tenant) {
          tenant.email = nextEmail;
          if (tenant.users) {
            const u = tenant.users.find((x) => x.email.toLowerCase() === user.email.toLowerCase());
            if (u) u.email = nextEmail;
          }
          modified = true;
        }
      }
    }

    // 3. Name update
    const nextName = typeof name === 'string' ? name.trim() : '';
    if (nextName) {
      if (w.role === 'tenant' && w.tenantId) {
        const tenant = s.tenants.find((t) => t.id === w.tenantId);
        if (tenant && tenant.admin !== nextName) {
          tenant.admin = nextName;
          if (tenant.users) {
            const u = tenant.users.find((x) => x.email.toLowerCase() === user.email.toLowerCase());
            if (u) u.name = nextName;
          }
          modified = true;
        }
      }
    }

    if (modified) {
      await query('UPDATE workspaces SET data=? WHERE owner=?', [
        JSON.stringify(s),
        w.row.owner,
      ]);
    }

    return Response.json({
      ok: true,
      email: nextEmail || user.email,
      name: nextName,
      message: 'Dados atualizados com sucesso.',
    });
  } catch (err) {
    const msg = (err as Error).message;
    return Response.json(
      { error: msg || 'Falha ao atualizar perfil.' },
      { status: msg === 'UNAUTHORIZED' ? 401 : 500 },
    );
  }
}
