import { useState, useEffect } from 'react';
import WorkoutsPage from './WorkoutsPage';
import AdminWorkoutsPage from './AdminWorkoutsPage';

export default function WorkoutsPageRouter() {
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));

  useEffect(() => {
    const onRoleUpdate = () => setUserRole(localStorage.getItem('userRole'));
    window.addEventListener('userRoleUpdated', onRoleUpdate);
    return () => window.removeEventListener('userRoleUpdated', onRoleUpdate);
  }, []);

  return userRole === 'admin' ? <AdminWorkoutsPage /> : <WorkoutsPage />;
}
