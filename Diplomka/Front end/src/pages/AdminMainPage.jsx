import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../api/users';
import { productsApi } from '../api/products';
import { ordersApi } from '../api/orders';
import { workoutsApi } from '../api/workouts';
import './AdminMainPage.css';

const STATS = [
  { key: 'users', label: 'Пользователи', to: '/users', api: () => usersApi.list().then((r) => (Array.isArray(r?.users) ? r.users.length : 0)) },
  { key: 'products', label: 'Товары', to: '/products', api: () => productsApi.list().then((r) => (Array.isArray(r?.products) ? r.products.length : 0)) },
  { key: 'orders', label: 'Заказы', to: '/orders', api: () => ordersApi.list().then((r) => (Array.isArray(r?.orders) ? r.orders.length : 0)) },
  { key: 'workouts', label: 'Тренировки', to: '/workouts', api: () => workoutsApi.admin.list().then((r) => (Array.isArray(r?.workouts) ? r.workouts.length : 0)) },
];

export default function AdminMainPage() {
  const [counts, setCounts] = useState({ users: 0, products: 0, orders: 0, workouts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError('');
    Promise.allSettled(STATS.map((s) => s.api()))
      .then((results) => {
        if (cancelled) return;
        const [u, p, o, w] = results.map((r) => (r.status === 'fulfilled' ? r.value : 0));
        setCounts({ users: u, products: p, orders: o, workouts: w });
        if (results.some((r) => r.status === 'rejected')) {
          setError('Часть данных не загрузилась');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="admin-main">
      <h1 className="admin-main__title">Панель администратора</h1>
      <p className="admin-main__subtitle">Управление приложением Calorie Tracker Pro</p>

      {error && <p className="admin-main__error">{error}</p>}

      {loading ? (
        <p className="admin-main__loading">Загрузка...</p>
      ) : (
        <div className="admin-main__grid">
          {STATS.map(({ key, label, to }) => (
            <Link key={key} to={to} className="admin-main__card">
              <span className="admin-main__card-label">{label}</span>
              <span className="admin-main__card-count">{counts[key] ?? 0}</span>
              <span className="admin-main__card-link">Перейти →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
