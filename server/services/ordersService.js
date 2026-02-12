const supabaseService = require('./supabaseService');
const excelService = require('./excelService');

function useSupabase() {
  return supabaseService.useSupabase && supabaseService.useSupabase();
}

async function getOrders(options) {
  return useSupabase() ? supabaseService.getOrders(options) : excelService.getOrders(options);
}

async function getOrderById(id) {
  return useSupabase() ? supabaseService.getOrderById(id) : excelService.getOrderById(id);
}

async function createOrder(orderData) {
  return useSupabase() ? supabaseService.createOrder(orderData) : excelService.createOrder(orderData);
}

async function updateOrder(id, orderData) {
  return useSupabase() ? supabaseService.updateOrder(id, orderData) : excelService.updateOrder(id, orderData);
}

async function getOrdersForDate(date) {
  return useSupabase() ? supabaseService.getOrdersForDate(date) : excelService.getOrdersForDate(date);
}

async function getOrdersForDateRange(startDate, endDate) {
  return useSupabase()
    ? supabaseService.getOrdersForDateRange(startDate, endDate)
    : excelService.getOrdersForDateRange(startDate, endDate);
}

function ensureExportsDir() {
  excelService.ensureExportsDir();
}

async function getOrdersSummary() {
  const orders = await getOrders({});
  let totalReceived = 0;
  let totalProfit = 0;
  let totalDelivery = 0;

  orders.forEach((o) => {
    const sellFor = parseFloat(o.items_total) || 0;
    const delivery = parseFloat(o.delivery_fee) || 0;
    const profit = parseFloat(o.total_profit) || 0;

    totalReceived += sellFor + delivery;
    totalDelivery += delivery;
    totalProfit += profit;
  });

  return {
    gross: totalReceived,
    totalProfit,
    totalDelivery,
  };
}

module.exports = {
  useSupabase,
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  getOrdersForDate,
  getOrdersForDateRange,
  getOrdersSummary,
  ensureExportsDir,
};
