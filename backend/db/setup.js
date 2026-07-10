// backend/db/setup.js
// Run: node db/setup.js
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const schema = `
-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS lyrics CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS artists CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Users table (for public visitors)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admins table (for CMS login)
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Artists table
CREATE TABLE artists (
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

-- Songs table
CREATE TABLE songs (
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

-- Lyrics table (each row = one couplet/line pair)
CREATE TABLE lyrics (
  id SERIAL PRIMARY KEY,
  song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  punjabi_text TEXT NOT NULL,
  english_meaning TEXT NOT NULL,
  line_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Likes table (track song likes by session)
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(song_id, session_id)
);

-- Indexes for performance
CREATE INDEX idx_songs_artist_id ON songs(artist_id);
CREATE INDEX idx_songs_slug ON songs(slug);
CREATE INDEX idx_artists_slug ON artists(slug);
CREATE INDEX idx_lyrics_song_id ON lyrics(song_id);
CREATE INDEX idx_songs_featured ON songs(featured);

-- Full text search index
CREATE INDEX idx_songs_search ON songs USING gin(to_tsvector('english', title));
CREATE INDEX idx_artists_search ON artists USING gin(to_tsvector('english', name));

-- Views: song with artist info
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
`;

async function setup() {
  const client = await pool.connect();
  try {
    console.log('🔧 Setting up database...');
    await client.query(schema);
    console.log('✅ Tables created successfully!');
    console.log('\nNext: run  node db/seed.js  to add sample data');
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
