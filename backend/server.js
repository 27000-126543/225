import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes from './routes/auth.js';
import excavationRoutes from './routes/excavation.js';
import workshopRoutes from './routes/workshop.js';
import museumRoutes from './routes/museum.js';
import marketRoutes from './routes/market.js';
import competitionRoutes from './routes/competition.js';
import guildRoutes from './routes/guild.js';
import warRoutes from './routes/war.js';
import leaderboardRoutes from './routes/leaderboard.js';
import announcementRoutes from './routes/announcements.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/excavation', excavationRoutes);
app.use('/api/workshop', workshopRoutes);
app.use('/api/museum', museumRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/competition', competitionRoutes);
app.use('/api/guild', guildRoutes);
app.use('/api/war', warRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/announcements', announcementRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Magic Archaeology API is running' });
});

const frontendDist = join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(join(frontendDist, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
});
