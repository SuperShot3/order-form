import { useState, useEffect } from 'react';
import ValidationField from './ValidationField';
import { PREFERRED_CONTACT, PAYMENT_STATUS, DELIVERY_STATUS, PRIORITY } from '../utils/enums';
import { getSettings } from '../api/settings';

const FIELD_LABELS = {
  order_id: 'Order ID',
  order_link: 'Order Link',
  customer_name: 'Customer Name',
  receiver_name: 'Recipient Name',
  phone: 'Phone',
  preferred_contact: 'Preferred Contact',
  delivery_date: 'Delivery Date',
  time_window: 'Time Window',
  district: 'District',
  full_address: 'Full Address',
  maps_link: 'Google Maps Link',
  bouquet_name: 'Bouquet Name',
  size: 'Size',
  image_link: 'Image Link',
  card_text: 'Card Text',
  items_total: 'Items Total',
  delivery_fee: 'Delivery Fee',
  flowers_cost: 'Flowers Cost',
  total_profit: 'Total Profit',
  payment_status: 'Payment Status',
  payment_confirmed_time: 'Payment Confirmed Time',
  florist_status: 'Florist Status',
  florist_payment: 'Florist Payment',
  driver_assigned: 'Driver Assigned',
  delivery_status: 'Delivery Status',
  priority: 'Priority',
  notes: 'Notes',
};

const DEFAULT_REQUIRED = [
  'bouquet_name', 'size', 'card_text', 'delivery_date', 'time_window',
  'district', 'full_address', 'maps_link', 'receiver_name', 'phone',
  'preferred_contact', 'items_total',
];

/** For datetime-local input: expects YYYY-MM-DDTHH:mm */
function toDateTimeLocal(val) {
  if (!val) return '';
  const s = String(val).replace(' ', 'T').slice(0, 16);
  return s;
}

