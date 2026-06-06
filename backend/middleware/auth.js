import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'magic_archaeology_secret', {
    expiresIn: '7d'
  });
};

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'magic_archaeology_secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: '认证令牌无效' });
  }
};
