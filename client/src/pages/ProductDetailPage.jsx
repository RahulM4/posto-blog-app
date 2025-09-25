import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Loader from '../components/Loader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import TagList from '../components/TagList.jsx';
import { api, resolveMediaUrl } from '../utils/api.js';
import { formatCurrency } from '../utils/format.js';

const RELATED_PRODUCTS_LIMIT = 3;

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');

    const fetchProduct = async () => {
      try {
        const response = await api.getPublicProduct(slug);
        const productData = response?.data?.product;
        setProduct(productData);
        if (productData?.title) {
          document.title = `${productData.title} — Posto shop`;
        }
      } catch (err) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await api.getPublicProducts({ limit: RELATED_PRODUCTS_LIMIT + 1 });
        const items = Array.isArray(response.data) ? response.data : [];
        const filtered = items.filter((item) => item.slug !== slug).slice(0, RELATED_PRODUCTS_LIMIT);
        setRelated(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRelatedProducts();
  }, [slug]);

  if (loading) {
    return <Loader message="Loading product…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!product) {
    return <EmptyState title="Product not found" description="This drop might be sold out." />;
  }

  const gallery = product.images?.map((image) => resolveMediaUrl(image?.url)).filter(Boolean) || [];

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <Link to="/products" className="text-sm text-secondary hover:text-heading">
          ← Back to products
        </Link>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {gallery.length ? (
              <div className="grid gap-4">
                {gallery.map((url, index) => (
                  <div key={url + index} className="overflow-hidden rounded-3xl border border-muted">
                    <img src={url} alt={product.title} className="w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-80 items-center justify-center rounded-3xl border border-muted bg-heading text-5xl font-semibold text-contrast">
                {product.title?.charAt(0) ?? 'P'}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              {product.categoryId?.name && (
                <p className="text-xs uppercase tracking-[0.3em] text-secondary">{product.categoryId.name}</p>
              )}
              <h1 className="text-3xl font-semibold text-heading sm:text-4xl">{product.title}</h1>
              <p className="text-2xl font-bold text-secondary">{formatCurrency(product.price)}</p>
            </div>

            <p className="text-sm text-muted">{product.description}</p>

            <TagList tags={product.tagIds} />

            <div className="rounded-3xl border border-primary bg-accent px-6 py-6 text-sm text-body">
              <p className="font-semibold">Limited availability</p>
              <p className="mt-2 text-secondary">
                These drops are released in small batches. Secure yours before the next restock.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-contrast transition hover:bg-heading"
            >
              Join waitlist
            </button>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-heading">You might also like</h2>
          <Link to="/products" className="text-sm text-secondary hover:text-heading">
            View all
          </Link>
        </div>
        {related.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.slug || item._id} product={item} />
            ))}
          </div>
        ) : (
          <EmptyState title="No related products" />
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;
