import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingBag, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authAPI.login({ email: form.email, password: form.password })
        : await authAPI.register(form);
      const { token, email, fullName, role } = res.data;
      setAuth({ email, fullName, role }, token);
      toast.success(`Welcome${fullName ? ', ' + fullName.split(' ')[0] : ''}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ email: 'demo@shopforge.com', password: 'demo1234', fullName: 'Demo User', phone: '' });

  return (
    <div className="auth-page">
      <div className="auth-grid-bg" />
      <div className="auth-accent-glow" />

      <div className="auth-card anim-fade-up">
        <div className="auth-logo">
          <div className="logo-mark" style={{ justifyContent: 'center', fontSize: 26, marginBottom: 8 }}>
            <span className="logo-dot" style={{ width: 10, height: 10 }} />
            ShopForge
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Modern commerce infrastructure</p>
        </div>

        <h2 className="auth-title" style={{ textAlign: 'center' }}>
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h2>
        <p className="auth-sub" style={{ textAlign: 'center', marginBottom: 24 }}>
          {mode === 'login' ? 'Good to see you again' : 'Start your free account today'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Ada Lovelace" required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                name="password"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{ paddingRight: 40 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Phone (optional)</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4, padding: '12px', fontSize: 15 }} disabled={loading}>
            {loading ? 'Please wait…' : (
              <>{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></>
            )}
          </button>

          <button type="button" className="btn btn-ghost" style={{ width: '100%', fontSize: 13 }} onClick={fillDemo}>
            Use demo credentials
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}
