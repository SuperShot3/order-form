const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

let client = null;

function getClient() {
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  if (!client) client = createClient(url, key);
  return client;
}

function useSupabase() {
  return !!(url && key);
}

function dbToOrder(row) {
  if (!row) return null;
  const order = { ...row };
  delete order.id;
  delete order.created_at;
  delete order.updated_at;
  order.florist_status = order.florist_status === 1 || order.florist_status === '1' ? 1 : 0;
  Object.keys(order).forEach((k) => {
    if (order[k] === null) order[k] = '';
  });
  return order;
}

function orderToDb(order) {
  const row = { ...order };
  if (row.florist_status === '' || row.florist_status === undefined) row.florist_status = 0;
  row.florist_status = row.florist_status === 1 || row.florist_status === '1' ? 1 : 0;
  Object.keys(row).forEach((k) => {
    if (row[k] === '' || row[k] === undefined) row[k] = null;
  });
  return row;
}

function calculateTotalProfit(order) {
  const totalReceived = parseFloat(order.items_total);
  if (isNaN(totalReceived)) return null;
  return totalReceived;
}

async function getOrders(options = {}) {
  const supabase = getClient();
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

  const { search, payment_status, delivery_status, priority, startDate, endDate } = options || {};

  if (payment_status) query = query.eq('payment_status', payment_status);
  if (delivery_status) query = query.eq('delivery_status', delivery_status);
  if (priority) query = query.eq('priority', priority);
  if (startDate) query = query.gte('delivery_date', startDate);
  if (endDate) query = query.lte('delivery_date', endDate);

  const { data, error } = await query;
  if (error) throw error;

  let orders = (data || []).map(dbToOrder);

  if (search) {
    const s = String(search).toLowerCase();
    orders = orders.filter((o) =>
      Object.values(o).some((v) => String(v).toLowerCase().includes(s))
    );
  }

  return orders;
}

async function getOrderById(id) {
  const supabase = getClient();
  const { data, error } = await supabase.from('orders').select('*').eq('order_id', id).single();
  if (error) return null;
  return dbToOrder(data);
}

async function createOrder(orderData) {
  const supabase = getClient();

  const { generateOrderId } = require('../utils/orderId');
  let order = { ...orderData };

  const { getOrderLink } = require('../utils/orderLink');
  if (!order.order_id) {
    order.order_id = await generateOrderId();
  }
  order.order_link = getOrderLink(order.order_id);

  const profit = calculateTotalProfit(order);
  if (profit !== null) order.total_profit = profit;

  const row = orderToDb(order);
  const { data, error } = await supabase.from('orders').insert(row).select().single();
  if (error) throw error;

  return dbToOrder(data);
}

async function updateOrder(id, orderData) {
  const supabase = getClient();

  const { getOrderLink } = require('../utils/orderLink');
  const order = { ...orderData, order_id: id };
  order.order_link = getOrderLink(id);
  const profit = calculateTotalProfit(order);
  if (profit !== null) order.total_profit = profit;

  const row = orderToDb(order);
  delete row.id;
  delete row.created_at;
  const { data, error } = await supabase.from('orders').update(row).eq('order_id', id).select().single();
  if (error) throw error;

  return dbToOrder(data);
}

async function getOrdersForDate(date) {
  return getOrders({ startDate: date, endDate: date });
}

async function getOrdersForDateRange(startDate, endDate) {
  return getOrders({ startDate, endDate });
}

module.exports = {
  useSupabase,
  getClient,
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  getOrdersForDate,
  getOrdersForDateRange,
  calculateTotalProfit,
};
