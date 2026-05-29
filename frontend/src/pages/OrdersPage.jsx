import React, { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../services/api';
import Layout from '../components/layout/Layout';

const STATUS_BADGE = {
  PENDING: 'badge-amber', CONFIRMED: 'badge-blue', PROCESSING: 'badge-blue',
  SHIPPED: 'badge-blue', DELIVERED: 'badge-green', CANCELLED: 'badge-red', REFUNDED: 'badge-muted',
};

const TIMELINE = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await orderAPI.getMyOrders({ page, size: 10 });
        setOrders(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      } catch {
        setOrders(DEMO_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res = await orderAPI.cancel(id);
      setOrders(prev => prev.map(o => o.id === id ? res.data : o));
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    }
  };

  const getTimelineIdx = (status) => TIMELINE.indexOf(status);

  return (
    <Layout title="My Orders">
      {loading ? (
        <div>{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 72, marginBottom: 10, borderRadius: 12 }} />)}</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Package size={48} strokeWidth={1} /></div>
          <p className="empty-title">No orders yet</p>
          <p className="empty-sub">Place your first order to see it here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const isExpanded = expanded === order.id;
            const tlIdx = getTimelineIdx(order.status);

            return (
              <div key={order.id} className="card anim-fade-up" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Order header */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer' }}
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={20} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Order #{order.id}</span>
                      <span className={`badge ${STATUS_BADGE[order.status] || 'badge-muted'}`}>{order.status}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {order.items?.length || 0} items ·&nbsp;
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
                    {/* Timeline */}
                    {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                      <div className="order-timeline" style={{ marginBottom: 20 }}>
                        {TIMELINE.map((step, i) => (
                          <div key={step} className={`timeline-step ${i <= tlIdx ? (i === tlIdx ? 'active' : 'done') : ''}`}>
                            <div className="timeline-dot">
                              {i < tlIdx ? '✓' : i === tlIdx ? '●' : ''}
                            </div>
                            <p className="timeline-label">{step.charAt(0) + step.slice(1).toLowerCase()}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Items */}
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Items</p>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 14 }}>{item.productName}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{item.priceAtPurchase?.toLocaleString('en-IN')}</p>
                        </div>
                        <p style={{ fontWeight: 600 }}>₹{item.subtotal?.toLocaleString('en-IN')}</p>
                      </div>
                    ))}

                    {/* Shipping */}
                    {order.shippingAddress && (
                      <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Shipping to</p>
                        <p style={{ fontSize: 13 }}>{order.shippingAddress}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                      <div style={{ marginTop: 14 }}>
                        <button className="btn btn-danger btn-sm" onClick={() => cancelOrder(order.id)}>
                          <XCircle size={14} /> Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </Layout>
  );
}

const DEMO_ORDERS = [
  { id: 1042, status: 'DELIVERED', totalAmount: 3499, createdAt: new Date(Date.now() - 86400000 * 3), shippingAddress: '42 MG Road, Bengaluru 560001', items: [{ productName: 'Wireless Headphones', quantity: 1, priceAtPurchase: 3499, subtotal: 3499 }] },
  { id: 1038, status: 'SHIPPED', totalAmount: 1299, createdAt: new Date(Date.now() - 86400000 * 7), shippingAddress: '15 Koramangala, Bengaluru 560034', items: [{ productName: 'Merino Sweater', quantity: 1, priceAtPurchase: 1299, subtotal: 1299 }] },
  { id: 1025, status: 'PENDING', totalAmount: 5999, createdAt: new Date(), shippingAddress: '7 Indiranagar, Bengaluru 560038', items: [{ productName: 'Mechanical Keyboard', quantity: 1, priceAtPurchase: 5999, subtotal: 5999 }] },
];
