import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { orderAPI, paymentAPI } from '../services/api';
import Layout from '../components/layout/Layout';

export default function PaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ordRes = await orderAPI.getMyOrders({ size: 20 });
        const ords = ordRes.data.content || [];
        setOrders(ords);
        const payMap = {};
        await Promise.allSettled(
          ords.filter(o => o.status !== 'PENDING').map(async o => {
            try {
              const res = await paymentAPI.getByOrder(o.id);
              payMap[o.id] = res.data;
            } catch {}
          })
        );
        setPayments(payMap);
      } catch {
        setOrders(DEMO_ORDERS);
        setPayments(DEMO_PAYMENTS);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const METHOD_ICON = { CREDIT_CARD:'💳', DEBIT_CARD:'🏦', UPI:'📲', NET_BANKING:'🖥️', COD:'💵', WALLET:'👜' };
  const STATUS_BADGE = { COMPLETED:'badge-green', PENDING:'badge-amber', FAILED:'badge-red', REFUNDED:'badge-muted' };

  return (
    <Layout title="Payments">
      {loading ? (
        Array(3).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height: 72, marginBottom: 10, borderRadius: 12 }} />)
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><CreditCard size={48} strokeWidth={1} /></div>
          <p className="empty-title">No payment records</p>
          <p className="empty-sub">Complete orders will appear here</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header" style={{ marginBottom: 0 }}>
            <span className="card-title">Payment History</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const pay = payments[order.id];
                  return (
                    <tr key={order.id}>
                      <td><span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--accent)' }}>#{order.id}</span></td>
                      <td style={{ fontSize:13, color:'var(--text-secondary)' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                      </td>
                      <td>
                        {pay ? (
                          <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span>{METHOD_ICON[pay.method] || '💰'}</span>
                            <span style={{ fontSize:13 }}>{pay.method?.replace('_',' ')}</span>
                          </span>
                        ) : <span style={{ color:'var(--text-muted)', fontSize:13 }}>—</span>}
                      </td>
                      <td style={{ fontWeight:600 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                      <td>
                        {pay?.transactionId
                          ? <code style={{ fontSize:11, background:'var(--bg-elevated)', padding:'2px 6px', borderRadius:4, color:'var(--text-secondary)' }}>{pay.transactionId}</code>
                          : <span style={{ color:'var(--text-muted)', fontSize:13 }}>—</span>
                        }
                      </td>
                      <td>
                        <span className={`badge ${pay ? STATUS_BADGE[pay.status] || 'badge-muted' : order.status === 'PENDING' ? 'badge-amber' : 'badge-muted'}`}>
                          {pay?.status || (order.status === 'PENDING' ? 'AWAITING' : 'N/A')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}

const DEMO_ORDERS = [
  { id: 1042, status:'DELIVERED', totalAmount:3499, createdAt: new Date(Date.now()-86400000*3) },
  { id: 1038, status:'SHIPPED', totalAmount:1299, createdAt: new Date(Date.now()-86400000*7) },
  { id: 1025, status:'PENDING', totalAmount:5999, createdAt: new Date() },
];
const DEMO_PAYMENTS = {
  1042: { status:'COMPLETED', method:'UPI', transactionId:'TXN-A3F9B2' },
  1038: { status:'COMPLETED', method:'CREDIT_CARD', transactionId:'TXN-D7E1C5' },
};
