import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Package, ShoppingCart, CreditCard, ArrowUpRight, ArrowRight, Clock } from 'lucide-react';
import { orderAPI, productAPI } from '../services/api';
import { useAuthStore } from '../store';
import Layout from '../components/layout/Layout';

const ORDER_STATUS_BADGE = {
  PENDING: 'badge-amber',
  CONFIRMED: 'badge-blue',
  PROCESSING: 'badge-blue',
  SHIPPED: 'badge-blue',
  DELIVERED: 'badge-green',
  CANCELLED: 'badge-red',
  REFUNDED: 'badge-muted',
};

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [ordRes, prodRes] = await Promise.all([
          orderAPI.getMyOrders({ size: 5 }),
          productAPI.getAll({ size: 6 }),
        ]);
        setOrders(ordRes.data.content || []);
        setProducts(prodRes.data.content || []);
      } catch {
        // demo data if backend offline
        setOrders(DEMO_ORDERS);
        setProducts(DEMO_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <Layout title="Dashboard">
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          Hey, {user?.fullName?.split(' ')[0] || 'there'} 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Here's what's happening with your store today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid stagger">
        {[
          { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'accent', change: '+12%', up: true },
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: CreditCard, color: 'blue', change: '+8%', up: true },
          { label: 'Delivered', value: deliveredCount, icon: Package, color: 'green', change: `${orders.length ? Math.round(deliveredCount / orders.length * 100) : 0}%`, up: true },
          { label: 'Pending', value: orders.filter(o => o.status === 'PENDING').length, icon: Clock, color: 'orange', change: '-3', up: false },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`stat-card ${stat.color} anim-fade-up`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p className="stat-label">{stat.label}</p>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </div>
              <p className="stat-value">{stat.value}</p>
              <p className={`stat-change ${stat.up ? 'up' : 'down'}`}>
                <TrendingUp size={11} />
                {stat.change} vs last month
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Orders */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <span className="card-title">Recent Orders</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          {loading ? (
            <div>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">📋</div>
              <p className="empty-title">No orders yet</p>
              <p className="empty-sub">Start shopping to see your orders here</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/orders')}>
                      <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>#{order.id}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td>{order.items?.length || 0} items</td>
                      <td style={{ fontWeight: 600 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                      <td><span className={`badge ${ORDER_STATUS_BADGE[order.status] || 'badge-muted'}`}>{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Browse */}
      {products.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <span className="card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>Featured Products</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/products')}>
              Browse all <ArrowRight size={13} />
            </button>
          </div>
          <div className="products-grid stagger">
            {products.slice(0, 4).map(p => (
              <MiniProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}

function MiniProductCard({ product }) {
  const navigate = useNavigate();
  return (
    <div className="product-card anim-fade-up" onClick={() => navigate('/products')}>
      <div className="product-image">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : getEmoji(product.categoryName)}
        {product.stockQuantity < 10 && <span className="product-badge">Low stock</span>}
      </div>
      <div className="product-info">
        <p className="product-category">{product.categoryName || 'Product'}</p>
        <p className="product-name">{product.name}</p>
        <div className="product-footer">
          <span className="product-price">₹{product.price?.toLocaleString('en-IN')}</span>
          <span className="product-stock">{product.stockQuantity} left</span>
        </div>
      </div>
    </div>
  );
}

function getEmoji(category) {
  const map = { Electronics: '💻', Clothing: '👕', Books: '📚', Food: '🍎', Sports: '⚽' };
  return map[category] || '📦';
}

const DEMO_ORDERS = [
  { id: 1042, status: 'DELIVERED', totalAmount: 3499, items: [{}, {}], createdAt: new Date(Date.now() - 86400000 * 3) },
  { id: 1038, status: 'SHIPPED', totalAmount: 1299, items: [{}], createdAt: new Date(Date.now() - 86400000 * 7) },
  { id: 1025, status: 'PENDING', totalAmount: 5999, items: [{}, {}, {}], createdAt: new Date() },
];

const DEMO_PRODUCTS = [
  { id: 1, name: 'Wireless Noise-Cancelling Headphones', price: 3499, categoryName: 'Electronics', stockQuantity: 12 },
  { id: 2, name: 'Slim-Fit Merino Wool Sweater', price: 1299, categoryName: 'Clothing', stockQuantity: 34 },
  { id: 3, name: 'The Pragmatic Programmer', price: 849, categoryName: 'Books', stockQuantity: 5 },
  { id: 4, name: 'Mechanical Keyboard TKL', price: 5999, categoryName: 'Electronics', stockQuantity: 8 },
];
