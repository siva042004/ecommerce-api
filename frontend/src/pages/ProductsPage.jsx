import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter, SlidersHorizontal, ShoppingCart, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI, categoryAPI, cartAPI } from '../services/api';
import { useAuthStore, useCartStore } from '../store';
import Layout from '../components/layout/Layout';
import ProductModal from '../components/features/ProductModal';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [addingId, setAddingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const { user } = useAuthStore();
  const { setCart, openCart } = useCartStore();
  const isAdmin = user?.role === 'ADMIN';

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (search) {
        res = await productAPI.search({ keyword: search, page, size: 12 });
      } else if (selectedCat) {
        res = await productAPI.getByCategory(selectedCat, { page, size: 12 });
      } else {
        res = await productAPI.getAll({ page, size: 12 });
      }
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setProducts(DEMO_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCat, page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data || [])).catch(() => setCategories(DEMO_CATS));
  }, []);

  const addToCart = async (product) => {
    setAddingId(product.id);
    try {
      const res = await cartAPI.addItem({ productId: product.id, quantity: 1 });
      setCart(res.data);
      toast.success(`${product.name.slice(0, 20)}… added to cart`);
      openCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingId(null);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      loadProducts();
    } catch { toast.error('Failed to delete'); }
  };

  const handleSaved = () => { setShowModal(false); setEditProduct(null); loadProducts(); };

  return (
    <Layout title="Products">
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} className="search-icon" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search products…"
            style={{ paddingLeft: 38 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowModal(true); }}>
            <Plus size={15} /> Add Product
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="filter-bar mb-6">
        <button className={`filter-chip ${!selectedCat ? 'active' : ''}`} onClick={() => { setSelectedCat(null); setPage(0); }}>
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`filter-chip ${selectedCat === cat.id ? 'active' : ''}`}
            onClick={() => { setSelectedCat(cat.id); setPage(0); }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="products-grid">
          {Array(8).fill(0).map((_, i) => (
            <div key={i}>
              <div className="skeleton" style={{ height: 180, borderRadius: 12, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 6, width: '60%' }} />
              <div className="skeleton" style={{ height: 16, borderRadius: 4, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 32, borderRadius: 8 }} />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p className="empty-title">No products found</p>
          <p className="empty-sub">Try a different search or category</p>
        </div>
      ) : (
        <>
          <div className="products-grid stagger">
            {products.map(product => (
              <div key={product.id} className="product-card anim-fade-up">
                <div className="product-image">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : getEmoji(product.categoryName)}
                  {product.stockQuantity !== undefined && product.stockQuantity < 5 && (
                    <span className="product-badge">Low stock</span>
                  )}
                  {product.stockQuantity === 0 && (
                    <span className="product-badge" style={{ background: 'var(--red)', color: 'white' }}>Out of stock</span>
                  )}
                </div>
                <div className="product-info">
                  <p className="product-category">{product.categoryName || '—'}</p>
                  <p className="product-name">{product.name}</p>
                  <div className="product-footer">
                    <span className="product-price">₹{product.price?.toLocaleString('en-IN')}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {isAdmin && (
                        <>
                          <button
                            className="add-to-cart-btn"
                            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                            onClick={(e) => { e.stopPropagation(); setEditProduct(product); setShowModal(true); }}
                            title="Edit"
                          >✏️</button>
                          <button
                            className="add-to-cart-btn"
                            style={{ background: 'var(--red-dim)', borderColor: 'rgba(255,68,68,0.25)', color: 'var(--red)' }}
                            onClick={(e) => { e.stopPropagation(); deleteProduct(product.id); }}
                            title="Delete"
                          >🗑</button>
                        </>
                      )}
                      <button
                        className="add-to-cart-btn"
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        disabled={addingId === product.id || product.stockQuantity === 0}
                        title="Add to cart"
                      >
                        {addingId === product.id ? '…' : <ShoppingCart size={14} />}
                      </button>
                    </div>
                  </div>
                  <p className="product-stock" style={{ marginTop: 6 }}>{product.stockQuantity} in stock</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
              <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSaved={handleSaved}
        />
      )}
    </Layout>
  );
}

function getEmoji(cat) {
  const map = { Electronics: '💻', Clothing: '👕', Books: '📚', Food: '🍎', Sports: '⚽', Furniture: '🪑', Beauty: '💄', Toys: '🧸' };
  return map[cat] || '📦';
}

const DEMO_PRODUCTS = [
  { id: 1, name: 'Wireless Noise-Cancelling Headphones', price: 3499, categoryName: 'Electronics', stockQuantity: 12, active: true },
  { id: 2, name: 'Slim-Fit Merino Wool Sweater', price: 1299, categoryName: 'Clothing', stockQuantity: 34, active: true },
  { id: 3, name: 'The Pragmatic Programmer', price: 849, categoryName: 'Books', stockQuantity: 5, active: true },
  { id: 4, name: 'Mechanical Keyboard TKL', price: 5999, categoryName: 'Electronics', stockQuantity: 8, active: true },
  { id: 5, name: 'Standing Desk Converter', price: 8999, categoryName: 'Furniture', stockQuantity: 3, active: true },
  { id: 6, name: 'Whey Protein — Chocolate', price: 2199, categoryName: 'Food', stockQuantity: 45, active: true },
];
const DEMO_CATS = [
  { id: 1, name: 'Electronics' }, { id: 2, name: 'Clothing' }, { id: 3, name: 'Books' }, { id: 4, name: 'Sports' }
];
