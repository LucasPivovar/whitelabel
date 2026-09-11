import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs';

mkdirSync('public', { recursive: true });
if (existsSync('node_modules/bootstrap-icons/bootstrap-icons.svg')) {
  copyFileSync(
    'node_modules/bootstrap-icons/bootstrap-icons.svg',
    'public/bootstrap-icons.svg',
  );
}

// Ensure prototype static assets are available in public directory for Next.js
if (existsSync('prototipo')) {
  mkdirSync('public/assets', { recursive: true });
  mkdirSync('public/prototipo', { recursive: true });
  if (existsSync('prototipo/assets')) {
    cpSync('prototipo/assets', 'public/assets', { recursive: true });
  }
  const staticFiles = [
    'branding.js',
    'mock-api.js',
    'favicon.svg',
    'hero-bg.jpg',
    'auth-market-bg.png',
    'Bot Animation (1).mp4',
    'Bot Animation.mp4',
    'Escudo Stop Loss.mp4',
    'Grafico Seta Loss.mp4',
    'Grafico Seta Win.mp4',
    'Trofeu Stop Win.mp4',
    'WhatsApp Image 2026-08-26 at 19.53.11.jpeg',
  ];
  for (const f of staticFiles) {
    if (existsSync(`prototipo/${f}`)) {
      copyFileSync(`prototipo/${f}`, `public/${f}`);
      copyFileSync(`prototipo/${f}`, `public/prototipo/${f}`);
    }
  }
  if (existsSync('prototipo/index.html')) {
    copyFileSync('prototipo/index.html', 'public/prototipo/index.html');
  }
  try {
    const { patchBundleFile } = await import('./patch-bundle.mjs');
    patchBundleFile('prototipo/assets/index-D08ZekFh.js');
    patchBundleFile('public/assets/index-D08ZekFh.js');
  } catch (err) {
    console.warn('[assets.mjs] Note on patchBundleFile:', err.message);
  }
}

