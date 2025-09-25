import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Loader from '../components/Loader.jsx';
import PageHeading from '../components/PageHeading.jsx';
import PostCard from '../components/PostCard.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../utils/api.js';

const SEARCH_PAGE_SIZE = 6;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentQuery = useMemo(() => searchParams.get('q')?.trim() || '', [searchParams]);

  useEffect(() => {
    setTerm(currentQuery);
    if (!currentQuery) {
      setResults([]);
      setMeta(null);
      setError('');
      return;
    }

    const controller = new AbortController();
    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.search({ q: currentQuery, limit: SEARCH_PAGE_SIZE }, { signal: controller.signal });
        const items = Array.isArray(response.data) ? response.data : [];
        setResults(items);
        setMeta(response.meta || null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    return () => controller.abort();
  }, [currentQuery]);

  useEffect(() => {
    document.title = currentQuery ? `Posto — Search “${currentQuery}”` : 'Posto — Search';
  }, [currentQuery]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextTerm = term.trim();
    if (!nextTerm) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q: nextTerm });
  };

  const loadMore = async () => {
    if (!meta || !currentQuery) return;
    setLoading(true);
    try {
      const nextPage = (meta?.page || 1) + 1;
      const response = await api.search({ q: currentQuery, page: nextPage, limit: SEARCH_PAGE_SIZE });
      const items = Array.isArray(response.data) ? response.data : [];
      setResults((current) => [...current, ...items]);
      setMeta(response.meta || null);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load more results');
    } finally {
      setLoading(false);
    }
  };

  const canLoadMore = meta && meta.page < meta.totalPages;

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-muted bg-surface px-6 py-6">
        <PageHeading
          eyebrow="Search"
          title="Looking for something specific?"
          description="Search across stories and product drops."
        />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search posts, guides, and products"
            className="h-12 flex-1 rounded-full border border-muted bg-background px-4 text-sm text-body placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-contrast transition hover:bg-heading"
          >
            Search
          </button>
        </div>
      </form>

      {!currentQuery && <EmptyState title="Try searching" description="Enter a keyword to explore the archive." />}

      {loading && currentQuery && results.length === 0 && <Loader message="Searching…" />}

      {error && !loading && results.length === 0 && currentQuery && <ErrorState message={error} />}

      {currentQuery && !loading && !error && results.length === 0 && (
        <EmptyState title="No matches" description="Try a different combination of keywords." />
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Showing {results.length} result{results.length === 1 ? '' : 's'} for “{currentQuery}”.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((item) => {
              if (item.type === 'product') {
                return <ProductCard key={`product-${item.slug || item._id}`} product={item} />;
              }
              return <PostCard key={`post-${item.slug || item._id}`} post={item} />;
            })}
          </div>
        </div>
      )}

      {error && results.length > 0 && (
        <p className="text-center text-sm text-secondary">{error}</p>
      )}

      {canLoadMore && !loading && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-contrast transition hover:bg-heading"
          >
            Load more
          </button>
        </div>
      )}

      {loading && results.length > 0 && <Loader message="Loading more results…" />}
    </div>
  );
};

export default SearchPage;
