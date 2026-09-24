// POST /api/visit  -> records one visit in Supabase (called from index.html)
const { createClient } = require('@supabase/supabase-js');

// Use the SAME env variable names your other /api files use for Supabase.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const isNew = !!(req.body && req.body.newVisitor === true);
  const { error } = await supabase.from('site_visits').insert({ is_new_visitor: isNew });
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not record visit' });
  }
  res.status(200).json({ ok: true });
};
