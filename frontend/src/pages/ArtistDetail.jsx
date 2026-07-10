// src/pages/ArtistDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import SongCard from '../components/SongCard';

export default function ArtistDetail() {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/artists/${slug}`)
      .then(setArtist)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
      <div className="spinner" />
    </div>
  );
  if (!artist) return <div style={{ padding: 80, textAlign: 'center', color: '#888' }}>Artist not found.</div>;

  return (
    <div>
      {/* Artist Header */}
      <div style={styles.hero}>
        <div className="container" style={styles.heroInner}>
          <div style={styles.avatarWrap}>
            {artist.image_url
              ? <img src={artist.image_url} alt={artist.name} style={styles.avatar} />
              : <div style={styles.avatarPlaceholder}>🎤</div>
            }
          </div>
          <div>
            <div style={styles.genre}>{artist.genre || 'Punjabi'}</div>
            <h1 style={styles.name}>
              {artist.name}
              {artist.verified && <span style={styles.verified}>✓ Verified</span>}
            </h1>
            {artist.bio && <p style={styles.bio}>{artist.bio}</p>}
            <div style={styles.meta}>
              <span>🎵 {artist.songs?.length || 0} Songs</span>
              {artist.instagram_handle && (
                <a
                  href={`https://instagram.com/${artist.instagram_handle}`}
                  target="_blank" rel="noreferrer"
                  style={styles.igLink}
                >
                  @{artist.instagram_handle}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Songs */}
      <section className="section">
        <div className="container">
          <h2 style={styles.songsHeading}>Songs</h2>
          {artist.songs?.length
            ? (
              <div style={grid}>
                {artist.songs.map(s => (
                  <SongCard key={s.id} song={{ ...s, artist_name: artist.name, artist_verified: artist.verified, artist_slug: artist.slug }} />
                ))}
              </div>
            )
            : <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>No songs yet.</p>
          }
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    padding: '60px 0',
    background: 'radial-gradient(ellipse 80% 100% at 30% 50%, rgba(192,132,252,0.06), transparent)',
    borderBottom: '1px solid #2a2a3a',
  },
  heroInner: { display: 'flex', alignItems: 'flex-start', gap: 40 },
  avatarWrap: { width: 160, height: 160, borderRadius: 80, overflow: 'hidden', flexShrink: 0, border: '2px solid #c084fc' },
  avatar: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarPlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 60, background: '#1a1a24',
  },
  genre: { color: '#c084fc', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  name: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 44, fontWeight: 700, marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 14,
  },
  verified: {
    fontSize: 14, color: '#c084fc',
    background: 'rgba(192,132,252,0.1)',
    padding: '4px 12px', borderRadius: 20, fontFamily: 'Inter, sans-serif', fontWeight: 600,
  },
  bio: { color: '#888899', fontSize: 15, lineHeight: 1.7, maxWidth: 540, marginBottom: 20 },
  meta: { display: 'flex', alignItems: 'center', gap: 20, fontSize: 14, color: '#555566' },
  igLink: { color: '#c084fc', fontWeight: 500 },
  songsHeading: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 28 },
};
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 20,
};
