import { Link } from 'react-router-dom';
import { formatDate } from '../utils/format.js';
import { resolveMediaUrl } from '../utils/api.js';

const PostCard = ({ post }) => {
  if (!post) return null;
  const { slug, title, coverImage, publishedAt, createdAt, updatedAt, categoryId } = post;
  const imageUrl = resolveMediaUrl(coverImage?.url);
  const displayDate = publishedAt || createdAt;
  const primaryDate = displayDate ? new Date(displayDate) : null;
  const updatedDate = updatedAt ? new Date(updatedAt) : null;
  const showUpdated =
    !!(updatedDate && primaryDate && updatedDate.getTime() !== primaryDate.getTime());
  const categoryName =
    typeof categoryId === 'string' ? categoryId : categoryId?.name || categoryId?.title;

  return (
    <Link
      to={`/posts/${slug}`}
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
          <div className="flex h-full w-full items-center justify-center bg-surface text-4xl font-semibold text-contrast">
            {title?.charAt(0) ?? 'P'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/90" />
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 py-6">
        {(displayDate || categoryName) && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wide text-muted">
            <span className="flex flex-col gap-0.5">
              {primaryDate && <span>{formatDate(primaryDate)}</span>}
              {showUpdated && (
                <span className="text-[0.6rem] uppercase text-secondary">Updated {formatDate(updatedDate, true)}</span>
              )}
            </span>
            {categoryName && (
              <span className="inline-flex items-center rounded-full border border-primary px-2 py-1 text-[0.65rem] font-semibold text-primary">
                {categoryName}
              </span>
            )}
          </div>
        )}
        <h3 className="text-lg font-semibold leading-tight text-contrast group-hover:text-secondary">
          {title}
        </h3>
        <span className="mt-auto inline-flex w-fit items-center gap-1 text-xs font-semibold text-secondary">
          Read story
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

export default PostCard;
