import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext({
  user: null,
  loading: true,
  error: '',
  refresh: async () => null,
  setUser: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getCurrentUser();
      const currentUser = response?.data?.user || null;
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      setUser(null);
      if (err?.message && err.message.toLowerCase().includes('authentication')) {
        setError('');
      } else if (err?.message) {
        setError(err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      refresh: loadUser,
      setUser
    }),
    [user, loading, error, loadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
