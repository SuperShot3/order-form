const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const EXCEL_PATH = path.join(__dirname, '../../data/orders.xlsx');
const SHEET_NAME = 'Orders';

async function generateOrderId() {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  let max = 0;

  if (fs.existsSync(EXCEL_PATH)) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EXCEL_PATH);
    const sheet = workbook.getWorksheet(SHEET_NAME);
    if (sheet) {
      sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return;
        const vals = row.values;
        const orderId = vals ? String(vals[1] || '').trim() : '';
        const parts = orderId.split('-');
        if (parts[0] === today && parts[1]) {
          const n = parseInt(parts[1], 10);
          if (!isNaN(n) && n > max) max = n;
        }
      });
    }
  }

  const next = String(max + 1).padStart(3, '0');
  return `${today}-${next}`;
}

module.exports = { generateOrderId };
