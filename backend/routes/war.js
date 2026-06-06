import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { runQuery, getQuery, allQuery } from '../config/database.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const wars = await allQuery(`
      SELECT * FROM ruin_wars
      ORDER BY CASE status
        WHEN 'ongoing' THEN 1
        WHEN 'upcoming' THEN 2
        ELSE 3
      END, startTime DESC
      LIMIT 20
    `);
    res.json(wars);
  } catch (error) {
    res.status(500).json({ error: '获取争夺战列表失败' });
  }
});

router.post('/declare', authMiddleware, async (req, res) => {
  try {
    const { targetGuildId, ruinName } = req.body;
    const membership = await getQuery('SELECT * FROM guild_members WHERE userId = ?', [req.userId]);
    if (!membership || membership.role === 'member') {
      return res.status(403).json({ error: '只有管理层可以发起争夺战' });
    }

    if (membership.guildId === targetGuildId) {
      return res.status(400).json({ error: '不能对自己公会发起争夺战' });
    }

    const myGuild = await getQuery('SELECT * FROM guilds WHERE id = ?', [membership.guildId]);
    const targetGuild = await getQuery('SELECT * FROM guilds WHERE id = ?', [targetGuildId]);
    if (!targetGuild) return res.status(404).json({ error: '目标公会不存在' });

    const warId = generateId();
    const startTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await runQuery(
      `INSERT INTO ruin_wars (id, ruinName, guildAId, guildAName, guildBId, guildBName, status, startTime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [warId, ruinName || '遗忘神殿', myGuild.id, myGuild.name, targetGuild.id, targetGuild.name, 'upcoming', startTime]
    );

    const annId = generateId();
    await runQuery(
      'INSERT INTO announcements (id, type, message) VALUES (?, ?, ?)',
      [annId, 'war', `⚔️ ${myGuild.name} 向 ${targetGuild.name} 发起了遗迹争夺战！`]
    );

    const war = await getQuery('SELECT * FROM ruin_wars WHERE id = ?', [warId]);
    res.json({ success: true, war });
  } catch (error) {
    console.error('Declare war error:', error);
    res.status(500).json({ error: '发起争夺战失败' });
  }
});

router.post('/participate/:warId', authMiddleware, async (req, res) => {
  try {
    const { warId } = req.params;
    const war = await getQuery('SELECT * FROM ruin_wars WHERE id = ?', [warId]);
    if (!war) return res.status(404).json({ error: '争夺战不存在' });
    if (war.status !== 'upcoming') return res.status(400).json({ error: '争夺战已开始或结束' });

    const membership = await getQuery('SELECT * FROM guild_members WHERE userId = ?', [req.userId]);
    if (!membership) return res.status(400).json({ error: '您未加入任何公会' });
    if (membership.guildId !== war.guildAId && membership.guildId !== war.guildBId) {
      return res.status(400).json({ error: '您不是参战公会成员' });
    }

    if (Date.now() < new Date(war.startTime).getTime()) {
      return res.status(400).json({ error: '争夺战尚未开始' });
    }

    const isGuildA = membership.guildId === war.guildAId;
    const myGuild = isGuildA ? 'A' : 'B';
    const guildBuildingBonus = isGuildA ? 1.1 : 1.05;

    const baseScore = 500 + Math.floor(Math.random() * 1000);
    const score = Math.floor(baseScore * guildBuildingBonus);

    if (isGuildA) {
      await runQuery('UPDATE ruin_wars SET scoreA = scoreA + ?, status = ? WHERE id = ?',
        [score, 'ongoing', warId]);
    } else {
      await runQuery('UPDATE ruin_wars SET scoreB = scoreB + ?, status = ? WHERE id = ?',
        [score, 'ongoing', warId]);
    }

    const updated = await getQuery('SELECT * FROM ruin_wars WHERE id = ?', [warId]);

    if (Math.random() > 0.7) {
      const winnerId = updated.scoreA > updated.scoreB ? updated.guildAId : updated.guildBId;
      const winner = updated.scoreA > updated.scoreB ? 'A' : 'B';

      await runQuery(
        'UPDATE ruin_wars SET status = ?, endTime = ?, winnerId = ? WHERE id = ?',
        ['ended', new Date().toISOString(), winnerId, warId]
      );

      await runQuery('UPDATE guilds SET reputation = reputation + 100 WHERE id = ?', [winnerId]);

      const winnerName = winner === 'A' ? updated.guildAName : updated.guildBName;
      const annId = generateId();
      await runQuery(
        'INSERT INTO announcements (id, type, message) VALUES (?, ?, ?)',
        [annId, 'war', `🏆 ${winnerName} 在 ${updated.ruinName} 争夺战中获胜！获得 +100 声望！`]
      );
    }

    const final = await getQuery('SELECT * FROM ruin_wars WHERE id = ?', [warId]);
    res.json({ success: true, score, war: final });
  } catch (error) {
    console.error('Participate war error:', error);
    res.status(500).json({ error: '参战失败' });
  }
});

export default router;
