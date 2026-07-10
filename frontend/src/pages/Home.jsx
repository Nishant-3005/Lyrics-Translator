// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import SongCard from '../components/SongCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch('/songs/featured'), apiFetch('/artists')])
      .then(([songs, arts]) => { setFeatured(songs); setArtists(arts); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={heroStyles.section}>
        <div className="container">
          <div style={heroStyles.eyebrow}>≈ almost punjabi</div>
          <h1 style={heroStyles.headline}>
            Feel every word.<br />
            <em style={heroStyles.sub}>Punjabi lyrics, decoded.</em>
          </h1>
          <p style={heroStyles.body}>
            Aesthetic Punjabi lyrics with English meanings — for the desi soul
            who lives between two worlds.
          </p>
          <div style={heroStyles.actions}>
            <Link to="/songs" style={heroStyles.btnPrimary}>Browse Lyrics</Link>
            <Link to="/artists" style={heroStyles.btnSecondary}>Top Artists</Link>
          </div>
          <div style={heroStyles.stat}>
            <span>🎵 {featured.length > 0 ? '100+' : '—'} Songs</span>
            <span>🎤 {artists.length || '—'} Artists</span>
            <span>🌍 English Meanings</span>
          </div>
        </div>
      </section>

      {/* Featured Songs */}
      <section className="section">
        <div className="container">
          <div style={sectionHead}>
            <h2 style={secTitle}>Featured Tracks</h2>
            <Link to="/songs" style={seeAll}>See all →</Link>
          </div>
          {loading
            ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
            : (
              <div style={grid}>
                {featured.map(s => <SongCard key={s.id} song={s} />)}
                {!featured.length && (
                  <p style={{ color: '#888', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
                    No songs yet. Add some via the admin panel!
                  </p>
                )}
              </div>
            )
          }
        </div>
      </section>

      {/* Artists */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={sectionHead}>
            <h2 style={secTitle}>Browse Artists</h2>
            <Link to="/artists" style={seeAll}>See all →</Link>
          </div>
          <div style={artistGrid}>
            {artists.slice(0, 6).map(a => (
              <Link to={`/artists/${a.slug}`} key={a.id} className="card" style={artistCard}>
                <div style={artistImgWrap}>
                  {a.image_url
                    ? <img src={a.image_url} alt={a.name} style={artistImg} />
                    : <div style={artistPlaceholder}>🎤</div>
                  }
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={artistName}>
                    {a.name}
                    {a.verified && <span style={verifiedBadge}>✓</span>}
                  </div>
                  <div style={artistMeta}>{a.song_count || 0} songs</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const heroStyles = {
  section: {
    padding: '120px 0 80px',
    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(192,132,252,0.08) 0%, transparent 70%)',
    borderBottom: '1px solid #2a2a3a',
  },
  eyebrow: { color: '#c084fc', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 },
  headline: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(42px, 6vw, 80px)',
    fontWeight: 700, lineHeight: 1.1,
    color: '#f0f0f8', marginBottom: 24,
  },
  sub: { color: '#c084fc', fontStyle: 'italic' },
  body: { fontSize: 18, color: '#888899', maxWidth: 520, marginBottom: 40, lineHeight: 1.7 },
  actions: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 },
  btnPrimary: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #c084fc, #a855f7)',
    color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 15,
    boxShadow: '0 4px 20px rgba(192,132,252,0.3)',
    transition: 'transform 0.2s',
  },
  btnSecondary: {
    padding: '14px 32px',
    border: '1px solid #2a2a3a',
    color: '#f0f0f8', borderRadius: 8, fontWeight: 600, fontSize: 15,
    transition: 'border-color 0.2s',
  },
  stat: {
    display: 'flex', gap: 32, fontSize: 13, color: '#555566',
  },
};

const sectionHead = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 };
const secTitle = { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 };
const seeAll = { color: '#c084fc', fontSize: 14, fontWeight: 500 };
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 20,
};
const artistGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: 16,
};
const artistCard = { textDecoration: 'none', overflow: 'hidden' };
const artistImgWrap = { aspectRatio: '1/1', overflow: 'hidden', background: '#1a1a24' };
const artistImg = { width: '100%', height: '100%', objectFit: 'cover' };
const artistPlaceholder = {
  width: '100%', height: '100%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 40, background: 'linear-gradient(135deg, #1a1a24, #2a1a3a)',
};
const artistName = {
  fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6,
};
const verifiedBadge = {
  color: '#c084fc', fontSize: 10,
  background: 'rgba(192,132,252,0.1)', padding: '1px 5px', borderRadius: 10,
};
const artistMeta = { fontSize: 12, color: '#555566', marginTop: 3 };
const ctaSection = {
  padding: '80px 0',
  background: 'linear-gradient(135deg, rgba(192,132,252,0.06), rgba(245,158,11,0.04))',
  borderTop: '1px solid #2a2a3a',
};
const ctaEyebrow = { color: '#c084fc', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 };
const ctaTitle = { fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, marginBottom: 12 };
const ctaBody = { color: '#888899', marginBottom: 32 };
const ctaBtn = {
  display: 'inline-block', padding: '14px 36px',
  background: 'linear-gradient(135deg, #c084fc, #f59e0b)',
  color: '#0a0a0f', borderRadius: 8, fontWeight: 700, fontSize: 15,
};
