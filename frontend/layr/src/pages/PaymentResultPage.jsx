import { Link, useLocation } from 'react-router-dom';
import './PaymentResultPage.css';

export default function PaymentResultPage() {
  const { pathname, search } = useLocation();
  const success = pathname.endsWith('/success');
  const orderId = new URLSearchParams(search).get('order');
  return (
    <main className={`payment-result-page${success ? ' payment-result-page--success' : ''}`}>
      <section className="payment-result-card">
        <span className="payment-result-mark">{success ? '✓' : '↺'}</span>
        <p className="eyebrow"><span className="eyebrow-dot" /> ESEWA PAYMENT</p>
        <h1>{success ? <>Payment<br /><em>confirmed.</em></> : <>Payment<br /><em>not completed.</em></>}</h1>
        <p>{success ? 'The backend verified your payment. Your template should now be available in your account library.' : 'Your payment was not completed. If you were charged, check your account orders or contact support before trying again.'}</p>
        {orderId && <small className="payment-order-id">Order reference · {orderId}</small>}
        <div className="payment-result-actions"><Link className="button button-dark" to={success ? '/account' : '/'}>{success ? 'Open my library' : 'Back to storefront'} <span>↗</span></Link><Link className="payment-secondary-link" to="/">Continue browsing</Link></div>
      </section>
    </main>
  );
}
