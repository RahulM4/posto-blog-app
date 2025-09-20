import { useCallback, useEffect, useMemo, useState } from 'react';
import CategoryPills from '../components/CategoryPills.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Loader from '../components/Loader.jsx';
import PageHeading from '../components/PageHeading.jsx';
import PostCard from '../components/PostCard.jsx';
import { api } from '../utils/api.js';

const POSTS_PER_PAGE = 6;

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('publishedAt:desc');
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    document.title = 'Posto — Posts';
  }, []);

  const fetchPosts = useCallback(async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = { page, limit: POSTS_PER_PAGE, sort: sortOrder };
      if (activeCategoryId) {
        params.categoryId = activeCategoryId;
      }
      if (searchTerm) {
        params.q = searchTerm;
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
  }, [activeCategoryId, sortOrder, searchTerm]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoryError('');
      const response = await api.getPublicCategories({ type: 'post' });
      const items = response?.data?.categories || [];
      setCategories(items);
    } catch (err) {
      setCategoryError(err.message || 'Failed to load post categories');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  const canLoadMore = meta && meta.page < meta.totalPages;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
    () => (sortOrder === 'publishedAt:asc' ? 'oldest to newest' : 'newest to oldest'),
    [sortOrder]
  );

  if (loading && !posts.length && !error) {
    return <Loader message="Loading posts…" />;
  }

  if (error && !posts.length) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-muted bg-surface px-8 py-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-transparent" />
        <div className="relative z-10 space-y-8">
          <PageHeading
            eyebrow="Stories"
            title="Browse the latest from Posto"
            description="Fresh perspectives, tutorials, and announcements from our creators."
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
        </div>
      </section>

      {categoryError && categories.length === 0 && (
        <p className="px-8 text-xs text-secondary">{categoryError}</p>
      )}

      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search posts"
              className="w-full rounded-full border border-muted bg-background px-4 py-2 text-sm text-contrast placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
            />
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="rounded-full border border-muted bg-background px-4 py-2 text-sm text-contrast focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="publishedAt:desc">Newest to oldest</option>
              <option value="publishedAt:asc">Oldest to newest</option>
            </select>
        </div>
        <div className="text-xs text-muted">
          {searchTerm ? `Showing results for “${searchTerm}”` : `Sorted ${sortDescription}`}
        </div>
      </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-contrast">Latest posts</h2>
          <p className="text-sm text-muted">New stories arrive regularly.</p>
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
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-contrast transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-accent"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default PostsPage;
