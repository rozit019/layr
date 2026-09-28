import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categories, templates as demoTemplates } from '../data/catalog.js';
import { useAuth } from '../auth/AuthProvider.jsx';
import { apiRequest, normalizeTemplate } from '../lib/api.js';
import { formatPrice } from '../utils/formatPrice.js';
import './CheckoutPage.css';

function submitEsewaForm(url, params) {
  if (!url || !params || typeof params !== 'object') throw new Error('The payment form details were not returned by the server.');
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.style.display = 'none';
  Object.entries(params).forEach(([name, value]) => {
    if (value === undefined || value === null) return;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage({ products = demoTemplates, visibleCategoryKeys }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [template, setTemplate] = useState(products.find((item) => item.slug === slug) || null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [demoOnly, setDemoOnly] = useState(false);

  useEffect(() => {
    let active = true;
    const localMatch = products.find((item) => item.slug === slug) || null;
    setTemplate(localMatch);
    setLoading(true);
    apiRequest(`/templates/${encodeURIComponent(slug)}`)
      .then((payload) => {
        if (!active) return;
        setTemplate(normalizeTemplate(payload.template));
        setDemoOnly(false);
      })
      .catch(() => {
        if (!active) return;
        setTemplate(localMatch);
        setDemoOnly(Boolean(localMatch?.demoOnly));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, products]);

  async function checkout(event) {
    event.preventDefault();
    setError('');
    if (!template) return;
    if (demoOnly) {
      setError('This is a preview listing. Upload it from the admin panel before taking payment.');
      return;
    }
    setBusy(true);
    try {
      const payload = await apiRequest('/orders/checkout', {
        method: 'POST',
        token,
        body: { templateSlug: template.slug },
      });
      submitEsewaForm(payload.esewaUrl, payload.params);
    } catch (err) {
      setError(err.message || 'Could not start eSewa checkout.');
      setBusy(false);
    }
  }

  if (loading) return <main className="checkout-page"><div className="container checkout-loading">Preparing your checkout…</div></main>;
  if (!template) return <main className="checkout-page"><div className="container checkout-loading"><h1>We couldn’t find that template.</h1><Link className="text-link" to="/">Back to the storefront ↗</Link></div></main>;
  if (visibleCategoryKeys && !visibleCategoryKeys.has(template.category)) return <main className="checkout-page"><div className="container checkout-loading"><h1>This collection is currently unavailable.</h1><Link className="text-link" to="/">Back to the storefront ↗</Link></div></main>;

  const category = categories.find((item) => item.key === template.category);
  return (
    <main className="checkout-page">
      <div className="container checkout-layout">
        <section className="checkout-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT STEP</p>
          <h1>Make it<br /><em>yours.</em></h1>
          <p>Sign-in is required before payment so your purchase can be saved to your account library.</p>
          <Link className="text-link" to={category?.path || '/'}>← Back to {category?.label || 'templates'}</Link>
        </section>
        <section className="checkout-card">
          <div className={`checkout-swatch checkout-swatch--${template.category}`}><span>{category?.icon || '✳'}</span></div>
          <p className="checkout-category">{category?.label || template.category} · DIGITAL TEMPLATE</p>
          <h2>{template.title}</h2>
          <p className="checkout-tagline">{template.tagline}</p>
          <div className="checkout-divider" />
          <div className="checkout-price-row"><span>Template price</span><strong>{formatPrice(template.price, 'NPR')}</strong></div>
          <div className="currency-options" aria-label="Payment currency">
            <label className="currency-option currency-option--selected"><input type="radio" name="currency" checked readOnly /><span><b>NPR</b><small>Pay with eSewa</small></span><i>✓</i></label>
            <label className="currency-option currency-option--disabled"><input type="radio" name="currency" disabled /><span><b>USD</b><small>International payment coming soon</small></span><i>SOON</i></label>
          </div>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <button className="button button-dark checkout-pay-button" type="button" onClick={checkout} disabled={busy || demoOnly}>{busy ? 'Connecting to eSewa…' : demoOnly ? 'Demo listing — not for sale' : 'Continue with eSewa'} <span>↗</span></button>
          <p className="checkout-terms">Your payment is verified by the backend before the template appears in your library. Download access is only granted after successful payment.</p>
          <p className="checkout-secure"><span>✓</span> Secure payment handoff · NPR pricing</p>
        </section>
      </div>
    </main>
  );
}
