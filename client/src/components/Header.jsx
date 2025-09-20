import { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import LogoutButton from './LogoutButton.jsx';

const BASE_NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/posts', label: 'Posts' },
  { to: '/products', label: 'Products' }
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = useMemo(() => {
    const items = [...BASE_NAV_ITEMS];
    if (user) {
      items.push({ to: '/my-posts', label: 'My posts' });
    }
    return items;
  }, [user]);

  const handleLogoClick = () => {
    navigate('/');
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className="border-b border-muted bg-surface backdrop-blur">
      <div className="flex w-full items-center justify-between gap-6 px-6 py-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLogoClick}
            className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-semibold text-contrast shadow-lg">
              P
            </div>
            <div>
              <p className="text-lg font-semibold text-primary sm:text-xl">Posto</p>
              <p className="text-xs text-muted">Stories that spark ideas</p>
            </div>
          </button>

          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-full px-4 py-2 transition hover:bg-accent hover:text-contrast ${
                  isActive(item.to) ? 'bg-primary text-contrast shadow-lg shadow-soft' : 'text-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {['Admin', 'SuperAdmin', 'Moderator'].includes(user.role) && (
                <Link
                  to="/admin"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-primary px-4 text-sm font-semibold text-contrast transition hover:bg-accent"
                >
                  Admin
                </Link>
              )}
              <Link
              
                to="/create-post"
                className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-contrast transition hover:bg-secondary sm:inline-flex"
              >
                Create post
              </Link>
              <span className="hidden rounded-full border border-muted px-4 py-2 text-sm text-contrast sm:inline-flex">
                {user.name}
              </span>
              <LogoutButton variant="minimal" />
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-11 items-center justify-center rounded-full border border-muted px-4 text-sm font-semibold text-contrast transition hover:border-primary hover:bg-accent hover:text-contrast"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
