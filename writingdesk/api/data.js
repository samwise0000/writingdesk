import { put, get } from '@vercel/blob';

const PATH = 'desk/workspace.json';

export const config = {
  api: { bodyParser: { sizeLimit: '8mb' } }
};

export default async function handler(req, res) {
  // Check that the API exists
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

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
    }

    res.setHeader('Allow', 'GET, POST, HEAD');

    return res.status(405).end();

  } catch (e) {
    console.error('Writing Desk sync error:', e);

    return res.status(500).json({
      error: String((e && e.message) || e)
    });
  }
}
