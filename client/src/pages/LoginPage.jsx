import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ErrorState from '../components/ErrorState.jsx';
import PageHeading from '../components/PageHeading.jsx';
import { api } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    setSuccessMessage('');
    try {
      setSubmitting(true);
      await api.login({
        email: form.email.trim(),
        password: form.password
      });
      const currentUser = await refresh();
      setSuccessMessage('Signed in successfully. Redirecting…');
      const defaultRoute = currentUser && ['Admin', 'SuperAdmin', 'Moderator'].includes(currentUser.role) ? '/admin' : '/';
      const redirectTo = location.state?.from || defaultRoute;
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 800);
    } catch (err) {
      setError(err.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8">
      <PageHeading
        eyebrow="Welcome back"
        title="Sign in"
        description="Log in to submit stories or manage your account."
      />

      <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-muted bg-surface p-6 shadow-lg shadow-soft">
        {error && <ErrorState message={error} />}
        {successMessage && <p className="rounded-2xl border border-secondary bg-accent p-3 text-sm text-secondary">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-primary">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-body placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-primary">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-body placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-contrast transition hover:bg-heading focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-muted">
          Need an account?{' '}
          <Link to="/register" className="text-secondary hover:text-heading">
            Register here
          </Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
