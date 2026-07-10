// src/components/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.inner}>
        <div>
          <div style={styles.logo}>≈ punjabi</div>
          <p style={styles.tagline}>Aesthetic Punjabi lyrics with English meanings.</p>
        </div>
        <div style={styles.links}>
          <Link to="/songs" style={styles.link}>Songs</Link>
          <Link to="/artists" style={styles.link}>Artists</Link>
          <Link to="/admin" style={{ ...styles.link, color: '#444' }}>Admin</Link>
        </div>
      </div>
      <div className="container" style={styles.bottom}>
        <span>© 2026 Almost Punjabi. Built for you</span>
      </div>
    </footer>
  );
}

const styles = {
  footer: { borderTop: '1px solid #2a2a3a', marginTop: 80, paddingTop: 48 },
  inner: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 24 },
  logo: { fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#c084fc', marginBottom: 8 },
  tagline: { color: '#555566', fontSize: 14 },
  links: { display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' },
  link: { color: '#888899', fontSize: 14, transition: 'color 0.2s' },
  bottom: { borderTop: '1px solid #2a2a3a', padding: '20px 24px', color: '#444', fontSize: 12 },
};
