import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { authApi } from '../api/auth';
import './Header.css';

const CartIcon = () => (
  <svg
    className="header__cart-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M5 7h14l-1.5 10H6.5L5 7z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 7V5a3 3 0 016 0v2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { items } = await import('../api/shop').then((m) => m.shopApi.getCart());
        setCount(items?.length ?? 0);
      } catch {
        setCount(0);
      }
    };
    if (localStorage.getItem('token')) fetchCount();
  }, []);

  useEffect(() => {
    const onUpdate = () => {
      import('../api/shop').then((m) =>
        m.shopApi.getCart().then(({ items }) => setCount(items?.length ?? 0))
      );
    };
    window.addEventListener('cartUpdated', onUpdate);
    return () => window.removeEventListener('cartUpdated', onUpdate);
  }, []);

  if (count === 0) return null;
  return <span className="header__cart-badge">{count}</span>;
}

export default function Header() {
  const isLoggedIn = !!localStorage.getItem('token');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));

  useEffect(() => {
    if (isLoggedIn && !userRole) {
      authApi.getProfile().then(({ user }) => {
        if (user?.role) {
          localStorage.setItem('userRole', user.role);
          setUserRole(user.role);
        }
      }).catch(() => {});
    }
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    const onRoleUpdate = () => setUserRole(localStorage.getItem('userRole'));
    window.addEventListener('userRoleUpdated', onRoleUpdate);
    return () => window.removeEventListener('userRoleUpdated', onRoleUpdate);
  }, []);

  const isAdmin = userRole === 'admin';

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <img src="/logo.png" alt="" className="header__logo-img" />
          <span className="header__brand">
            {isAdmin ? 'CTP Admin' : <>Calorie <span className="header__brand-tracker">Tracker</span> Pro</>}
          </span>
        </Link>
        <nav className="header__nav">
          <NavLink to="/" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
            Главная
          </NavLink>
          {isAdmin ? (
            <>
              <NavLink to="/products" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
                Товары
              </NavLink>
              <NavLink to="/orders" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
                Заказы
              </NavLink>
              <NavLink to="/users" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
                Пользователи
              </NavLink>
              <NavLink to="/workouts" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
                Тренировки
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/shop" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
                Покупка продуктов
              </NavLink>
              <NavLink to="/workouts" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
                Тренировки
              </NavLink>
            </>
          )}
        </nav>
        <div className="header__actions">
          {isLoggedIn ? (
            <>
              {!isAdmin && (
                <NavLink to="/cart" className="header__cart" aria-label="Корзина">
                  <CartIcon />
                  <CartBadge />
                </NavLink>
              )}
              <NavLink
                to="/profile"
                className={({ isActive }) => `header__profile-btn ${isActive ? 'header__profile-btn--active' : ''}`}
              >
                Профиль
              </NavLink>
            </>
          ) : (
            <Link to="/login" className="header__profile-btn">
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
