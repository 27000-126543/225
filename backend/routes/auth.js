import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, authMiddleware } from '../middleware/auth.js';
import { runQuery, getQuery, allQuery } from '../config/database.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }
    if (username.length < 3 || password.length < 6) {
      return res.status(400).json({ error: '用户名至少3位，密码至少6位' });
    }

    const existing = await getQuery('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();

    await runQuery(
      `INSERT INTO users (id, username, password, teamName) VALUES (?, ?, ?, ?)`,
      [userId, username, hashedPassword, `${username}的考古队`]
    );

    const materialNames = ['青铜修复液', '古代黏合剂', '魔法清洁剂', '加固树脂', '光泽剂'];
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    for (let i = 0; i < 5; i++) {
      await runQuery(
        `INSERT INTO materials (id, userId, name, rarity, quantity, description) VALUES (?, ?, ?, ?, ?, ?)`,
        [generateId(), userId, materialNames[i], rarities[i], 10 + i * 5, `用于文物修复的${materialNames[i]}`]
      );
    }

    const hallThemes = [
      { id: 'hall1', name: '远古文明厅', theme: 'ancient' },
      { id: 'hall2', name: '中世纪魔法厅', theme: 'medieval' },
      { id: 'hall3', name: '文艺复兴厅', theme: 'renaissance' }
    ];
    for (const hall of hallThemes) {
      await runQuery(
        `INSERT INTO museum_halls (id, userId, name, theme) VALUES (?, ?, ?, ?)`,
        [generateId(), userId, hall.name, hall.theme]
      );
    }

    const token = generateToken(userId);
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    delete user.password;

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }

    const user = await getQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = generateToken(user.id);
    delete user.password;

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

router.post('/stamina/recover', authMiddleware, async (req, res) => {
  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    const recovered = Math.min(20, user.maxStamina - user.stamina);
    await runQuery('UPDATE users SET stamina = stamina + ? WHERE id = ?', [recovered, req.userId]);

    const updated = await getQuery('SELECT * FROM users WHERE id = ?', [req.userId]);
    delete updated.password;
    res.json({ stamina: updated.stamina, recovered });
  } catch (error) {
    res.status(500).json({ error: '恢复体力失败' });
  }
});

export default router;
