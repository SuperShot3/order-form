const express = require('express');
const router = express.Router();

const ordersService = require('../services/ordersService');

/** GET /api/orders/summary - Totals for header display */
router.get('/summary', async (req, res) => {
  try {
    const summary = await ordersService.getOrdersSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { search, payment_status, delivery_status, priority, startDate, endDate } = req.query;
    const orders = await ordersService.getOrders({ search, payment_status, delivery_status, priority, startDate, endDate });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await ordersService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const order = await ordersService.createOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const order = await ordersService.updateOrder(req.params.id, req.body);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
