const express = require('express');
const router = express.Router();

const reportService = require('../services/reportService');

router.get('/florist/:orderId.pdf', async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await reportService.generateFloristPDF(orderId);
    if (!result) return res.status(404).json({ error: 'Order not found' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=florist_${orderId}.pdf`);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/driver', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const buffer = await reportService.generateDriverExcel(date);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=driver_${date}.xlsx`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/finance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const buffer = await reportService.generateFinanceExcel(startDate, endDate);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=finance_${startDate || 'all'}_${endDate || 'all'}.xlsx`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all-orders', async (req, res) => {
  try {
    const buffer = await reportService.generateAllOrdersExcel();
    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=orders_export_${date}.xlsx`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
