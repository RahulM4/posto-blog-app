import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { api } from '../../utils/api.js';
import { formatDate } from '../../utils/format.js';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ users: 0, posts: 0, products: 0 });
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError('');
        const [usersRes, postsRes, productsRes] = await Promise.all([
          api.adminGetUsers({ limit: 5, sort: 'createdAt:desc' }),
          api.adminGetPosts({ limit: 5, sort: 'createdAt:desc' }),
          api.adminGetProducts({ limit: 5, sort: 'createdAt:desc' })
        ]);

        setStats({
          users: usersRes?.meta?.total ?? usersRes?.data?.length ?? 0,
          posts: postsRes?.meta?.total ?? postsRes?.data?.length ?? 0,
          products: productsRes?.meta?.total ?? productsRes?.data?.length ?? 0
        });
        setRecentUsers(usersRes?.data || []);
        setRecentPosts(postsRes?.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load admin summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <Loader message="Loading dashboard…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-muted bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-secondary">Total users</p>
          <p className="mt-3 text-3xl font-semibold text-heading">{stats.users}</p>
        </div>
        <div className="rounded-3xl border border-muted bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-secondary">Total posts</p>
          <p className="mt-3 text-3xl font-semibold text-heading">{stats.posts}</p>
        </div>
        <div className="rounded-3xl border border-muted bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-secondary">Total products</p>
          <p className="mt-3 text-3xl font-semibold text-heading">{stats.products}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-heading">Recent posts</h2>
            <LinkButton to="/admin/posts" label="Manage" />
          </header>
          {recentPosts.length ? (
            <ul className="space-y-2">
              {recentPosts.map((post) => (
                <li
                  key={post._id || post.id}
                  className="flex items-center justify-between rounded-2xl border border-muted bg-background px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-primary">{post.title}</p>
                    <p className="text-xs text-muted">{formatDate(post.createdAt, true)}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      post.status === 'published'
                        ? 'border border-primary bg-accent text-primary'
                        : 'border border-muted bg-background text-primary'
                    }`}
                  >
                    {post.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No posts yet" description="Submissions will appear here once created." />
          )}
        </section>

        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-heading">New accounts</h2>
            <LinkButton to="/admin/users" label="Manage" />
          </header>
          {recentUsers.length ? (
            <ul className="space-y-2">
              {recentUsers.map((user) => (
                <li
                  key={user._id || user.id}
                  className="flex items-center justify-between rounded-2xl border border-muted bg-background px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-primary">{user.name}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-secondary">{user.approvalStatus}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No users yet" description="Registrations will appear here." />
          )}
        </section>
      </div>
    </div>
  );
};

const LinkButton = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      className="rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary transition hover:bg-heading hover:text-contrast"
    >
      {label}
    </NavLink>
  );
};

export default AdminDashboardPage;
