import { useState } from 'react';
import ErrorState from '../components/ErrorState.jsx';
import PageHeading from '../components/PageHeading.jsx';
import { api } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const BootstrapAdminPage = () => {
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bootstrapToken: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    setSuccess(false);
    try {
      setSubmitting(true);
      await api.bootstrapAdmin({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        bootstrapToken: form.bootstrapToken.trim()
      });
      await refresh();
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Unable to create admin account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8">
      <PageHeading
        eyebrow="Admin bootstrap"
        title="Create an administrator"
        description="Provide the bootstrap token and credentials to create the first admin. Keep this page hidden from regular users."
      />

      <div className="max-w-lg space-y-6 rounded-3xl border border-muted bg-surface p-6 shadow-lg shadow-soft">
        {error && <ErrorState message={error} />}
        {success && (
          <p className="rounded-2xl border border-secondary bg-accent p-4 text-sm text-secondary">
            Admin account created successfully and signed in.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="bootstrapToken" className="block text-sm font-semibold text-contrast">
              Bootstrap token
            </label>
            <input
              id="bootstrapToken"
              name="bootstrapToken"
              type="password"
              value={form.bootstrapToken}
              onChange={handleChange}
              placeholder="Enter the secret token"
              className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-contrast placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-contrast">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Admin name"
              className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-contrast placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-contrast">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-contrast placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-contrast">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-contrast placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-contrast transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Creating…' : 'Create admin'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default BootstrapAdminPage;
