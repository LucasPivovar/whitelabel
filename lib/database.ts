import { createClient, type Client, type InValue } from '@libsql/client';
let client: Client | undefined;
let ready: Promise<void> | undefined;
function connection() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url)
      throw Error(
        'Configure TURSO_DATABASE_URL e execute npm run setup no ambiente local.',
      );
    if (process.env.VERCEL && url.startsWith('file:'))
      throw Error('A Vercel exige um banco remoto Turso.');
    client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  return client;
}
export async function initialize() {
  if (!ready) {
    ready = connection()
      .batch(
        [
          'CREATE TABLE IF NOT EXISTS workspaces (owner TEXT PRIMARY KEY NOT NULL,data TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0)',
          'CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY NOT NULL,email TEXT NOT NULL UNIQUE,password TEXT NOT NULL,created INTEGER NOT NULL)',
          'CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY NOT NULL,account_id TEXT NOT NULL,expires INTEGER NOT NULL)',
          'CREATE TABLE IF NOT EXISTS invitations (token TEXT PRIMARY KEY NOT NULL,owner TEXT NOT NULL,tenant_id TEXT NOT NULL,email TEXT NOT NULL,expires INTEGER NOT NULL)',
          'CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY NOT NULL,count INTEGER NOT NULL,reset_at INTEGER NOT NULL)',
          'CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY NOT NULL,owner TEXT NOT NULL,mime TEXT NOT NULL,bytes BLOB NOT NULL)',
          'CREATE INDEX IF NOT EXISTS sessions_account ON sessions(account_id)',
          'CREATE INDEX IF NOT EXISTS invitations_tenant ON invitations(owner,tenant_id)',
        ],
        'write',
      )
      .then(() => {})
      .catch((e) => {
        ready = undefined;
        throw e;
      });
  }
  return ready;
}
export async function query(sql: string, args: InValue[] = []) {
  await initialize();
  return connection().execute({ sql, args });
}
export async function transaction() {
  await initialize();
  return connection().transaction('write');
}
// Small prepared-query adapter preserves existing workspace operations during migration.
export function database() {
  return {
    prepare(sql: string) {
      let args: InValue[] = [];
      return {
        bind(...values: InValue[]) {
          args = values;
          return this;
        },
        async first<T>() {
          const r = await query(sql, args);
          return (r.rows[0] as unknown as T) || null;
        },
        async run() {
          const r = await query(sql, args);
          return { meta: { changes: r.rowsAffected } };
        },
      };
    },
  };
}
