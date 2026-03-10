import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import './AdminProfilePage.css';

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    repeatPassword: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { user } = await authApi.getProfile();
        if (user) {
          setEmail(user.email || '');
        }
      } catch {
        // Profile might not exist or user not authenticated
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.newPassword) {
      if (formData.newPassword !== formData.repeatPassword) {
        setError('Пароли не совпадают');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('Пароль должен быть не менее 6 символов');
        return;
      }
      if (!formData.oldPassword) {
        setError('Введите текущий пароль');
        return;
      }
    }

    setLoading(true);
    try {
      await authApi.updateProfile({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword || undefined,
      });
      setSuccess(true);
      setFormData({ oldPassword: '', newPassword: '', repeatPassword: '' });
    } catch (err) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login', { replace: true });
  };

  if (loading && !email) {
    return (
      <div className="admin-profile-page">
        <div className="admin-profile-card">
          <p className="admin-profile-page__loading">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-page__header">
        <h1 className="admin-profile-page__title">Обновить профиль</h1>
      </div>
      <div className="admin-profile-card">
        <form className="admin-profile-form" onSubmit={handleSubmit}>
          {error && <p className="admin-profile-form__error">{error}</p>}
          {success && <p className="admin-profile-form__success">Профиль обновлён</p>}

          <div className="admin-profile-form__field">
            <label className="admin-profile-form__label">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="admin-profile-form__input admin-profile-form__input--readonly"
              placeholder="Ваш email"
            />
          </div>

          <div className="admin-profile-form__field">
            <label className="admin-profile-form__label">Старый пароль</label>
            <input
              type="password"
              name="oldPassword"
              placeholder="Введите старый пароль"
              value={formData.oldPassword}
              onChange={handleChange}
              className="admin-profile-form__input"
            />
          </div>

          <div className="admin-profile-form__field">
            <label className="admin-profile-form__label">Новый пароль</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Введите новый пароль"
              value={formData.newPassword}
              onChange={handleChange}
              className="admin-profile-form__input"
            />
          </div>

          <div className="admin-profile-form__field">
            <label className="admin-profile-form__label">Повторите</label>
            <input
              type="password"
              name="repeatPassword"
              placeholder="Потвердите пароль"
              value={formData.repeatPassword}
              onChange={handleChange}
              className="admin-profile-form__input"
            />
          </div>

          <div className="admin-profile-form__actions">
            <button type="submit" className="admin-profile-form__submit" disabled={loading}>
              {loading ? 'Обновление...' : 'Обновить'}
            </button>
            <button
              type="button"
              className="admin-profile-form__logout"
              onClick={handleLogout}
            >
              Выйти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
