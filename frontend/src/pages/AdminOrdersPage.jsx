import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import Layout from '../components/layout/Layout';
import toast from 'react-hot-toast';

const STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'];
const BADGE = { PENDING:'badge-amber', CONFIRMED:'badge-blue', PROCESSING:'badge-blue', SHIPPED:'badge-blue', DELIVERED:'badge-green', CANCELLED:'badge-red', REFUNDED:'badge-muted' };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await orderAPI.getAllOrders({ page, size: 15 });
        setOrders(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      } catch { setOrders(DEMO_ORDERS); }
      finally { setLoading(false); }
    };
    load();
  }, [page]);

  const updateStatus = async (id, status) => {
    try {
      const res = await orderAPI.updateStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? res.data : o));
      toast.success(`Order #${id} → ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <Layout title="All Orders (Admin)">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Order Management</span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{orders.length} orders</span>
        </div>
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />)
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>#{order.id}</span></td>
                    <td style={{ fontSize: 13 }}>{order.userEmail || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td>{order.items?.length || 0}</td>
                    <td style={{ fontWeight: 600 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${BADGE[order.status]||'badge-muted'}`}>{order.status}</span></td>
                    <td>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        style={{ width: 'auto', padding: '4px 8px', fontSize: 12, borderRadius: 6 }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p-1)}>Previous</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>Page {page+1} of {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages-1} onClick={() => setPage(p => p+1)}>Next</button>
        </div>
      )}
    </Layout>
  );
}

const DEMO_ORDERS = [
  { id: 1042, status: 'DELIVERED', totalAmount: 3499, createdAt: new Date(Date.now()-86400000*3), items: [{}], userEmail: 'alice@example.com' },
  { id: 1038, status: 'SHIPPED', totalAmount: 1299, createdAt: new Date(Date.now()-86400000*7), items: [{}], userEmail: 'bob@example.com' },
  { id: 1025, status: 'PENDING', totalAmount: 5999, createdAt: new Date(), items: [{},{}], userEmail: 'carol@example.com' },
];
