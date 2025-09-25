const CategoryPills = ({ categories = [], activeCategoryId = '', onSelect, onClear }) => {
  if (!categories.length && !onClear) return null;

  const renderButton = (label, { key, isActive, onClick }) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
        isActive
          ? 'border-primary bg-heading text-contrast'
          : 'border-muted text-muted hover:border-primary hover:bg-heading hover:text-contrast'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {onClear &&
        renderButton('All', {
          key: 'all',
          isActive: !activeCategoryId,
          onClick: () => onClear()
        })}
      {categories.map((category) => {
        const id = category._id || category.id || category.slug;
        return renderButton(category.name, {
          key: id || category.name,
          isActive: activeCategoryId === id,
          onClick: () => onSelect?.(category)
        });
      })}
    </div>
  );
};

export default CategoryPills;
