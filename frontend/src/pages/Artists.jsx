// src/pages/Artists.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/artists').then(setArtists).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container section">
      <h1 style={styles.title}>Top Artists</h1>
      <p style={styles.sub}>Explore Punjabi music's biggest names</p>

      {loading
        ? <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
        : (
          <div style={grid}>
            {artists.map(a => (
              <Link to={`/artists/${a.slug}`} key={a.id} className="card" style={styles.card}>
                <div style={styles.imgWrap}>
                  {a.image_url
                    ? <img src={a.image_url} alt={a.name} style={styles.img} />
                    : <div style={styles.placeholder}>🎤</div>
                  }
                </div>
                <div style={styles.info}>
                  <div style={styles.name}>
                    {a.name}
                    {a.verified && <span style={styles.verified}>✓</span>}
                  </div>
                  <div style={styles.meta}>
                    <span>{a.genre || 'Punjabi'}</span>
                    <span>{a.song_count || 0} songs</span>
                  </div>
                  {a.bio && <p style={styles.bio}>{a.bio.slice(0, 80)}…</p>}
                </div>
              </Link>
            ))}
          </div>
        )
      }
    </div>
  );
}

const styles = {
  title: { fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, marginBottom: 8 },
  sub: { color: '#888899', marginBottom: 40 },
  card: { display: 'flex', alignItems: 'center', gap: 16, padding: 16, textDecoration: 'none' },
  imgWrap: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', flexShrink: 0, border: '1px solid #2a2a3a' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, background: '#1a1a24',
  },
  info: { minWidth: 0 },
  name: {
    fontWeight: 600, fontSize: 16, marginBottom: 4,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  verified: {
    color: '#c084fc', fontSize: 10,
    background: 'rgba(192,132,252,0.1)', padding: '1px 5px', borderRadius: 10,
  },
  meta: { fontSize: 12, color: '#555566', marginBottom: 6, display: 'flex', gap: 10 },
  bio: { fontSize: 13, color: '#888899', lineHeight: 1.5, margin: 0 },
};
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: 16,
};
