// src/components/Navbar.jsx
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  async function handleSearch(e) {
    const val = e.target.value;
    setSearch(val);
    if (!val.trim()) { setResults(null); return; }
    setSearching(true);
    try {
      const data = await apiFetch(`/songs/search?q=${encodeURIComponent(val)}`);
      setResults(data);
    } catch {}
    setSearching(false);
  }

  function closeSearch() { setSearch(''); setResults(null); }

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>≈ Punjabi Lyrics</Link>

        <div style={styles.searchWrap}>
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search songs, artists..."
            style={styles.searchInput}
          />
          {results && (
            <div style={styles.dropdown}>
              {results.artists?.map(a => (
                <Link
                  key={a.id}
                  to={`/artists/${a.slug}`}
                  style={styles.dropItem}
                  onClick={closeSearch}
                >
                  <span style={styles.dropLabel}>Artist</span>
                  <span>{a.name}</span>
                </Link>
              ))}
              {results.songs?.map(s => (
                <Link
                  key={s.id}
                  to={`/songs/${s.slug}`}
                  style={styles.dropItem}
                  onClick={closeSearch}
                >
                  <span style={styles.dropLabel}>Song</span>
                  <span>{s.title} — {s.artist_name}</span>
                </Link>
              ))}
              {!results.artists?.length && !results.songs?.length && (
                <div style={{ padding: '12px 16px', color: '#888' }}>No results</div>
              )}
            </div>
          )}
        </div>

        <div style={styles.links}>
  <Link to="/artists" style={styles.link}>Artists</Link>
  <Link to="/songs" style={styles.link}>Songs</Link>
  {user ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ color: '#888899', fontSize: 13 }}>Hi, {user.name}</span>
      <button
        onClick={logout}
        style={styles.logoutBtn}
      >
        Logout
      </button>
    </div>
  ) : (
    <Link to="/login" style={styles.igBtn}>Login</Link>
  )}
</div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(10,10,15,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #2a2a3a',
  },
  inner: {
    display: 'flex', alignItems: 'center',
    gap: 24, height: 64,
  },
  logo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22, fontWeight: 700,
    color: '#c084fc', whiteSpace: 'nowrap',
  },
  searchWrap: { position: 'relative', flex: 1, maxWidth: 400 },
  searchInput: {
    width: '100%', padding: '8px 14px',
    background: '#1a1a24', border: '1px solid #2a2a3a',
    borderRadius: 8, color: '#f0f0f8', fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  dropdown: {
    position: 'absolute', top: '110%', left: 0, right: 0,
    background: '#1a1a24', border: '1px solid #2a2a3a',
    borderRadius: 8, overflow: 'hidden', zIndex: 200,
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
  },
  dropItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', fontSize: 14,
    color: '#f0f0f8',
    borderBottom: '1px solid #2a2a3a',
    transition: 'background 0.15s',
  },
  dropLabel: {
    padding: '2px 8px', background: 'rgba(192,132,252,0.15)',
    color: '#c084fc', borderRadius: 4, fontSize: 11,
    fontWeight: 600, textTransform: 'uppercase',
  },
  links: { display: 'flex', alignItems: 'center', gap: 20 },
  link: { color: '#888899', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' },
  igBtn: {
    padding: '6px 14px', border: '1px solid #c084fc',
    borderRadius: 20, color: '#c084fc', fontSize: 13, fontWeight: 600,
    transition: 'background 0.2s',
  },
  logoutBtn: {
  padding: '6px 14px', border: '1px solid #2a2a3a',
  borderRadius: 20, color: '#888899', fontSize: 13,
  cursor: 'pointer', background: 'none',
},
};
