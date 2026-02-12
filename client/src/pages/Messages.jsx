import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getOrder, getOrders } from '../api/orders';

const EMPTY_ORDER = {
  order_id: '',
  bouquet_name: '',
  size: '',
  card_text: '',
  delivery_date: '',
  time_window: '',
  full_address: '',
  maps_link: '',
  receiver_name: '',
  phone: '',
  preferred_contact: '',
  items_total: '',
  delivery_fee: '',
  customer_name: '',
};

function templateConfirmation(order) {
  return `Hi! Thank you for your order. Here are the details for your confirmation:

💐 Bouquet: ${order.bouquet_name || ''} — ${order.size || ''} size
📝 Card message: "${order.card_text || ''}"
📅 Delivery date: ${order.delivery_date || ''}
⏰ Delivery time: ${order.time_window || ''}
📍 Delivery address: ${order.full_address || ''}
${order.maps_link ? `Map link: ${order.maps_link}` : ''}
👤 Recipient: ${order.receiver_name || ''}
☎️ Contact: ${order.phone || ''} (${order.preferred_contact || ''})
💰 Sell Flowers For: ${order.items_total ?? ''} THB
🚚 Delivery fee: ${order.delivery_fee ?? '0'} THB
💵 Total Amount Received: ${(parseFloat(order.items_total) || 0) + (parseFloat(order.delivery_fee) || 0)} THB

Please confirm if everything is correct.`;
}

function templatePaymentRequest(order) {
  const total = (parseFloat(order.items_total) || 0) + (parseFloat(order.delivery_fee) || 0);
  return `Hi! Your order is confirmed. Please complete payment:

Order ID: ${order.order_id || ''}
💐 Bouquet: ${order.bouquet_name || ''} — ${order.size || ''}
📅 Delivery: ${order.delivery_date || ''} ${order.time_window || ''}
📍 Delivery to: ${order.full_address || ''}
👤 Recipient: ${order.receiver_name || ''}

Sell Flowers For: ${order.items_total ?? ''} THB
Delivery fee: ${order.delivery_fee ?? '0'} THB
Total Amount Received: ${total} THB

Please confirm payment once completed.`;
}

function templateMissingInfo(order, missingFields) {
  return `Hi! Thank you for your order. We need a few more details:

📋 Missing information:
${(missingFields || []).map((f) => `- ${f}`).join('\n')}

Please provide the above so we can process your order.`;
}

export default function Messages() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(location.state?.orderId || '');
  const [order, setOrder] = useState(EMPTY_ORDER);
  const [copied, setCopied] = useState(null);
  const [missingFields, setMissingFields] = useState([]);

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  useEffect(() => {
    if (selectedId) {
      getOrder(selectedId).then((o) => {
        setOrder(o);
      });
    } else {
      setOrder(EMPTY_ORDER);
    }
  }, [selectedId]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const conf = templateConfirmation(order);
  const payReq = templatePaymentRequest(order);
  const missingInfo = templateMissingInfo(order, missingFields);

  const canPaymentRequest = order.items_total !== '' && order.items_total != null && (order.delivery_fee !== '' && order.delivery_fee != null || order.delivery_fee === 0);

  return (
    <div>
      <h1>Messages</h1>
      <div className="messages-layout">
        <div className="order-selector">
          <label>Select order:</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">-- Select --</option>
            {orders.map((o) => (
              <option key={o.order_id} value={o.order_id}>
                {o.order_id} - {o.bouquet_name || '(no bouquet)'}
              </option>
            ))}
          </select>
        </div>

        <div className="template-section">
          <h3>1. Confirmation Request (EN)</h3>
          <pre className="template-preview">{conf}</pre>
          <button onClick={() => copyToClipboard(conf, 'conf')}>
            {copied === 'conf' ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="template-section">
          <h3>2. Payment Request (EN)</h3>
          {!canPaymentRequest && (
            <p className="warning">Requires Sell Flowers For and delivery fee (or 0)</p>
          )}
          <pre className="template-preview">{payReq}</pre>
          <button onClick={() => copyToClipboard(payReq, 'pay')} disabled={!canPaymentRequest}>
            {copied === 'pay' ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="template-section">
          <h3>3. Missing Info Request (EN)</h3>
          <input
            type="text"
            placeholder="Comma-separated missing fields (e.g. maps_link, receiver_name)"
            value={missingFields.join(', ')}
            onChange={(e) =>
              setMissingFields(
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />
          <pre className="template-preview">{missingInfo}</pre>
          <button onClick={() => copyToClipboard(missingInfo, 'missing')}>
            {copied === 'missing' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
