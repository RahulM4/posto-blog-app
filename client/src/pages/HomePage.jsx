import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryPills from '../components/CategoryPills.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Loader from '../components/Loader.jsx';
import PageHeading from '../components/PageHeading.jsx';
import PostCard from '../components/PostCard.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../utils/api.js';

const POSTS_PER_PAGE = 6;

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    document.title = 'Posto — Explore interesting blogs here';
  }, []);

  const fetchPosts = useCallback(async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const params = { page, limit: POSTS_PER_PAGE };
      if (activeCategoryId) {
        params.categoryId = activeCategoryId;
      }
      const response = await api.getPublicPosts(params);
      const items = Array.isArray(response.data) ? response.data : [];
      setPosts((current) => (append ? [...current, ...items] : items));
      setMeta(response.meta || null);
      setError('');
    } catch (err) {
      const message = err.message || 'Unable to load posts';
      setError(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategoryId]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.getPublicCategories({ type: 'post' });
      const items = response?.data?.categories || [];
      setCategories(items);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.getPublicProducts({ page: 1, limit: 4 });
      const items = Array.isArray(response.data) ? response.data : [];
      setProducts(items);
      setProductsError('');
    } catch (err) {
      setProductsError(err.message || 'Unable to load products');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

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

  const canLoadMore = meta && meta.page < meta.totalPages;
  if (loading && !posts.length && !error) {
    return <Loader message="Loading stories…" />;
  }

  if (error && !posts.length) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-muted bg-surface px-8 py-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-transparent" />
        <div className="relative z-10">
          <PageHeading
          eyebrow="Featured"
          title="Discover stories that matter"
          description="Curated articles from the Posto community. Dive into product updates, creative guides, and behind-the-scenes stories crafted for builders."
          actions={
            categories.length ? (
              <CategoryPills
                categories={categories.slice(0, 6)}
                activeCategoryId={activeCategoryId}
                onSelect={handleSelectCategory}
                onClear={categories.length ? handleClearCategory : undefined}
              />
            ) : null
          }
        />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-heading">Latest posts</h2>
          <p className="text-sm text-muted">Fresh perspectives, published regularly.</p>
        </div>

        {activeCategory && (
          <p className="text-xs uppercase tracking-wide text-secondary">
            Showing posts in {activeCategory.name}
          </p>
        )}

        {posts.length === 0 ? (
          <EmptyState title="No posts yet" description="Once new posts are published they will appear here." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug || post._id} post={post} />
            ))}
          </div>
        )}

        {error && posts.length > 0 && (
          <p className="text-center text-sm text-secondary">{error}</p>
        )}

        {canLoadMore && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fetchPosts((meta?.page || 1) + 1, true)}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-contrast transition hover:bg-heading disabled:cursor-not-allowed disabled:bg-accent"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-heading">Featured products</h2>
          <Link to="/products" className="text-sm font-semibold text-secondary hover:text-heading">View all</Link>
        </div>
        {products.length === 0 ? (
          productsError ? (
            <p className="text-sm text-secondary">{productsError}</p>
          ) : (
            <p className="text-sm text-muted">New drops are coming soon.</p>
          )
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.slug || product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
