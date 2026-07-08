// Hermetic test server: serves the built app from dist/ and emulates the
// home server's /sync/ endpoint in memory. Tests never touch the real
// deployment or its family-backup store.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.argv[2] ?? 4180);
const DIST = new URL('../dist/', import.meta.url).pathname;
const store = new Map();

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  const path = new URL(req.url, 'http://x').pathname;

  if (path.startsWith('/sync/profiles/')) {
    const name = decodeURIComponent(path.slice('/sync/profiles/'.length));
    if (req.method === 'PUT') {
      let body = '';
      for await (const chunk of req) body += chunk;
      store.set(name, body);
      res.writeHead(201).end();
    } else if (req.method === 'DELETE') {
      store.delete(name);
      res.writeHead(204).end();
    } else if (!name) {
      res
        .writeHead(200, { 'Content-Type': 'application/json' })
        .end(JSON.stringify([...store.keys()].map((n) => ({ name: n, type: 'file' }))));
    } else if (store.has(name)) {
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(store.get(name));
    } else {
      res.writeHead(404).end();
    }
    return;
  }

  const file = path === '/' ? '/index.html' : path;
  try {
    const data = await readFile(join(DIST, normalize(file)));
    res
      .writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
      .end(data);
  } catch {
    res.writeHead(404).end();
  }
}).listen(PORT, '0.0.0.0', () => console.log(`test server on :${PORT}`));
