import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { runQuery, getQuery, allQuery } from '../config/database.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

router.get('/active', authMiddleware, async (req, res) => {
  try {
    const comp = await getQuery('SELECT * FROM competitions WHERE isActive = 1 ORDER BY startDate DESC LIMIT 1');
    if (!comp) return res.json(null);

    const entries = await allQuery(`
      SELECT ce.* FROM competition_entries ce
      WHERE ce.competitionId = ?
      ORDER BY ce.score DESC
      LIMIT 100
    `, [comp.id]);

    const myEntry = entries.find(e => e.playerId === req.userId);

    res.json({
      competition: comp,
      rankings: entries.map(e => ({
        ...e,
        artifactIds: JSON.parse(e.artifactIds || '[]')
      })),
      myEntry: myEntry ? { ...myEntry, artifactIds: JSON.parse(myEntry.artifactIds || '[]') } : null
    });
  } catch (error) {
    res.status(500).json({ error: '获取竞赛信息失败' });
  }
});

router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { competitionId, artifactIds } = req.body;
    if (!artifactIds || artifactIds.length === 0 || artifactIds.length > 3) {
      return res.status(400).json({ error: '请提交1-3件藏品' });
    }

    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.userId]);
    const comp = await getQuery('SELECT * FROM competitions WHERE id = ?', [competitionId]);
    if (!comp || !comp.isActive) return res.status(400).json({ error: '竞赛不存在或已结束' });

    const existing = await getQuery('SELECT id FROM competition_entries WHERE competitionId = ? AND playerId = ?',
      [competitionId, req.userId]);
    if (existing) return res.status(400).json({ error: '您已参赛' });

    let totalScore = 0;
    for (const aid of artifactIds) {
      const art = await getQuery('SELECT * FROM artifacts WHERE id = ? AND userId = ? AND isRepaired = 1', [aid, req.userId]);
      if (!art) return res.status(400).json({ error: '藏品无效' });
      totalScore += art.score || 0;

      const affixes = JSON.parse(art.affixes || '[]');
      totalScore += affixes.length * 100;
    }

    const entryId = generateId();
    await runQuery(
      `INSERT INTO competition_entries (id, competitionId, playerId, playerName, artifactIds, score)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [entryId, competitionId, req.userId, user.username, JSON.stringify(artifactIds), totalScore]
    );

    const allEntries = await allQuery('SELECT id, score FROM competition_entries WHERE competitionId = ? ORDER BY score DESC', [competitionId]);
    const rank = allEntries.findIndex(e => e.id === entryId) + 1;

    await runQuery('UPDATE competition_entries SET rank = ? WHERE id = ?', [rank, entryId]);

    res.json({ success: true, entryId, score: totalScore, rank });
  } catch (error) {
    console.error('Join comp error:', error);
    res.status(500).json({ error: '参赛失败' });
  }
});

router.get('/rewards', authMiddleware, async (req, res) => {
  try {
    res.json([
      { rank: 1, name: '传说考古工具·创世之镐', rarity: 'legendary', type: 'tool' },
      { rank: 2, name: '史诗考古工具·龙晶铲', rarity: 'epic', type: 'tool' },
      { rank: 3, name: '稀有考古工具·精灵之铲', rarity: 'rare', type: 'tool' },
      { rank: '4-10', name: '5000金币 + 修复材料包', rarity: 'uncommon', type: 'package' },
      { rank: '参与奖', name: '1000金币 + 普通材料', rarity: 'common', type: 'package' }
    ]);
  } catch (error) {
    res.status(500).json({ error: '获取奖励列表失败' });
  }
});

export default router;
