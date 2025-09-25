import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { api, resolveMediaUrl } from '../../utils/api.js';
import { formatCurrency } from '../../utils/format.js';

const INITIAL_FORM_STATE = {
  title: '',
  price: '',
  stock: '',
  description: '',
  status: 'draft',
  visibility: 'visible',
  categoryId: ''
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState({ total: 0 });
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM_STATE }));
  const [imageUrl, setImageUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryFeedback, setCategoryFeedback] = useState({ error: '', success: '' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [categorySearch, setCategorySearch] = useState('');
  const productImageInputRef = useRef(null);
  const displayImageUrl = imageUrl && (imageUrl.startsWith('data:') ? imageUrl : resolveMediaUrl(imageUrl));

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) return categories;
    return categories.filter((category) => category.name?.toLowerCase().includes(search));
  }, [categories, categorySearch]);

  const applyProductToForm = useCallback((product) => {
    if (!product) {
      setForm({ ...INITIAL_FORM_STATE });
      setImageUrl('');
      return;
    }
    const categoryValue = (() => {
      if (!product.categoryId) return '';
      if (typeof product.categoryId === 'string') return product.categoryId;
      return product.categoryId._id || product.categoryId.id || '';
    })();
    setForm({
      title: product.title || '',
      price: (product.price ?? '').toString(),
      stock: (product.stock ?? '').toString(),
      description: product.description || '',
      status: product.status || 'draft',
      visibility: product.visibility || 'visible',
      categoryId: categoryValue
    });
    setImageUrl(product.images?.[0]?.url || '');
  }, []);


  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.adminGetProducts({ sort: 'createdAt:desc', limit: 50 });
      setProducts(response?.data || []);
      setMeta(response?.meta || {});
    } catch (err) {
      setError(err.message || 'Unable to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  const processImageFile = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.adminUploadMedia(formData);
    const uploaded = response?.data?.media;
    if (!uploaded?.url) return null;
    return resolveMediaUrl(uploaded.url);
  };

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoryFeedback((prev) => ({ ...prev, error: '' }));
      const response = await api.adminGetCategories({ type: 'product' });
      const items = response?.data?.categories || [];
      setCategories(items);
    } catch (err) {
      setCategoryFeedback({ error: err.message || 'Unable to load product categories.', success: '' });
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!editingProduct) return;
    const identifier = editingProduct._id || editingProduct.id;
    const refreshed = products.find((product) => (product._id || product.id) === identifier);
    if (refreshed && refreshed !== editingProduct) {
      setEditingProduct(refreshed);
      applyProductToForm(refreshed);
    }
  }, [products, editingProduct, applyProductToForm]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUrlChange = (event) => {
    setImageUrl(event.target.value);
  };

  const handleProductImageSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const url = await processImageFile(file);
      if (!url) throw new Error('Upload failed');
      setImageUrl(url);
      setCreateSuccess('Product image uploaded.');
    } catch (err) {
      setCreateError(err.message || 'Unable to upload image.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (creating) return;

    setCreateError('');
    setCreateSuccess('');

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      setCreateError('Product title is required.');
      return;
    }

    const price = parseFloat(form.price);
    if (Number.isNaN(price) || price < 0) {
      setCreateError('Enter a valid non-negative price.');
      return;
    }

    const stockValue = form.stock === '' ? 0 : Number.parseInt(form.stock, 10);
    if (Number.isNaN(stockValue) || stockValue < 0) {
      setCreateError('Stock must be a non-negative integer.');
      return;
    }

    if (categories.length && !form.categoryId) {
      setCreateError('Select a category for this product.');
      return;
    }

    const payload = {
      title: trimmedTitle,
      price,
      stock: stockValue,
      description: form.description.trim(),
      status: form.status,
      visibility: form.visibility
    };

    const trimmedImageUrl = imageUrl.trim();
    if (trimmedImageUrl) {
      payload.images = [{ url: trimmedImageUrl }];
    }

    if (form.categoryId) {
      payload.categoryId = form.categoryId;
    }

    try {
      setCreating(true);
      const isEditing = Boolean(editingProduct?._id || editingProduct?.id);
      if (isEditing) {
        const response = await api.adminUpdateProduct(editingProduct._id || editingProduct.id, payload);
        const updated = response?.data?.product;
        setCreateSuccess('Product updated successfully.');
        if (updated) {
          setEditingProduct(updated);
          applyProductToForm(updated);
        }
      } else {
        await api.adminCreateProduct(payload);
        setCreateSuccess('Product created successfully.');
        applyProductToForm(null);
      }
      await loadProducts();
    } catch (err) {
      setCreateError(err.message || 'Unable to save product.');
    } finally {
      setCreating(false);
    }
  };

  const updateProduct = async (productId, payload) => {
    try {
      await api.adminUpdateProduct(productId, payload);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Unable to update product');
    }
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCategoryFeedback({ error: 'Category name is required.', success: '' });
      return;
    }
    try {
      await api.adminCreateCategory({ name: trimmed, type: 'product' });
      setCategoryFeedback({ error: '', success: 'Category added.' });
      setNewCategoryName('');
      await fetchCategories();
    } catch (err) {
      setCategoryFeedback({ error: err.message || 'Unable to create category.', success: '' });
    }
  };

  if (loading) {
    return <Loader message="Loading products…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-heading">Products</h2>
          <p className="text-sm text-muted">Total products: {meta.total ?? products.length}</p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-muted bg-surface p-6 shadow-lg shadow-soft"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-heading">
            {editingProduct ? 'Edit product' : 'Add new product'}
          </h3>
          {editingProduct && (
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                applyProductToForm(null);
                setCreateSuccess('');
                setCreateError('');
              }}
              className="rounded-full border border-muted px-3 py-1 text-xs font-semibold text-muted hover:border-primary hover:text-secondary"
            >
              Cancel edit
            </button>
          )}
        </div>
        <div className="space-y-3 rounded-2xl border border-muted bg-background/40 p-4">
          <h4 className="text-sm font-semibold text-heading">Product categories</h4>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="e.g. Limited Edition"
              className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-body placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-contrast transition hover:bg-heading"
            >
              Add category
            </button>
          </div>
          {categoryFeedback.error && <ErrorState message={categoryFeedback.error} />}
          {categoryFeedback.success && <p className="text-xs text-secondary">{categoryFeedback.success}</p>}
          {categories.length > 0 && (
            <p className="text-xs text-muted">Available: {categories.map((category) => category.name).join(', ')}</p>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="product-title" className="block text-sm font-semibold text-primary">
              Title
            </label>
            <input
              id="product-title"
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder="Product name"
              className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-primary placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="product-price" className="block text-sm font-semibold text-primary">
              Price
            </label>
            <input
              id="product-price"
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleFormChange}
              placeholder="0.00"
              className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-primary placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="product-stock" className="block text-sm font-semibold text-primary">
              Stock
            </label>
            <input
              id="product-stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleFormChange}
              placeholder="0"
              className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-primary placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="product-category" className="block text-sm font-semibold text-primary">
              Category
            </label>
            <input
              type="text"
              value={categorySearch}
              onChange={(event) => setCategorySearch(event.target.value)}
              placeholder="Search categories"
              className="w-full rounded-2xl border border-muted bg-background px-4 py-2 text-sm text-primary placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {categorySearch && filteredCategories.length === 0 && (
              <p className="text-xs text-secondary">No categories match that search.</p>
            )}
            <select
              id="product-category"
              name="categoryId"
              value={form.categoryId}
              onChange={handleFormChange}
              className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required={categories.length > 0}
            >
              <option value="">Select category</option>
              {filteredCategories.map((category) => (
                <option key={category._id || category.id} value={category._id || category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary">Publish status</label>
            <div className="flex items-center gap-4 text-sm text-muted">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={form.status === 'draft'}
                  onChange={handleFormChange}
                  className="h-4 w-4"
                />
                Draft
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={form.status === 'published'}
                  onChange={handleFormChange}
                  className="h-4 w-4"
                />
                Publish now
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="product-description" className="block text-sm font-semibold text-primary">
            Description
          </label>
          <textarea
            id="product-description"
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Tell customers about this product"
            className="h-24 w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-primary placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-primary">Image</label>
          <input
            type="text"
            value={imageUrl}
            onChange={handleImageUrlChange}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-primary placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <button
              type="button"
              onClick={() => productImageInputRef.current?.click()}
              className="rounded-full border border-muted px-3 py-1 hover:border-primary hover:text-heading"
            >
              Upload image
            </button>
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="rounded-full border border-muted px-3 py-1 hover:border-primary hover:text-secondary"
            >
              Clear
            </button>
          </div>
          {displayImageUrl && <img src={displayImageUrl} alt="Product" className="h-24 w-24 rounded-2xl object-cover" />}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-primary">Visibility</label>
          <select
            name="visibility"
            value={form.visibility}
            onChange={handleFormChange}
            className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {createError && <ErrorState message={createError} />}
        {createSuccess && <p className="text-sm text-secondary">{createSuccess}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-contrast transition hover:bg-heading focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={creating}
          >
            {creating ? 'Saving…' : editingProduct ? 'Save changes' : 'Add product'}
          </button>
        </div>
        <input ref={productImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleProductImageSelected} />

      </form>

      <div className="space-y-4">
        {products.length ? (
          products.map((product) => (
            <article
              key={product._id || product.id}
              className="flex flex-col gap-4 rounded-3xl border border-muted bg-surface p-5 shadow-sm shadow-soft md:flex-row md:items-center"
            >
              {product.images?.length ? (
                <img
                  src={resolveMediaUrl(product.images[0].url)}
                  alt={product.title}
                  className="h-24 w-24 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-muted bg-background text-2xl font-semibold text-muted">
                  {product.title?.charAt(0) || 'P'}
                </div>
              )}
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="text-lg font-semibold text-heading">{product.title}</h3>
                <p className="text-sm text-muted">Price: {formatCurrency(product.price || 0)}</p>
                <p className="text-sm text-muted">Stock: {product.stock ?? 0}</p>
                {product.categoryId?.name && (
                  <p className="text-xs uppercase tracking-[0.3em] text-secondary">{product.categoryId.name}</p>
                )}
                <p className="text-xs uppercase tracking-[0.3em] text-secondary">{product.status}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateProduct(product._id || product.id, {
                      status: product.status === 'published' ? 'draft' : 'published'
                    })
                  }
                  className="rounded-full border border-primary bg-background px-3 py-1 text-xs font-semibold text-primary transition hover:bg-heading hover:text-contrast"
                >
                  {product.status === 'published' ? 'Move to draft' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateProduct(product._id || product.id, {
                      visibility: product.visibility === 'visible' ? 'hidden' : 'visible'
                    })
                  }
                  className="rounded-full border border-muted bg-background px-3 py-1 text-xs font-semibold text-primary transition hover:bg-heading hover:text-contrast"
                >
                  {product.visibility === 'visible' ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(product);
                    setCreateError('');
                    setCreateSuccess('');
                    applyProductToForm(product);
                  }}
                  className="rounded-full border border-muted bg-background px-3 py-1 text-xs font-semibold text-primary transition hover:bg-heading hover:text-contrast"
                >
                  Edit
                </button>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No products" description="Add your first product using the form above." />
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
