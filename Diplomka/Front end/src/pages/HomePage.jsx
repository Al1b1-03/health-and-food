import { useState, useEffect } from 'react';
import MainPage from './MainPage';
import AdminMainPage from './AdminMainPage';

export default function HomePage() {
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));

  useEffect(() => {
    const onRoleUpdate = () => setUserRole(localStorage.getItem('userRole'));
    window.addEventListener('userRoleUpdated', onRoleUpdate);
    return () => window.removeEventListener('userRoleUpdated', onRoleUpdate);
  }, []);

  return userRole === 'admin' ? <AdminMainPage /> : <MainPage />;
}
