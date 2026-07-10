// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>≈ Punjabi Lyrics</h1>
        <p style={styles.sub}>Login to access lyrics and meanings</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            style={styles.input}
            required
          />
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            style={styles.input}
            required
          />
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: '#0a0a0f',
  },
  card: {
    background: '#111118', border: '1px solid #2a2a3a',
    borderRadius: 16, padding: '40px 40px 32px', width: 380,
  },
  logo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28, color: '#c084fc',
    textAlign: 'center', marginBottom: 8,
  },
  sub: { color: '#888899', fontSize: 14, textAlign: 'center', marginBottom: 28 },
  error: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444', padding: '10px 14px',
    borderRadius: 8, marginBottom: 16, fontSize: 13,
  },
  label: {
    display: 'block', fontSize: 12, color: '#888',
    marginBottom: 6, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    display: 'block', width: '100%', padding: '10px 14px',
    marginBottom: 16, background: '#1a1a24',
    border: '1px solid #2a2a3a', borderRadius: 8,
    color: '#f0f0f8', fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    display: 'block', width: '100%', padding: 12,
    background: 'linear-gradient(135deg, #c084fc, #a855f7)',
    color: '#fff', borderRadius: 8, fontWeight: 600,
    fontSize: 15, cursor: 'pointer', border: 'none', marginTop: 4,
  },
  switchText: { color: '#888899', fontSize: 13, textAlign: 'center', marginTop: 24 },
  link: { color: '#c084fc', fontWeight: 600 },
};