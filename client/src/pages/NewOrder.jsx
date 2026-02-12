import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../components/OrderForm';
import { parseOrder } from '../api/parse';
import { createOrder } from '../api/orders';

const EMPTY_ORDER = {
  order_id: '',
  order_link: '',
  customer_name: '',
  receiver_name: '',
  phone: '',
  preferred_contact: '',
  delivery_date: '',
  time_window: '',
  district: '',
  full_address: '',
  maps_link: '',
  bouquet_name: '',
  size: '',
  card_text: '',
  items_total: '',
  delivery_fee: '',
  flowers_cost: '',
  total_profit: '',
  payment_status: 'NEW',
  payment_confirmed_time: '',
  florist_status: 0,
  florist_payment: '',
  driver_assigned: '',
  delivery_status: 'PREPARING',
  priority: 'Normal',
  notes: '',
};

export default function NewOrder() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(EMPTY_ORDER);
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setParsing(true);
    try {
      const { extracted, missing_fields } = await parseOrder(rawText);
      setOrder((prev) => {
        const next = { ...prev };
        Object.keys(extracted).forEach((k) => {
          if (extracted[k] !== undefined && extracted[k] !== null) {
            next[k] = extracted[k];
          }
        });
        return next;
      });
      if (missing_fields?.length) {
        alert(`Missing fields: ${missing_fields.join(', ')}`);
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const created = await createOrder(order);
      navigate(`/orders/${created.order_id}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>New Order</h1>
      <div className="parse-section">
        <label>Paste raw order text:</label>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste order message here..."
          rows={6}
          className="raw-textarea"
        />
        <button onClick={handleParse} disabled={parsing}>
          {parsing ? 'Parsing...' : 'Parse'}
        </button>
      </div>
      <hr />
      <OrderForm order={order} onChange={setOrder} />
      <div className="form-actions">
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Order'}
        </button>
      </div>
    </div>
  );
}
