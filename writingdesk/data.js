import { put, list } from '@vercel/blob';

const PATH = 'desk/workspace.json';

export const config = {
  api: { bodyParser: { sizeLimit: '8mb' } }
};

export default async function handler(req, res) {
  // HEAD is the page checking whether an API exists at all
  if (req.method === 'HEAD') return res.status(200).end();

  const key = process.env.DESK_KEY;
  if (!key) return res.status(500).json({ error: 'DESK_KEY is not set on the server' });
  if (req.headers['x-desk-key'] !== key) return res.status(401).json({ error: 'wrong password' });

  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: PATH, limit: 1 });
      if (!blobs.length) return res.status(200).json(null);
      // cache-bust: blob URLs are edge-cached
      const r = await fetch(blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return res.status(502).json({ error: 'could not read stored data' });
      return res.status(200).json(await r.json());
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || !Array.isArray(body.books)) {
        return res.status(400).json({ error: 'expected {books:[...], current:n}' });
      }
      await put(PATH, JSON.stringify(body), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true
      });
      return res.status(200).json({ ok: true, books: body.books.length });
    }

    res.setHeader('Allow', 'GET, POST, HEAD');
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
