import React, { useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCartStore } from '../../store';
import { cartAPI } from '../../services/api';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, setCart } = useCartStore();
  const navigate = useNavigate();

  const updateQty = async (itemId, newQty) => {
    try {
      const res = await cartAPI.updateItem(itemId, newQty);
      setCart(res.data);
    } catch {
      toast.error('Failed to update cart');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await cartAPI.removeItem(itemId);
      setCart(res.data);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const items = cart?.items || [];

  return (
    <>
      <div className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={closeCart} />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <span className="cart-drawer-title">
            <ShoppingBag size={18} style={{ display: 'inline', verticalAlign: -3, marginRight: 8, color: 'var(--accent)' }} />
            Cart {items.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 14 }}>({items.length} items)</span>}
          </span>
          <button className="btn btn-ghost btn-icon" onClick={closeCart}>
            <X size={18} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 16px' }}>
              <div className="empty-icon">🛒</div>
              <p className="empty-title">Your cart is empty</p>
              <p className="empty-sub">Add some products to get started</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : '📦'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }} className="truncate">{item.productName}</p>
                  <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>
                    ₹{item.price?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                  <div className="cart-qty-ctrl">
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <Minus size={11} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)}>
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-value">₹{cart?.totalPrice?.toLocaleString('en-IN')}</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '13px' }} onClick={handleCheckout}>
              Checkout <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
