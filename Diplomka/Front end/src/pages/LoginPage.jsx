import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmailIcon, LockIcon, CloseIcon, GoogleIcon, VkIcon, YandexIcon } from '../shared/icons';
import { authApi } from '../api/auth';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await authApi.login(formData.email, formData.password);
      localStorage.setItem('token', token);
      const role = user?.role || 'user';
      localStorage.setItem('userRole', role);
      window.dispatchEvent(new CustomEvent('userRoleUpdated'));
      navigate(role === 'admin' ? '/products' : '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <button className="login-card__close" aria-label="Закрыть">
          <CloseIcon />
        </button>
        <h1 className="login-card__title">Calorie Tracker Pro</h1>
        <div className="login-card__tabs">
          <span className="login-card__tab login-card__tab--active">Вход</span>
          <Link to="/registration" className="login-card__tab login-card__tab--inactive">
            Регистрация
          </Link>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <p className="login-form__error">{error}</p>}
          <div className="login-form__field">
            <label className="login-form__label">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Ваш email"
              value={formData.email}
              onChange={handleChange}
              className="login-form__input login-form__input--with-icon"
            />
            <span className="login-form__icon"><EmailIcon /></span>
          </div>
          <div className="login-form__field">
            <label className="login-form__label">Пароль</label>
            <input
              type="password"
              name="password"
              placeholder="Ваш пароль"
              value={formData.password}
              onChange={handleChange}
              className="login-form__input login-form__input--with-icon"
            />
            <span className="login-form__icon"><LockIcon /></span>
          </div>
          <button type="submit" className="login-form__submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
          <div className="login-form__social">
            <div className="login-form__social-divider">
              <span className="login-form__social-line"></span>
              <span className="login-form__social-text">Или войдите через</span>
              <span className="login-form__social-line"></span>
            </div>
            <div className="login-form__social-icons">
              <button type="button" className="login-form__social-btn" aria-label="Войти через Google">
                <GoogleIcon />
              </button>
              <button type="button" className="login-form__social-btn" aria-label="Войти через Google">
                <YandexIcon />
              </button>
              <button type="button" className="login-form__social-btn" aria-label="Войти через VK">
                <VkIcon />
              </button>
            </div>
          </div>
          <p className="login-form__footer">
            Нет аккаунта? <Link to="/registration">Зарегистрироваться</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
