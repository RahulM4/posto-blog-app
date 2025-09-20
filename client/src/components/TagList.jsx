const TagList = ({ tags = [] }) => {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.slug || tag._id || tag.name}
          className="rounded-full border border-primary bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary"
        >
          #{tag.name}
        </span>
      ))}
    </div>
  );
};

export default TagList;
