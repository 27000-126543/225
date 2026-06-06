import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { runQuery, getQuery, allQuery } from '../config/database.js';
import { generateId, calculateDropRate, calculateScore } from '../utils/helpers.js';

const router = express.Router();

const weathers = ['sunny', 'cloudy', 'rainy', 'stormy', 'magical'];

const artifactTemplates = [
  { type: 'fragment', nameBase: '文物碎片', images: ['🧩', '🔮', '💎', '⚱️', '🏺'] },
  { type: 'scroll', nameBase: '古代卷轴', images: ['📜', '📋', '📖', '🗞️', '🧾'] },
  { type: 'gem', nameBase: '稀有宝石', images: ['💎', '💠', '🔷', '♦️', '🪙'] }
];

const affixPool = [
  '古代魔法', '龙之祝福', '精灵之泪', '星辰之力', '深渊低语',
  '时间印记', '永恒光辉', '神秘符文', '失落记忆', '创世精华'
];

router.get('/ruins', authMiddleware, async (req, res) => {
  try {
    const ruins = await allQuery('SELECT * FROM ruin_sites');
    res.json(ruins);
  } catch (error) {
    res.status(500).json({ error: '获取遗迹列表失败' });
  }
});

router.get('/weather', authMiddleware, async (req, res) => {
  try {
    const weather = weathers[Math.floor(Math.random() * weathers.length)];
    res.json({ weather, timestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ error: '获取天气失败' });
  }
});

router.post('/excavate', authMiddleware, async (req, res) => {
  try {
    const { ruinId } = req.body;
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    const ruin = await getQuery('SELECT * FROM ruin_sites WHERE id = ?', [ruinId]);
    if (!ruin) return res.status(404).json({ error: '遗迹不存在' });

    if (user.stamina < ruin.staminaCost) {
      return res.status(400).json({ error: '体力不足' });
    }

    if (user.level < ruin.minLevel) {
      return res.status(400).json({ error: `需要等级 ${ruin.minLevel} 才能挖掘此遗迹` });
    }

    const weather = weathers[Math.floor(Math.random() * weathers.length)];
    const results = [];
    const dropCount = 1 + Math.floor(Math.random() * 3);

    for (let i = 0; i < dropCount; i++) {
      const roll = Math.random();
      let rarity = 'common';
      if (roll < calculateDropRate(weather, user.toolQuality, 'legendary')) rarity = 'legendary';
      else if (roll < calculateDropRate(weather, user.toolQuality, 'epic')) rarity = 'epic';
      else if (roll < calculateDropRate(weather, user.toolQuality, 'rare')) rarity = 'rare';
      else if (roll < calculateDropRate(weather, user.toolQuality, 'uncommon')) rarity = 'uncommon';

      const template = artifactTemplates[Math.floor(Math.random() * artifactTemplates.length)];
      const eraWeights = [0.25, 0.25, 0.25, 0.15, 0.1];
      const eras = ['ancient', 'classical', 'medieval', 'renaissance', 'modern'];
      let eraRoll = Math.random();
      let era = eras[0];
      for (let j = 0; j < eras.length; j++) {
        if (eraRoll < eraWeights.slice(0, j + 1).reduce((a, b) => a + b, 0)) {
          era = eras[j];
          break;
        }
      }

      const completeness = 30 + Math.floor(Math.random() * 60);
      const score = calculateScore(rarity, era, completeness);
      const affixes = rarity === 'legendary' ? [affixPool[Math.floor(Math.random() * affixPool.length)]] :
                      rarity === 'epic' ? (Math.random() > 0.5 ? [affixPool[Math.floor(Math.random() * affixPool.length)]] : []) : [];
      const image = template.images[Math.floor(Math.random() * template.images.length)];

      const artifactId = generateId();
      await runQuery(
        `INSERT INTO artifacts (id, userId, name, type, rarity, era, completeness, score, description, affixes, image, isIdentified, isRepaired)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
        [
          artifactId, user.id,
          `${template.nameBase} #${Math.floor(Math.random() * 99999)}`,
          template.type, rarity, era, completeness, score,
          `从${ruin.name}挖掘出的${template.nameBase}`,
          JSON.stringify(affixes), image
        ]
      );

      const newArtifact = await getQuery('SELECT * FROM artifacts WHERE id = ?', [artifactId]);
      results.push(newArtifact);
    }

    const expGain = ruin.difficulty * 10 + Math.floor(Math.random() * 20);
    const newStamina = user.stamina - ruin.staminaCost;
    const newExp = user.exp + expGain;
    const expToLevel = user.level * 100;
    let newLevel = user.level;
    let remainingExp = newExp;

    while (remainingExp >= newLevel * 100) {
      remainingExp -= newLevel * 100;
      newLevel++;
    }

    await runQuery(
      `UPDATE users SET stamina = ?, exp = ?, level = ?, excavationDepth = excavationDepth + ? WHERE id = ?`,
      [newStamina, remainingExp, newLevel, ruin.depth, user.id]
    );

    const updatedUser = await getQuery('SELECT * FROM users WHERE id = ?', [user.id]);
    delete updatedUser.password;

    res.json({
      weather,
      artifacts: results,
      expGain,
      stamina: newStamina,
      leveledUp: newLevel > user.level,
      newLevel,
      user: updatedUser
    });
  } catch (error) {
    console.error('Excavate error:', error);
    res.status(500).json({ error: '挖掘失败' });
  }
});

router.get('/artifacts', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM artifacts WHERE userId = ?';
    const params = [req.userId];

    if (status === 'unidentified') {
      sql += ' AND isIdentified = 0';
    } else if (status === 'unrepaired') {
      sql += ' AND isIdentified = 1 AND isRepaired = 0';
    } else if (status === 'repaired') {
      sql += ' AND isRepaired = 1';
    }

    sql += ' ORDER BY excavatedAt DESC';
    const artifacts = await allQuery(sql, params);
    res.json(artifacts.map(a => ({ ...a, affixes: JSON.parse(a.affixes || '[]') })));
  } catch (error) {
    res.status(500).json({ error: '获取文物列表失败' });
  }
});

router.get('/materials', authMiddleware, async (req, res) => {
  try {
    const materials = await allQuery('SELECT * FROM materials WHERE userId = ?', [req.userId]);
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: '获取材料列表失败' });
  }
});

export default router;
