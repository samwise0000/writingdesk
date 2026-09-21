import Anthropic from '@anthropic-ai/sdk';

export const config = {
  api: { bodyParser: { sizeLimit: '512kb' } }
};

const anthropic = new Anthropic();

const SYSTEM = `You are a writing coach embedded in Writing Desk, a personal writing app for serious writers.

You help with craft — voice, structure, pacing, scene work, dialogue, point of view, imagery, revision. You are concise and specific. You reference the writer's actual content when it's available. You ask questions when more context would help you give better advice.

You are not a cheerleader. You give honest, useful feedback like a good editor would.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const key = process.env.DESK_KEY;
  if (!key) return res.status(500).json({ error: 'DESK_KEY not set' });
  if (req.headers['x-desk-key'] !== key) return res.status(401).json({ error: 'wrong password' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set on the server' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { messages = [], context = '' } = body;

    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'messages required' });
    }

    const system = context ? `${SYSTEM}\n\nCurrent context:\n${context}` : SYSTEM;

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      return res.status(500).json({ error: String(e?.message || e) });
    }
    res.write(`data: ${JSON.stringify({ error: String(e?.message || e) })}\n\n`);
    res.end();
  }
}
