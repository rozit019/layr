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
  const [downloading, setDownloading] = useState('');

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

  async function download(template) {
    setError('');
    setDownloading(template.slug);
    try {
      const response = await fetch(`/api/templates/${encodeURIComponent(template.slug)}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        let message = 'Could not download this template.';
        try { message = (await response.json()).message || message; } catch { /* response may be a file error */ }
        throw new Error(message);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const disposition = response.headers.get('content-disposition') || '';
      const serverFilename = disposition.match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i)?.[1];
      link.download = decodeURIComponent(serverFilename || template.fileName || `${template.slug}.zip`).replace(/^\"|\"$/g, '');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Download failed.');
    } finally {
      setDownloading('');
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <main className="account-page">
      <section className="account-heading"><div className="container account-heading-inner"><div><p className="eyebrow"><span className="eyebrow-dot" /> YOUR LAYR ACCOUNT</p><h1>Welcome in,<br /><em>{user?.name || 'friend'}.</em></h1><p>{user?.email}</p></div><button className="account-logout" type="button" onClick={handleLogout}>Sign out ↗</button></div></section>
      <div className="container account-content">
        {error && <p className="account-error" role="alert">{error}</p>}
        <section className="account-panel"><div className="account-panel-heading"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Your template library</h2></div><span>{library.length} {library.length === 1 ? 'template' : 'templates'}</span></div>
          {loading ? <p className="account-empty">Loading your library…</p> : library.length ? <div className="library-grid">{library.map((template) => <article className="library-card" key={template.slug}><div className={`library-swatch library-swatch--${template.category}`}><span>{template.category === 'birthday' ? '✷' : template.category === 'proposal' ? '♡' : template.category === 'anniversary' ? '∞' : '✳'}</span></div><div><small>{template.category}</small><h3>{template.title}</h3><p>{template.techStack || 'Digital template'}</p></div><button className="button button-dark library-download" type="button" disabled={downloading === template.slug} onClick={() => download(template)}>{downloading === template.slug ? 'Preparing…' : 'Download ZIP'} <span>↓</span></button></article>)}</div> : <p className="account-empty">Your library is ready for its first template. After a successful eSewa payment, purchases will appear here.</p>}
        </section>
        <section className="account-panel orders-panel"><div className="account-panel-heading"><div><p className="eyebrow">YOUR CHECKOUTS</p><h2>Order history</h2></div></div>{loading ? <p className="account-empty">Loading orders…</p> : orders.length ? <div className="orders-list">{orders.map((order) => <div className="order-row" key={order._id}><span className={`order-status order-status--${order.status?.toLowerCase()}`}>{order.status}</span><div className="order-copy"><b>{order.template?.name || 'Template order'}</b><small>{new Date(order.createdAt).toLocaleDateString()} · {order.transactionUuid}</small></div><strong>{formatPrice(order.amount, 'NPR')}</strong></div>)}</div> : <p className="account-empty">No orders yet.</p>}</section>
      </div>
    </main>
  );
}
