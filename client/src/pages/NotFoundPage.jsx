import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-muted bg-surface px-8 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.4em] text-secondary">404</p>
      <h1 className="text-3xl font-semibold text-heading sm:text-4xl">We lost that page</h1>
      <p className="max-w-md text-sm text-muted">
        The page you are looking for might have been moved or no longer exists. Navigate back to the homepage to
        continue exploring.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-contrast transition hover:bg-heading"
      >
        Return home
      </Link>
    </div>
  );
};

export default NotFoundPage;
