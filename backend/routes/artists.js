// backend/routes/artists.js
import express from 'express';
import pool from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all artists
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, COUNT(s.id) as song_count 
       FROM artists a 
       LEFT JOIN songs s ON s.artist_id = a.id 
       GROUP BY a.id 
       ORDER BY a.name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single artist with songs
router.get('/:slug', async (req, res) => {
  try {
    const { rows: artistRows } = await pool.query(
      `SELECT * FROM artists WHERE slug = $1`, [req.params.slug]
    );
    if (!artistRows.length) return res.status(404).json({ error: 'Artist not found' });

    const { rows: songs } = await pool.query(
      `SELECT s.*, COUNT(l.id) as like_count 
       FROM songs s
       LEFT JOIN likes l ON l.song_id = s.id
       WHERE s.artist_id = $1
       GROUP BY s.id
       ORDER BY s.release_year DESC`,
      [artistRows[0].id]
    );

    res.json({ ...artistRows[0], songs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create artist (admin only)
router.post('/', requireAdmin, async (req, res) => {
  const { name, slug, image_url, bio, instagram_handle, genre } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO artists (name, slug, image_url, bio, instagram_handle, genre)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, slug, image_url, bio, instagram_handle, genre]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update artist (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, slug, image_url, bio, instagram_handle, genre, verified } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE artists SET name=$1, slug=$2, image_url=$3, bio=$4, instagram_handle=$5, genre=$6, verified=$7
       WHERE id=$8 RETURNING *`,
      [name, slug, image_url, bio, instagram_handle, genre, verified, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE artist (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query(`DELETE FROM artists WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Artist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
