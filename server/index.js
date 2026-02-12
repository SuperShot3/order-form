require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const ordersService = require('./services/ordersService');
const excelService = require('./services/excelService');

const ordersRouter = require('./routes/orders');
const settingsRouter = require('./routes/settings');
const parseRouter = require('./routes/parse');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/orders', ordersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/parse', parseRouter);
app.use('/api/reports', reportsRouter);

// Health check for Railway (must respond quickly to pass deployment)
app.get('/health', (req, res) => res.json({ ok: true }));

// Serve static frontend in production (Railway, etc.)
const clientDist = path.join(__dirname, '../client/dist');
if (require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

async function init() {
  excelService.ensureDataDir();
  excelService.ensureExportsDir();
  if (!ordersService.useSupabase || !ordersService.useSupabase()) {
    await excelService.ensureExcelExists();
  }
}

// Start server immediately so Railway health checks pass; init runs in background
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Order Desk server running at http://0.0.0.0:${PORT}`);
  init().catch((err) => {
    console.error('Init failed (non-fatal):', err);
  });
});
