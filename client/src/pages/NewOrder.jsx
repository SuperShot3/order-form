import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../components/OrderForm';
import { parseOrder, getParseStatus } from '../api/parse';
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
  image_link: '',
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
  action_required: 'No',
  action_required_note: '',
};

const AUTO_PARSE_DEBOUNCE_MS = 800;

export default function NewOrder() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(EMPTY_ORDER);
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const autoParseTimer = useRef(null);

  useEffect(() => {
    getParseStatus().then((r) => setAiAvailable(r.aiAvailable)).catch(() => setAiAvailable(false));
  }, []);

  const handleParse = useCallback(async () => {
    if (!rawText.trim()) return;
    setParsing(true);
    try {
      const { extracted, missing_fields, ai_used, ai_failed } = await parseOrder(rawText);
      setOrder((prev) => {
        const next = { ...prev };
        Object.keys(extracted || {}).forEach((k) => {
          if (extracted[k] !== undefined && extracted[k] !== null) {
            next[k] = extracted[k];
          }
        });
        return next;
      });
      if (ai_failed) {
        alert('AI parsing failed (check OPENAI_API_KEY and connection). Used local extraction.');
      }
      if (missing_fields?.length) {
        alert(`Missing fields: ${missing_fields.join(', ')}`);
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setParsing(false);
    }
  }, [rawText]);

  useEffect(() => {
    if (!aiAvailable || !rawText.trim() || rawText.trim().length < 20) return;
    if (autoParseTimer.current) clearTimeout(autoParseTimer.current);
    autoParseTimer.current = setTimeout(handleParse, AUTO_PARSE_DEBOUNCE_MS);
    return () => { if (autoParseTimer.current) clearTimeout(autoParseTimer.current); };
  }, [rawText, aiAvailable, handleParse]);

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
        <label>
          Paste raw order text
          {aiAvailable && <span className="parse-ai-badge">AI auto-fill</span>}
        </label>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={aiAvailable
            ? 'Paste order message… AI will automatically fill the form below'
            : 'Paste order message here…'}
          rows={6}
          className="raw-textarea"
        />
        <button onClick={handleParse} disabled={parsing}>
          {parsing ? 'Parsing...' : aiAvailable ? 'Parse with AI' : 'Parse'}
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
