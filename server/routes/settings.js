const express = require('express');
const router = express.Router();

const settingsService = require('../services/settingsService');

router.get('/', async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
