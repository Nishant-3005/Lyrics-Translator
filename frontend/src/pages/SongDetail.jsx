// src/pages/SongDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch, getSessionId } from '../utils/api';

export default function SongDetail() {
  const { slug } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showMeaning, setShowMeaning] = useState({});

  useEffect(() => {
    apiFetch(`/songs/${slug}`)
      .then(data => {
        setSong(data);
        setLikeCount(data.like_count || 0);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  async function toggleLike() {
    const session_id = getSessionId();
    if (liked) {
      const data = await apiFetch(`/songs/${song.id}/like`, {
        method: 'DELETE', body: JSON.stringify({ session_id }),
      });
      setLiked(false); setLikeCount(data.count);
    } else {
      const data = await apiFetch(`/songs/${song.id}/like`, {
        method: 'POST', body: JSON.stringify({ session_id }),
      });
      setLiked(true); setLikeCount(data.count);
    }
  }

  function toggleMeaning(id) {
    setShowMeaning(prev => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
      <div className="spinner" />
    </div>
  );
  if (error) return <div style={{ padding: 80, textAlign: 'center', color: '#888' }}>Song not found.</div>;

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.bcLink}>Home</Link>
        <span style={styles.bcSep}>/</span>
        <Link to={`/artists/${song.artist_slug}`} style={styles.bcLink}>{song.artist_name}</Link>
        <span style={styles.bcSep}>/</span>
        <span style={{ color: '#888' }}>{song.title}</span>
      </div>

      {/* Song Header */}
      <div style={styles.header}>
        <div style={styles.coverWrap}>
          {song.cover_image_url
            ? <img src={song.cover_image_url} alt={song.title} style={styles.cover} />
            : <div style={styles.coverPlaceholder}>♪</div>
          }
        </div>
        <div style={styles.info}>
          <div style={styles.eyebrow}>{song.album || 'Single'} • {song.release_year}</div>
          <h1 style={styles.title}>{song.title}</h1>
          <Link to={`/artists/${song.artist_slug}`} style={styles.artistLink}>
            {song.artist_name}
            {song.artist_verified && <span style={styles.verified}>✓</span>}
          </Link>

          <div style={styles.actions}>
            <button
              onClick={toggleLike}
              style={{ ...styles.likeBtn, ...(liked ? styles.likeBtnActive : {}) }}
            >
              {liked ? '♥' : '♡'} {likeCount}
            </button>
            {song.spotify_url && (
              <a href={song.spotify_url} target="_blank" rel="noreferrer" style={styles.platformBtn}>
                🎵 Spotify
              </a>
            )}
            {song.youtube_url && (
              <a href={song.youtube_url} target="_blank" rel="noreferrer" style={styles.platformBtn}>
                ▶ YouTube
              </a>
            )}
          </div>
          <p style={styles.hint}>Click any line to reveal its meaning ↓</p>
        </div>
      </div>

      {/* Lyrics */}
      <div style={styles.lyricsSection}>
        <h2 style={styles.lyricsHeading}>Lyrics & Meanings</h2>
        <div style={styles.lyricsList}>
          {song.lyrics?.map(line => (
            <div
              key={line.id}
              onClick={() => toggleMeaning(line.id)}
              style={styles.lyricBlock}
            >
              <p style={styles.punjabi}>{line.punjabi_text}</p>
              {showMeaning[line.id] && (
                <p className="fade-up" style={styles.meaning}>
                  {line.english_meaning}
                </p>
              )}
              <div style={styles.revealHint}>
                {showMeaning[line.id] ? '▲ hide meaning' : '▼ show meaning'}
              </div>
            </div>
          ))}
          {!song.lyrics?.length && (
            <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>
              Lyrics coming soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, fontSize: 13 },
  bcLink: { color: '#888899', transition: 'color 0.2s' },
  bcSep: { color: '#555566' },
  header: {
    display: 'grid', gridTemplateColumns: '240px 1fr', gap: 48, marginBottom: 60,
    alignItems: 'start',
  },
  coverWrap: { borderRadius: 16, overflow: 'hidden', aspectRatio: '1/1', background: '#1a1a24' },
  cover: { width: '100%', height: '100%', objectFit: 'cover' },
  coverPlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 72, color: '#555566',
    background: 'linear-gradient(135deg, #1a1a24, #2a1a3a)',
  },
  info: { paddingTop: 8 },
  eyebrow: { color: '#888899', fontSize: 13, marginBottom: 12, fontWeight: 500 },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(28px, 4vw, 52px)',
    fontWeight: 700, lineHeight: 1.15, marginBottom: 12,
  },
  artistLink: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    color: '#c084fc', fontSize: 16, fontWeight: 600, marginBottom: 28,
  },
  verified: {
    fontSize: 11, background: 'rgba(192,132,252,0.15)',
    padding: '2px 6px', borderRadius: 10,
  },
  actions: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 },
  likeBtn: {
    padding: '10px 20px', border: '1px solid #2a2a3a',
    borderRadius: 8, color: '#888899', fontWeight: 600, fontSize: 15,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  likeBtnActive: {
    borderColor: '#c084fc', color: '#c084fc',
    background: 'rgba(192,132,252,0.1)',
  },
  platformBtn: {
    padding: '10px 20px', border: '1px solid #2a2a3a',
    borderRadius: 8, color: '#888', fontWeight: 500, fontSize: 14,
    transition: 'border-color 0.2s',
  },
  hint: { color: '#555566', fontSize: 13, fontStyle: 'italic' },
  lyricsSection: { maxWidth: 700 },
  lyricsHeading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24, marginBottom: 24,
    color: '#c084fc',
  },
  lyricsList: { display: 'flex', flexDirection: 'column', gap: 4 },
  lyricBlock: {
    padding: '20px 24px',
    background: '#111118', border: '1px solid #2a2a3a',
    borderRadius: 10, cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
  },
  punjabi: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 20, fontWeight: 400,
    lineHeight: 1.7, color: '#f0f0f8',
  },
  meaning: {
    marginTop: 12, padding: '12px 16px',
    background: 'rgba(192,132,252,0.07)',
    borderLeft: '2px solid #c084fc',
    borderRadius: '0 8px 8px 0',
    color: '#888899', fontSize: 15, lineHeight: 1.6,
    fontStyle: 'italic',
  },
  revealHint: {
    marginTop: 10, color: '#555566', fontSize: 11,
    textTransform: 'uppercase', letterSpacing: 1,
  },
};
