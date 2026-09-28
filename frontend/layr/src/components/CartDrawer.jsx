import { useEffect } from 'react';
import { getCategory } from '../data/catalog.js';
import { formatPrice } from '../utils/formatPrice.js';
import './CartDrawer.css';

export default function CartDrawer({ items, onClose, onRemove }) {
  const total = items.reduce((sum, item) => sum + item.template.price * item.quantity, 0);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="cart-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-drawer-head">
          <div><p className="eyebrow">YOUR LAYR BAG</p><h2 id="cart-title">A good start.</h2></div>
          <button type="button" className="cart-close" onClick={onClose} aria-label="Close bag">×</button>
        </div>
        {items.length ? <>
          <div className="cart-items">
            {items.map(({ template, quantity }) => (
              <div className="cart-line" key={template.slug}>
                <div className={`cart-swatch cart-swatch--${template.category}`}><span>{getCategory(template.category)?.icon}</span></div>
                <div className="cart-line-info"><b>{template.title}</b><small>{getCategory(template.category)?.label}{quantity > 1 ? ` · Qty ${quantity}` : ''}</small></div>
                <strong>{formatPrice(template.price * quantity, template.currency)}</strong>
                <button type="button" className="remove-item" onClick={() => onRemove(template.slug)} aria-label={`Remove ${template.title} from bag`}>×</button>
              </div>
            ))}
          </div>
          <div className="cart-subtotal"><span>Subtotal</span><b>{formatPrice(total)}</b></div>
          <button className="button button-dark checkout-button" type="button" disabled>Checkout <span>↗</span></button>
          <p className="checkout-note">Checkout and secure template delivery are the next step. Your bag is a front-end preview for now.</p>
        </> : <div className="cart-empty"><span>♡</span><h3>Your bag is waiting for a story.</h3><p>Add a template and it’ll show up here.</p><button type="button" className="text-link" onClick={onClose}>Keep exploring <span>↗</span></button></div>}
      </aside>
    </div>
  );
}
