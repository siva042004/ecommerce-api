import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderAPI, paymentAPI } from '../services/api';
import { useCartStore } from '../store';
import Layout from '../components/layout/Layout';

const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI', icon: '📲' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
  { value: 'DEBIT_CARD', label: 'Debit Card', icon: '🏦' },
  { value: 'NET_BANKING', label: 'Net Banking', icon: '🖥️' },
  { value: 'COD', label: 'Cash on Delivery', icon: '💵' },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=success
  const [address, setAddress] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const { cart, setCart } = useCartStore();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const total = cart?.totalPrice || 0;

  const placeOrder = async () => {
    if (!address.trim()) { toast.error('Please enter a shipping address'); return; }
    setLoading(true);
    try {
      const orderRes = await orderAPI.place({ shippingAddress: address, paymentMethod: payMethod });
      const order = orderRes.data;

      if (payMethod !== 'COD') {
        await paymentAPI.process({ orderId: order.id, method: payMethod });
      }

      setPlacedOrder(order);
      setCart(null);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <Layout title="Order Placed">
        <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green-dim)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={36} style={{ color: 'var(--green)' }} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Order confirmed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
            Order <strong style={{ color: 'var(--accent)' }}>#{placedOrder?.id}</strong> has been placed successfully.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>
            You'll receive a confirmation shortly. We'll deliver to:<br />
            <span style={{ color: 'var(--text-secondary)' }}>{address}</span>
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/orders')}>View Orders</button>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>Continue Shopping</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Checkout">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

        {/* Left: Steps */}
        <div>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back
          </button>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
            {['Shipping', 'Payment'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                  background: step > i + 1 ? 'var(--green-dim)' : step === i + 1 ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: step > i + 1 ? 'var(--green)' : step === i + 1 ? '#0a0a0a' : 'var(--text-muted)',
                  border: `1px solid ${step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--accent)' : 'var(--border)'}`,
                  flexShrink: 0,
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</span>
                {i < 1 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? 'var(--green)' : 'var(--border)', margin: '0 8px' }} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Truck size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Shipping Address</h3>
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Full delivery address *</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Flat No, Building, Street, City, State — PIN Code"
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { if (!address.trim()) { toast.error('Enter address'); return; } setStep(2); }}>
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <CreditCard size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Payment Method</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {PAYMENT_METHODS.map(m => (
                  <label key={m.value} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    border: `1px solid ${payMethod === m.value ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    background: payMethod === m.value ? 'var(--accent-dim)' : 'transparent',
                    transition: 'all 0.15s',
                  }}>
                    <input type="radio" name="pay" value={m.value} checked={payMethod === m.value} onChange={() => setPayMethod(m.value)} style={{ width: 'auto' }} />
                    <span style={{ fontSize: 18 }}>{m.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{m.label}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={placeOrder} disabled={loading}>
                  {loading ? 'Placing order…' : `Pay ₹${total?.toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order summary */}
        <div className="card" style={{ position: 'sticky', top: 88 }}>
          <p className="card-title" style={{ marginBottom: 16 }}>Order Summary</p>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
                {item.imageUrl ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }} className="truncate">{item.productName}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Qty {item.quantity}</p>
              </div>
              <p style={{ fontWeight: 600, fontSize: 13, flexShrink: 0 }}>₹{item.subtotal?.toLocaleString('en-IN')}</p>
            </div>
          ))}
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Subtotal</span>
            <span style={{ fontSize: 13 }}>₹{total?.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Delivery</span>
            <span style={{ fontSize: 13, color: 'var(--green)' }}>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>₹{total?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
