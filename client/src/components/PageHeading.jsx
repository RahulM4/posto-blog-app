const PageHeading = ({ eyebrow, title, description, actions }) => {
  return (
    <div className="space-y-4 text-center sm:text-left">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>}
      {title && <h1 className="text-3xl font-semibold text-body sm:text-4xl">{title}</h1>}
      {description && <p className="max-w-2xl text-sm text-muted sm:text-base">{description}</p>}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeading;
