import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchMe } from '../../api/auth.api';
import { LoadingSpinner } from '../LoadingSpinner';
import { useAuthStore } from '../../stores/authStore';

export const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const [checking, setChecking] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const response = await fetchMe();
        if (!cancelled) {
          setSession({
            token,
            user: response.data.user,
            stores: response.data.stores,
          });
        }
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [token, setSession, logout]);

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <LoadingSpinner />
      </div>
    );
  }

  return children;
};
