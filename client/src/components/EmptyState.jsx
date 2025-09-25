import { Link } from 'react-router-dom';

const EmptyState = ({ title = 'No results', description = 'Check back later for fresh content.', actionLabel, actionHref, onAction }) => {
  const renderAction = () => {
    if (!actionLabel) return null;
    if (onAction) {
      return (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-heading hover:text-contrast"
        >
          {actionLabel}
        </button>
      );
    }
    if (actionHref) {
      return (
        <Link
          to={actionHref}
          className="mt-4 inline-flex items-center rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-heading hover:text-contrast"
        >
          {actionLabel}
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-muted bg-surface px-6 py-10 text-center">
      <p className="text-lg font-semibold text-primary">{title}</p>
      <p className="mt-2 text-sm text-muted">{description}</p>
      {renderAction()}
    </div>
  );
};

export default EmptyState;
