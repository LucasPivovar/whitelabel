import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

export async function GET(
  _request: Request,
  props: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await props.params;
  const root = join(process.cwd(), 'prototipo');

  let filePath = join(root, 'index.html');
  if (slug && slug.length > 0) {
    const requested = normalize(join(root, ...slug));
    if (requested.startsWith(root) && existsSync(requested) && statSync(requested).isFile()) {
      filePath = requested;
    }
  }

  try {
    const content = readFileSync(/*turbopackIgnore: true*/ filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, must-revalidate',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
  } catch {
    return new Response('File not found', { status: 404 });
  }
}