export default function OrderForm({ order, onChange, readOnly = false }) {
  const [data, setData] = useState(order || {});
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => setSettings({ required_fields: DEFAULT_REQUIRED }));
  }, []);

  useEffect(() => {
    setData(order || {});
  }, [order]);

  const requiredFields = settings?.required_fields || DEFAULT_REQUIRED;
  const districtOptions = settings?.district_options || [];
  const timeWindowOptions = settings?.time_window_options || [];
  const sizeOptions = settings?.size_options || ['S', 'M', 'L', 'XL'];

  const update = (key, value) => {
    const next = { ...data, [key]: value };
    setData(next);
    onChange?.(next);
  };

  const isRequired = (key) => requiredFields.includes(key);

  return (
    <div className="order-form">
      <div className="form-grid">
        <ValidationField label={FIELD_LABELS.order_id} value={data.order_id} required={false} fieldKey="order_id">
          <input
            type="text"
            value={data.order_id || ''}
            onChange={(e) => update('order_id', e.target.value)}
            readOnly={readOnly}
            placeholder="Auto-generated if empty"
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.order_link} value={data.order_link} required={false} fieldKey="order_link">
          <input
            type="text"
            value={data.order_link || ''}
            onChange={(e) => update('order_link', e.target.value)}
            readOnly={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.customer_name} value={data.customer_name} required={false} fieldKey="customer_name">
          <input
            type="text"
            value={data.customer_name || ''}
            onChange={(e) => update('customer_name', e.target.value)}
            readOnly={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.receiver_name} value={data.receiver_name} required={isRequired('receiver_name')} fieldKey="receiver_name">
          <input
            type="text"
            value={data.receiver_name || ''}
            onChange={(e) => update('receiver_name', e.target.value)}
            readOnly={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.phone} value={data.phone} required={isRequired('phone')} fieldKey="phone">
          <input
            type="text"
            value={data.phone || ''}
            onChange={(e) => update('phone', e.target.value)}
            readOnly={readOnly}
            placeholder="+66 or digits"
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.preferred_contact} value={data.preferred_contact} required={isRequired('preferred_contact')} fieldKey="preferred_contact">
          <select
            value={data.preferred_contact || ''}
            onChange={(e) => update('preferred_contact', e.target.value)}
            disabled={readOnly}
          >
            <option value="">Select</option>
            {PREFERRED_CONTACT.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </ValidationField>

        <ValidationField label={FIELD_LABELS.delivery_date} value={data.delivery_date} required={isRequired('delivery_date')} fieldKey="delivery_date">
          <input
            type="date"
            value={data.delivery_date || ''}
            onChange={(e) => update('delivery_date', e.target.value)}
            readOnly={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.time_window} value={data.time_window} required={isRequired('time_window')} fieldKey="time_window">
          <select
            value={data.time_window || ''}
            onChange={(e) => update('time_window', e.target.value)}
            disabled={readOnly}
          >
            <option value="">Select</option>
            {timeWindowOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </ValidationField>

        <ValidationField label={FIELD_LABELS.district} value={data.district} required={isRequired('district')} fieldKey="district">
          <select
            value={data.district || ''}
            onChange={(e) => update('district', e.target.value)}
            disabled={readOnly}
          >
            <option value="">Select</option>
            {districtOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </ValidationField>

        <ValidationField label={FIELD_LABELS.full_address} value={data.full_address} required={isRequired('full_address')} fieldKey="full_address" className="span-full">
          <input
            type="text"
            value={data.full_address || ''}
            onChange={(e) => update('full_address', e.target.value)}
            readOnly={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.maps_link} value={data.maps_link} required={isRequired('maps_link')} fieldKey="maps_link" className="span-full">
          <input
            type="text"
            value={data.maps_link || ''}
            onChange={(e) => update('maps_link', e.target.value)}
            readOnly={readOnly}
            placeholder="maps.app.goo.gl or google.com/maps"
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.bouquet_name} value={data.bouquet_name} required={isRequired('bouquet_name')} fieldKey="bouquet_name">
          <input
            type="text"
            value={data.bouquet_name || ''}
            onChange={(e) => update('bouquet_name', e.target.value)}
            readOnly={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.size} value={data.size} required={isRequired('size')} fieldKey="size">
          <select
            value={data.size || ''}
            onChange={(e) => update('size', e.target.value)}
            disabled={readOnly}
          >
            <option value="">Select</option>
            {sizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </ValidationField>

        <ValidationField label={FIELD_LABELS.image_link} value={data.image_link} required={false} fieldKey="image_link" className="span-full">
          <input
            type="url"
            value={data.image_link || ''}
            onChange={(e) => update('image_link', e.target.value)}
            readOnly={readOnly}
            placeholder="https://... (flower image – QR in florist PDF)"
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.card_text} value={data.card_text} required={isRequired('card_text')} fieldKey="card_text" className="span-full">
          <textarea
            value={data.card_text || ''}
            onChange={(e) => update('card_text', e.target.value)}
            readOnly={readOnly}
            rows={4}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.items_total} value={data.items_total} required={isRequired('items_total')} fieldKey="items_total">
          <input
            type="number"
            min={0}
            step={0.01}
            value={data.items_total ?? ''}
            onChange={(e) => update('items_total', e.target.value === '' ? '' : parseFloat(e.target.value))}
            readOnly={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.delivery_fee} value={data.delivery_fee} required={false} fieldKey="delivery_fee">
          <input
            type="number"
            min={0}
            step={0.01}
            value={data.delivery_fee ?? ''}
            onChange={(e) => update('delivery_fee', e.target.value === '' ? '' : parseFloat(e.target.value))}
            readOnly={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.flowers_cost} value={data.flowers_cost} required={false} fieldKey="flowers_cost">
          <input
            type="number"
            min={0}
            step={0.01}
            value={data.flowers_cost ?? ''}
            onChange={(e) => update('flowers_cost', e.target.value === '' ? '' : parseFloat(e.target.value))}
            readOnly={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.total_profit} value={data.total_profit} required={false} fieldKey="total_profit">
          <input
            type="text"
            value={data.total_profit ?? ''}
            readOnly
            placeholder="Auto-calculated"
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.payment_status} value={data.payment_status} required={false} fieldKey="payment_status">
          <select
            value={data.payment_status || ''}
            onChange={(e) => update('payment_status', e.target.value)}
            disabled={readOnly}
          >
            <option value="">Select</option>
            {PAYMENT_STATUS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </ValidationField>

        <ValidationField label={FIELD_LABELS.payment_confirmed_time} value={data.payment_confirmed_time} required={false} fieldKey="payment_confirmed_time">
          <input
            type="datetime-local"
            value={toDateTimeLocal(data.payment_confirmed_time)}
            onChange={(e) => update('payment_confirmed_time', e.target.value ? e.target.value.replace('T', ' ').slice(0, 16) : '')}
            readOnly={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.florist_status} value={data.florist_status} required={false} fieldKey="florist_status">
          <input
            type="checkbox"
            checked={data.florist_status === 1 || data.florist_status === '1'}
            onChange={(e) => update('florist_status', e.target.checked ? 1 : 0)}
            disabled={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.florist_payment} value={data.florist_payment} required={false} fieldKey="florist_payment">
          <input
            type="number"
            min={0}
            step={0.01}
            value={data.florist_payment ?? ''}
            onChange={(e) => update('florist_payment', e.target.value === '' ? '' : parseFloat(e.target.value))}
            readOnly={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.driver_assigned} value={data.driver_assigned} required={false} fieldKey="driver_assigned">
          <input
            type="text"
            value={data.driver_assigned || ''}
            onChange={(e) => update('driver_assigned', e.target.value)}
            readOnly={readOnly}
          />
        </ValidationField>

        <ValidationField label={FIELD_LABELS.delivery_status} value={data.delivery_status} required={false} fieldKey="delivery_status">
          <select
            value={data.delivery_status || ''}
            onChange={(e) => update('delivery_status', e.target.value)}
            disabled={readOnly}
          >
            <option value="">Select</option>
            {DELIVERY_STATUS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </ValidationField>

        <ValidationField label={FIELD_LABELS.priority} value={data.priority} required={false} fieldKey="priority">
          <select
            value={data.priority || ''}
            onChange={(e) => update('priority', e.target.value)}
            disabled={readOnly}
          >
            <option value="">Select</option>
            {PRIORITY.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </ValidationField>

        <ValidationField label={FIELD_LABELS.notes} value={data.notes} required={false} fieldKey="notes" className="span-full">
          <textarea
            value={data.notes || ''}
            onChange={(e) => update('notes', e.target.value)}
            readOnly={readOnly}
            rows={2}
          />
        </ValidationField>
      </div>
    </div>
  );
}
