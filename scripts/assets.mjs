import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';
import { build } from 'esbuild';

await build({ entryPoints: ['prototipo/auth-preview-entry.tsx'], outfile: 'prototipo/auth-preview.js', bundle: true, minify: true, format: 'esm', define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic' });

// Keep the archived SPA and the console on exactly the same palette generator.
const palette = ts.transpileModule(readFileSync('lib/brand-palette.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
const paletteScript = `(function(exports){\n${palette}\n})(window.TradingProPalette = {});\n`;
if (readFileSync('prototipo/palette.js', 'utf8') !== paletteScript) writeFileSync('prototipo/palette.js', paletteScript);

mkdirSync('public', { recursive: true });
if (existsSync('node_modules/bootstrap-icons/bootstrap-icons.svg')) {
  copyFileSync(
    'node_modules/bootstrap-icons/bootstrap-icons.svg',
    'public/bootstrap-icons.svg',
  );
  copyFileSync('node_modules/bootstrap-icons/bootstrap-icons.svg', 'prototipo/bootstrap-icons.svg');
}

// Ensure prototype static assets are available in public directory for Next.js
if (existsSync('prototipo')) {
  mkdirSync('public/assets', { recursive: true });
  mkdirSync('public/prototipo', { recursive: true });
  if (existsSync('prototipo/assets')) {
    cpSync('prototipo/assets', 'public/assets', { recursive: true });
  }
  const staticFiles = [
    'palette.js',
    'auth.js',
    'auth.css',
    'bootstrap-icons.svg',
    'auth-preview.js',
    'auth-preview.html',
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
    const { patchBundleFile, patchStylesFile } = await import('./patch-bundle.mjs');
    patchBundleFile('prototipo/assets/index-D08ZekFh.js');
    patchBundleFile('public/assets/index-D08ZekFh.js');
    patchStylesFile('prototipo/assets/index-D2p3AFeV.css');
    patchStylesFile('public/assets/index-D2p3AFeV.css');
  } catch (err) {
    console.warn('[assets.mjs] Note on patchBundleFile:', err.message);
  }
}

