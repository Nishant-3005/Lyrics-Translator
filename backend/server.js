// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import usersRouter from './routes/users.js';
import artistsRouter from './routes/artists.js';
import songsRouter from './routes/songs.js';
import authRouter from './routes/auth.js';
import aiRouter from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://almostpunjabi.in']
    : ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/artists', artistsRouter);
app.use('/api/songs', songsRouter);
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);
app.use('/api/users', usersRouter);
// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`   DB: ${process.env.DATABASE_URL?.split('@')[1] || 'not connected'}`);
});
