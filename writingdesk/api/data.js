import { put, get, list, del } from '@vercel/blob';

const PATH = 'desk/workspace.json';
const SNAP_PREFIX = 'desk/snapshots/';

export const config = {
  api: { bodyParser: { sizeLimit: '8mb' } }
};

async function readBlob(path) {
  const result = await get(path, { access: 'private' });
  if (!result) return null;
  return JSON.parse(await new Response(result.stream).text());
}

function cleanName(name) {
  return String(name || '').trim().slice(0, 80).replace(/[\\/:*?"<>|]/g, '-');
}

export default async function handler(req, res) {
  if (req.method === 'HEAD') return res.status(200).end();

  const key = process.env.DESK_KEY;
  if (!key) return res.status(500).json({ error: 'DESK_KEY is not set on the server' });
  if (req.headers['x-desk-key'] !== key) return res.status(401).json({ error: 'wrong password' });

  try {
    if (req.method === 'GET') {
      if (req.query?.snapshots === '1') {
        const { blobs } = await list({ prefix: SNAP_PREFIX });
        const snapshots = blobs.map(b => ({
          id: b.pathname.slice(SNAP_PREFIX.length),
          name: b.pathname.slice(SNAP_PREFIX.length).replace(/^[0-9]+-[a-z0-9]+-/, '').replace(/\.json$/, '').replace(/-/g, ' '),
          pathname: b.pathname,
          createdAt: b.uploadedAt,
          size: b.size
        })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        return res.status(200).json({ snapshots });
      }

      if (req.query?.snapshot) {
        const id = String(req.query.snapshot);
        if (!/^[0-9]+-[a-z0-9]+-[a-z0-9-]+\.json$/.test(id)) {
          return res.status(400).json({ error: 'invalid snapshot id' });
        }
        const workspace = await readBlob(SNAP_PREFIX + id);
        if (!workspace) return res.status(404).json({ error: 'snapshot not found' });
        return res.status(200).json({ workspace });
      }

      const workspace = await readBlob(PATH);
      return res.status(200).json(workspace);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (body?.action === 'snapshot_save') {
        if (!body.workspace || !Array.isArray(body.workspace.books)) {
          return res.status(400).json({ error: 'expected snapshot workspace' });
        }
        const name = cleanName(body.name);
        if (!name) return res.status(400).json({ error: 'snapshot name required' });
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'state'}.json`;
        await put(SNAP_PREFIX + id, JSON.stringify(body.workspace), {
          access: 'private',
          contentType: 'application/json',
          addRandomSuffix: false
        });
        return res.status(200).json({ ok: true, id, name });
      }

      if (body?.action === 'snapshot_delete') {
        const id = String(body.id || '');
        if (!/^[0-9]+-[a-z0-9]+-[a-z0-9-]+\.json$/.test(id)) {
          return res.status(400).json({ error: 'invalid snapshot id' });
        }
        await del(SNAP_PREFIX + id);
        return res.status(200).json({ ok: true });
      }

      if (!body || !Array.isArray(body.books)) {
        return res.status(400).json({ error: 'expected {books:[...], current:n}' });
      }
      await put(PATH, JSON.stringify(body), {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true
      });
      return res.status(200).json({ ok: true, books: body.books.length });
    }

    res.setHeader('Allow', 'GET, POST, HEAD');
    return res.status(405).end();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
