// src/pages/Songs.jsx
import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import SongCard from '../components/SongCard';

export default function Songs() {
  const [data, setData] = useState({ songs: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/songs?page=${page}&limit=12`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="container section">
      <h1 style={styles.title}>All Songs</h1>
      <p style={styles.sub}>{data.total} songs with Punjabi lyrics & English meanings</p>

      {loading
        ? <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
        : (
          <>
            <div style={grid}>
              {data.songs.map(s => <SongCard key={s.id} song={s} />)}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div style={styles.pagination}>
                {Array.from({ length: data.pages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    style={{ ...styles.pageBtn, ...(page === i + 1 ? styles.pageBtnActive : {}) }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )
      }
    </div>
  );
}

const styles = {
  title: { fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, marginBottom: 8 },
  sub: { color: '#888899', marginBottom: 40 },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 48 },
  pageBtn: {
    width: 40, height: 40, border: '1px solid #2a2a3a',
    borderRadius: 8, color: '#888', fontSize: 14, background: 'none', cursor: 'pointer',
  },
  pageBtnActive: { borderColor: '#c084fc', color: '#c084fc', background: 'rgba(192,132,252,0.1)' },
};
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 20,
};
