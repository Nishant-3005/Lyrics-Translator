// backend/db/seed.js
// Run: node db/seed.js
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database...');

    // Create admin
    const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await client.query(
      `INSERT INTO admins (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING`,
      [process.env.ADMIN_EMAIL || 'admin@example.com', adminHash]
    );
    console.log('✅ Admin created');

    // Insert artists
    const artists = [
      {
        name: 'Karan Aujla',
        slug: 'karan-aujla',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        bio: 'Karan Aujla is a Canadian-Punjabi rapper, singer, and songwriter known for his raw lyrics and street-smart storytelling.',
        instagram_handle:null,
        verified: true,
      },
      {
        name: 'AP Dhillon',
        slug: 'ap-dhillon',
        image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
        bio: 'AP Dhillon is a Canadian singer who blends Punjabi pop with R&B and trap influences, creating a global Punjabi sound.',
        instagram_handle: null,
        verified: true,
      },
      {
        name: 'Diljit Dosanjh',
        slug: 'diljit-dosanjh',
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        bio: 'Diljit Dosanjh is one of the most prominent artists in Punjabi music, known for his energetic performances and diverse discography.',
        instagram_handle: null,
        verified: true,
      },
      {
        name: 'Shubh',
        slug: 'shubh',
        image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400',
        bio: 'Shubh is a rising Punjabi artist known for melodic trap beats blended with emotional Punjabi lyrics.',
        instagram_handle: null,
        verified: true,
      },
    ];

    const artistIds = {};
    for (const artist of artists) {
      const res = await client.query(
        `INSERT INTO artists (name, slug, image_url, bio, instagram_handle, verified)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO UPDATE SET name=$1
         RETURNING id`,
        [artist.name, artist.slug, artist.image_url, artist.bio, artist.instagram_handle, artist.verified]
      );
      artistIds[artist.slug] = res.rows[0].id;
    }
    console.log('✅ Artists inserted');

    // Insert songs
    const songs = [
      {
        artist_slug: 'karan-aujla',
        title: 'Tauba Tauba',
        slug: 'tauba-tauba',
        release_year: 2024,
        album: 'Making Memories',
        featured: true,
        spotify_url: 'https://open.spotify.com',
        youtube_url: 'https://youtube.com',
        lyrics: [
          { punjabi: 'ਤੌਬਾ ਤੌਬਾ, ਤੌਬਾ ਤੌਬਾ', english: 'Oh lord, oh lord (an expression of being overwhelmed by beauty)', order: 1 },
          { punjabi: 'ਤੇਰੀ ਅੱਖ ਨੇ ਕੀ ਕੀਤਾ ਮੈਨੂੰ', english: 'What has your eye done to me', order: 2 },
          { punjabi: 'ਇਹ ਹੁਸਨ ਜੋ ਤੇਰਾ, ਅਫ਼ਸਾਨਾ ਬਣਿਆ', english: 'This beauty of yours has become a legend', order: 3 },
          { punjabi: 'ਦਿਲ ਮੇਰਾ ਦੀਵਾਨਾ ਬਣਿਆ', english: 'My heart has become like a madman', order: 4 },
        ],
      },
      {
        artist_slug: 'ap-dhillon',
        title: 'With You',
        slug: 'with-you-ap-dhillon',
        release_year: 2021,
        album: 'Hidden Gems',
        featured: true,
        spotify_url: 'https://open.spotify.com',
        youtube_url: 'https://youtube.com',
        lyrics: [
          { punjabi: 'ਮੈਂ ਤੇਰੇ ਨਾਲ ਰਹਿਣਾ ਚਾਹੁੰਦਾ', english: 'I want to stay with you', order: 1 },
          { punjabi: 'ਹਰ ਪਲ ਤੈਨੂੰ ਦੇਖਣਾ ਚਾਹੁੰਦਾ', english: 'I want to see you every moment', order: 2 },
          { punjabi: 'ਤੂੰ ਮੇਰੀ ਜ਼ਿੰਦਗੀ ਦਾ ਨੂਰ ਹੈਂ', english: 'You are the light of my life', order: 3 },
          { punjabi: 'ਦੂਰ ਨਾ ਜਾਵੀਂ ਕਦੇ ਯਾਰ', english: 'Never go far from me, my love', order: 4 },
        ],
      },
      {
        artist_slug: 'diljit-dosanjh',
        title: 'G.O.A.T.',
        slug: 'goat-diljit',
        release_year: 2020,
        album: 'G.O.A.T.',
        featured: true,
        spotify_url: 'https://open.spotify.com',
        youtube_url: 'https://youtube.com',
        lyrics: [
          { punjabi: 'ਗ੍ਰੇਟੇਸਟ ਆਫ਼ ਆਲ ਟਾਈਮ', english: 'Greatest of All Time — Diljit claims his legendary status', order: 1 },
          { punjabi: 'ਖ਼ੂਨ ਵਿੱਚ ਸ਼ਾਹੀ ਮੇਰੇ', english: 'Royalty runs in my blood', order: 2 },
          { punjabi: 'ਨਾ ਕੋਈ ਤੋੜ ਸਕਦਾ ਮੈਨੂੰ', english: 'No one can break me', order: 3 },
          { punjabi: 'ਮੈਂ ਸ਼ੇਰ ਪੰਜਾਬ ਦਾ', english: 'I am the lion of Punjab', order: 4 },
        ],
      },
      {
        artist_slug: 'shubh',
        title: 'Cheques',
        slug: 'cheques-shubh',
        release_year: 2021,
        album: 'Single',
        featured: false,
        spotify_url: 'https://open.spotify.com',
        youtube_url: 'https://youtube.com',
        lyrics: [
          { punjabi: 'ਚੈੱਕ ਕੱਟਦੇ ਆਂ, ਤੂੰ ਲੈ ਜਾ', english: 'We write cheques (we earn big), you take them', order: 1 },
          { punjabi: 'ਪੈਸਾ ਹੀ ਗੱਲ ਕਰਦਾ ਏਥੇ', english: 'Only money talks here', order: 2 },
          { punjabi: 'ਯਾਰਾਂ ਨੂੰ ਰੱਖਾਂ ਖ਼ੁਸ਼', english: 'I keep my friends happy', order: 3 },
          { punjabi: 'ਦੁਸ਼ਮਣਾਂ ਨੂੰ ਦੱਸ ਦਿੱਤਾ', english: 'I have already answered my enemies through actions', order: 4 },
        ],
      },
    ];

    for (const song of songs) {
      const artistId = artistIds[song.artist_slug];
      const songRes = await client.query(
        `INSERT INTO songs (artist_id, title, slug, release_year, album, featured, spotify_url, youtube_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (slug) DO UPDATE SET title=$2
         RETURNING id`,
        [artistId, song.title, song.slug, song.release_year, song.album, song.featured, song.spotify_url, song.youtube_url]
      );
      const songId = songRes.rows[0].id;
      for (const l of song.lyrics) {
        await client.query(
          `INSERT INTO lyrics (song_id, punjabi_text, english_meaning, line_order)
           VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
          [songId, l.punjabi, l.english, l.order]
        );
      }
    }

    console.log('✅ Songs and lyrics inserted');
    console.log('\n🎉 Database seeded! You can now start the server.');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
