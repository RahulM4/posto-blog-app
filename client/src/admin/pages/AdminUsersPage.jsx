import { useCallback, useEffect, useState } from 'react';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { api } from '../../utils/api.js';
import { formatDate } from '../../utils/format.js';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState({ total: 0 });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.adminGetUsers({ sort: 'createdAt:desc', limit: 50, includeDeleted: false });
      setUsers(response?.data || []);
      setMeta(response?.meta || {});
    } catch (err) {
      setError(err.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleStatus = async (userId, status) => {
    try {
      await api.adminSetUserStatus(userId, status);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Unable to update user status');
    }
  };

  const handleApproval = async (userId, approvalStatus) => {
    try {
      await api.adminSetUserApproval(userId, approvalStatus);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Unable to update approval status');
    }
  };

  if (loading) {
    return <Loader message="Loading users…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!users.length) {
    return <EmptyState title="No users yet" description="Registrations will appear once users sign up." />;
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-heading">Users</h2>
          <p className="text-sm text-muted">Total users: {meta.total ?? users.length}</p>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-muted text-left text-sm text-primary">
          <thead className="bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Approval</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {users.map((user) => (
              <tr key={user._id || user.id} className="hover:bg-surface">
                <td className="px-4 py-3 font-medium text-primary">{user.name}</td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3 capitalize">{user.approvalStatus}</td>
                <td className="px-4 py-3 capitalize">{user.status}</td>
                <td className="px-4 py-3 text-muted">{formatDate(user.createdAt, true)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {user.approvalStatus !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleApproval(user._id || user.id, 'approved')}
                        className="rounded-full border border-primary bg-accent px-3 py-1 text-xs font-semibold text-primary transition hover:bg-heading hover:text-contrast"
                      >
                        Approve
                      </button>
                    )}
                    {user.approvalStatus !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => handleApproval(user._id || user.id, 'rejected')}
                        className="rounded-full border border-secondary bg-surface px-3 py-1 text-xs font-semibold text-secondary transition hover:bg-heading hover:text-contrast"
                      >
                        Reject
                      </button>
                    )}
                    {user.status !== 'active' && (
                      <button
                        type="button"
                        onClick={() => handleStatus(user._id || user.id, 'active')}
                        className="rounded-full border border-primary bg-background px-3 py-1 text-xs font-semibold text-primary transition hover:bg-heading hover:text-contrast"
                      >
                        Activate
                      </button>
                    )}
                    {user.status !== 'inactive' && (
                      <button
                        type="button"
                        onClick={() => handleStatus(user._id || user.id, 'inactive')}
                        className="rounded-full border border-secondary bg-background px-3 py-1 text-xs font-semibold text-secondary transition hover:bg-heading hover:text-contrast"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
