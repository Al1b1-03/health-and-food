import { useEffect, useState } from 'react';
import { workoutsApi } from '../api/workouts';
import './AdminWorkoutsPage.css';

const INITIAL_FORM = {
  title: '',
  shortDesc: '',
  fullDescription: '',
  duration: '30',
  calories: '0',
  difficulty: 'Средняя',
  imageUrl: '',
  exercises: [{ name: '', sets: '', reps: '', rest: '' }],
};

const DIFFICULTY_OPTIONS = ['Лёгкая', 'Средняя', 'Высокая'];

export default function AdminWorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const loadWorkouts = async () => {
    try {
      setError('');
      const { workouts: data } = await workoutsApi.admin.list();
      setWorkouts(data ?? []);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки тренировок');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleExerciseChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: '', reps: '', rest: '' }],
    }));
  };

  const removeExercise = (index) => {
    if (formData.exercises.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setShowForm(true);
  };

  const openEdit = (workout) => {
    setEditingId(workout.id);
    setFormData({
      title: workout.title ?? '',
      shortDesc: workout.shortDesc ?? '',
      fullDescription: workout.fullDescription ?? '',
      duration: String(workout.duration ?? 30),
      calories: String(workout.calories ?? 0),
      difficulty: workout.difficulty ?? 'Средняя',
      imageUrl: workout.imageUrl ?? workout.image ?? '',
      exercises:
        (workout.exercises?.length && workout.exercises.map((ex) => ({
          name: ex.name ?? '',
          sets: ex.sets ?? '',
          reps: ex.reps ?? '',
          rest: ex.rest ?? '—',
        }))) ||
        [{ name: '', sets: '', reps: '', rest: '' }],
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Введите название тренировки');
      return;
    }
    setActionLoading(editingId ?? 'new');
    setError('');
    try {
      const payload = {
        title: formData.title.trim(),
        shortDesc: formData.shortDesc.trim() || undefined,
        fullDescription: formData.fullDescription.trim() || undefined,
        duration: parseInt(formData.duration, 10) || 0,
        calories: parseInt(formData.calories, 10) || 0,
        difficulty: formData.difficulty,
        imageUrl: formData.imageUrl.trim() || undefined,
        exercises: formData.exercises
          .filter((ex) => ex.name?.trim())
          .map((ex) => ({
            name: ex.name.trim(),
            sets: ex.sets,
            reps: ex.reps,
            rest: ex.rest || '—',
          })),
      };
      if (editingId) {
        const { workout } = await workoutsApi.admin.update(editingId, payload);
        setWorkouts((prev) => prev.map((w) => (w.id === editingId ? workout : w)));
      } else {
        const { workout } = await workoutsApi.admin.create(payload);
        setWorkouts((prev) => [workout, ...prev]);
      }
      closeForm();
    } catch (err) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (workout) => {
    if (!window.confirm(`Удалить тренировку «${workout.title}»?`)) return;
    setActionLoading(workout.id);
    try {
      await workoutsApi.admin.delete(workout.id);
      setWorkouts((prev) => prev.filter((w) => w.id !== workout.id));
    } catch (err) {
      setError(err.message || 'Ошибка удаления');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-workouts">
        <h1 className="admin-workouts__title">База тренировок</h1>
        <p className="admin-workouts__loading">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="admin-workouts">
      <div className="admin-workouts__header">
        <h1 className="admin-workouts__title">База тренировок</h1>
        <button type="button" className="admin-workouts__add-btn" onClick={openAdd}>
          + Добавить тренировку
        </button>
      </div>
      {error && <p className="admin-workouts__error">{error}</p>}

      <div className="admin-workouts__grid">
        {workouts.map((workout) => (
          <div key={workout.id} className="admin-workouts__card">
            <div className="admin-workouts__card-content">
              <h3 className="admin-workouts__card-name">{workout.title}</h3>
              <p className="admin-workouts__card-meta">
                {workout.duration} мин · {workout.calories} Ккал · {workout.difficulty}
              </p>
            </div>
            <div className="admin-workouts__card-actions">
              <button
                type="button"
                className="admin-workouts__btn admin-workouts__btn--edit"
                onClick={() => openEdit(workout)}
                disabled={actionLoading !== null}
              >
                Изменить
              </button>
              <button
                type="button"
                className="admin-workouts__btn admin-workouts__btn--delete"
                onClick={() => handleDelete(workout)}
                disabled={actionLoading === workout.id}
              >
                {actionLoading === workout.id ? '...' : 'Удалить'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="admin-workouts__modal" onClick={closeForm}>
          <div className="admin-workouts__modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="admin-workouts__modal-close"
              onClick={closeForm}
              aria-label="Закрыть"
            >
              ×
            </button>
            <h2 className="admin-workouts__modal-title">
              {editingId ? 'Редактировать тренировку' : 'Добавить тренировку'}
            </h2>
            <form onSubmit={handleSubmit} className="admin-workouts__form">
              <label className="admin-workouts__label">
                Название *
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="admin-workouts__input"
                  required
                />
              </label>
              <label className="admin-workouts__label">
                Краткое описание
                <input
                  type="text"
                  name="shortDesc"
                  value={formData.shortDesc}
                  onChange={handleChange}
                  className="admin-workouts__input"
                />
              </label>
              <label className="admin-workouts__label">
                Полное описание
                <textarea
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleChange}
                  className="admin-workouts__input admin-workouts__textarea"
                  rows={3}
                />
              </label>
              <div className="admin-workouts__row">
                <label className="admin-workouts__label">
                  Длительность (мин)
                  <input
                    type="number"
                    name="duration"
                    min="0"
                    value={formData.duration}
                    onChange={handleChange}
                    className="admin-workouts__input"
                  />
                </label>
                <label className="admin-workouts__label">
                  Ккал
                  <input
                    type="number"
                    name="calories"
                    min="0"
                    value={formData.calories}
                    onChange={handleChange}
                    className="admin-workouts__input"
                  />
                </label>
                <label className="admin-workouts__label">
                  Сложность
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="admin-workouts__input"
                  >
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="admin-workouts__label">
                URL изображения
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="admin-workouts__input"
                  placeholder="https://..."
                />
              </label>

              <div className="admin-workouts__exercises">
                <div className="admin-workouts__exercises-header">
                  <span>Упражнения</span>
                  <button type="button" className="admin-workouts__add-ex" onClick={addExercise}>
                    + Упражнение
                  </button>
                </div>
                {formData.exercises.map((ex, index) => (
                  <div key={index} className="admin-workouts__exercise-row">
                    <input
                      type="text"
                      placeholder="Название"
                      value={ex.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      className="admin-workouts__input admin-workouts__ex-name"
                    />
                    <input
                      type="text"
                      placeholder="Подходы"
                      value={ex.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                      className="admin-workouts__input admin-workouts__ex-small"
                    />
                    <input
                      type="text"
                      placeholder="Повторения"
                      value={ex.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                      className="admin-workouts__input admin-workouts__ex-small"
                    />
                    <input
                      type="text"
                      placeholder="Отдых"
                      value={ex.rest}
                      onChange={(e) => handleExerciseChange(index, 'rest', e.target.value)}
                      className="admin-workouts__input admin-workouts__ex-small"
                    />
                    <button
                      type="button"
                      className="admin-workouts__remove-ex"
                      onClick={() => removeExercise(index)}
                      disabled={formData.exercises.length <= 1}
                      aria-label="Удалить упражнение"
                    >
                      −
                    </button>
                  </div>
                ))}
              </div>

              <div className="admin-workouts__form-actions">
                <button type="button" className="admin-workouts__btn admin-workouts__btn--secondary" onClick={closeForm}>
                  Отмена
                </button>
                <button
                  type="submit"
                  className="admin-workouts__btn admin-workouts__btn--save"
                  disabled={actionLoading !== null}
                >
                  {actionLoading !== null ? '...' : editingId ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
