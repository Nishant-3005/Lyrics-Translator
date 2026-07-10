// backend/routes/songs.js
import express from 'express';
import pool from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET featured songs
router.get('/featured', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM songs_with_artists WHERE featured = true ORDER BY view_count DESC LIMIT 6`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET search songs + artists
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ songs: [], artists: [] });
  try {
    const searchTerm = `%${q}%`;
    const { rows: songs } = await pool.query(
      `SELECT * FROM songs_with_artists WHERE title ILIKE $1 OR artist_name ILIKE $1 LIMIT 10`,
      [searchTerm]
    );
    const { rows: artists } = await pool.query(
      `SELECT * FROM artists WHERE name ILIKE $1 LIMIT 5`,
      [searchTerm]
    );
    res.json({ songs, artists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all songs (paginated)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM songs_with_artists ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { rows: countRows } = await pool.query(`SELECT COUNT(*) FROM songs`);
    res.json({
      songs: rows,
      total: parseInt(countRows[0].count),
      page,
      pages: Math.ceil(countRows[0].count / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single song with lyrics
router.get('/:slug', async (req, res) => {
  try {
    const { rows: songRows } = await pool.query(
      `SELECT * FROM songs_with_artists WHERE slug = $1`, [req.params.slug]
    );
    if (!songRows.length) return res.status(404).json({ error: 'Song not found' });

    // Increment view count
    await pool.query(`UPDATE songs SET view_count = view_count + 1 WHERE slug = $1`, [req.params.slug]);

    const { rows: lyrics } = await pool.query(
      `SELECT * FROM lyrics WHERE song_id = $1 ORDER BY line_order`,
      [songRows[0].id]
    );

    res.json({ ...songRows[0], lyrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST like a song (session-based)
router.post('/:id/like', async (req, res) => {
  const { session_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO likes (song_id, session_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.id, session_id]
    );
    const { rows } = await pool.query(
      `SELECT COUNT(*) as count FROM likes WHERE song_id = $1`, [req.params.id]
    );
    res.json({ liked: true, count: parseInt(rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE unlike a song
router.delete('/:id/like', async (req, res) => {
  const { session_id } = req.body;
  try {
    await pool.query(
      `DELETE FROM likes WHERE song_id = $1 AND session_id = $2`,
      [req.params.id, session_id]
    );
    const { rows } = await pool.query(
      `SELECT COUNT(*) as count FROM likes WHERE song_id = $1`, [req.params.id]
    );
    res.json({ liked: false, count: parseInt(rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create song (admin)
router.post('/', requireAdmin, async (req, res) => {
  const { artist_id, title, slug, cover_image_url, release_year, album, spotify_url, youtube_url, featured, lyrics } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO songs (artist_id, title, slug, cover_image_url, release_year, album, spotify_url, youtube_url, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [artist_id, title, slug, cover_image_url, release_year, album, spotify_url, youtube_url, featured]
    );
    const songId = rows[0].id;
    if (lyrics && lyrics.length) {
      for (const l of lyrics) {
        await client.query(
          `INSERT INTO lyrics (song_id, punjabi_text, english_meaning, line_order) VALUES ($1,$2,$3,$4)`,
          [songId, l.punjabi_text, l.english_meaning, l.line_order]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT update song (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  const { title, slug, cover_image_url, release_year, album, spotify_url, youtube_url, featured, lyrics } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE songs SET title=$1, slug=$2, cover_image_url=$3, release_year=$4, album=$5,
       spotify_url=$6, youtube_url=$7, featured=$8 WHERE id=$9 RETURNING *`,
      [title, slug, cover_image_url, release_year, album, spotify_url, youtube_url, featured, req.params.id]
    );
    // Replace all lyrics
    if (lyrics) {
      await client.query(`DELETE FROM lyrics WHERE song_id = $1`, [req.params.id]);
      for (const l of lyrics) {
        await client.query(
          `INSERT INTO lyrics (song_id, punjabi_text, english_meaning, line_order) VALUES ($1,$2,$3,$4)`,
          [req.params.id, l.punjabi_text, l.english_meaning, l.line_order]
        );
      }
    }
    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE song (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query(`DELETE FROM songs WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
