import { useNavigate } from 'react-router-dom';

export default function OrderTable({ orders }) {
  const navigate = useNavigate();

  const cols = [
    { key: 'order_id', label: 'Order ID' },
    { key: 'delivery_date', label: 'Delivery Date' },
    { key: 'bouquet_name', label: 'Bouquet' },
    { key: 'receiver_name', label: 'Recipient' },
    { key: 'district', label: 'District' },
    { key: 'payment_status', label: 'Customer Payment' },
    { key: 'delivery_status', label: 'Status' },
    { key: 'action_required', label: 'Action Required' },
  ];

  return (
    <div className="table-wrap">
      <table className="order-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.order_id}
              onClick={() => navigate(`/orders/${o.order_id}`)}
              className="clickable"
            >
              {cols.map((c) => (
                <td key={c.key}>{o[c.key] ?? ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
