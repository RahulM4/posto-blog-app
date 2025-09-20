import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import ErrorState from '../components/ErrorState.jsx';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import LogoutButton from './components/LogoutButton.jsx';

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/posts', label: 'Posts' },
  { to: '/admin/products', label: 'Products' }
];

const ALLOWED_ROLES = ['Admin', 'SuperAdmin', 'Moderator'];

const AdminLayout = () => {
  const location = useLocation();
  const { user, loading, error } = useAuth();

  if (loading) {
    return <Loader message="Loading admin tools…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return <ErrorState message="You do not have access to the admin dashboard." />;
  }

  return (
    <div className="min-h-screen bg-background text-primary">
      <div className="flex flex-col gap-6 px-6 py-8 sm:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-secondary">Admin dashboard</p>
            <h1 className="text-3xl font-semibold text-contrast">Welcome back, {user.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <nav className="flex flex-wrap items-center gap-2">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 transition ${
                      isActive ? 'bg-primary text-contrast shadow-lg shadow-soft' : 'border border-muted text-muted hover:border-primary hover:text-contrast'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <LogoutButton />
          </div>
        </header>

        {error && <ErrorState message={error} />}

        <section className="min-h-[60vh] rounded-3xl border border-muted bg-surface p-6 shadow-lg shadow-soft">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default AdminLayout;
