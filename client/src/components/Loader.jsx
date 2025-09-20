const Loader = ({ message = 'Loading content…' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-muted bg-surface px-6 py-10 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
};

export default Loader;
