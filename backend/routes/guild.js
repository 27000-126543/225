import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { runQuery, getQuery, allQuery } from '../config/database.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const guilds = await allQuery('SELECT * FROM guilds ORDER BY level DESC, reputation DESC LIMIT 50');
    const myMembership = await getQuery('SELECT * FROM guild_members WHERE userId = ?', [req.userId]);

    let myGuild = null;
    if (myMembership) {
      myGuild = await getQuery('SELECT * FROM guilds WHERE id = ?', [myMembership.guildId]);
      if (myGuild) {
        const members = await allQuery('SELECT * FROM guild_members WHERE guildId = ? ORDER BY contribution DESC', [myGuild.id]);
        const buildings = await allQuery('SELECT * FROM guild_buildings WHERE guildId = ?', [myGuild.id]);
        const materials = await allQuery('SELECT * FROM guild_materials WHERE guildId = ?', [myGuild.id]);
        myGuild = { ...myGuild, members, buildings, materials, myRole: myMembership.role };
      }
    }

    res.json({ guilds, myGuild });
  } catch (error) {
    res.status(500).json({ error: '获取公会列表失败' });
  }
});

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.length < 2) return res.status(400).json({ error: '公会名称至少2个字符' });

    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.userId]);
    const existingMember = await getQuery('SELECT id FROM guild_members WHERE userId = ?', [req.userId]);
    if (existingMember) return res.status(400).json({ error: '您已加入其他公会' });

    const existingGuild = await getQuery('SELECT id FROM guilds WHERE name = ?', [name]);
    if (existingGuild) return res.status(400).json({ error: '公会名称已存在' });

    if (user.gold < 10000) return res.status(400).json({ error: '创建公会需要10000金币' });

    const guildId = generateId();
    await runQuery('UPDATE users SET gold = gold - 10000 WHERE id = ?', [req.userId]);
    await runQuery(
      'INSERT INTO guilds (id, name, leaderId, leaderName) VALUES (?, ?, ?, ?)',
      [guildId, name, req.userId, user.username]
    );

    const memberId = generateId();
    await runQuery(
      'INSERT INTO guild_members (id, guildId, userId, userName, role, contribution) VALUES (?, ?, ?, ?, ?, ?)',
      [memberId, guildId, req.userId, user.username, 'leader', 0]
    );

    const buildings = [
      { name: '联合挖掘场', type: 'excavation', bonus: '挖掘效率 +5%/级' },
      { name: '大师修复室', type: 'repair', bonus: '修复成功率 +3%/级' },
      { name: '考古图书馆', type: 'exp', bonus: '经验获取 +4%/级' },
      { name: '物资仓库', type: 'storage', bonus: '材料存储 +10/级' }
    ];

    for (const b of buildings) {
      const bid = generateId();
      await runQuery(
        'INSERT INTO guild_buildings (id, guildId, name, type, level, bonus, upgradeCost) VALUES (?, ?, ?, ?, 1, ?, ?)',
        [bid, guildId, b.name, b.type, b.bonus, JSON.stringify({ gold: 5000, materials: 10 })]
      );
    }

    const guild = await getQuery('SELECT * FROM guilds WHERE id = ?', [guildId]);
    res.json({ success: true, guild });
  } catch (error) {
    console.error('Create guild error:', error);
    res.status(500).json({ error: '创建公会失败' });
  }
});

router.post('/join/:guildId', authMiddleware, async (req, res) => {
  try {
    const { guildId } = req.params;
    const guild = await getQuery('SELECT * FROM guilds WHERE id = ?', [guildId]);
    if (!guild) return res.status(404).json({ error: '公会不存在' });

    const existingMember = await getQuery('SELECT id FROM guild_members WHERE userId = ?', [req.userId]);
    if (existingMember) return res.status(400).json({ error: '您已加入其他公会' });

    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.userId]);
    const memberId = generateId();
    await runQuery(
      'INSERT INTO guild_members (id, guildId, userId, userName, role) VALUES (?, ?, ?, ?, ?)',
      [memberId, guildId, req.userId, user.username, 'member']
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '加入公会失败' });
  }
});

