// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Songs from './pages/Songs';
import SongDetail from './pages/SongDetail';
import Artists from './pages/Artists';
import ArtistDetail from './pages/ArtistDetail';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main>
        <Routes>
          {/* Public routes - anyone can access */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes - must be logged in */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/songs" element={<ProtectedRoute><Songs /></ProtectedRoute>} />
          <Route path="/songs/:slug" element={<ProtectedRoute><SongDetail /></ProtectedRoute>} />
          <Route path="/artists" element={<ProtectedRoute><Artists /></ProtectedRoute>} />
          <Route path="/artists/:slug" element={<ProtectedRoute><ArtistDetail /></ProtectedRoute>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-login" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}