import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/format.js';
import { resolveMediaUrl } from '../utils/api.js';

const ProductCard = ({ product }) => {
  if (!product) return null;
  const { slug, title, images, price, categoryId } = product;
  const imageUrl = resolveMediaUrl(images?.[0]?.url);
  const categoryName =
    typeof categoryId === 'string' ? categoryId : categoryId?.name || categoryId?.title;

  return (
    <Link
      to={`/products/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-muted bg-surface transition hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-soft"
    >
      <div className="relative h-56 w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-heading text-4xl font-semibold text-contrast">
            {title?.charAt(0) ?? 'P'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/90" />
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 py-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted">
          <span>Featured product</span>
          {categoryName && (
            <span className="inline-flex items-center rounded-full border border-primary px-2 py-1 text-[0.65rem] font-semibold text-primary">
              {categoryName}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold leading-tight text-heading transition-colors group-hover:text-secondary">
          {title}
        </h3>
        <p className="text-sm font-semibold text-secondary">{formatCurrency(price)}</p>
        <span className="mt-auto inline-flex w-fit items-center gap-1 text-xs font-semibold text-secondary">
          View details
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

export default ProductCard;
