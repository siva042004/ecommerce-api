import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/api';

export default function ProductModal({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stockQuantity: product?.stockQuantity ?? '',
    imageUrl: product?.imageUrl || '',
    categoryId: product?.categoryId || categories[0]?.id || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity), categoryId: parseInt(form.categoryId) };
      if (product?.id) {
        await productAPI.update(product.id, data);
        toast.success('Product updated!');
      } else {
        await productAPI.create(data);
        toast.success('Product created!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 className="modal-title" style={{ margin: 0 }}>{product ? 'Edit Product' : 'Add Product'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Product name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the product…" rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} placeholder="999.00" required />
            </div>
            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input name="stockQuantity" type="number" min="0" value={form.stockQuantity} onChange={handleChange} placeholder="50" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving…' : (product ? 'Save changes' : 'Create product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
