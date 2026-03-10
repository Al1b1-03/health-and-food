import { useEffect, useState, useCallback } from 'react';
import { entriesApi } from '../api/entries';
import './MainPage.css';

export default function MainPage() {
  const [formData, setFormData] = useState({
    product: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterDateFrom) params.dateFrom = filterDateFrom;
      if (filterDateTo) params.dateTo = filterDateTo;
      const { entries: list } = await entriesApi.getList(params);
      setEntries(list);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки записей');
    } finally {
      setLoading(false);
    }
  }, [filterDateFrom, filterDateTo]);

  const loadStats = useCallback(async () => {
    try {
      const data = await entriesApi.getStats();
      setStats(data);
    } catch {
      setStats({
        today: { calories: 0, protein: 0, fat: 0, carbs: 0 },
        norm: 2000,
        remaining: 2000,
        total: 0,
        macros: { protein: 0, fat: 0, carbs: 0 },
      });
    }
  }, []);

  const loadChartData = useCallback(async () => {
    const today = new Date();
    const dateTo = today.toISOString().split('T')[0];
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    const dateFrom = from.toISOString().split('T')[0];
    try {
      const { entries: list } = await entriesApi.getList({ dateFrom, dateTo });
      const byDate = {};
      const day = new Date(dateFrom);
      const end = new Date(dateTo);
      while (day <= end) {
        const d = day.toISOString().split('T')[0];
        byDate[d] = 0;
        day.setDate(day.getDate() + 1);
      }
      list.forEach((e) => {
        const key = new Date(e.entryDate).toISOString().split('T')[0];
        if (byDate[key] !== undefined) {
          byDate[key] += e.calories || 0;
        }
      });
      const data = Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, calories]) => ({ date, calories }));
      setChartData(data);
    } catch {
      setChartData([]);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product.trim()) {
      setError('Введите название продукта');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await entriesApi.create({
        productName: formData.product.trim(),
        calories: formData.calories,
        protein: formData.protein,
        fat: formData.fat,
        carbs: formData.carbs,
        entryDate: formData.date,
      });
      setFormData((prev) => ({
        ...prev,
        product: '',
        calories: '',
        protein: '',
        fat: '',
        carbs: '',
      }));
      loadEntries();
      loadStats();
      loadChartData();
    } catch (err) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await entriesApi.delete(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      loadStats();
      loadChartData();
    } catch (err) {
      setError(err.message || 'Ошибка удаления');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="main-page">
      <div className="main-page__grid">
        <section className="main-page__new-entry">
          <div className="main-page__section-header">
            <button type="button" className="main-page__add-btn" aria-label="Добавить">
              <AddIcon />
            </button>
            <h2 className="main-page__section-title">Новая запись</h2>
          </div>

          <form className="main-page__form" onSubmit={handleSubmit}>
            {error && <p className="main-page__error">{error}</p>}
            <div className="main-page__field">
              <label className="main-page__label">Дата</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="main-page__input"
              />
            </div>

            <div className="main-page__field">
              <label className="main-page__label">Продукт или блюдо</label>
              <input
                type="text"
                name="product"
                placeholder="Что вы съели?"
                value={formData.product}
                onChange={handleChange}
                className="main-page__input"
              />
            </div>

            <div className="main-page__field">
              <label className="main-page__label">Количество калорий</label>
              <input
                type="number"
                name="calories"
                placeholder="0"
                min="0"
                value={formData.calories}
                onChange={handleChange}
                className="main-page__input"
              />
            </div>

            <div className="main-page__fields-row">
              <div className="main-page__field main-page__field--small">
                <label className="main-page__label">Белки (г)</label>
                <input
                  type="number"
                  name="protein"
                  placeholder="0"
                  min="0"
                  step="0.1"
                  value={formData.protein}
                  onChange={handleChange}
                  className="main-page__input"
                />
              </div>
              <div className="main-page__field main-page__field--small">
                <label className="main-page__label">Жиры (г)</label>
                <input
                  type="number"
                  name="fat"
                  placeholder="0"
                  min="0"
                  step="0.1"
                  value={formData.fat}
                  onChange={handleChange}
                  className="main-page__input"
                />
              </div>
              <div className="main-page__field main-page__field--small">
                <label className="main-page__label">Углеводы (г)</label>
                <input
                  type="number"
                  name="carbs"
                  placeholder="0"
                  min="0"
                  step="0.1"
                  value={formData.carbs}
                  onChange={handleChange}
                  className="main-page__input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="main-page__submit"
              disabled={saving || !formData.product.trim()}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        </section>

        <section className="main-page__records">
          <div className="main-page__section-header main-page__section-header--row">
            <h2 className="main-page__section-title">Все записи</h2>
            <div className="main-page__filter-controls">
              <input
                type="date"
                className="main-page__filter-input"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                placeholder="От"
              />
              <input
                type="date"
                className="main-page__filter-input"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                placeholder="До"
              />
            </div>
          </div>

          {loading ? (
            <p className="main-page__loading">Загрузка...</p>
          ) : entries.length === 0 ? (
            <div className="main-page__empty-state">
              <span className="main-page__empty-emoji" aria-hidden>🍽️</span>
              <p className="main-page__empty-text">Нет записей для отображения</p>
            </div>
          ) : (
            <ul className="main-page__entries-list">
              {entries.map((entry) => (
                <li key={entry.id} className="main-page__entry">
                  <div className="main-page__entry-content">
                    <span className="main-page__entry-name">{entry.productName}</span>
                    <span className="main-page__entry-meta">
                      {formatDate(entry.entryDate)} · {entry.calories} Ккал
                    </span>
                  </div>
                  <button
                    type="button"
                    className="main-page__entry-delete"
                    onClick={() => handleDelete(entry.id)}
                    aria-label="Удалить"
                  >
                    <DeleteIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="main-page__stats">
        <h2 className="main-page__section-title">Статистика</h2>
        <div className="main-page__stats-grid">
          <div className="main-page__stat-card">
            <span className="main-page__stat-label">Сегодня</span>
            <span className="main-page__stat-value">
              {stats?.today?.calories ?? 0} Ккал
            </span>
          </div>
          <div className="main-page__stat-card">
            <span className="main-page__stat-label">Норма</span>
            <span className="main-page__stat-value">{(stats?.norm ?? 2000)} Ккал</span>
          </div>
          <div className="main-page__stat-card">
            <span className="main-page__stat-label">Осталось</span>
            <span className="main-page__stat-value">
              {(stats?.remaining ?? 2000)} Ккал
            </span>
          </div>
          <div className="main-page__stat-card">
            <span className="main-page__stat-label">Всего</span>
            <span className="main-page__stat-value">{(stats?.total ?? 0)} Ккал</span>
          </div>
        </div>
        <div className="main-page__macros">
          <span className="main-page__macro main-page__macro--protein">
            Белки: {stats?.today?.protein ?? 0}
          </span>
          <span className="main-page__macro main-page__macro--fat">
            Жиры: {stats?.today?.fat ?? 0}
          </span>
          <span className="main-page__macro main-page__macro--carbs">
            Углеводы: {stats?.today?.carbs ?? 0}
          </span>
        </div>

        {chartData.length > 0 && (
          <div className="main-page__chart">
            <h3 className="main-page__chart-title">Результативность за 7 дней</h3>
            <div className="main-page__chart-bars">
              {chartData.map(({ date, calories }) => {
                const norm = stats?.norm ?? 2000;
                const maxVal = Math.max(norm, ...chartData.map((d) => d.calories), 1);
                const heightPct = Math.round((calories / maxVal) * 100);
                const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                });
                return (
                  <div key={date} className="main-page__chart-bar-wrap">
                    <div className="main-page__chart-bar-container">
                      <div
                        className="main-page__chart-bar"
                        style={{ height: `${heightPct}%` }}
                        title={`${dayLabel}: ${calories} Ккал`}
                      />
                    </div>
                    <span className="main-page__chart-label">{dayLabel}</span>
                    <span className="main-page__chart-value">{calories}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function AddIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

