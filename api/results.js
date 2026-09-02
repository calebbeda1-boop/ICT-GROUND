const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const LIST_KEY = 'exam_submissions';

export default async function handler(req, res) {
  const pw = req.headers['x-admin-password'] || req.query.pw || '';
  if (!process.env.ADMIN_PASSWORD || pw !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Password si sahihi.' });
    return;
  }
  if (!REDIS_URL || !REDIS_TOKEN) {
    res.status(500).json({ error: 'Storage haijawekwa.' });
    return;
  }

  try {
    const r = await fetch(REDIS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      body: JSON.stringify(['LRANGE', LIST_KEY, 0, -1])
    });
    const data = await r.json();
    if (data.error) throw new Error(data.error);
    const submissions = (data.result || [])
      .map(s => { try { return JSON.parse(s); } catch (e) { return null; } })
      .filter(Boolean)
      .sort((a, b) => b.submittedAt - a.submittedAt);
    res.status(200).json({ submissions });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
