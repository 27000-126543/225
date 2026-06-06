import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { allQuery } from '../config/database.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const announcements = await allQuery(`
      SELECT * FROM announcements
      ORDER BY createdAt DESC
      LIMIT 30
    `);
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: '获取公告失败' });
  }
});

export default router;
