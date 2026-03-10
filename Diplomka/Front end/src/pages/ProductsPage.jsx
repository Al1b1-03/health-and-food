import { useEffect, useState, useRef } from 'react';
import { productsApi, getImageUrl } from '../api/products';
import './ProductsPage.css';

const CATEGORY_OPTIONS = [
  { value: 'ration', label: 'Рацион питания' },
  { value: 'vitamins', label: 'Витамины' },
  { value: 'dishes', label: 'Блюда и напитки' },
];

const INITIAL_FORM = {
  name: '',
  calories: '',
  protein: '',
  fat: '',
  carbs: '',
  price: '',
  imageUrl: '',
  category: 'dishes',
  sortOrder: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  const loadProducts = async () => {
    try {
      setError('');
      const { products: data } = await productsApi.list();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const setImageFromFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setImagePreview(url);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'image') {
      const file = e.target.files?.[0];
      if (file) setImageFromFile(file);
      else {
        setImageFile(null);
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
        setImagePreview(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handlePaste = (e) => {
    const item = e.clipboardData?.items && [...e.clipboardData.items].find((i) => i.type.startsWith('image/'));
    if (item) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) setImageFromFile(file);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      calories: product.calories?.toString() ?? '',
      protein: product.protein?.toString() ?? '',
      fat: product.fat?.toString() ?? '',
      carbs: product.carbs?.toString() ?? '',
      price: product.price?.toString() ?? '',
      imageUrl: product.imageUrl ?? '',
      category: product.category || 'dishes',
      sortOrder: product.sortOrder != null ? String(product.sortOrder) : '',
    });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setImageFile(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Введите название товара');
      return;
    }

    setActionLoading(editingId ?? 'new');
    setError('');
    try {
      if (editingId) {
        const updated = await productsApi.update(editingId, {
          name: formData.name.trim(),
          calories: formData.calories ? parseInt(formData.calories, 10) : 0,
          protein: formData.protein ? parseFloat(formData.protein) : 0,
          fat: formData.fat ? parseFloat(formData.fat) : 0,
          carbs: formData.carbs ? parseFloat(formData.carbs) : 0,
          price: formData.price ? parseFloat(formData.price) : 0,
          imageUrl: formData.imageUrl?.trim() || (editingId && !imageFile ? (products.find((p) => p.id === editingId)?.imageUrl ?? undefined) : undefined),
          category: formData.category || 'dishes',
          sortOrder: formData.sortOrder === '' ? 0 : parseInt(formData.sortOrder, 10) || 0,
        });
        if (imageFile) {
          const withImage = await productsApi.uploadImage(editingId, imageFile);
          setProducts((prev) =>
            prev.map((p) => (p.id === editingId ? withImage.product : p))
          );
        } else {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingId ? updated.product : p))
          );
        }
      } else {
        const numOrZero = (v) => {
          const n = v === '' || v == null ? 0 : Number(v);
          return Number.isNaN(n) ? 0 : Math.max(0, n);
        };
        const created = await productsApi.create({
          name: formData.name.trim(),
          calories: Math.floor(numOrZero(formData.calories)),
          protein: numOrZero(formData.protein),
          fat: numOrZero(formData.fat),
          carbs: numOrZero(formData.carbs),
          price: numOrZero(formData.price),
          imageUrl: formData.imageUrl?.trim() || undefined,
          category: formData.category || 'dishes',
          sortOrder: formData.sortOrder === '' ? 0 : Math.floor(numOrZero(formData.sortOrder)),
        });
        if (imageFile) {
          await productsApi.uploadImage(created.product.id, imageFile);
          const { products: refreshed } = await productsApi.list();
          setProducts(refreshed);
        } else {
          setProducts((prev) => [created.product, ...prev]);
        }
      }
      closeForm();
    } catch (err) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Удалить товар «${product.name}»?`)) return;
    setActionLoading(product.id);
    try {
      await productsApi.delete(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err.message || 'Ошибка удаления');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="products-page">
        <h1 className="products-page__title">Товары</h1>
        <p className="products-page__loading">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-page__header">
        <h1 className="products-page__title">Товары</h1>
        <button
          type="button"
          className="products-page__add-btn"
          onClick={openAddForm}
        >
          + Добавить товар
        </button>
      </div>

      {error && <p className="products-page__error">{error}</p>}

      {showForm && (
        <div className="products-modal" onClick={closeForm}>
          <div
            className="products-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="products-modal__title">
              {editingId ? 'Редактировать товар' : 'Новый товар'}
            </h2>
            <form className="products-form" onSubmit={handleSubmit} onPaste={handlePaste}>
              <div className="products-form__body">
              <div className="products-form__field products-form__field--span-2">
                <label className="products-form__label">Фото</label>
                <p className="products-form__hint">Выберите файл, вставьте из буфера (Ctrl+V) или введите ссылку на картинку.</p>
                <div className="products-form__image-row">
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleChange}
                    className="products-form__file"
                  />
                  <span className="products-form__or">или ссылка (URL):</span>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    className="products-form__input"
                  />
                </div>
                {(imagePreview || (editingId && formData.imageUrl) || formData.imageUrl?.trim()) && (
                  <div className="products-form__preview">
                    <img
                      src={imagePreview || (editingId && products.find((p) => p.id === editingId)?.imageDataUrl) || getImageUrl(formData.imageUrl, editingId ? products.find((p) => p.id === editingId)?.imageFullUrl : null)}
                      alt="Превью"
                      className="products-form__preview-img"
                    />
                  </div>
                )}
              </div>
              <div className="products-form__field products-form__field--span-2">
                <label className="products-form__label">Название</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Название товара"
                  className="products-form__input"
                  autoFocus
                />
              </div>
              <div className="products-form__field">
                <label className="products-form__label">Категория</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="products-form__input"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
              </div>
              <div className="products-form__field">
                <label className="products-form__label">Порядок в каталоге</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="products-form__input"
                  title="Меньше — выше в списке (напр. пробный день = 0)"
                />
              </div>
              <div className="products-form__field">
                <label className="products-form__label">Цена (₸)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="products-form__input"
                />
              </div>
              <div className="products-form__field">
                <label className="products-form__label">Калории (Ккал)</label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="products-form__input"
                />
              </div>
              <div className="products-form__field products-form__field--span-2">
                <div className="products-form__row">
                  <div className="products-form__field">
                    <label className="products-form__label">Белки (г)</label>
                    <input
                      type="number"
                      name="protein"
                      value={formData.protein}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="products-form__input"
                    />
                  </div>
                  <div className="products-form__field">
                    <label className="products-form__label">Жиры (г)</label>
                    <input
                      type="number"
                      name="fat"
                      value={formData.fat}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="products-form__input"
                    />
                  </div>
                  <div className="products-form__field">
                    <label className="products-form__label">Углеводы (г)</label>
                    <input
                      type="number"
                      name="carbs"
                      value={formData.carbs}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="products-form__input"
                    />
                  </div>
                </div>
              </div>
              </div>
              <div className="products-form__actions">
                <button
                  type="button"
                  className="products-form__btn products-form__btn--cancel"
                  onClick={closeForm}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="products-form__btn products-form__btn--submit"
                  disabled={actionLoading === (editingId ?? 'new')}
                >
                  {actionLoading === (editingId ?? 'new')
                    ? 'Сохранение...'
                    : editingId
                    ? 'Сохранить'
                    : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="products-card">
            <div className="products-card__main">
              {product.imageUrl && (
                <div className="products-card__image-wrap">
                  <img
                    src={product.imageDataUrl || getImageUrl(product.imageUrl, product.imageFullUrl)}
                    alt={product.name}
                    className="products-card__image"
                  />
                </div>
              )}
              <h3 className="products-card__name">{product.name}</h3>
              <p className="products-card__price">{product.price ?? 0} ₸</p>
              <p className="products-card__calories">{product.calories} Ккал</p>
              <p className="products-card__macros">
                Б: {product.protein} · Ж: {product.fat} · У: {product.carbs}
              </p>
            </div>
            <div className="products-card__actions">
              <button
                type="button"
                className="products-card__btn products-card__btn--edit"
                onClick={() => openEditForm(product)}
                disabled={actionLoading === product.id}
              >
                Редактировать
              </button>
              <button
                type="button"
                className="products-card__btn products-card__btn--delete"
                onClick={() => handleDelete(product)}
                disabled={actionLoading === product.id}
              >
                {actionLoading === product.id ? '...' : 'Удалить'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <p className="products-page__empty">Нет товаров. Добавьте первый.</p>
      )}
    </div>
  );
}
