import { useEffect, useState } from 'react';
import { ordersApi } from '../api/orders';
import './OrdersPage.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const STATUS_LABELS = {
  paid: 'Оплачен',
  pending: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const loadOrders = async () => {
    try {
      setError('');
      const { orders: data } = await ordersApi.list();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="orders-page">
        <h1 className="orders-page__title">Заказы</h1>
        <p className="orders-page__loading">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1 className="orders-page__title">Заказы</h1>
      {error && <p className="orders-page__error">{error}</p>}

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="orders-card">
            <div className="orders-card__header">
              <div className="orders-card__main-info">
                <span className="orders-card__id">Заказ #{order.id}</span>
                <span className="orders-card__date">{formatDate(order.createdAt)}</span>
              </div>
              <div className="orders-card__meta">
                <span className="orders-card__status">{STATUS_LABELS[order.status] ?? order.status}</span>
                <span className="orders-card__total">{order.total?.toFixed(0) ?? 0} ₸</span>
              </div>
            </div>
            <div className="orders-card__user">
              <span className="orders-card__label">Клиент:</span>
              <span className="orders-card__value">{order.userFullName}</span>
              <span className="orders-card__email">({order.userEmail})</span>
            </div>
            {order.address && (
              <div className="orders-card__address">
                <span className="orders-card__label">Адрес:</span>
                <span className="orders-card__value">{order.address}</span>
              </div>
            )}
            <button
              type="button"
              className="orders-card__toggle"
              onClick={() => toggleExpand(order.id)}
              aria-expanded={expandedId === order.id}
            >
              {expandedId === order.id ? 'Скрыть товары' : 'Показать товары'}
            </button>
            {expandedId === order.id && (
              <div className="orders-card__items">
                <table className="orders-items-table">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Кол-во</th>
                      <th>Цена</th>
                      <th>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price?.toFixed(0)} ₸</td>
                        <td>{(item.price * item.quantity)?.toFixed(0)} ₸</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {orders.length === 0 && !loading && (
        <p className="orders-page__empty">Нет заказов</p>
      )}
    </div>
  );
}
