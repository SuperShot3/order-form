const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

const ordersService = require('./ordersService');

const EXPORTS_DIR = path.join(__dirname, '../../exports');
const EXCEL_PATH = path.join(__dirname, '../../data/orders.xlsx');
const SHEET_NAME = 'Orders';

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function getLogoDataUrl() {
  const paths = [
    path.join(__dirname, '../../public/logo.png'),
    path.join(__dirname, '../../client/dist/logo.png'),
    path.join(__dirname, '../../client/public/logo.png'),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      const buf = fs.readFileSync(p);
      return `data:image/png;base64,${buf.toString('base64')}`;
    }
  }
  return null;
}

async function generateFloristPDF(orderId) {
  const order = await ordersService.getOrderById(orderId);
  if (!order) return null;

  ordersService.ensureExportsDir();

  const mapsUrl = order.maps_link || order.order_link || 'https://maps.google.com';
  const qrMapsUrl = await QRCode.toDataURL(mapsUrl, { width: 120, margin: 1 });
  const qrFlowerUrl = order.image_link
    ? await QRCode.toDataURL(order.image_link, { width: 120, margin: 1 })
    : null;

  const cardText = (order.card_text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
  const notes = (order.notes || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
  const fullAddress = escapeHtml(order.full_address || '');
  const logoDataUrl = await getLogoDataUrl();

  const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'Sarabun', sans-serif; }
    body { padding: 20px; max-width: 420px; font-size: 14px; }
    .logo { max-height: 48px; margin-bottom: 12px; }
    h1 { font-size: 18px; margin: 0 0 16px 0; font-weight: 700; }
    .row { margin: 10px 0; }
    .label { font-weight: 600; color: #333; }
    .value { margin-top: 2px; }
    .value a { color: #2563eb; text-decoration: none; }
    .value a:hover { text-decoration: underline; }
    .card-text, .notes { white-space: pre-wrap; background: #f8f8f8; padding: 12px; border-radius: 4px; margin-top: 4px; }
    .qr-row { display: flex; gap: 16px; margin-top: 16px; justify-content: center; flex-wrap: wrap; }
    .qr-box { text-align: center; }
    .qr-label { font-size: 12px; color: #666; margin-bottom: 4px; }
    .qr-box img { display: block; margin: 0 auto; }
  </style>
</head>
<body>
  ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Logo" class="logo"/>` : ''}
  <h1>Order: ${escapeHtml(order.order_id || '')}</h1>
  <div class="row"><span class="label">วันที่จัดส่ง / Delivery Date:</span><div class="value">${escapeHtml(order.delivery_date || '')}</div></div>
  <div class="row"><span class="label">ช่วงเวลาจัดส่ง / Delivery Window:</span><div class="value">${escapeHtml(order.time_window || '')}</div></div>
  <div class="row"><span class="label">แขวง / District:</span><div class="value">${escapeHtml(order.district || '')}</div></div>
  <div class="row"><span class="label">ที่อยู่จัดส่ง / Delivery Address:</span><div class="value">${fullAddress}${mapsUrl ? `<br/><a href="${escapeHtml(mapsUrl)}" target="_blank">เปิด Google Maps / Open in Google Maps</a>` : ''}</div></div>
  <div class="row"><span class="label">ช่อดอกไม้ / Bouquet:</span><div class="value">${escapeHtml(order.bouquet_name || '')} ${escapeHtml(order.size || '')}</div></div>
  <div class="row"><span class="label">ผู้รับ / Recipient:</span><div class="value">${escapeHtml(order.receiver_name || '')}</div></div>
  <div class="row"><span class="label">ข้อความการ์ด / Card Text:</span><div class="card-text">${cardText || '(none)'}</div></div>
  <div class="row"><span class="label">ผู้สั่ง / Customer:</span><div class="value">${escapeHtml(order.customer_name || '')}</div></div>
  <div class="row"><span class="label">เบอร์โทร / Phone:</span><div class="value">${escapeHtml(order.phone || '')}</div></div>
  <div class="row"><span class="label">ช่องทางติดต่อ / Preferred Contact:</span><div class="value">${escapeHtml(order.preferred_contact || '')}</div></div>
  <div class="row"><span class="label">ยืนยันการชำระเงิน / Payment Confirmed:</span><div class="value">${escapeHtml(order.payment_confirmed_time || '-')}</div></div>
  <div class="row"><span class="label">Action Required:</span><div class="value">${escapeHtml(order.action_required || 'No')}${order.action_required_note ? ` — ${escapeHtml(order.action_required_note)}` : ''}</div></div>
  <div class="row"><span class="label">หมายเหตุ / Notes:</span><div class="notes">${notes || '(none)'}</div></div>
  <div class="qr-row">
    <div class="qr-box"><p class="qr-label">QR ไปยัง Google Maps</p><img src="${qrMapsUrl}" alt="QR Map" width="120" height="120"/></div>
    ${qrFlowerUrl ? `<div class="qr-box"><p class="qr-label">QR รูปดอกไม้</p><img src="${qrFlowerUrl}" alt="QR Flower" width="120" height="120"/></div>` : ''}
  </div>
</body>
</html>
`;

  const launchOpts = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const browser = await puppeteer.launch(launchOpts);
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
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
  await ordersService.ensureExcelExists();
  const orders = await ordersService.getOrdersForDate(date);

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
  await ordersService.ensureExcelExists();
  const orders = await ordersService.getOrdersForDateRange(startDate || '1900-01-01', endDate || '9999-12-31');

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Finance', {
    headerFooter: { firstHeader: 'Finance Report', firstFooter: 'Order Desk' },
  });

  const financeCols = [
    'Order ID',
    'Delivery Date',
    'Customer Name',
    'Order Total Amount',
    'Delivery Fee',
    'Flowers Cost',
    'Total Profit',
    'Customer Payment Status',
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

async function generateAllOrdersExcel() {
  const orders = await ordersService.getOrders({});
  const excelService = require('./excelService');

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Orders', {
    headerFooter: { firstHeader: 'Orders Export', firstFooter: 'Order Desk' },
  });

  sheet.addRow(excelService.COLUMN_HEADERS);
  sheet.getRow(1).font = { bold: true };

  orders.forEach((o) => {
    sheet.addRow(excelService.orderToRow(o));
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const outPath = path.join(EXPORTS_DIR, `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  fs.writeFileSync(outPath, Buffer.from(buffer));
  return buffer;
}

module.exports = {
  generateFloristPDF,
  generateDriverExcel,
  generateFinanceExcel,
  generateAllOrdersExcel,
};
