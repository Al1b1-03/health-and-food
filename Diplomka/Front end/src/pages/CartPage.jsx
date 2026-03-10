import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shopApi, getImageUrl } from '../api/shop';
import './CartPage.css';

const TEST_CARD = '4242 4242 4242 4242';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [address, setAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const loadCart = async () => {
    try {
      setError('');
      const { items: data, total: cartTotal } = await shopApi.getCart();
      setItems(data);
      setTotal(cartTotal);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки корзины');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    const onCartUpdate = () => loadCart();
    window.addEventListener('cartUpdated', onCartUpdate);
    return () => window.removeEventListener('cartUpdated', onCartUpdate);
  }, []);

  const handleQuantityChange = async (item, newQuantity) => {
    const qty = Math.max(1, parseInt(newQuantity, 10) || 1);
    setActionLoading(item.id);
    try {
      const { item: updated } = await shopApi.updateCartItem(item.id, qty);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, ...updated } : i))
      );
      setTotal((prev) => prev - item.subtotal + updated.subtotal);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      setError(err.message || 'Ошибка обновления');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (item) => {
    setActionLoading(item.id);
    try {
      await shopApi.removeFromCart(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setTotal((prev) => prev - item.subtotal);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      setError(err.message || 'Ошибка удаления');
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (n) => new Intl.NumberFormat('ru-KZ').format(n);

  const handleCheckout = async (e) => {
    e.preventDefault();
    const card = cardNumber.replace(/\s/g, '');
    const addr = address.trim();
    if (!card) {
      setError('Введите номер карты');
      return;
    }
    if (!addr) {
      setError('Укажите адрес доставки');
      return;
    }
    setCheckoutLoading(true);
    setError('');
    try {
      await shopApi.checkout(card, addr);
      setCheckoutSuccess(true);
      setShowCheckout(false);
      setCardNumber('');
      setAddress('');
      loadCart();
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      setError(err.message || 'Ошибка оплаты');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatCardInput = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    return v.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  if (loading) {
    return (
      <div className="cart-page">
        <h1 className="cart-page__title">Корзина</h1>
        <p className="cart-page__loading">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page__title">Корзина</h1>
      {checkoutSuccess && (
        <p className="cart-page__success">Оплата прошла успешно! Спасибо за заказ.</p>
      )}
      {error && <p className="cart-page__error">{error}</p>}

      {items.length === 0 ? (
        <div className="cart-page__empty">
          <p className="cart-page__empty-text">Корзина пуста</p>
          <Link to="/shop" className="cart-page__empty-link">
            Перейти к покупкам
          </Link>
        </div>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="cart-item__image">
                  {item.imageUrl ? (
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="cart-item__img"
                    />
                  ) : (
                    <div className="cart-item__placeholder" />
                  )}
                </div>
                <div className="cart-item__info">
                  <h3 className="cart-item__name">{item.name}</h3>
                  <p className="cart-item__price">{formatPrice(item.price)} ₸</p>
                </div>
                <div className="cart-item__quantity">
                  <button
                    type="button"
                    className="cart-item__qty-btn"
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    disabled={actionLoading === item.id || item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="cart-item__qty-value">{item.quantity}</span>
                  <button
                    type="button"
                    className="cart-item__qty-btn"
                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                    disabled={actionLoading === item.id}
                  >
                    +
                  </button>
                </div>
                <p className="cart-item__subtotal">
                  {formatPrice(item.subtotal)} ₸
                </p>
                <button
                  type="button"
                  className="cart-item__remove"
                  onClick={() => handleRemove(item)}
                  disabled={actionLoading === item.id}
                  aria-label="Удалить"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-page__footer">
            <p className="cart-page__total">
              Итого: <strong>{formatPrice(total)} ₸</strong>
            </p>
            <div className="cart-page__footer-actions">
              <Link to="/shop" className="cart-page__continue">
                Продолжить покупки
              </Link>
              <button
                type="button"
                className="cart-page__pay-btn"
                onClick={() => setShowCheckout(true)}
              >
                Оплатить
              </button>
            </div>
          </div>
        </>
      )}

      {showCheckout && (
        <div className="cart-checkout" onClick={() => setShowCheckout(false)}>
          <div
            className="cart-checkout__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="cart-checkout__title">Оплата картой</h2>
            <p className="cart-checkout__total">
              К оплате: <strong>{formatPrice(total)} ₸</strong>
            </p>
            <form className="cart-checkout__form" onSubmit={handleCheckout}>
              <div className="cart-checkout__field">
                <label className="cart-checkout__label">Адрес доставки</label>
                <input
                  type="text"
                  placeholder="Город, улица, дом, квартира"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="cart-checkout__input"
                />
              </div>
              <div className="cart-checkout__field">
                <label className="cart-checkout__label">Номер карты</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                  className="cart-checkout__input"
                  maxLength={19}
                />
                <p className="cart-checkout__hint">
                  Тестовая карта:{' '}
                  <button
                    type="button"
                    className="cart-checkout__test-card"
                    onClick={() => setCardNumber(TEST_CARD)}
                  >
                    {TEST_CARD}
                  </button>
                </p>
              </div>
              <div className="cart-checkout__actions">
                <button
                  type="button"
                  className="cart-checkout__btn cart-checkout__btn--cancel"
                  onClick={() => setShowCheckout(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="cart-checkout__btn cart-checkout__btn--pay"
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Оплата...' : `Оплатить ${formatPrice(total)} ₸`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
