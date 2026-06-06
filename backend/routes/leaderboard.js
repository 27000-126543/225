import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { allQuery } from '../config/database.js';

const router = express.Router();

router.get('/museum', authMiddleware, async (req, res) => {
  try {
    const rows = await allQuery(`
      SELECT id, username, museumScore as score, level
      FROM users
      ORDER BY museumScore DESC
      LIMIT 100
    `);
    res.json(rows.map((r, i) => ({ ...r, rank: i + 1 })));
  } catch (error) {
    res.status(500).json({ error: '获取博物馆排行榜失败' });
  }
});

router.get('/artifacts', authMiddleware, async (req, res) => {
  try {
    const rows = await allQuery(`
      SELECT id, username, totalArtifacts as score, level
      FROM users
      ORDER BY totalArtifacts DESC
      LIMIT 100
    `);
    res.json(rows.map((r, i) => ({ ...r, rank: i + 1 })));
  } catch (error) {
    res.status(500).json({ error: '获取收藏排行榜失败' });
  }
});

router.get('/excavation', authMiddleware, async (req, res) => {
  try {
    const rows = await allQuery(`
      SELECT id, username, excavationDepth as score, level
      FROM users
      ORDER BY excavationDepth DESC
      LIMIT 100
    `);
    res.json(rows.map((r, i) => ({ ...r, rank: i + 1 })));
  } catch (error) {
    res.status(500).json({ error: '获取挖掘排行榜失败' });
  }
});

router.get('/repair', authMiddleware, async (req, res) => {
  try {
    const rows = await allQuery(`
      SELECT id, username, repairSuccessRate as score, restorerProficiency
      FROM users
      ORDER BY repairSuccessRate DESC
      LIMIT 100
    `);
    res.json(rows.map((r, i) => ({ ...r, rank: i + 1 })));
  } catch (error) {
    res.status(500).json({ error: '获取修复排行榜失败' });
  }
});

router.get('/report/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await allQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (user.length === 0) return res.status(404).json({ error: '用户不存在' });

    const artifacts = await allQuery('SELECT * FROM artifacts WHERE userId = ?', [userId]);
    const rarityCount = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    const eraCount = { ancient: 0, classical: 0, medieval: 0, renaissance: 0, modern: 0 };

    artifacts.forEach(a => {
      if (rarityCount[a.rarity] !== undefined) rarityCount[a.rarity]++;
      if (eraCount[a.era] !== undefined) eraCount[a.era]++;
    });

    const excavationTrend = [];
    for (let i = 6; i >= 0; i--) {
      excavationTrend.push({
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) + 3
      });
    }

    res.json({
      user: user[0],
      rarityDistribution: Object.entries(rarityCount).map(([name, value]) => ({ name, value })),
      eraDistribution: Object.entries(eraCount).map(([name, value]) => ({ name, value })),
      excavationTrend,
      totalArtifacts: artifacts.length,
      repairedCount: artifacts.filter(a => a.isRepaired).length,
      avgScore: artifacts.length > 0
        ? Math.floor(artifacts.reduce((s, a) => s + (a.score || 0), 0) / artifacts.length)
        : 0
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: '获取报告数据失败' });
  }
});

export default router;
