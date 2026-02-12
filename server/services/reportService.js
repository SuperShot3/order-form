const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

const excelService = require('./excelService');

const EXPORTS_DIR = path.join(__dirname, '../../exports');
const EXCEL_PATH = path.join(__dirname, '../../data/orders.xlsx');
const SHEET_NAME = 'Orders';

async function generateFloristPDF(orderId) {
  const order = await excelService.getOrderById(orderId);
  if (!order) return null;

  excelService.ensureExportsDir();

  const qrUrl = order.maps_link || order.order_link || 'https://example.com';
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 150, margin: 1 });

  const cardText = (order.card_text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
  const notes = (order.notes || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; max-width: 400px; }
    h1 { font-size: 18px; margin-bottom: 16px; }
    .row { margin: 8px 0; }
    .label { font-weight: bold; color: #444; }
    .value { margin-top: 2px; }
    .card-text, .notes { white-space: pre-wrap; background: #f8f8f8; padding: 12px; border-radius: 4px; margin-top: 4px; }
    .qr { margin-top: 16px; text-align: center; }
    img { display: block; margin: 0 auto; }
  </style>
</head>
<body>
  <h1>Order: ${(order.order_id || '').replace(/</g, '&lt;')}</h1>
  <div class="row"><span class="label">Delivery Date:</span><div class="value">${(order.delivery_date || '').replace(/</g, '&lt;')} ${(order.time_window || '').replace(/</g, '&lt;')}</div></div>
  <div class="row"><span class="label">District:</span><div class="value">${(order.district || '').replace(/</g, '&lt;')}</div></div>
  <div class="row"><span class="label">Bouquet:</span><div class="value">${(order.bouquet_name || '').replace(/</g, '&lt;')} ${(order.size || '').replace(/</g, '&lt;')}</div></div>
  <div class="row"><span class="label">Card Text:</span><div class="card-text">${cardText || '(none)'}</div></div>
  <div class="row"><span class="label">Notes:</span><div class="notes">${notes || '(none)'}</div></div>
  <div class="qr"><img src="${qrDataUrl}" alt="QR" width="150" height="150"/></div>
</body>
</html>
`;

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });
    const outPath = path.join(EXPORTS_DIR, `florist_${orderId}.pdf`);
    fs.writeFileSync(outPath, pdfBuffer);
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

async function generateDriverExcel(date) {
  await excelService.ensureExcelExists();
  const orders = await excelService.getOrdersForDate(date);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Driver', {
    headerFooter: { firstHeader: 'Driver List', firstFooter: 'Order Desk' },
  });

  const driverCols = [
    'Order ID',
    'Delivery Date',
    'Time Window',
    'District',
    'Full Address',
    'Google Maps Link',
    'Bouquet Name',
    'Size',
    'Recipient Name',
    'Notes',
  ];

  sheet.addRow(driverCols);
  sheet.getRow(1).font = { bold: true };

  orders.forEach((o) => {
    sheet.addRow([
      o.order_id,
      o.delivery_date,
      o.time_window,
      o.district,
      o.full_address,
      o.maps_link,
      o.bouquet_name,
      o.size,
      o.receiver_name,
      o.notes,
    ]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const outPath = path.join(EXPORTS_DIR, `driver_${date}.xlsx`);
  fs.writeFileSync(outPath, Buffer.from(buffer));
  return buffer;
}

async function generateFinanceExcel(startDate, endDate) {
  await excelService.ensureExcelExists();
  const orders = await excelService.getOrdersForDateRange(startDate || '1900-01-01', endDate || '9999-12-31');

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Finance', {
    headerFooter: { firstHeader: 'Finance Report', firstFooter: 'Order Desk' },
  });

  const financeCols = [
    'Order ID',
    'Delivery Date',
    'Customer Name',
    'Items Total',
    'Delivery Fee',
    'Flowers Cost',
    'Total Profit',
    'Payment Status',
  ];

  sheet.addRow(financeCols);
  sheet.getRow(1).font = { bold: true };

  orders.forEach((o) => {
    sheet.addRow([
      o.order_id,
      o.delivery_date,
      o.customer_name,
      o.items_total,
      o.delivery_fee,
      o.flowers_cost,
      o.total_profit,
      o.payment_status,
    ]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const range = `${startDate || 'all'}_${endDate || 'all'}`.replace(/\//g, '-');
  const outPath = path.join(EXPORTS_DIR, `finance_${range}.xlsx`);
  fs.writeFileSync(outPath, Buffer.from(buffer));
  return buffer;
}

module.exports = {
  generateFloristPDF,
  generateDriverExcel,
  generateFinanceExcel,
};
