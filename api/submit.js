const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = 'exam_submissions';

async function upsertRecord(record) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify([record])
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(text || `Supabase error (${r.status})`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    res.status(500).json({ error: 'Storage haijawekwa (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY hazipo).' });
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
      raw_total: Number(body.rawTotal) || 0,
      penalty_marks: Number(body.penaltyMarks) || 0,
      total_correct: Number(body.totalCorrect) || 0,
      total_marks: Number(body.totalMarks) || 0,
      pct: Number(body.pct) || 0,
      grade: String(body.grade || ''),
      tab_switch_count: Number(body.tabSwitchCount) || 0,
      submitted_at: Number(body.submittedAt) || Date.now(),
      received_at: Date.now()
    };

    await upsertRecord(record);
    res.status(200).json({ ok: true, id: record.id });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
