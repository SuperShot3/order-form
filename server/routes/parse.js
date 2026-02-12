const express = require('express');
const router = express.Router();

const { parseOrder, testOpenAIConnection, getParseStatus } = require('../services/parseOrder');

/** GET /api/parse/status - Check if AI parsing is available */
router.get('/status', async (req, res) => {
  try {
    const result = await getParseStatus();
    res.json(result);
  } catch (err) {
    res.status(500).json({ aiAvailable: false, error: err.message });
  }
});

/** GET /api/parse/test - Verify OpenAI connection when API key is set */
router.get('/test', async (req, res) => {
  try {
    const result = await testOpenAIConnection();
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: 'rawText is required' });
    const result = await parseOrder(rawText);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
