import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { apiRequest, normalizeTemplate } from '../lib/api.js';
import { formatPrice } from '../utils/formatPrice.js';
import './AccountPage.css';

export default function AccountPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [library, setLibrary] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest('/templates/me/library', { token }).catch(() => ({ templates: [] })),
      apiRequest('/orders/mine', { token }).catch(() => ({ orders: [] })),
    ]).then(([libraryPayload, orderPayload]) => {
      if (!active) return;
      setLibrary((libraryPayload.templates || []).filter(Boolean).map(normalizeTemplate));
      setOrders(orderPayload.orders || []);
    }).catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <main className="account-page">
      <section className="account-heading"><div className="container account-heading-inner"><div><p className="eyebrow"><span className="eyebrow-dot" /> YOUR LAYR ACCOUNT</p><h1>Welcome in,<br /><em>{user?.name || 'friend'}.</em></h1><p>{user?.email}</p></div><button className="account-logout" type="button" onClick={handleLogout}>Log out ↗</button></div></section>
      <div className="container account-content">
        {error && <p className="account-error" role="alert">{error}</p>}
        <section className="account-panel"><div className="account-panel-heading"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Your templates</h2></div><span>{library.length} {library.length === 1 ? 'template' : 'templates'}</span></div>
          {loading ? <p className="account-empty">Loading your templates…</p> : library.length ? <div className="library-grid">{library.map((template) => {
            const customizeUrl = template.customizeUrl || template.customizationUrl;
            return <article className="library-card" key={template.slug}><div className={`library-swatch library-swatch--${template.category}`}><span>{template.category === 'birthday' ? '✷' : template.category === 'proposal' ? '♡' : template.category === 'anniversary' ? '∞' : '✳'}</span></div><div><small>{template.category}</small><h3>{template.title}</h3><p>{template.techStack || 'Personalize this template and make your own link.'}</p></div>{customizeUrl ? <a className="button button-dark library-action" href={customizeUrl} target="_blank" rel="noreferrer">Customize now <span>↗</span></a> : <button className="button button-dark library-action" type="button" disabled>Link not ready</button>}</article>;
          })}</div> : <p className="account-empty">After a successful payment, your private customization link will appear here.</p>}
        </section>
        <section className="account-panel orders-panel"><div className="account-panel-heading"><div><p className="eyebrow">YOUR CHECKOUTS</p><h2>Order history</h2></div></div>{loading ? <p className="account-empty">Loading orders…</p> : orders.length ? <div className="orders-list">{orders.map((order) => <div className="order-row" key={order._id}><span className={`order-status order-status--${order.status?.toLowerCase()}`}>{order.status}</span><div className="order-copy"><b>{order.template?.name || 'Template order'}</b><small>{new Date(order.createdAt).toLocaleDateString()} · {order.transactionUuid}</small></div><strong>{formatPrice(order.amount, 'NPR')}</strong></div>)}</div> : <p className="account-empty">No orders yet.</p>}</section>
      </div>
    </main>
  );
}
