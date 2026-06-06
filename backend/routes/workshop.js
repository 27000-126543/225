import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { runQuery, getQuery, allQuery } from '../config/database.js';
import { calculateScore } from '../utils/helpers.js';

const router = express.Router();

router.post('/identify', authMiddleware, async (req, res) => {
  try {
    const { artifactId } = req.body;
    const artifact = await getQuery('SELECT * FROM artifacts WHERE id = ? AND userId = ?', [artifactId, req.userId]);
    if (!artifact) return res.status(404).json({ error: '文物不存在' });
    if (artifact.isIdentified) return res.status(400).json({ error: '文物已鉴定' });

    const score = calculateScore(artifact.rarity, artifact.era, artifact.completeness);

    await runQuery('UPDATE artifacts SET isIdentified = 1, score = ? WHERE id = ?', [score, artifactId]);

    const updated = await getQuery('SELECT * FROM artifacts WHERE id = ?', [artifactId]);
    updated.affixes = JSON.parse(updated.affixes || '[]');

    res.json({ artifact: updated, score });
  } catch (error) {
    res.status(500).json({ error: '鉴定失败' });
  }
});

router.post('/repair', authMiddleware, async (req, res) => {
  try {
    const { artifactId, materialIds } = req.body;
    const artifact = await getQuery('SELECT * FROM artifacts WHERE id = ? AND userId = ?', [artifactId, req.userId]);
    if (!artifact) return res.status(404).json({ error: '文物不存在' });
    if (!artifact.isIdentified) return res.status(400).json({ error: '请先鉴定文物' });
    if (artifact.isRepaired) return res.status(400).json({ error: '文物已修复' });

    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.userId]);
    const userMaterials = await allQuery('SELECT * FROM materials WHERE userId = ? AND quantity > 0', [req.userId]);

    const requiredCount = artifact.rarity === 'legendary' ? 5 :
                         artifact.rarity === 'epic' ? 4 :
                         artifact.rarity === 'rare' ? 3 :
                         artifact.rarity === 'uncommon' ? 2 : 1;

    if (!materialIds || materialIds.length < requiredCount) {
      return res.status(400).json({ error: `需要至少 ${requiredCount} 种材料` });
    }

    for (const matId of materialIds) {
      const mat = userMaterials.find(m => m.id === matId);
      if (!mat || mat.quantity < 1) {
        return res.status(400).json({ error: '材料不足' });
      }
    }

    const baseSuccess = { common: 95, uncommon: 85, rare: 70, epic: 50, legendary: 30 };
    const successRate = Math.min(98, (baseSuccess[artifact.rarity] || 70) + user.restorerProficiency / 10);
    const success = Math.random() * 100 < successRate;

    for (const matId of materialIds) {
      await runQuery('UPDATE materials SET quantity = quantity - 1 WHERE id = ?', [matId]);
    }

    let newCompleteness = artifact.completeness;
    let isRepaired = 0;
    let profGain = 0;

    if (success) {
      newCompleteness = Math.min(100, artifact.completeness + 20 + Math.floor(Math.random() * 20));
      isRepaired = 1;
      profGain = artifact.rarity === 'legendary' ? 10 : artifact.rarity === 'epic' ? 5 : 2;
    } else {
      newCompleteness = Math.max(10, artifact.completeness - 15);
      profGain = 1;
    }

    const newScore = calculateScore(artifact.rarity, artifact.era, newCompleteness);
    const newProficiency = Math.min(100, user.restorerProficiency + profGain);

    await runQuery(
      'UPDATE artifacts SET completeness = ?, score = ?, isRepaired = ? WHERE id = ?',
      [newCompleteness, newScore, isRepaired, artifactId]
    );
    await runQuery('UPDATE users SET restorerProficiency = ?, repairSuccessRate = ? WHERE id = ?',
      [newProficiency, 70 + newProficiency / 2, req.userId]);

    await runQuery(
      'UPDATE users SET totalArtifacts = (SELECT COUNT(*) FROM artifacts WHERE userId = ? AND isRepaired = 1) WHERE id = ?',
      [req.userId, req.userId]
    );

    const updatedArtifact = await getQuery('SELECT * FROM artifacts WHERE id = ?', [artifactId]);
    updatedArtifact.affixes = JSON.parse(updatedArtifact.affixes || '[]');

    res.json({
      success,
      artifact: updatedArtifact,
      successRate,
      proficiencyGain: profGain,
      newProficiency
    });
  } catch (error) {
    console.error('Repair error:', error);
    res.status(500).json({ error: '修复失败' });
  }
});

export default router;
