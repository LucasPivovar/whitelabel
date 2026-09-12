import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  if (!pathname.startsWith('/prototipo')) {
    response.writeHead(302, { Location: "/prototipo" + (pathname === '/' ? '' : pathname) + new URL(request.url, "http://localhost").search });
    response.end();
    return;
  }
  const requested = normalize(join(root, pathname.replace(/^\/prototipo(?:\/|$)/, "/")));
  const found = requested.startsWith(root) && existsSync(requested) && statSync(requested).isFile();
  if (!found && extname(requested)) {
    response.writeHead(404); response.end('File not found'); return;
  }
  const file = found
    ? requested
    : join(root, "index.html");

  response.writeHead(200, {
    "Content-Type": mime[extname(file).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  });
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`TradingPro prototype: http://127.0.0.1:${port}`);
});
