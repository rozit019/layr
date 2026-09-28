import { useEffect } from 'react';
import { getCategory } from '../data/catalog.js';
import { formatPrice } from '../utils/formatPrice.js';
import './CartDrawer.css';

export default function CartDrawer({ items, onClose, onRemove, onCheckout }) {
  const total = items.reduce((sum, item) => sum + item.template.price * item.quantity, 0);
  const singleTemplate = items.length === 1 ? items[0].template : null;

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
                <div className={`cart-swatch cart-swatch--${template.category}`}><span>{getCategory(template.category)?.icon || '✳'}</span></div>
                <div className="cart-line-info"><b>{template.title}</b><small>{getCategory(template.category)?.label || template.category}{quantity > 1 ? ` · Qty ${quantity}` : ''}</small></div>
                <strong>{formatPrice(template.price * quantity, template.currency || 'NPR')}</strong>
                <button type="button" className="remove-item" onClick={() => onRemove(template.slug)} aria-label={`Remove ${template.title} from bag`}>×</button>
                {items.length > 1 && <button className="cart-line-checkout" type="button" onClick={() => onCheckout(template)} disabled={template.demoOnly}>{template.demoOnly ? 'Preview listing' : 'Checkout this template'} <span>↗</span></button>}
              </div>
            ))}
          </div>
          <div className="cart-subtotal"><span>Bag subtotal <small>{items.length > 1 ? '(one template per checkout)' : 'NPR total'}</small></span><b>{formatPrice(total, 'NPR')}</b></div>
          {singleTemplate && <button className="button button-dark checkout-button" type="button" onClick={() => onCheckout(singleTemplate)} disabled={singleTemplate.demoOnly}>Proceed to checkout <span>↗</span></button>}
          {items.length > 1 && <p className="checkout-note">Choose one template at a time to continue to eSewa. Demo previews cannot be purchased until an admin publishes them.</p>}
          {singleTemplate?.demoOnly && <p className="checkout-note">This is a preview item. An admin must add its screenshot and customization link before payment can be enabled.</p>}
          {singleTemplate && !singleTemplate.demoOnly && <p className="checkout-note">Sign in is required before payment. Your private customization link appears after eSewa confirms the purchase.</p>}
        </> : <div className="cart-empty"><span>♡</span><h3>Your bag is waiting for a story.</h3><p>Add a template and it’ll show up here.</p><button type="button" className="text-link" onClick={onClose}>Keep exploring <span>↗</span></button></div>}
      </aside>
    </div>
  );
}
