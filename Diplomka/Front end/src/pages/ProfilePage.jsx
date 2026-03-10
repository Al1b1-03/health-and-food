import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import AdminProfilePage from './AdminProfilePage';
import './ProfilePage.css';

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Сидячий образ жизни' },
  { value: 'light', label: 'Лёгкая активность' },
  { value: 'moderate', label: 'Умеренная активность' },
  { value: 'active', label: 'Высокая активность' },
  { value: 'very_active', label: 'Очень высокая активность' },
];

const GENDERS = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    activityLevel: '',
    calorieNorm: '',
    protein: '',
    fat: '',
    carbs: '',
    newPassword: '',
    repeatPassword: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { user } = await authApi.getProfile();
        if (user) {
          const role = user.role || 'user';
          setUserRole(role);
          if (role) {
            localStorage.setItem('userRole', role);
            window.dispatchEvent(new CustomEvent('userRoleUpdated'));
          }
          setFormData((prev) => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            email: user.email || '',
            gender: user.gender || '',
            age: user.age?.toString() || '',
            weight: user.weight?.toString() || '',
            height: user.height?.toString() || '',
            activityLevel: user.activityLevel || '',
            calorieNorm: user.calorieNorm?.toString() || '',
            protein: user.protein?.toString() || '',
            fat: user.fat?.toString() || '',
            carbs: user.carbs?.toString() || '',
          }));
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
    }

    setLoading(true);
    try {
      await authApi.updateProfile({
        gender: formData.gender,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        activityLevel: formData.activityLevel,
        calorieNorm: formData.calorieNorm,
        protein: formData.protein,
        fat: formData.fat,
        carbs: formData.carbs,
        newPassword: formData.newPassword || undefined,
      });
      setSuccess(true);
      setFormData((prev) => ({ ...prev, newPassword: '', repeatPassword: '' }));
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

  if (loading && !formData.age && userRole !== 'admin') {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p className="profile-page__loading">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (userRole === 'admin') {
    return <AdminProfilePage />;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-card__header">
          <UserIcon />
          <h1 className="profile-card__title">Настройки профиля</h1>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          {error && <p className="profile-form__error">{error}</p>}
          {success && <p className="profile-form__success">Профиль сохранён</p>}

          <div className="profile-form__field">
            <label className="profile-form__label">Пол</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="profile-form__input"
            >
              <option value="">Выберите</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div className="profile-form__field">
            <label className="profile-form__label">Возраст</label>
            <input
              type="number"
              name="age"
              placeholder="0"
              min="1"
              max="120"
              value={formData.age}
              onChange={handleChange}
              className="profile-form__input"
            />
          </div>

          <div className="profile-form__field">
            <label className="profile-form__label">Вес (кг)</label>
            <input
              type="number"
              name="weight"
              placeholder="0"
              min="1"
              value={formData.weight}
              onChange={handleChange}
              className="profile-form__input"
            />
          </div>

          <div className="profile-form__field">
            <label className="profile-form__label">Рост</label>
            <input
              type="number"
              name="height"
              placeholder="0"
              min="1"
              value={formData.height}
              onChange={handleChange}
              className="profile-form__input"
            />
          </div>

          <div className="profile-form__field">
            <label className="profile-form__label">Уровень активности</label>
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              className="profile-form__input"
            >
              <option value="">Выберите</option>
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div className="profile-form__section">
            <h2 className="profile-form__section-title">Смена пароля</h2>
            <div className="profile-form__field">
              <label className="profile-form__label">Новый пароль</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Придумайте пароль"
                value={formData.newPassword}
                onChange={handleChange}
                className="profile-form__input"
              />
            </div>
            <div className="profile-form__field">
              <label className="profile-form__label">Повторите пароль</label>
              <input
                type="password"
                name="repeatPassword"
                placeholder="Повторите пароль"
                value={formData.repeatPassword}
                onChange={handleChange}
                className="profile-form__input"
              />
            </div>
          </div>

          <div className="profile-form__field">
            <label className="profile-form__label">Ваша норма калорий</label>
            <input
              type="number"
              name="calorieNorm"
              placeholder="0"
              min="0"
              value={formData.calorieNorm}
              onChange={handleChange}
              className="profile-form__input"
            />
          </div>

          <div className="profile-form__macros-inputs">
            <div className="profile-form__field profile-form__field--inline">
              <label className="profile-form__label">Белки (г)</label>
              <input
                type="number"
                name="protein"
                placeholder="0"
                min="0"
                value={formData.protein}
                onChange={handleChange}
                className="profile-form__input"
              />
            </div>
            <div className="profile-form__field profile-form__field--inline">
              <label className="profile-form__label">Жиры (г)</label>
              <input
                type="number"
                name="fat"
                placeholder="0"
                min="0"
                value={formData.fat}
                onChange={handleChange}
                className="profile-form__input"
              />
            </div>
            <div className="profile-form__field profile-form__field--inline">
              <label className="profile-form__label">Углеводы (г)</label>
              <input
                type="number"
                name="carbs"
                placeholder="0"
                min="0"
                value={formData.carbs}
                onChange={handleChange}
                className="profile-form__input"
              />
            </div>
          </div>

          <div className="profile-form__actions">
            <button type="submit" className="profile-form__submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              className="profile-form__logout"
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

function UserIcon() {
  return (
    <svg width="35" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 20c0-4 4-6 8-6s8 2 8 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
