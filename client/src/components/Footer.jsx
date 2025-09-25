const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-muted bg-surface">
      <div className="flex w-full flex-col gap-3 px-6 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p>© {year} Posto. Crafted for curious minds.</p>
        <p>
          Built with <span className="text-heading">React</span> &amp; <span className="text-heading">Tailwind</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
