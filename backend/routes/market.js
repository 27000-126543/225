import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { runQuery, getQuery, allQuery, db } from '../config/database.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

router.get('/listings', authMiddleware, async (req, res) => {
  try {
    const listings = await allQuery(`
      SELECT ml.* FROM market_listings ml
      WHERE ml.sellerId != ?
      ORDER BY ml.listedAt DESC
      LIMIT 50
    `, [req.userId]);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: '获取商品列表失败' });
  }
});

router.get('/my-listings', authMiddleware, async (req, res) => {
  try {
    const listings = await allQuery(
      'SELECT * FROM market_listings WHERE sellerId = ? ORDER BY listedAt DESC',
      [req.userId]
    );
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: '获取我的商品失败' });
  }
});

router.get('/price-suggestion', authMiddleware, async (req, res) => {
  try {
    const { rarity, type } = req.query;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const rows = await allQuery(`
      SELECT price FROM market_listings
      WHERE rarity = ? AND itemType = ? AND listedAt > ?
      LIMIT 20
    `, [rarity, type, sevenDaysAgo]);

    if (rows.length === 0) {
      const basePrices = {
        fragment: { common: 100, uncommon: 300, rare: 800, epic: 2500, legendary: 10000 },
        scroll: { common: 150, uncommon: 400, rare: 1200, epic: 4000, legendary: 15000 },
        gem: { common: 200, uncommon: 500, rare: 1500, epic: 5000, legendary: 20000 },
        material: { common: 50, uncommon: 150, rare: 400, epic: 1200, legendary: 5000 }
      };
      const base = basePrices[type]?.[rarity] || 500;
      return res.json({ min: Math.floor(base * 0.8), max: Math.floor(base * 1.2), avg: base, sampleSize: 0 });
    }

    const prices = rows.map(r => r.price).sort((a, b) => a - b);
    const avg = Math.floor(prices.reduce((a, b) => a + b, 0) / prices.length);
    const min = Math.floor(prices[Math.floor(prices.length * 0.1)] || avg * 0.8);
    const max = Math.floor(prices[Math.floor(prices.length * 0.9)] || avg * 1.2);

    res.json({ min, max, avg, sampleSize: rows.length });
  } catch (error) {
    res.status(500).json({ error: '获取价格建议失败' });
  }
});

router.post('/list', authMiddleware, async (req, res) => {
  try {
    const { itemId, itemType, price, suggestedMin, suggestedMax } = req.body;
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.userId]);

    let itemName, rarity;
    if (itemType === 'artifact' || itemType === 'fragment' || itemType === 'scroll' || itemType === 'gem') {
      const artifact = await getQuery('SELECT * FROM artifacts WHERE id = ? AND userId = ?', [itemId, req.userId]);
      if (!artifact) return res.status(404).json({ error: '物品不存在' });
      const placed = await getQuery('SELECT id FROM museum_slots WHERE artifactId = ?', [itemId]);
      if (placed) return res.status(400).json({ error: '文物正在展厅中展出，无法出售' });
      itemName = artifact.name;
      rarity = artifact.rarity;
      await runQuery('DELETE FROM artifacts WHERE id = ?', [itemId]);
    } else {
      const material = await getQuery('SELECT * FROM materials WHERE id = ? AND userId = ?', [itemId, req.userId]);
      if (!material || material.quantity < 1) return res.status(400).json({ error: '材料不足' });
      itemName = material.name;
      rarity = material.rarity;
      await runQuery('UPDATE materials SET quantity = quantity - 1 WHERE id = ?', [itemId]);
    }

    const listingId = generateId();
    await runQuery(
      `INSERT INTO market_listings (id, sellerId, sellerName, itemType, itemName, rarity, price, suggestedMin, suggestedMax)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [listingId, req.userId, user.username, itemType, itemName, rarity, price, suggestedMin, suggestedMax]
    );

    res.json({ success: true, listingId });
  } catch (error) {
    console.error('List item error:', error);
    res.status(500).json({ error: '上架失败' });
  }
});

router.post('/buy', authMiddleware, async (req, res) => {
  try {
    const { listingId } = req.body;
    const listing = await getQuery('SELECT * FROM market_listings WHERE id = ?', [listingId]);
    if (!listing) return res.status(404).json({ error: '商品不存在' });
    if (listing.sellerId === req.userId) return res.status(400).json({ error: '不能购买自己的商品' });

    const buyer = await getQuery('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (buyer.gold < listing.price) return res.status(400).json({ error: '金币不足' });

    const seller = await getQuery('SELECT * FROM users WHERE id = ?', [listing.sellerId]);

    await runQuery('UPDATE users SET gold = gold - ? WHERE id = ?', [listing.price, req.userId]);
    await runQuery('UPDATE users SET gold = gold + ? WHERE id = ?', [listing.price, listing.sellerId]);

    const itemId = generateId();
    if (listing.itemType === 'material') {
      const existing = await getQuery('SELECT * FROM materials WHERE userId = ? AND name = ?', [req.userId, listing.itemName]);
      if (existing) {
        await runQuery('UPDATE materials SET quantity = quantity + 1 WHERE id = ?', [existing.id]);
      } else {
        await runQuery(
          'INSERT INTO materials (id, userId, name, rarity, quantity, description) VALUES (?, ?, ?, ?, 1, ?)',
          [itemId, req.userId, listing.itemName, listing.rarity, '购自交易市场']
        );
      }
    } else {
      await runQuery(
        `INSERT INTO artifacts (id, userId, name, type, rarity, era, completeness, score, description, affixes, image, isIdentified, isRepaired)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', '🏺', 1, 1)`,
        [itemId, req.userId, listing.itemName, listing.itemType, listing.rarity, 'ancient', 85, 500, `购自${seller.username}的商品`]
      );
    }

    await runQuery('DELETE FROM market_listings WHERE id = ?', [listingId]);

    const annId = generateId();
    await runQuery(
      'INSERT INTO announcements (id, type, message) VALUES (?, ?, ?)',
      [annId, 'trade', `🎉 ${buyer.username} 从 ${seller.username} 处购买了 [${listing.itemName}]！`]
    );

    res.json({ success: true, itemId });
  } catch (error) {
    console.error('Buy error:', error);
    res.status(500).json({ error: '购买失败' });
  }
});

router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const { listingId } = req.body;
    const listing = await getQuery('SELECT * FROM market_listings WHERE id = ? AND sellerId = ?', [listingId, req.userId]);
    if (!listing) return res.status(404).json({ error: '商品不存在' });

    const itemId = generateId();
    if (listing.itemType === 'material') {
      const existing = await getQuery('SELECT * FROM materials WHERE userId = ? AND name = ?', [req.userId, listing.itemName]);
      if (existing) {
        await runQuery('UPDATE materials SET quantity = quantity + 1 WHERE id = ?', [existing.id]);
      } else {
        await runQuery(
          'INSERT INTO materials (id, userId, name, rarity, quantity, description) VALUES (?, ?, ?, ?, 1, ?)',
          [itemId, req.userId, listing.itemName, listing.rarity, '下架商品']
        );
      }
    } else {
      await runQuery(
        `INSERT INTO artifacts (id, userId, name, type, rarity, era, completeness, score, description, affixes, image, isIdentified, isRepaired)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', '🏺', 1, 1)`,
        [itemId, req.userId, listing.itemName, listing.itemType, listing.rarity, 'ancient', 85, 500, '下架商品']
      );
    }

    await runQuery('DELETE FROM market_listings WHERE id = ?', [listingId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '下架失败' });
  }
});

export default router;
