const jwt = require('jsonwebtoken');

const APP_PASSWORD = process.env.APP_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || APP_PASSWORD || 'fallback-secret-change-me';

function isProtected() {
  return !!APP_PASSWORD && APP_PASSWORD.trim() !== '';
}

function createToken() {
  return jwt.sign(
    { auth: true },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

function authMiddleware(req, res, next) {
  if (!isProtected()) return next();

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.auth_token;

  const decoded = verifyToken(token);
  if (decoded) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

module.exports = {
  isProtected,
  createToken,
  verifyToken,
  authMiddleware,
};
