const express = require('express');
const router = express.Router();

const { parseOrder } = require('../services/parseOrder');

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
