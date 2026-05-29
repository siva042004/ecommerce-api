import React, { useState, useEffect } from 'react';
import { Plus, Tag, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryAPI } from '../services/api';
import { useAuthStore } from '../store';
import Layout from '../components/layout/Layout';

const CAT_EMOJIS = ['🏷️','💻','👕','📚','🍎','⚽','🪑','💄','🧸','🎮','🎵','🌿','🔧','✈️','📸'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const load = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data || []);
    } catch {
      setCategories(DEMO_CATS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditCat(null); setForm({ name: '', description: '' }); setShowModal(true); };
  const openEdit = (cat) => { setEditCat(cat); setForm({ name: cat.name, description: cat.description || '' }); setShowModal(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editCat) { await categoryAPI.update(editCat.id, form); toast.success('Updated!'); }
      else { await categoryAPI.create(form); toast.success('Category created!'); }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await categoryAPI.delete(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
  };

  return (
    <Layout title="Categories">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{categories.length} categories</p>
        {isAdmin && <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> New Category</button>}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }} className="stagger">
          {categories.map((cat, i) => (
            <div key={cat.id} className="card anim-fade-up" style={{ position: 'relative' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{CAT_EMOJIS[i % CAT_EMOJIS.length]}</div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{cat.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, minHeight: 32 }}>
                {cat.description || 'No description'}
              </p>
              {cat.productCount !== undefined && (
                <span className="badge badge-muted">{cat.productCount} products</span>
              )}
              {isAdmin && (
                <div style={{ display: 'flex', gap: 6, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(cat)}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(cat.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 className="modal-title" style={{ margin: 0 }}>{editCat ? 'Edit Category' : 'New Category'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electronics" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

const DEMO_CATS = [
  { id: 1, name: 'Electronics', description: 'Gadgets, devices and tech accessories', productCount: 24 },
  { id: 2, name: 'Clothing', description: 'Apparel for all occasions', productCount: 48 },
  { id: 3, name: 'Books', description: 'Fiction, non-fiction, technical', productCount: 112 },
  { id: 4, name: 'Sports', description: 'Fitness and outdoor gear', productCount: 35 },
  { id: 5, name: 'Furniture', description: 'Home and office furnishings', productCount: 18 },
  { id: 6, name: 'Beauty', description: 'Skincare and cosmetics', productCount: 63 },
];
