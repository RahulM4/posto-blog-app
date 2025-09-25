import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const LogoutButton = ({ variant = 'default', className = '' }) => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await api.logout();
      setUser(null);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Unable to log out');
    } finally {
      setBusy(false);
    }
  };

  const baseClasses =
    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed';
  const variantClasses =
    variant === 'minimal'
      ? 'border-muted bg-accent text-body hover:border-primary hover:bg-heading hover:text-contrast'
      : 'border-muted bg-surface text-primary hover:border-primary hover:bg-heading hover:text-contrast';

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleLogout}
        disabled={busy}
        className={`${baseClasses} ${variantClasses} ${className}`}
      >
        {busy ? 'Signing out…' : 'Sign out'}
      </button>
      {error && <p className="text-xs text-secondary">{error}</p>}
    </div>
  );
};

export default LogoutButton;
