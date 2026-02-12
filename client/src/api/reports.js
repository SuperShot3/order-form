const API = '/api';

export function floristPdfUrl(orderId) {
  return `${API}/reports/florist/${orderId}.pdf`;
}

export function driverExcelUrl(date) {
  return `${API}/reports/driver?date=${encodeURIComponent(date)}`;
}

export function financeExcelUrl(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  return `${API}/reports/finance?${params.toString()}`;
}

export function allOrdersExcelUrl() {
  return `${API}/reports/all-orders`;
}
