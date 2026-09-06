// /api/delete-result.js — Vercel serverless function
// DELETE a student's exam submission: removes the database row AND the
// marked-paper PDF file in Storage, so deleted results actually free space
// (not just hidden from the dashboard). Admin-only.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const TABLE = 'exam_submissions';
const BUCKET = 'marked-exams';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pw = req.headers['x-admin-password'];
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    // Best-effort: remove the PDF file from Storage too (id.pdf is how submit.js names it)
    try { await supabase.storage.from(BUCKET).remove([`${id}.pdf`]); } catch (e) { /* ignore */ }

    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
