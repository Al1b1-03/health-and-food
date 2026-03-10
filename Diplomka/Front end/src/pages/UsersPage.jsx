import { useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import { authApi } from '../api/auth';
import './UsersPage.css';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const loadUsers = async () => {
    try {
      setError('');
      const [{ users: data }, profile] = await Promise.all([
        usersApi.list(),
        authApi.getProfile().catch(() => ({ user: null })),
      ]);
      setUsers(data);
      if (profile?.user?.id) setCurrentUserId(profile.user.id);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const visibleUsers = currentUserId != null ? users.filter((u) => u.id !== currentUserId) : users;

  const handleBan = async (user) => {
    setActionLoading(user.id);
    try {
      await usersApi.ban(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isBanned: !u.isBanned } : u
        )
      );
    } catch (err) {
      setError(err.message || 'Ошибка при блокировке');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Удалить пользователя ${user.fullName} (${user.email})?`)) {
      return;
    }
    setActionLoading(user.id);
    try {
      await usersApi.delete(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err.message || 'Ошибка при удалении');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="users-page">
        <h1 className="users-page__title">Учетные записи пользователей</h1>
        <p className="users-page__loading">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      <h1 className="users-page__title">Учетные записи пользователей</h1>
      {error && <p className="users-page__error">{error}</p>}

      <div className="users-grid">
        {visibleUsers.map((user) => (
          <div key={user.id} className="users-card">
            <div className="users-card__field">
              <span className="users-card__label">Имя пользователя:</span>
              <span className="users-card__value">{user.fullName}</span>
            </div>
            <div className="users-card__field">
              <span className="users-card__label">Email:</span>
              <span className="users-card__value">{user.email}</span>
            </div>
            <p
              className={`users-card__status ${user.isBanned ? 'users-card__status--banned' : ''}`}
            >
              {user.isBanned ? 'Пользователь забанен' : 'Пользователь не забанен'}
            </p>
            <div className="users-card__actions">
              <button
                type="button"
                className="users-card__btn users-card__btn--ban"
                onClick={() => handleBan(user)}
                disabled={actionLoading === user.id || user.role === 'admin'}
                title={user.role === 'admin' ? 'Нельзя заблокировать администратора' : ''}
              >
                {actionLoading === user.id ? '...' : user.isBanned ? 'Разбанить' : 'Бан'}
              </button>
              <button
                type="button"
                className="users-card__btn users-card__btn--delete"
                onClick={() => handleDelete(user)}
                disabled={actionLoading === user.id || user.role === 'admin'}
                title={user.role === 'admin' ? 'Нельзя удалить администратора' : ''}
              >
                {actionLoading === user.id ? '...' : 'Удалить'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {visibleUsers.length === 0 && !loading && (
        <p className="users-page__empty">Нет пользователей</p>
      )}
    </div>
  );
}
