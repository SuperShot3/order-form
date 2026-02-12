const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const DATA_DIR = path.join(__dirname, '../../data');
const EXCEL_PATH = path.join(DATA_DIR, 'orders.xlsx');
const SHEET_NAME = 'Orders';

// Excel column headers in exact order (as in spec)
const COLUMN_HEADERS = [
  'Order ID',
  'Oder Link',
  'Customer Name',
  'Flower Reciver Name',
  'Phone',
  'Preferred Contact',
  'Delivery Date',
  'Time Window',
  'District',
  'Full Address',
  'Google Maps Link',
  'Bouquet Name',
  'Size',
  'Card Text (LONG)',
  'Total Amount Received',
  'Delivery Fee',
  'Flowers Cost',
  'Total Proft',
  'Customer Payment Status',
  'Customer Payment Confirmed Time',
  'Florist Payment Status',
  'Florist Payment',
  'Driver Assigned',
  'Delivery Status',
  'Priority',
  'Notes',
  'Action Required',
  'Action Required Note',
  'Image Link',
];

// Internal key to Excel column index
const KEY_TO_COL = {
  order_id: 0,
  order_link: 1,
  customer_name: 2,
  receiver_name: 3,
  phone: 4,
  preferred_contact: 5,
  delivery_date: 6,
  time_window: 7,
  district: 8,
  full_address: 9,
  maps_link: 10,
  bouquet_name: 11,
  size: 12,
  card_text: 13,
  items_total: 14,
  delivery_fee: 15,
  flowers_cost: 16,
  total_profit: 17,
  payment_status: 18,
  payment_confirmed_time: 19,
  florist_status: 20,
  florist_payment: 21,
  driver_assigned: 22,
  delivery_status: 23,
  priority: 24,
  notes: 25,
  action_required: 26,
  action_required_note: 27,
  image_link: 28,
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function ensureExportsDir() {
  const exportsDir = path.join(__dirname, '../../exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }
}

async function ensureExcelExists() {
  ensureDataDir();
  if (!fs.existsSync(EXCEL_PATH)) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(SHEET_NAME);
    sheet.addRow(COLUMN_HEADERS);
    await workbook.xlsx.writeFile(EXCEL_PATH);
  }
}

function rowToOrder(row) {
  const order = {};
  Object.keys(KEY_TO_COL).forEach((key) => {
    const idx = KEY_TO_COL[key];
    let val = row[idx];
    if (val !== undefined && val !== null) {
      if (key === 'florist_status') {
        order[key] = val === 1 || val === '1' || val === true ? 1 : 0;
      } else if (typeof val === 'object' && val.result !== undefined) {
        order[key] = val.result;
      } else {
        order[key] = String(val).trim();
      }
    } else {
      order[key] = '';
    }
  });
  return order;
}

function orderToRow(order) {
  const row = new Array(COLUMN_HEADERS.length);
  row.fill('');
  Object.keys(KEY_TO_COL).forEach((key) => {
    const idx = KEY_TO_COL[key];
    let val = order[key];
    if (val !== undefined && val !== null && val !== '') {
      if (key === 'florist_status') {
        row[idx] = val === 1 || val === '1' || val === true ? 1 : 0;
      } else if (typeof val === 'number') {
        row[idx] = val;
      } else {
        row[idx] = String(val);
      }
    }
  });
  return row;
}

function calculateTotalProfit(order) {
  const totalReceived = parseFloat(order.items_total);
  if (isNaN(totalReceived)) return null;
  return totalReceived;
}

async function getOrders(options = {}) {
  await ensureExcelExists();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_PATH);
  const sheet = workbook.getWorksheet(SHEET_NAME);

  let orders = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const values = row.values;
    const arr = values.slice(1); // ExcelJS 1-based, first empty
    orders.push(rowToOrder(arr));
  });

  const { search, payment_status, delivery_status, priority, startDate, endDate } = options || {};

  if (search) {
    const s = String(search).toLowerCase();
    orders = orders.filter((o) =>
      Object.values(o).some((v) => String(v).toLowerCase().includes(s))
    );
  }
  if (payment_status) {
    orders = orders.filter((o) => o.payment_status === payment_status);
  }
  if (delivery_status) {
    orders = orders.filter((o) => o.delivery_status === delivery_status);
  }
  if (priority) {
    orders = orders.filter((o) => o.priority === priority);
  }
  if (startDate) {
    orders = orders.filter((o) => o.delivery_date >= startDate);
  }
  if (endDate) {
    orders = orders.filter((o) => o.delivery_date <= endDate);
  }

  return orders;
}

async function getOrderById(id) {
  const orders = await getOrders();
  return orders.find((o) => o.order_id === id) || null;
}

async function getOrderByRowIndex(id) {
  await ensureExcelExists();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_PATH);
  const sheet = workbook.getWorksheet(SHEET_NAME);

  let rowNum = null;
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    const arr = values.slice(1);
    const order = rowToOrder(arr);
    if (order.order_id === id) rowNum = rowNumber;
  });
  return rowNum;
}

async function createOrder(orderData) {
  await ensureExcelExists();

  const { generateOrderId } = require('../utils/orderId');
  let order = { ...orderData };

  const { getOrderLink } = require('../utils/orderLink');
  if (!order.order_id) {
    order.order_id = await generateOrderId();
  }
  order.order_link = getOrderLink(order.order_id);

  const profit = calculateTotalProfit(order);
  if (profit !== null) order.total_profit = profit;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_PATH);
  const sheet = workbook.getWorksheet(SHEET_NAME);

  sheet.addRow(orderToRow(order));
  await workbook.xlsx.writeFile(EXCEL_PATH);

  return order;
}

async function updateOrder(id, orderData) {
  await ensureExcelExists();

  const rowNum = await getOrderByRowIndex(id);
  if (!rowNum) return null;

  const { getOrderLink } = require('../utils/orderLink');
  const order = { ...orderData, order_id: id };
  order.order_link = getOrderLink(id);
  const profit = calculateTotalProfit(order);
  if (profit !== null) order.total_profit = profit;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_PATH);
  const sheet = workbook.getWorksheet(SHEET_NAME);

  const row = sheet.getRow(rowNum);
  const arr = orderToRow(order);
  arr.forEach((val, i) => {
    row.getCell(i + 1).value = val;
  });
  await workbook.xlsx.writeFile(EXCEL_PATH);

  return order;
}

function getOrdersForDate(date) {
  return getOrders({ startDate: date, endDate: date });
}

function getOrdersForDateRange(startDate, endDate) {
  return getOrders({ startDate, endDate });
}

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  getOrdersForDate,
  getOrdersForDateRange,
  ensureExcelExists,
  ensureDataDir,
  ensureExportsDir,
  rowToOrder,
  orderToRow,
  calculateTotalProfit,
  COLUMN_HEADERS,
  KEY_TO_COL,
};
