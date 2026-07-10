# Almost Punjabi — Lyrics & Meanings Platform

A full-stack web app for Punjabi lyrics with English meanings. Built for portfolio.

**Stack:** React + Vite (frontend) · Node.js + Express (backend) · PostgreSQL (database)

---

## 📁 Project Structure

```
punjabi-lyrics/
├── backend/
│   ├── db/
│   │   ├── pool.js        ← DB connection
│   │   ├── setup.js       ← Creates all tables
│   │   └── seed.js        ← Adds sample data
│   ├── middleware/
│   │   └── auth.js        ← JWT auth guard
│   ├── routes/
│   │   ├── artists.js     ← CRUD for artists
│   │   ├── songs.js       ← CRUD for songs + lyrics + likes
│   │   └── auth.js        ← Admin login
│   ├── server.js          ← Express app entry
│   ├── .env.example       ← Copy to .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx  ← Search + navigation
    │   │   ├── Footer.jsx
    │   │   └── SongCard.jsx
    │   ├── pages/
    │   │   ├── Home.jsx        ← Featured songs + artists
    │   │   ├── Songs.jsx       ← All songs with pagination
    │   │   ├── SongDetail.jsx  ← Lyrics with click-to-reveal meanings
    │   │   ├── Artists.jsx     ← Artist list
    │   │   ├── ArtistDetail.jsx
    │   │   └── Admin.jsx       ← CMS: add/delete songs & artists
    │   ├── utils/api.js    ← Fetch helper + session ID
    │   ├── App.jsx         ← Routes
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

---

## 🚀 Setup Guide (Step by Step)

### Step 1 — Install Prerequisites

Make sure you have:
- **Node.js** v18+ → https://nodejs.org
- **PostgreSQL** v14+ → https://postgresql.org/download

### Step 2 — Clone / Download Project

```bash
# If using git
git init punjabi-lyrics
cd punjabi-lyrics
# Then copy the backend/ and frontend/ folders in
```

### Step 3 — Set Up the Database

Open **pgAdmin** or **psql** and create a new database:

```sql
CREATE DATABASE punjabi_lyrics;
```

Or via terminal:
```bash
psql -U postgres -c "CREATE DATABASE punjabi_lyrics;"
```

### Step 4 — Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/punjabi_lyrics
JWT_SECRET=some_random_long_string_change_this
PORT=5000
ADMIN_EMAIL=admin@youremail.com
ADMIN_PASSWORD=your_admin_password
```

### Step 5 — Install Backend Dependencies & Set Up DB

```bash
cd backend
npm install

# Create all database tables
node db/setup.js

# Add sample artists, songs & lyrics
node db/seed.js
```

You should see:
```
✅ Tables created successfully!
✅ Admin created
✅ Artists inserted
✅ Songs and lyrics inserted
🎉 Database seeded!
```

### Step 6 — Start the Backend

```bash
npm run dev
# Server running at http://localhost:5000
```

Test it:
```bash
curl http://localhost:5000/api/health
# {"status":"ok"}

curl http://localhost:5000/api/artists
# Returns list of artists
```

### Step 7 — Set Up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Open your browser at **http://localhost:5173** — you should see the homepage!

---

## 🔑 Admin Panel

Go to **http://localhost:5173/admin**

Login with the email/password you set in `.env`.

From the admin panel you can:
- ✅ View all songs
- ✅ Add new songs with lyrics line by line (Punjabi + English)
- ✅ Add new artists
- ✅ Mark songs as featured (they appear on homepage)
- ✅ Delete songs

---

## 🗄️ Database Schema

```
admins          → id, email, password_hash
artists         → id, name, slug, image_url, bio, instagram_handle, verified
songs           → id, artist_id, title, slug, cover_image_url, release_year, 
                  album, spotify_url, youtube_url, featured, view_count
lyrics          → id, song_id, punjabi_text, english_meaning, line_order
likes           → id, song_id, session_id (unique per user session)

VIEW: songs_with_artists → joins songs + artists + like count
```

---

## 🌐 API Endpoints

### Public
```
GET  /api/artists                → All artists
GET  /api/artists/:slug          → Artist + their songs
GET  /api/songs                  → All songs (paginated)
GET  /api/songs/featured         → Featured songs for homepage
GET  /api/songs/search?q=...     → Search songs & artists
GET  /api/songs/:slug            → Song detail + lyrics (increments view count)
POST /api/songs/:id/like         → Like a song
DEL  /api/songs/:id/like         → Unlike a song
```

### Admin (requires JWT token)
```
POST /api/auth/login             → Returns JWT token
POST /api/artists                → Create artist
PUT  /api/artists/:id            → Update artist
DEL  /api/artists/:id            → Delete artist
POST /api/songs                  → Create song + lyrics
PUT  /api/songs/:id              → Update song + lyrics
DEL  /api/songs/:id              → Delete song
```

---

## 🚢 Deployment

### Option A: Railway.app (easiest, free tier)
1. Push code to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add a PostgreSQL service
4. Set environment variables in Railway dashboard
5. Railway auto-detects Node.js and deploys

### Option B: Render.com
1. Push to GitHub
2. Create a "Web Service" for backend, point to `backend/`
3. Add a PostgreSQL database
4. Create a "Static Site" for frontend (build: `npm run build`, publish: `dist/`)
5. Set `VITE_API_URL` in frontend env

### Option C: VPS (DigitalOcean / Hostinger)
```bash
# On server
git clone your-repo
cd backend && npm install && node db/setup.js
pm2 start server.js

cd ../frontend && npm install && npm run build
# Serve dist/ with nginx
```

---

## ✨ Features Summary

| Feature | Description |
|---------|-------------|
| 🎨 Dark aesthetic UI | Deep purple + gold palette, Playfair Display serif |
| 🔍 Live search | Search songs & artists in navbar |
| 🖱️ Click-to-reveal | Click any lyric line to show its English meaning |
| ♡ Likes | Session-based song likes (no login needed) |
| 👁️ View counts | Auto-increments when a song is opened |
| 📱 Responsive | Works on mobile |
| 🔐 Admin CMS | Add/edit/delete songs and artists with JWT auth |
| 📄 Pagination | Songs list is paginated |

---

## 🛠️ Tech Stack (for CV)

- **Frontend:** React 18, React Router v6, Vite, CSS-in-JS (inline styles)
- **Backend:** Node.js, Express.js, JWT authentication, bcrypt
- **Database:** PostgreSQL with views, indexes, and full-text search
- **Architecture:** REST API with proper CRUD, session-based likes, role-based auth
