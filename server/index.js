require('dotenv').config();
const express = require('express');
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

async function init() {
  excelService.ensureDataDir();
  excelService.ensureExportsDir();
  if (!ordersService.useSupabase || !ordersService.useSupabase()) {
    await excelService.ensureExcelExists();
  }
}

init().then(() => {
  app.listen(PORT, () => {
    console.log(`Order Desk server running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Init failed:', err);
  process.exit(1);
});
