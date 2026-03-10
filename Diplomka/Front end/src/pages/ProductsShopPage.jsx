import { useEffect, useState, useMemo } from 'react';
import { shopApi, getImageUrl } from '../api/shop';
import './ProductsShopPage.css';

const CATEGORY_LABELS = {
  ration: 'Рацион питания',
  vitamins: 'Витамины',
  dishes: 'Блюда и напитки',
};

const CATEGORY_ORDER = ['ration', 'vitamins', 'dishes'];

export default function ProductsShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState(null);

  const loadProducts = async () => {
    try {
      setError('');
      const { products: data } = await shopApi.getProducts();
      setProducts(data ?? []);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const byCategory = useMemo(() => {
    const map = { ration: [], vitamins: [], dishes: [] };
    (products || []).forEach((p) => {
      const cat = p.category && map[p.category] ? p.category : 'dishes';
      map[cat].push(p);
    });
    return CATEGORY_ORDER.map((key) => ({ key, label: CATEGORY_LABELS[key], items: map[key] || [] }));
  }, [products]);

  const handleAddToCart = async (product, quantity = 1) => {
    setAddingId(product.id);
    try {
      await shopApi.addToCart(product.id, quantity);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      setError(err.message || 'Ошибка добавления в корзину');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="shop-page">
        <h1 className="shop-page__title">Покупка продуктов</h1>
        <p className="shop-page__loading">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <h1 className="shop-page__title">Покупка продуктов</h1>
      {error && <p className="shop-page__error">{error}</p>}

      {byCategory.map(
        (section) =>
          section.items.length > 0 && (
            <section key={section.key} className="shop-section">
              <h2 className="shop-section__title">{section.label}</h2>
              <div className="shop-grid">
                {section.items.map((product) => (
                  <div key={product.id} className="shop-card">
                    {product.imageUrl && (
                      <div className="shop-card__image-wrap">
                        <img
                          src={product.imageDataUrl || getImageUrl(product.imageUrl, product.imageFullUrl)}
                          alt={product.name}
                          className="shop-card__image"
                        />
                      </div>
                    )}
                    <div className="shop-card__content">
                      <h3 className="shop-card__name">{product.name}</h3>
                      <p className="shop-card__price">{product.price ?? 0} ₸</p>
                      <p className="shop-card__calories">{product.calories} Ккал</p>
                      <p className="shop-card__macros">
                        Б: {product.protein} · Ж: {product.fat} · У: {product.carbs}
                      </p>
                      <button
                        type="button"
                        className="shop-card__add-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={addingId === product.id}
                      >
                        {addingId === product.id ? 'Добавление...' : 'В корзину'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
      )}

      {products.length === 0 && !loading && (
        <p className="shop-page__empty">Нет товаров в каталоге</p>
      )}
    </div>
  );
}
