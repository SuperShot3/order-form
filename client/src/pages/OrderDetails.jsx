import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderForm from '../components/OrderForm';
import { getOrder, updateOrder } from '../api/orders';
import { floristPdfUrl } from '../api/reports';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOrder(id)
      .then(setOrder)
      .catch((e) => {
        alert(e.message);
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await updateOrder(order.order_id, order);
      setOrder((prev) => ({ ...prev }));
      alert('Saved');
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateMessages = () => {
    navigate('/messages', { state: { orderId: id } });
  };

  const handleFloristPdf = () => {
    window.open(floristPdfUrl(id), '_blank');
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return null;

  return (
    <div>
      <h1>Order {order.order_id}</h1>
      <OrderForm order={order} onChange={setOrder} />
      <div className="form-actions">
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={handleGenerateMessages}>Generate Messages</button>
        <button onClick={handleFloristPdf}>Generate Florist PDF</button>
      </div>
    </div>
  );
}
