import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';

import { useAuthStore, useCartStore } from './store';
import { cartAPI } from './services/api';

import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentsPage from './pages/PaymentsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import CartDrawer from './components/features/CartDrawer';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      cartAPI.get().then(res => setCart(res.data)).catch(() => {});
    }
  }, [isAuthenticated, setCart]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a1a', color: '#f0f0f0', border: '1px solid rgba(255,255,255,0.1)', fontFamily: "'DM Sans', sans-serif", fontSize: 14 },
          success: { iconTheme: { primary: '#4dff91', secondary: '#0a0a0a' } },
          error: { iconTheme: { primary: '#ff4444', secondary: '#0a0a0a' } },
        }}
      />

      <CartDrawer />

      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><CategoriesPage /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
        <Route path="/payments" element={<PrivateRoute><PaymentsPage /></PrivateRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
