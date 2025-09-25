import { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
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
  const { theme, toggleTheme } = useTheme();

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
                className={`rounded-full px-4 py-2 transition hover:bg-heading hover:text-contrast ${
                  isActive(item.to) ? 'bg-primary text-contrast shadow-lg shadow-soft' : 'text-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/create-post"
                className="ml-1 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-heading hover:text-contrast"
              >
                Create post
              </Link>
            )}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-muted text-sm font-semibold text-body transition hover:bg-heading hover:text-contrast"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4.75V6.5M18.364 5.636L17.25 6.75M19.25 12H17.5M18.364 18.364L17.25 17.25M12 17.5V19.25M6.75 17.25L5.636 18.364M6.5 12H4.75M6.75 6.75L5.636 5.636M12 8.75A3.25 3.25 0 1 1 8.75 12 3.25 3.25 0 0 1 12 8.75Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              {['Admin', 'SuperAdmin', 'Moderator'].includes(user.role) && (
                <Link
                  to="/admin"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-primary px-4 text-sm font-semibold text-contrast transition hover:bg-heading"
                >
                  Admin
                </Link>
              )}
              <span className="hidden rounded-full border border-muted bg-accent px-4 py-2 text-sm text-body sm:inline-flex">
                {user.name}
              </span>
              <LogoutButton variant="minimal" />
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-11 items-center justify-center rounded-full border border-muted bg-accent px-4 text-sm font-semibold text-body transition hover:border-primary hover:bg-heading hover:text-contrast"
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