router.post('/leave', authMiddleware, async (req, res) => {
  try {
    const membership = await getQuery('SELECT * FROM guild_members WHERE userId = ?', [req.userId]);
    if (!membership) return res.status(400).json({ error: '您未加入任何公会' });
    if (membership.role === 'leader') return res.status(400).json({ error: '会长不能退出公会，请先转让或解散' });

    await runQuery('DELETE FROM guild_members WHERE userId = ?', [req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '退出公会失败' });
  }
});

router.post('/contribute', authMiddleware, async (req, res) => {
  try {
    const { gold, materialId, quantity } = req.body;
    const membership = await getQuery('SELECT * FROM guild_members WHERE userId = ?', [req.userId]);
    if (!membership) return res.status(400).json({ error: '您未加入任何公会' });

    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.userId]);
    let contribution = 0;

    if (gold && gold > 0) {
      if (user.gold < gold) return res.status(400).json({ error: '金币不足' });
      await runQuery('UPDATE users SET gold = gold - ? WHERE id = ?', [gold, req.userId]);
      await runQuery('UPDATE guilds SET gold = gold + ? WHERE id = ?', [gold, membership.guildId]);
      contribution += gold;
    }

    if (materialId && quantity > 0) {
      const mat = await getQuery('SELECT * FROM materials WHERE id = ? AND userId = ?', [materialId, req.userId]);
      if (!mat || mat.quantity < quantity) return res.status(400).json({ error: '材料不足' });
      await runQuery('UPDATE materials SET quantity = quantity - ? WHERE id = ?', [quantity, materialId]);

      const existingGuildMat = await getQuery('SELECT * FROM guild_materials WHERE guildId = ? AND materialId = ?',
        [membership.guildId, materialId]);
      if (existingGuildMat) {
        await runQuery('UPDATE guild_materials SET quantity = quantity + ? WHERE id = ?', [quantity, existingGuildMat.id]);
      } else {
        const gmid = generateId();
        await runQuery(
          'INSERT INTO guild_materials (id, guildId, materialId, materialName, quantity) VALUES (?, ?, ?, ?, ?)',
          [gmid, membership.guildId, materialId, mat.name, quantity]
        );
      }
      contribution += quantity * 100;
    }

    await runQuery(
      'UPDATE guild_members SET contribution = contribution + ? WHERE userId = ?',
      [contribution, req.userId]
    );

    res.json({ success: true, contribution });
  } catch (error) {
    console.error('Contribute error:', error);
    res.status(500).json({ error: '贡献失败' });
  }
});

router.post('/upgrade/:buildingId', authMiddleware, async (req, res) => {
  try {
    const { buildingId } = req.params;
    const membership = await getQuery('SELECT * FROM guild_members WHERE userId = ?', [req.userId]);
    if (!membership || membership.role === 'member') {
      return res.status(403).json({ error: '只有管理层可以升级建筑' });
    }

    const building = await getQuery('SELECT * FROM guild_buildings WHERE id = ? AND guildId = ?',
      [buildingId, membership.guildId]);
    if (!building) return res.status(404).json({ error: '建筑不存在' });
    if (building.level >= building.maxLevel) return res.status(400).json({ error: '建筑已满级' });

    const guild = await getQuery('SELECT * FROM guilds WHERE id = ?', [membership.guildId]);
    const cost = JSON.parse(building.upgradeCost || '{}');
    const goldCost = cost.gold * building.level;

    if (guild.gold < goldCost) return res.status(400).json({ error: '公会金币不足' });

    await runQuery('UPDATE guilds SET gold = gold - ? WHERE id = ?', [goldCost, membership.guildId]);
    await runQuery('UPDATE guild_buildings SET level = level + 1 WHERE id = ?', [buildingId]);

    const updated = await getQuery('SELECT * FROM guild_buildings WHERE id = ?', [buildingId]);
    res.json({ success: true, building: updated });
  } catch (error) {
    res.status(500).json({ error: '升级失败' });
  }
});

export default router;
