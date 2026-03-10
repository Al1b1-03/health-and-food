import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmailIcon, PhoneIcon, LockIcon, CloseIcon } from '../shared/icons';
import { authApi } from '../api/auth';
import './RegistrationForm.css';

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);
    try {
      await authApi.register(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-card">
        <button className="registration-card__close" aria-label="Закрыть">
          <CloseIcon />
        </button>
        <h1 className="registration-card__title">Calorie Tracker Pro</h1>

        <div className="registration-card__tabs">
          <Link
            to="/login"
            className="registration-card__tab registration-card__tab--inactive"
          >
            Вход
          </Link>
          <span className="registration-card__tab registration-card__tab--active">
            Регистрация
          </span>
        </div>

        <form className="registration-form" onSubmit={handleSubmit}>
          {success && (
            <p className="registration-form__success">
              Регистрация прошла успешно! Перенаправление на страницу входа...
            </p>
          )}
          {error && <p className="registration-form__error">{error}</p>}
          <div className="registration-form__field">
            <label className="registration-form__label">Имя</label>
            <input
              type="text"
              name="firstName"
              placeholder="Ваше имя"
              value={formData.firstName}
              onChange={handleChange}
              className="registration-form__input"
            />
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label">Фамилия</label>
            <input
              type="text"
              name="lastName"
              placeholder="Ваше фамилия"
              value={formData.lastName}
              onChange={handleChange}
              className="registration-form__input"
            />
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label">Номер</label>
            <input
              type="tel"
              name="phone"
              placeholder="Ваш номер"
              value={formData.phone}
              onChange={handleChange}
              className="registration-form__input registration-form__input--with-icon"
            />
            <span className="registration-form__icon registration-form__icon--left">
              <PhoneIcon />
            </span>
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Ваш email"
              value={formData.email}
              onChange={handleChange}
              className="registration-form__input registration-form__input--with-icon"
            />
            <span className="registration-form__icon registration-form__icon--left">
              <EmailIcon />
            </span>
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label">Пароль</label>
            <input
              type="password"
              name="password"
              placeholder="Придумайте пароль"
              value={formData.password}
              onChange={handleChange}
              className="registration-form__input registration-form__input--with-icon"
            />
            <span className="registration-form__icon registration-form__icon--left">
              <LockIcon />
            </span>
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label">Потверждение пароля</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Повторите пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="registration-form__input registration-form__input--with-icon"
            />
            <span className="registration-form__icon registration-form__icon--left">
              <LockIcon />
            </span>
          </div>

          <button type="submit" className="registration-form__submit" disabled={loading || success}>
            {loading ? 'Регистрация...' : 'Зарегистрироватся'}
          </button>

          <p className="registration-form__footer">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
