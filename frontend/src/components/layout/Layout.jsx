import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, ClipboardList,
  CreditCard, Tag, Settings, LogOut, Bell, Search
} from 'lucide-react';
import { useAuthStore, useCartStore } from '../../store';

const navItems = [
  { group: 'Main', items: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Products', icon: Package, path: '/products' },
    { label: 'Categories', icon: Tag, path: '/categories' },
  ]},
  { group: 'Commerce', items: [
    { label: 'My Orders', icon: ClipboardList, path: '/orders' },
    { label: 'Payments', icon: CreditCard, path: '/payments' },
  ]},
];

const adminItems = [
  { group: 'Admin', items: [
    { label: 'All Orders', icon: ClipboardList, path: '/admin/orders' },
  ]},
];

export default function Layout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { toggleCart, getTotalItems } = useCartStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  const allNav = user?.role === 'ADMIN' ? [...navItems, ...adminItems] : navItems;

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <span className="logo-dot" />
            ShopForge
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Commerce Platform</p>
        </div>

        <nav className="sidebar-nav">
          {allNav.map(group => (
            <div key={group.group}>
              <p className="nav-group-label">{group.group}</p>
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon size={17} className="icon" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <p className="user-name truncate">{user?.fullName || user?.email}</p>
              <p className="user-role">{user?.role || 'Customer'}</p>
            </div>
            <button className="btn-icon btn" onClick={handleLogout} title="Logout" style={{ marginLeft: 'auto', padding: '6px' }}>
              <LogOut size={15} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">{title}</h1>
          </div>
          <div className="topbar-right">
            <div className="cart-btn-wrap">
              <button className="btn btn-ghost btn-icon" onClick={toggleCart} title="Cart">
                <ShoppingCart size={18} />
                {getTotalItems() > 0 && (
                  <span className="cart-badge">{getTotalItems()}</span>
                )}
              </button>
            </div>
            <button className="btn btn-ghost btn-icon">
              <Bell size={18} />
            </button>
          </div>
        </header>

        <main className="page-container anim-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
