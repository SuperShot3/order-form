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

module.exports = {
  useSupabase,
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  getOrdersForDate,
  getOrdersForDateRange,
  ensureExportsDir,
};
