import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import PageHeading from '../components/PageHeading.jsx';
import { api } from '../utils/api.js';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState({ loading: true, error: '', success: false });
  const token = searchParams.get('token');

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus({ loading: false, error: 'Missing verification token.', success: false });
        return;
      }
      try {
        setStatus({ loading: true, error: '', success: false });
        await api.verifyEmail({ token });
        setStatus({ loading: false, error: '', success: true });
      } catch (err) {
        setStatus({ loading: false, error: err.message || 'Unable to verify email.', success: false });
      }
    };
    run();
  }, [token]);

  if (status.loading) {
    return <Loader message="Confirming your email…" />;
  }

  return (
    <section className="space-y-8">
      <PageHeading
        eyebrow="Email confirmation"
        title={status.success ? 'Email verified' : 'Verification failed'}
        description={
          status.success
            ? 'Thanks for confirming your email. An admin will approve your account soon.'
            : 'We could not verify your email with the provided link.'
        }
      />

      <div className="mx-auto max-w-md space-y-4 rounded-3xl border border-muted bg-surface p-6 text-sm text-contrast shadow-lg shadow-soft">
        {status.success ? (
          <p>
            You can now sign in once an administrator approves your account.
            <br />
            <Link to="/login" className="text-secondary hover:text-contrast">
              Continue to sign in
            </Link>
            .
          </p>
        ) : (
          <ErrorState message={status.error || 'Verification link invalid or expired.'} />
        )}
      </div>
    </section>
  );
};

export default VerifyEmailPage;
