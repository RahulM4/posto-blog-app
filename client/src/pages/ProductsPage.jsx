import { useCallback, useEffect, useMemo, useState } from 'react';
import CategoryPills from '../components/CategoryPills.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Loader from '../components/Loader.jsx';
import PageHeading from '../components/PageHeading.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../utils/api.js';

const PRODUCTS_PER_PAGE = 6;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('createdAt:desc');

  useEffect(() => {
    document.title = 'Posto — Featured products';
  }, []);

  const fetchProducts = useCallback(async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = { page, limit: PRODUCTS_PER_PAGE, sort: sortOrder };
      if (activeCategoryId) {
        params.categoryId = activeCategoryId;
      }
      if (searchTerm) {
        params.q = searchTerm;
      }
      const response = await api.getPublicProducts(params);
      const items = Array.isArray(response.data) ? response.data : [];
      setProducts((current) => (append ? [...current, ...items] : items));
      setMeta(response.meta || null);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategoryId, sortOrder, searchTerm]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoryError('');
      const response = await api.getPublicCategories({ type: 'product' });
      const items = response?.data?.categories || [];
      setCategories(items);
    } catch (err) {
      setCategoryError(err.message || 'Failed to load product categories');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadMore = async () => {
    if (!meta) return;
    const nextPage = (meta?.page || 1) + 1;
    await fetchProducts(nextPage, true);
  };

  const canLoadMore = meta && meta.page < meta.totalPages;

  const handleSelectCategory = (category) => {
    const id = category?._id || category?.id || category?.slug;
    if (!id) return;
    setActiveCategoryId((current) => (current === id ? '' : id));
  };

  const handleClearCategory = () => setActiveCategoryId('');

  const activeCategory = useMemo(
    () => categories.find((category) => (category._id || category.id || category.slug) === activeCategoryId),
    [categories, activeCategoryId]
  );

  const filteredCategories = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) => category.name?.toLowerCase().includes(query));
  }, [categories, categoryQuery]);

  const displayedCategories = useMemo(() => {
    const queryActive = categoryQuery.trim();
    const base = queryActive ? filteredCategories : filteredCategories.slice(0, 8);
    if (activeCategory) {
      const exists = base.some((category) => (category._id || category.id || category.slug) === (activeCategory._id || activeCategory.id || activeCategory.slug));
      if (!exists) {
        return [...base, activeCategory];
      }
    }
    return base;
  }, [filteredCategories, categoryQuery, activeCategory]);

  const sortDescription = useMemo(
    () => (sortOrder === 'createdAt:asc' ? 'oldest to newest' : 'newest to oldest'),
    [sortOrder]
  );

  if (loading && !products.length && !error) {
    return <Loader message="Loading products…" />;
  }

  if (error && !products.length) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-10">
      <PageHeading
        eyebrow="Shop"
        title="Limited-run drops"
        description="Pair your reading list with hand-picked essentials from the Posto store."
        actions={
          categories.length ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <input
                type="text"
                value={categoryQuery}
                onChange={(event) => setCategoryQuery(event.target.value)}
                placeholder="Filter categories"
                className="w-full rounded-full border border-muted bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:w-48"
              />
              {categoryQuery && filteredCategories.length === 0 ? (
                <p className="text-xs text-secondary">No categories match.</p>
              ) : (
                <CategoryPills
                  categories={displayedCategories}
                  activeCategoryId={activeCategoryId}
                  onSelect={handleSelectCategory}
                  onClear={handleClearCategory}
                />
              )}
            </div>
          ) : null
        }
      />

      {categoryError && categories.length === 0 && (
        <p className="px-2 text-xs text-secondary">{categoryError}</p>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products"
            className="w-full rounded-full border border-muted bg-background px-4 py-2 text-sm text-contrast placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
          />
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="rounded-full border border-muted bg-background px-4 py-2 text-sm text-contrast focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="createdAt:desc">Newest to oldest</option>
            <option value="createdAt:asc">Oldest to newest</option>
          </select>
        </div>
        <div className="text-xs text-muted">
          {searchTerm ? `Showing results for “${searchTerm}”` : `Sorted ${sortDescription}`}
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState title="No products yet" description="New drops are coming soon." />
      ) : (
        <>
          {activeCategory && (
            <p className="text-xs uppercase tracking-wide text-secondary">
              Showing products in {activeCategory.name}
            </p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug || product._id} product={product} />
            ))}
          </div>
        </>
      )}

      {error && products.length > 0 && (
        <p className="text-center text-sm text-secondary">{error}</p>
      )}

      {canLoadMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-contrast transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-accent"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
