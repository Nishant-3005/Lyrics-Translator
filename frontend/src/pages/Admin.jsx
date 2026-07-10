// src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import { apiFetch, slugify } from '../utils/api';

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState('songs');

  // Songs
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [songForm, setSongForm] = useState({
    artist_id: '', title: '', slug: '', cover_image_url: '',
    release_year: '', album: '', spotify_url: '', youtube_url: '',
    featured: false, lyrics: [{ punjabi_text: '', english_meaning: '', line_order: 1 }],
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [editingSong, setEditingSong] = useState(null);

  // Artists
  const [artistForm, setArtistForm] = useState({
    name: '', slug: '', image_url: '', bio: '', instagram_handle: '', genre: 'Punjabi',
  });

  async function login(e) {
    e.preventDefault();
    setLoginError('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST', body: JSON.stringify(loginForm),
      });
      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
    } catch (err) {
      setLoginError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem('admin_token');
    setToken(null);
  }

  useEffect(() => {
    if (!token) return;
    setLoadingSongs(true);
    Promise.all([apiFetch('/songs?limit=50'), apiFetch('/artists')])
      .then(([s, a]) => { setSongs(s.songs); setArtists(a); })
      .finally(() => setLoadingSongs(false));
  }, [token]);

async function generateLyricsWithAI() {
    if (!songForm.title || !songForm.artist_id) {
      setAiMessage('Please fill in the Song Title and select an Artist first.');
      return;
    }
    const artist = artists.find(a => a.id === parseInt(songForm.artist_id));
    if (!artist) {
      setAiMessage('Please select an artist first.');
      return;
    }
    setAiLoading(true);
    setAiMessage('');
    try {
      const data = await apiFetch('/ai/generate-lyrics', {
        method: 'POST',
        body: JSON.stringify({
          song_title: songForm.title,
          artist_name: artist.name,
        }),
      });
      if (data.found) {
        setSongForm(prev => ({ ...prev, lyrics: data.lyrics }));
        setAiMessage(`✅ ${data.message}`);
      } else {
        setAiMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setAiMessage('❌ Error: ' + err.message);
    }
    setAiLoading(false);
  }

  async function saveSong(e) {
    e.preventDefault();
    const payload = { ...songForm, release_year: Number(songForm.release_year) };
    try {
      if (editingSong) {
        await apiFetch(`/songs/${editingSong}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/songs', { method: 'POST', body: JSON.stringify(payload) });
      }
      alert('Saved!');
      setEditingSong(null);
      setSongForm({ artist_id: '', title: '', slug: '', cover_image_url: '', release_year: '', album: '', spotify_url: '', youtube_url: '', featured: false, lyrics: [{ punjabi_text: '', english_meaning: '', line_order: 1 }] });
      const s = await apiFetch('/songs?limit=50');
      setSongs(s.songs);
    } catch (err) { alert(err.message); }
  }

  async function deleteSong(id) {
    if (!confirm('Delete this song?')) return;
    await apiFetch(`/songs/${id}`, { method: 'DELETE' });
    setSongs(songs.filter(s => s.id !== id));
  }

  async function saveArtist(e) {
    e.preventDefault();
    try {
      await apiFetch('/artists', { method: 'POST', body: JSON.stringify(artistForm) });
      alert('Artist created!');
      const a = await apiFetch('/artists');
      setArtists(a);
    } catch (err) { alert(err.message); }
  }

  function addLyricLine() {
    setSongForm(prev => ({
      ...prev,
      lyrics: [...prev.lyrics, { punjabi_text: '', english_meaning: '', line_order: prev.lyrics.length + 1 }],
    }));
  }

  function updateLyric(idx, field, value) {
    setSongForm(prev => ({
      ...prev,
      lyrics: prev.lyrics.map((l, i) => i === idx ? { ...l, [field]: value } : l),
    }));
  }

  // Login screen
  if (!token) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={styles.loginCard}>
        <h1 style={styles.loginTitle}>≈ Admin</h1>
        <p style={{ color: '#888', marginBottom: 28, textAlign: 'center' }}>Almost Punjabi CMS</p>
        {loginError && <div style={styles.error}>{loginError}</div>}
        <form onSubmit={login}>
          <input
            type="email" placeholder="Email" required
            value={loginForm.email}
            onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
            style={styles.input}
          />
          <input
            type="password" placeholder="Password" required
            value={loginForm.password}
            onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
            style={styles.input}
          />
          <button type="submit" style={styles.btnPrimary}>Login</button>
        </form>
      </div>
    </div>
  );

  // Admin dashboard
  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={styles.adminBar}>
        <span style={styles.adminTitle}>≈ Admin Panel</span>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Tabs */}
        <div style={styles.tabs}>
          {['songs', 'add-song', 'add-artist'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
              {t === 'songs' ? '🎵 Songs' : t === 'add-song' ? '+ Add Song' : '+ Add Artist'}
            </button>
          ))}
        </div>

        {/* Songs list */}
        {tab === 'songs' && (
          <div>
            <h2 style={styles.sectionTitle}>All Songs</h2>
            {loadingSongs
              ? <div className="spinner" />
              : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Title', 'Artist', 'Year', 'Featured', 'Views', 'Actions'].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {songs.map(s => (
                      <tr key={s.id} style={styles.tr}>
                        <td style={styles.td}>{s.title}</td>
                        <td style={styles.td}>{s.artist_name}</td>
                        <td style={styles.td}>{s.release_year}</td>
                        <td style={styles.td}>{s.featured ? '✅' : '—'}</td>
                        <td style={styles.td}>{s.view_count}</td>
                        <td style={styles.td}>
                          <button onClick={() => deleteSong(s.id)} style={styles.deleteBtn}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>
        )}

        {/* Add Song */}
        {tab === 'add-song' && (
          <div style={{ maxWidth: 720 }}>
            <h2 style={styles.sectionTitle}>Add New Song</h2>
            <form onSubmit={saveSong} style={styles.form}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Artist</label>
                  <select
                    value={songForm.artist_id}
                    onChange={e => setSongForm(p => ({ ...p, artist_id: e.target.value }))}
                    style={styles.select} required
                  >
                    <option value="">Select artist</option>
                    {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Title</label>
                  <input
                    value={songForm.title}
                    onChange={e => setSongForm(p => ({ ...p, title: e.target.value, slug: slugify(e.target.value) }))}
                    style={styles.input} required
                  />
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Slug (auto)</label>
                  <input value={songForm.slug} onChange={e => setSongForm(p => ({ ...p, slug: e.target.value }))} style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Year</label>
                  <input type="number" value={songForm.release_year} onChange={e => setSongForm(p => ({ ...p, release_year: e.target.value }))} style={styles.input} />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Album</label>
                <input value={songForm.album} onChange={e => setSongForm(p => ({ ...p, album: e.target.value }))} style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Cover Image URL</label>
                <input value={songForm.cover_image_url} onChange={e => setSongForm(p => ({ ...p, cover_image_url: e.target.value }))} style={styles.input} />
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Spotify URL</label>
                  <input value={songForm.spotify_url} onChange={e => setSongForm(p => ({ ...p, spotify_url: e.target.value }))} style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>YouTube URL</label>
                  <input value={songForm.youtube_url} onChange={e => setSongForm(p => ({ ...p, youtube_url: e.target.value }))} style={styles.input} />
                </div>
              </div>
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                <input type="checkbox" checked={songForm.featured} onChange={e => setSongForm(p => ({ ...p, featured: e.target.checked }))} />
                Featured song (shows on homepage)
              </label>

              {/* Lyrics */}
              <div style={styles.lyricsSection}>
              <h3 style={styles.lyricsTitle}>Lyrics Lines</h3>
             <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
             <button
    type="button"
    onClick={generateLyricsWithAI}
    disabled={aiLoading}
    style={{
      padding: '10px 20px',
      background: aiLoading ? '#333' : 'linear-gradient(135deg, #c084fc, #a855f7)',
      color: '#fff', borderRadius: 8, fontWeight: 600,
      fontSize: 14, cursor: aiLoading ? 'not-allowed' : 'pointer',
      border: 'none', textAlign: 'left',
    }}
  >
    {aiLoading ? '⏳ Searching and translating...' : '✨ Auto-generate lyrics with AI'}
  </button>
  {aiMessage && (
    <div style={{
      padding: '10px 14px',
      background: aiMessage.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${aiMessage.startsWith('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
      borderRadius: 8, fontSize: 13,
      color: aiMessage.startsWith('✅') ? '#86efac' : '#fca5a5',
    }}>
      {aiMessage}
    </div>
  )}
  <p style={{ fontSize: 12, color: '#555566', margin: 0 }}>
    Or add lyrics manually line by line below ↓
  </p>
</div>


                {songForm.lyrics.map((line, i) => (
                  <div key={i} style={styles.lyricRow}>
                    <span style={styles.lineNum}>{i + 1}</span>
                    <div style={{ flex: 1, display: 'flex', gap: 12 }}>
                      <textarea
                        placeholder="Punjabi text (ਪੰਜਾਬੀ)"
                        value={line.punjabi_text}
                        onChange={e => updateLyric(i, 'punjabi_text', e.target.value)}
                        style={{ ...styles.input, flex: 1, resize: 'vertical', minHeight: 52, fontFamily: 'inherit' }}
                      />
                      <textarea
                        placeholder="English meaning"
                        value={line.english_meaning}
                        onChange={e => updateLyric(i, 'english_meaning', e.target.value)}
                        style={{ ...styles.input, flex: 1, resize: 'vertical', minHeight: 52 }}
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addLyricLine} style={styles.addLineBtn}>
                  + Add Line
                </button>
              </div>

              <button type="submit" style={styles.btnPrimary}>Save Song</button>
            </form>
          </div>
        )}

        {/* Add Artist */}
        {tab === 'add-artist' && (
          <div style={{ maxWidth: 600 }}>
            <h2 style={styles.sectionTitle}>Add New Artist</h2>
            <form onSubmit={saveArtist} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Name</label>
                <input
                  value={artistForm.name}
                  onChange={e => setArtistForm(p => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))}
                  style={styles.input} required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Slug</label>
                <input value={artistForm.slug} onChange={e => setArtistForm(p => ({ ...p, slug: e.target.value }))} style={styles.input} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Image URL</label>
                <input value={artistForm.image_url} onChange={e => setArtistForm(p => ({ ...p, image_url: e.target.value }))} style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Instagram Handle</label>
                <input value={artistForm.instagram_handle} onChange={e => setArtistForm(p => ({ ...p, instagram_handle: e.target.value }))} style={styles.input} placeholder="without @" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Genre</label>
                <input value={artistForm.genre} onChange={e => setArtistForm(p => ({ ...p, genre: e.target.value }))} style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Bio</label>
                <textarea
                  value={artistForm.bio}
                  onChange={e => setArtistForm(p => ({ ...p, bio: e.target.value }))}
                  style={{ ...styles.input, minHeight: 100, resize: 'vertical' }}
                />
              </div>
              <button type="submit" style={styles.btnPrimary}>Create Artist</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  adminBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 24px', background: '#111118', borderBottom: '1px solid #2a2a3a',
  },
  adminTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#c084fc', fontWeight: 700 },
  logoutBtn: { color: '#888', fontSize: 13, cursor: 'pointer', background: 'none', border: 'none' },
  loginCard: {
    background: '#111118', border: '1px solid #2a2a3a',
    borderRadius: 16, padding: '40px 40px 32px', width: 360,
  },
  loginTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: 32,
    textAlign: 'center', color: '#c084fc', marginBottom: 4,
  },
  error: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13,
  },
  input: {
    display: 'block', width: '100%', padding: '10px 14px', marginBottom: 14,
    background: '#1a1a24', border: '1px solid #2a2a3a',
    borderRadius: 8, color: '#f0f0f8', fontSize: 14, outline: 'none',
    fontFamily: 'Inter, sans-serif',
  },
  select: {
    display: 'block', width: '100%', padding: '10px 14px', marginBottom: 14,
    background: '#1a1a24', border: '1px solid #2a2a3a',
    borderRadius: 8, color: '#f0f0f8', fontSize: 14, outline: 'none',
  },
  btnPrimary: {
    display: 'block', width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, #c084fc, #a855f7)',
    color: '#fff', borderRadius: 8, fontWeight: 600,
    fontSize: 15, cursor: 'pointer', border: 'none',
  },
  tabs: { display: 'flex', gap: 8, marginBottom: 32 },
  tab: {
    padding: '10px 20px', border: '1px solid #2a2a3a',
    borderRadius: 8, color: '#888', fontSize: 14, cursor: 'pointer', background: 'none',
  },
  tabActive: { borderColor: '#c084fc', color: '#c084fc', background: 'rgba(192,132,252,0.08)' },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 24 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 16px', textAlign: 'left', color: '#888', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #2a2a3a' },
  tr: { borderBottom: '1px solid #2a2a3a' },
  td: { padding: '12px 16px', fontSize: 14 },
  deleteBtn: { color: '#ef4444', cursor: 'pointer', background: 'none', border: 'none', fontSize: 13 },
  form: { display: 'flex', flexDirection: 'column' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { marginBottom: 4 },
  label: { display: 'block', fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  lyricsSection: { background: '#111118', border: '1px solid #2a2a3a', borderRadius: 12, padding: 20, marginBottom: 24 },
  lyricsTitle: { fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#c084fc' },
  lyricRow: { display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  lineNum: { width: 24, height: 24, background: '#2a2a3a', borderRadius: 12, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 12, color: '#888' },
  addLineBtn: { padding: '8px 16px', border: '1px dashed #2a2a3a', borderRadius: 8, color: '#888', fontSize: 13, cursor: 'pointer', background: 'none', marginBottom: 20 },
};
