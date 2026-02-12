import { useState, useEffect } from 'react';
import { getOrders } from '../api/orders';
import OrderTable from '../components/OrderTable';
import { PAYMENT_STATUS, DELIVERY_STATUS, PRIORITY } from '../utils/enums';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (paymentStatus) params.payment_status = paymentStatus;
    if (deliveryStatus) params.delivery_status = deliveryStatus;
    if (priority) params.priority = priority;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    getOrders(params)
      .then(setOrders)
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1>Orders</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="">All Payment</option>
          {PAYMENT_STATUS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)}>
          <option value="">All Status</option>
          {DELIVERY_STATUS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priority</option>
          {PRIORITY.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="From"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="To"
        />
        <button onClick={load}>Filter</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <OrderTable orders={orders} />
      )}
    </div>
  );
}
