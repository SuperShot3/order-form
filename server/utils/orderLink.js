const ORDER_LINK_BASE = process.env.ORDER_LINK_BASE || 'https://www.lannabloom.shop/order/';

function getOrderLink(orderId) {
  if (!orderId || !String(orderId).trim()) return '';
  return ORDER_LINK_BASE + String(orderId).trim();
}

module.exports = { getOrderLink, ORDER_LINK_BASE };
