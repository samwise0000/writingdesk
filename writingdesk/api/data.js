<<<<<<< Updated upstream
import { put, get } from '@vercel/blob';
=======
<<<<<<< HEAD
import { put, get, list, del } from '@vercel/blob';
=======
import { put, get } from '@vercel/blob';
>>>>>>> b14448a2175d280efe99220f95045bd9d157ad29
>>>>>>> Stashed changes

const PATH = 'desk/workspace.json';
const SNAP_PREFIX = 'desk/snapshots/';

export const config = {
  api: { bodyParser: { sizeLimit: '8mb' } }
};

function validId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,240}$/.test(id);
}

function encodeName(name) {
  return Buffer.from(name, 'utf8').toString('base64url');
}

function decodeName(part) {
  try { return Buffer.from(part, 'base64url').toString('utf8') || 'Untitled state'; }
  catch { return 'Untitled state'; }
}

export default async function handler(req, res) {
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
  if (req.method === 'HEAD') return res.status(200).end();
=======
>>>>>>> Stashed changes
  // Check that the API exists
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }
<<<<<<< Updated upstream
=======
>>>>>>> b14448a2175d280efe99220f95045bd9d157ad29
>>>>>>> Stashed changes

  const key = process.env.DESK_KEY;

  if (!key) {
    return res.status(500).json({
      error: 'DESK_KEY is not set on the server'
    });
  }

  if (req.headers['x-desk-key'] !== key) {
    return res.status(401).json({
      error: 'wrong password'
    });
  }

  try {
<<<<<<< Updated upstream
    // LOAD WORKSPACE
    if (req.method === 'GET') {
      const result = await get(PATH, {
        access: 'private'
      });

      if (!result || result.statusCode !== 200) {
        return res.status(200).json(null);
      }

      const data = await new Response(result.stream).json();

      return res.status(200).json(data);
    }

    // SAVE WORKSPACE
    if (req.method === 'POST') {
      const body =
        typeof req.body === 'string'
          ? JSON.parse(req.body)
          : req.body;

      if (!body || !Array.isArray(body.books)) {
        return res.status(400).json({
          error: 'expected {books:[...], current:n}'
        });
      }

      await put(
        PATH,
        JSON.stringify(body),
        {
          access: 'private',
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: true
        }
      );

      return res.status(200).json({
        ok: true,
        books: body.books.length
      });
=======
<<<<<<< HEAD
    // List saved named snapshots. Names are encoded into the pathname so
    // listing does not require downloading every snapshot.
    if (req.method === 'GET' && req.query?.snapshots === '1') {
      const { blobs } = await list({ prefix: SNAP_PREFIX, limit: 1000 });
      const snapshots = blobs
        .map(b => {
          const filename = String(b.pathname || '').slice(SNAP_PREFIX.length);
          if (!filename.endsWith('.json')) return null;
          const id = filename.slice(0, -5);
          if (!validId(id)) return null;
          const marker = id.lastIndexOf('--');
          const encodedName = marker >= 0 ? id.slice(marker + 2) : '';
          return {
            id,
            name: encodedName ? decodeName(encodedName) : 'Saved state',
            createdAt: b.uploadedAt || null,
            size: b.size || 0
          };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return res.status(200).json({ snapshots });
    }

    // Load one named snapshot.
    if (req.method === 'GET' && req.query?.snapshot) {
      const id = String(req.query.snapshot);
      if (!validId(id)) return res.status(400).json({ error: 'invalid snapshot id' });
      const result = await get(`${SNAP_PREFIX}${id}.json`, { access: 'private', useCache: false });
      if (!result || result.statusCode !== 200) return res.status(404).json({ error: 'snapshot not found' });
      const saved = await new Response(result.stream).json();
      return res.status(200).json(saved);
    }

    // Load the current live workspace. useCache:false matters because the
    // same pathname is intentionally overwritten by normal autosaves.
    if (req.method === 'GET') {
      const result = await get(PATH, { access: 'private', useCache: false });
      if (!result || result.statusCode !== 200) return res.status(200).json(null);
      return res.status(200).json(await new Response(result.stream).json());
=======
    // LOAD WORKSPACE
    if (req.method === 'GET') {
      const result = await get(PATH, {
        access: 'private'
      });

      if (!result || result.statusCode !== 200) {
        return res.status(200).json(null);
      }

      const data = await new Response(result.stream).json();

      return res.status(200).json(data);
>>>>>>> b14448a2175d280efe99220f95045bd9d157ad29
    }

    // SAVE WORKSPACE
    if (req.method === 'POST') {
<<<<<<< HEAD
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      // Save a named immutable snapshot.
      if (body?.action === 'snapshot_save') {
        const workspace = body.workspace;
        const name = String(body.name || '').trim().slice(0, 80);
        if (!name) return res.status(400).json({ error: 'snapshot name is required' });
        if (!workspace || !Array.isArray(workspace.books)) {
          return res.status(400).json({ error: 'invalid workspace' });
        }
        const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}--${encodeName(name)}`;
        const pathname = `${SNAP_PREFIX}${id}.json`;
        const saved = { name, createdAt: new Date().toISOString(), workspace };
        await put(pathname, JSON.stringify(saved), {
          access: 'private',
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: false
        });
        return res.status(200).json({ ok: true, id, name });
      }

      // Delete a named snapshot.
      if (body?.action === 'snapshot_delete') {
        const id = String(body.id || '');
        if (!validId(id)) return res.status(400).json({ error: 'invalid snapshot id' });
        await del(`${SNAP_PREFIX}${id}.json`);
        return res.status(200).json({ ok: true });
      }

      // Replace the current live workspace.
=======
      const body =
        typeof req.body === 'string'
          ? JSON.parse(req.body)
          : req.body;

>>>>>>> b14448a2175d280efe99220f95045bd9d157ad29
      if (!body || !Array.isArray(body.books)) {
        return res.status(400).json({
          error: 'expected {books:[...], current:n}'
        });
      }

<<<<<<< HEAD
      await put(PATH, JSON.stringify(body), {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true
      });

      return res.status(200).json({ ok: true, books: body.books.length });
=======
      await put(
        PATH,
        JSON.stringify(body),
        {
          access: 'private',
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: true
        }
      );

      return res.status(200).json({
        ok: true,
        books: body.books.length
      });
>>>>>>> b14448a2175d280efe99220f95045bd9d157ad29
>>>>>>> Stashed changes
    }

    res.setHeader('Allow', 'GET, POST, HEAD');

    return res.status(405).end();

  } catch (e) {
    console.error('Writing Desk sync error:', e);
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    return res.status(500).json({ error: String((e && e.message) || e) });
=======
>>>>>>> Stashed changes

    return res.status(500).json({
      error: String((e && e.message) || e)
    });
<<<<<<< Updated upstream
=======
>>>>>>> b14448a2175d280efe99220f95045bd9d157ad29
>>>>>>> Stashed changes
  }
}
