
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import artistsRouter from './routes/artists.js';
import songsRouter from './routes/songs.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/user.js';
import aiRouter from './routes/ai.js';
import pool from './db/pool.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://punjabi-lyrics.vercel.app']
    : ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

app.use('/api/artists', artistsRouter);
app.use('/api/songs', songsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/ai', aiRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Auto setup database on first deploy
async function setupDatabase() {
  try {
    // Check if tables already exist
    const check = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'artists'
      )`
    );

    if (check.rows[0].exists) {
      console.log('✅ Database already set up');
      return;
    }

    console.log('🔧 First deploy detected - setting up database...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS artists (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        image_url TEXT,
        bio TEXT,
        instagram_handle VARCHAR(100),
        genre VARCHAR(100) DEFAULT 'Punjabi',
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        cover_image_url TEXT,
        release_year INTEGER,
        album VARCHAR(255),
        spotify_url TEXT,
        youtube_url TEXT,
        featured BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lyrics (
        id SERIAL PRIMARY KEY,
        song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
        punjabi_text TEXT NOT NULL,
        english_meaning TEXT NOT NULL,
        line_order INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
        session_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(song_id, session_id)
      );

      CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);
      CREATE INDEX IF NOT EXISTS idx_songs_slug ON songs(slug);
      CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
      CREATE INDEX IF NOT EXISTS idx_lyrics_song_id ON lyrics(song_id);
    `);

    // Create the view
    await pool.query(`
      CREATE OR REPLACE VIEW songs_with_artists AS
      SELECT 
        s.id, s.title, s.slug, s.cover_image_url,
        s.release_year, s.album, s.spotify_url, s.youtube_url,
        s.featured, s.view_count, s.created_at,
        a.id as artist_id, a.name as artist_name,
        a.slug as artist_slug, a.image_url as artist_image,
        a.verified as artist_verified,
        COUNT(DISTINCT l.id) as like_count
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      LEFT JOIN likes l ON s.id = l.song_id
      GROUP BY s.id, a.id;
    `);

    // Create admin account
    const bcrypt = await import('bcryptjs');
    const adminHash = await bcrypt.default.hash(
      process.env.ADMIN_PASSWORD || 'admin123', 10
    );
    await pool.query(
      `INSERT INTO admins (email, password_hash) 
       VALUES ($1, $2) ON CONFLICT (email) DO NOTHING`,
      [process.env.ADMIN_EMAIL || 'admin@admin.com', adminHash]
    );

    console.log('✅ Database setup complete!');
    console.log('✅ Admin account created');

  } catch (err) {
    console.error('❌ Database setup error:', err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  await setupDatabase();
});