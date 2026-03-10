import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));
  const [checking, setChecking] = useState(!userRole && !!token);
  const location = useLocation();

  useEffect(() => {
    if (token && !userRole) {
      authApi.getProfile()
        .then(({ user }) => {
          const role = user?.role || 'user';
          localStorage.setItem('userRole', role);
          setUserRole(role);
        })
        .catch(() => setUserRole('user'))
        .finally(() => setChecking(false));
    }
  }, [token, userRole]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (checking) {
    return <div className="admin-route-loading">Загрузка...</div>;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
