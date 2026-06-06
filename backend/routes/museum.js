import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { runQuery, getQuery, allQuery } from '../config/database.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

router.get('/halls', authMiddleware, async (req, res) => {
  try {
    const halls = await allQuery('SELECT * FROM museum_halls WHERE userId = ?', [req.userId]);
    const result = [];

    for (const hall of halls) {
      const slots = await allQuery('SELECT * FROM museum_slots WHERE hallId = ?', [hall.id]);
      const items = [];
      for (const slot of slots) {
        if (slot.artifactId) {
          const art = await getQuery('SELECT * FROM artifacts WHERE id = ?', [slot.artifactId]);
          if (art) {
            items.push({
              slotId: slot.id,
              artifact: { ...art, affixes: JSON.parse(art.affixes || '[]') },
              position: { x: slot.positionX, y: slot.positionY },
              size: slot.size
            });
          }
        }
      }
      result.push({ ...hall, items });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取博物馆展厅失败' });
  }
});

router.get('/available-artifacts', authMiddleware, async (req, res) => {
  try {
    const placed = await allQuery('SELECT artifactId FROM museum_slots WHERE artifactId IS NOT NULL');
    const placedIds = placed.map(p => p.artifactId);

    let sql = 'SELECT * FROM artifacts WHERE userId = ? AND isRepaired = 1';
    const params = [req.userId];
    if (placedIds.length > 0) {
      sql += ` AND id NOT IN (${placedIds.map(() => '?').join(',')})`;
      params.push(...placedIds);
    }

    const artifacts = await allQuery(sql, params);
    res.json(artifacts.map(a => ({ ...a, affixes: JSON.parse(a.affixes || '[]') })));
  } catch (error) {
    res.status(500).json({ error: '获取可用文物失败' });
  }
});

router.post('/place', authMiddleware, async (req, res) => {
  try {
    const { hallId, artifactId, position, size } = req.body;
    const hall = await getQuery('SELECT * FROM museum_halls WHERE id = ? AND userId = ?', [hallId, req.userId]);
    if (!hall) return res.status(404).json({ error: '展厅不存在' });

    const artifact = await getQuery('SELECT * FROM artifacts WHERE id = ? AND userId = ?', [artifactId, req.userId]);
    if (!artifact || !artifact.isRepaired) return res.status(400).json({ error: '文物不可用' });

    const existing = await getQuery('SELECT id FROM museum_slots WHERE artifactId = ?', [artifactId]);
    if (existing) return res.status(400).json({ error: '文物已在展厅中' });

    const slotId = generateId();
    await runQuery(
      'INSERT INTO museum_slots (id, hallId, artifactId, positionX, positionY, size) VALUES (?, ?, ?, ?, ?, ?)',
      [slotId, hallId, artifactId, position?.x || 0, position?.y || 0, size || 'medium']
    );

    await updateMuseumScore(req.userId);

    res.json({ success: true, slotId });
  } catch (error) {
    res.status(500).json({ error: '放置文物失败' });
  }
});

router.post('/remove', authMiddleware, async (req, res) => {
  try {
    const { slotId } = req.body;
    const slot = await getQuery(`
      SELECT ms.* FROM museum_slots ms
      JOIN museum_halls mh ON ms.hallId = mh.id
      WHERE ms.id = ? AND mh.userId = ?
    `, [slotId, req.userId]);

    if (!slot) return res.status(404).json({ error: '展柜不存在' });

    await runQuery('DELETE FROM museum_slots WHERE id = ?', [slotId]);
    await updateMuseumScore(req.userId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '移除文物失败' });
  }
});

router.get('/income', authMiddleware, async (req, res) => {
  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.userId]);
    const baseIncome = Math.floor(user.museumScore / 10);
    const hourlyIncome = baseIncome * 10;
    const dailyIncome = hourlyIncome * 24;

    res.json({
      museumScore: user.museumScore,
      baseIncome,
      hourlyIncome,
      dailyIncome
    });
  } catch (error) {
    res.status(500).json({ error: '获取收入信息失败' });
  }
});

const updateMuseumScore = async (userId) => {
  const halls = await allQuery('SELECT * FROM museum_halls WHERE userId = ?', [userId]);
  let totalScore = 0;

  for (const hall of halls) {
    const slots = await allQuery('SELECT artifactId FROM museum_slots WHERE hallId = ? AND artifactId IS NOT NULL', [hall.id]);
    for (const slot of slots) {
      const art = await getQuery('SELECT score FROM artifacts WHERE id = ?', [slot.artifactId]);
      if (art) totalScore += Math.floor(art.score * hall.ticketBonus);
    }
  }

  await runQuery('UPDATE users SET museumScore = ? WHERE id = ?', [totalScore, userId]);
};

export default router;
