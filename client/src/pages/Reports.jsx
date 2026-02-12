import { useState, useEffect } from 'react';
import { getOrders } from '../api/orders';
import { floristPdfUrl, driverExcelUrl, financeExcelUrl, allOrdersExcelUrl } from '../api/reports';

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [driverDate, setDriverDate] = useState(new Date().toISOString().split('T')[0]);
  const [financeStart, setFinanceStart] = useState('');
  const [financeEnd, setFinanceEnd] = useState('');

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  const handleFloristPdf = () => {
    if (!selectedOrderId) {
      alert('Select an order');
      return;
    }
    window.open(floristPdfUrl(selectedOrderId), '_blank');
  };

  const handleDriverExcel = () => {
    window.open(driverExcelUrl(driverDate), '_blank');
  };

  const handleFinanceExcel = () => {
    window.open(financeExcelUrl(financeStart, financeEnd), '_blank');
  };

  const handleAllOrdersExcel = () => {
    window.open(allOrdersExcelUrl(), '_blank');
  };

  return (
    <div>
      <h1>Reports</h1>
      <div className="reports-layout">
        <div className="report-card">
          <h3>Florist PDF</h3>
          <p>Single order PDF for florist (bouquet details, card text, QR map).</p>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
          >
            <option value="">Select order</option>
            {orders.map((o) => (
              <option key={o.order_id} value={o.order_id}>
                {o.order_id} - {o.bouquet_name || ''}
              </option>
            ))}
          </select>
          <button onClick={handleFloristPdf} disabled={!selectedOrderId}>
            Download Florist PDF
          </button>
        </div>

        <div className="report-card">
          <h3>Driver Excel</h3>
          <p>Daily delivery list for drivers.</p>
          <input
            type="date"
            value={driverDate}
            onChange={(e) => setDriverDate(e.target.value)}
          />
          <button onClick={handleDriverExcel}>Download Driver Excel</button>
        </div>

        <div className="report-card">
          <h3>Finance Excel</h3>
          <p>Financial report for date range.</p>
          <input
            type="date"
            value={financeStart}
            onChange={(e) => setFinanceStart(e.target.value)}
            placeholder="Start date"
          />
          <input
            type="date"
            value={financeEnd}
            onChange={(e) => setFinanceEnd(e.target.value)}
            placeholder="End date"
          />
          <button onClick={handleFinanceExcel}>Download Finance Excel</button>
        </div>

        <div className="report-card">
          <h3>Export All Orders</h3>
          <p>Full Excel export of all orders (backup).</p>
          <button onClick={handleAllOrdersExcel}>Download All Orders Excel</button>
        </div>
      </div>
    </div>
  );
}
