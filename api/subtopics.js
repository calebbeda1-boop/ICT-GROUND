// /api/subtopics.js — Vercel serverless function
// CRUD for each topic's uploaded resources: GET (public, published only),
// POST (create), PUT (edit), DELETE — all writes require x-admin-password.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function isAdmin(req) {
  const pw = req.headers['x-admin-password'];
  return pw && pw === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Regular visitors (index.html) only see published rows.
      // The admin panel sends the password header and sees everything.
      let query = supabase.from('subtopics').select('*').order('created_at', { ascending: false });
      if (!isAdmin(req)) query = query.eq('published', true);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ subtopics: data });
    }

    if (req.method === 'POST') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { topic_id, title, content_type, file_ext, url } = body || {};
      if (!topic_id || !title || !content_type || !url) {
        return res.status(400).json({ error: 'Missing fields' });
      }
      const { data, error } = await supabase
        .from('subtopics')
        .insert([{ topic_id, title, content_type, file_ext, url, published: true }])
        .select();
      if (error) throw error;
      return res.status(200).json({ subtopic: data[0] });
    }

    if (req.method === 'PUT') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, topic_id, title, content_type, file_ext, url } = body || {};
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const update = {};
      if (topic_id !== undefined) update.topic_id = topic_id;
      if (title !== undefined) update.title = title;
      if (content_type !== undefined) update.content_type = content_type;
      if (file_ext !== undefined) update.file_ext = file_ext;
      if (url !== undefined) update.url = url;
      const { data, error } = await supabase.from('subtopics').update(update).eq('id', id).select();
      if (error) throw error;
      return res.status(200).json({ subtopic: data[0] });
    }

    if (req.method === 'DELETE') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('subtopics').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
