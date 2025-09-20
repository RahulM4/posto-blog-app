import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorState from '../components/ErrorState.jsx';
import PageHeading from '../components/PageHeading.jsx';
import { api } from '../utils/api.js';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    try {
      setSubmitting(true);
      await api.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      });
      setCompleted(true);
    } catch (err) {
      setError(err.message || 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8">
      <PageHeading
        eyebrow="Join the community"
        title="Create an account"
        description="Submit your stories once your email is verified and an admin approves your account."
      />

      <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-muted bg-surface p-6 shadow-lg shadow-soft">
        {error && <ErrorState message={error} />}
        {completed ? (
          <div className="space-y-3 text-sm text-contrast">
            <p className="rounded-2xl border border-secondary bg-accent p-4 text-secondary">
              We emailed a verification link to {form.email}. Click it to confirm your address, then wait for an admin to approve your account.
            </p>
            <p>
              Already verified?{' '}
              <Link to="/login" className="text-secondary hover:text-contrast">
                Sign in here
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Jane Doe"
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
                placeholder="you@example.com"
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
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}
        {!completed && (
          <p className="text-center text-sm text-muted">
            Already verified?{' '}
            <Link to="/login" className="text-secondary hover:text-contrast">
              Sign in here
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
};

export default RegisterPage;
