// GET /api/stats  -> visitor numbers, admin only (x-admin-password header)
const { createClient } = require('@supabase/supabase-js');

// Use the SAME env variable names your other /api files use for Supabase.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TZ_OFFSET_HOURS = 3; // "today" starts at local midnight (UTC+3). Change if needed.

function startOfTodayISO() {
  const local = new Date(Date.now() + TZ_OFFSET_HOURS * 3600 * 1000);
  const ms = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - TZ_OFFSET_HOURS * 3600 * 1000;
  return new Date(ms).toISOString();
}

const count = (q) => q.then(({ count, error }) => { if (error) throw error; return count || 0; });

module.exports = async (req, res) => {
  // Use the SAME env variable name your other /api files check for the admin password.
  if (!process.env.ADMIN_PASSWORD || req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const t = () => supabase.from('site_visits').select('*', { count: 'exact', head: true });
    const [total, unique, today] = await Promise.all([
      count(t()),
      count(t().eq('is_new_visitor', true)),
      count(t().gte('visited_at', startOfTodayISO())),
    ]);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ total, unique, today });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not read stats' });
  }
};
