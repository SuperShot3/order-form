const express = require('express');
const router = express.Router();
const { isProtected, createToken } = require('../middleware/auth');

/** GET /api/auth/status - Check if site is password-protected */
router.get('/status', (req, res) => {
  res.json({ protected: isProtected() });
});

/** POST /api/auth/logout - Clear auth cookie */
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', { path: '/' });
  res.json({ ok: true });
});

/** POST /api/auth/login - Login with password */
router.post('/login', (req, res) => {
  const { password } = req.body || {};
  if (!isProtected()) {
    return res.json({ token: null, ok: true });
  }
  if (password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = createToken();
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ token, ok: true });
});

module.exports = router;
