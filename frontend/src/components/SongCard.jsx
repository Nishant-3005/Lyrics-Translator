// src/components/SongCard.jsx
import { Link } from 'react-router-dom';

export default function SongCard({ song }) {
  return (
    <Link to={`/songs/${song.slug}`} className="card" style={styles.card}>
      <div style={styles.cover}>
        {song.cover_image_url
          ? <img src={song.cover_image_url} alt={song.title} style={styles.img} />
          : <div style={styles.placeholder}>♪</div>
        }
        {song.featured && (
          <span className="badge" style={styles.featuredBadge}>Featured</span>
        )}
      </div>
      <div style={styles.info}>
        <h3 style={styles.title}>{song.title}</h3>
        <p style={styles.artist}>
          {song.artist_name}
          {song.artist_verified && <span style={styles.verified}>✓</span>}
        </p>
        <div style={styles.meta}>
          {song.release_year && <span>{song.release_year}</span>}
          <span>♡ {song.like_count || 0}</span>
          <span>👁 {song.view_count || 0}</span>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    display: 'block', overflow: 'hidden',
    textDecoration: 'none',
  },
  cover: {
    position: 'relative',
    aspectRatio: '1 / 1',
    overflow: 'hidden',
    background: '#1a1a24',
  },
  img: {
    width: '100%', height: '100%', objectFit: 'cover',
    transition: 'transform 0.3s',
  },
  placeholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 48, color: '#555566',
    background: 'linear-gradient(135deg, #1a1a24, #2a1a3a)',
  },
  featuredBadge: {
    position: 'absolute', top: 10, left: 10,
    background: 'rgba(192,132,252,0.9)',
    color: '#0a0a0f',
  },
  info: { padding: '14px 16px' },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 17, fontWeight: 700,
    color: '#f0f0f8', marginBottom: 4,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  artist: {
    fontSize: 13, color: '#888899', marginBottom: 8,
    display: 'flex', alignItems: 'center', gap: 4,
  },
  verified: {
    color: '#c084fc', fontSize: 11,
    background: 'rgba(192,132,252,0.1)',
    padding: '1px 5px', borderRadius: 10,
  },
  meta: {
    display: 'flex', gap: 12,
    fontSize: 12, color: '#555566',
  },
};
