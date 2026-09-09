import { copyFileSync, mkdirSync } from 'node:fs';
mkdirSync('public', { recursive: true });
copyFileSync(
  'node_modules/bootstrap-icons/bootstrap-icons.svg',
  'public/bootstrap-icons.svg',
);
