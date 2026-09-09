import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
if (existsSync('.env.local')) {
  console.log('Existing .env.local preserved.');
  process.exit(0);
}
mkdirSync('data', { recursive: true });
const password = randomBytes(15).toString('base64url');
writeFileSync(
  '.env.local',
  `TURSO_DATABASE_URL=file:./data/tradingpro.db\nADMIN_EMAIL=admin@tradingpro.io\nADMIN_PASSWORD=${password}\n`,
  { flag: 'wx' },
);
console.log('Local environment prepared. Login: admin@tradingpro.io');
console.log(
  'Password is stored in .env.local (ADMIN_PASSWORD). Never commit this file.',
);
