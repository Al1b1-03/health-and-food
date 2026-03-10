import { useState, useEffect } from 'react';
import { workoutsApi } from '../api/workouts';
import { workoutsData } from '../data/workouts';
import './WorkoutsPage.css';

const WorkoutIcon = ({ id = 'workout-g' }) => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill={`url(#workout-gradient-${id})`} />
    <path
      d="M32 18v28M24 26h16M24 26l-4 12h4l4-4 4 4h4l-4-12M24 38h16"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id={`workout-gradient-${id}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00A6FF" />
        <stop offset="0.5" stopColor="#7B00FF" />
        <stop offset="1" stopColor="#FF0090" />
      </linearGradient>
    </defs>
  </svg>
);

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    workoutsApi
      .list()
      .then(({ workouts: data }) => setWorkouts(data ?? []))
      .catch(() => setWorkouts(workoutsData))
      .finally(() => setLoading(false));
  }, []);

  const openDetails = (workout) => setSelectedWorkout(workout);
  const closeDetails = () => setSelectedWorkout(null);

  const list = workouts.length > 0 ? workouts : workoutsData;

  return (
    <div className="workouts-page">
      <h1 className="workouts-page__title">Тренировки</h1>
      {loading && <p className="workouts-page__loading">Загрузка...</p>}
      <div className="workouts-grid">
        {list.map((workout) => (
          <div key={workout.id} className="workout-card">
            <div className="workout-card__image-wrap">
              {workout.image ? (
                <img src={workout.image} alt={workout.title} className="workout-card__image" />
              ) : (
                <div className="workout-card__placeholder">
                  <WorkoutIcon id={workout.id} />
                </div>
              )}
            </div>
            <div className="workout-card__content">
              <h3 className="workout-card__name">{workout.title}</h3>
              <p className="workout-card__desc">{workout.shortDesc}</p>
              <div className="workout-card__meta">
                <span className="workout-card__meta-item">{workout.duration} мин</span>
                <span className="workout-card__meta-item">{workout.calories} Ккал</span>
                <span className="workout-card__meta-item">{workout.difficulty}</span>
              </div>
              <button
                type="button"
                className="workout-card__btn"
                onClick={() => openDetails(workout)}
              >
                Подробнее
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedWorkout && (
        <div className="workout-modal" onClick={closeDetails}>
          <div className="workout-modal__content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="workout-modal__close"
              onClick={closeDetails}
              aria-label="Закрыть"
            >
              ×
            </button>
            <h2 className="workout-modal__title">{selectedWorkout.title}</h2>
            <div className="workout-modal__meta">
              <span>{selectedWorkout.duration} мин</span>
              <span>{selectedWorkout.calories} Ккал</span>
              <span>{selectedWorkout.difficulty}</span>
            </div>
            <p className="workout-modal__desc">{selectedWorkout.fullDescription}</p>
            <h4 className="workout-modal__exercises-title">Упражнения</h4>
            <div className="workout-modal__exercises">
              {(selectedWorkout.exercises || []).map((ex, idx) => (
                <div key={idx} className="workout-modal__exercise">
                  <div className="workout-modal__exercise-header">
                    <span className="workout-modal__exercise-name">{ex.name}</span>
                    <span className="workout-modal__exercise-sets">{ex.sets} × {ex.reps}</span>
                  </div>
                  {ex.rest && ex.rest !== '—' && (
                    <span className="workout-modal__exercise-rest">Отдых: {ex.rest}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
