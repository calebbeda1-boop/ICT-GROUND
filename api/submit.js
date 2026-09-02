const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const LIST_KEY = 'exam_submissions';

async function redisCommand(cmd) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(cmd)
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!REDIS_URL || !REDIS_TOKEN) {
    res.status(500).json({ error: 'Storage haijawekwa (KV_REST_API_URL / KV_REST_API_TOKEN hazipo). Ongeza Upstash Redis kwenye mradi wako wa Vercel.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || !body.student || !body.student.name || !body.id) {
      res.status(400).json({ error: 'Data ya mwanafunzi haitoshi (jina/id hazipo).' });
      return;
    }

    const record = {
      id: String(body.id),
      name: String(body.student.name || '').slice(0, 120),
      cand: String(body.student.cand || '').slice(0, 60),
      cls: String(body.student.cls || '').slice(0, 60),
      rawTotal: Number(body.rawTotal) || 0,
      penaltyMarks: Number(body.penaltyMarks) || 0,
      totalCorrect: Number(body.totalCorrect) || 0,
      totalMarks: Number(body.totalMarks) || 0,
      pct: Number(body.pct) || 0,
      grade: String(body.grade || ''),
      tabSwitchCount: Number(body.tabSwitchCount) || 0,
      submittedAt: Number(body.submittedAt) || Date.now(),
      receivedAt: Date.now()
    };

    await redisCommand(['LREM', LIST_KEY, 0, JSON.stringify(record)]);
    const existing = await redisCommand(['LRANGE', LIST_KEY, 0, -1]);
    const filtered = (existing || []).filter(s => {
      try { return JSON.parse(s).id !== record.id; } catch (e) { return true; }
    });
    if (filtered.length !== (existing || []).length) {
      await redisCommand(['DEL', LIST_KEY]);
      if (filtered.length) await redisCommand(['RPUSH', LIST_KEY, ...filtered]);
    }
    await redisCommand(['RPUSH', LIST_KEY, JSON.stringify(record)]);

    res.status(200).json({ ok: true, id: record.id });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
