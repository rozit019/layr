import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { categories, templates as demoTemplates } from "../data/catalog.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import { apiRequest, normalizeTemplate } from "../lib/api.js";
import { formatPrice } from "../utils/formatPrice.js";
import "./CheckoutPage.css";

const ESEWA_ENABLED = false;
// The provided number is a Nepal local mobile number; wa.me needs country code 977.
const WHATSAPP_NUMBER = "9779767292202";

function createWhatsAppLink(template, category) {
  const storeLink = new URL(
    category?.path || "/",
    window.location.origin,
  ).toString();
  const message = [
    "Hi! I’m interested in this Elvi template.",
    `Product: ${template.title}`,
    `Category: ${category?.label || template.category}`,
    `Price: ${formatPrice(template.price, "NPR")}`,
    `Details: ${template.description || template.tagline || "Digital template"}`,
    `Store: ${storeLink}`,
  ]
    .filter(Boolean)
    .join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function submitEsewaForm(url, params) {
  if (!url || !params || typeof params !== "object")
    throw new Error(
      "The payment form details were not returned by the server.",
    );
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.style.display = "none";
  Object.entries(params).forEach(([name, value]) => {
    if (value === undefined || value === null) return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage({
  products = demoTemplates,
  visibleCategoryKeys,
}) {
  const { slug } = useParams();
  const { token } = useAuth();
  const [template, setTemplate] = useState(
    products.find((item) => item.slug === slug) || null,
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, products]);

  async function checkout(event) {
    event.preventDefault();
    setError("");
    if (!ESEWA_ENABLED) {
      setError(
        "eSewa checkout is coming soon. Please contact us on WhatsApp for now.",
      );
      return;
    }
    if (!template) return;
    if (demoOnly) {
      setError(
        "This is a preview listing. Upload it from the admin panel before taking payment.",
      );
      return;
    }
    setBusy(true);
    try {
      const payload = await apiRequest("/orders/checkout", {
        method: "POST",
        token,
        body: { templateSlug: template.slug },
      });
      submitEsewaForm(payload.esewaUrl, payload.params);
    } catch (err) {
      setError(err.message || "Could not start eSewa checkout.");
      setBusy(false);
    }
  }

  if (loading)
    return (
      <main className="checkout-page">
        <div className="container checkout-loading">
          Preparing your checkout…
        </div>
      </main>
    );
  if (!template)
    return (
      <main className="checkout-page">
        <div className="container checkout-loading">
          <h1>We couldn’t find that template.</h1>
          <Link className="text-link" to="/">
            Back to the storefront ↗
          </Link>
        </div>
      </main>
    );
  if (visibleCategoryKeys && !visibleCategoryKeys.has(template.category))
    return (
      <main className="checkout-page">
        <div className="container checkout-loading">
          <h1>This collection is currently unavailable.</h1>
          <Link className="text-link" to="/">
            Back to the storefront ↗
          </Link>
        </div>
      </main>
    );

  const category = categories.find((item) => item.key === template.category);
  const whatsappHref = createWhatsAppLink(template, category);
  return (
    <main className="checkout-page">
      <div className="container checkout-layout">
        <section className="checkout-copy">
          <p className="eyebrow">
            <span className="eyebrow-dot" /> YOUR NEXT STEP
          </p>
          <h1>
            Make it
            <br />
            <em>yours.</em>
          </h1>
          <p>
            Ask us about this template or arrange your order directly on
            WhatsApp. We’ll include the product details in your message.
          </p>
          <Link className="text-link" to={category?.path || "/"}>
            ← Back to {category?.label || "templates"}
          </Link>
        </section>
        <section className="checkout-card">
          <div
            className={`checkout-swatch checkout-swatch--${template.category}`}
          >
            <span>{category?.icon || "✳"}</span>
          </div>
          <p className="checkout-category">
            {category?.label || template.category} · DIGITAL TEMPLATE
          </p>
          <h2>{template.title}</h2>
          <p className="checkout-tagline">{template.tagline}</p>
          <div className="checkout-divider" />
          <div className="checkout-price-row">
            <span>Template price</span>
            <strong>{formatPrice(template.price, "NPR")}</strong>
          </div>
          <div className="currency-options" aria-label="Payment options">
            <label className="currency-option currency-option--disabled">
              <input type="radio" name="currency" disabled />
              <span>
                <b>eSewa · NPR</b>
                <small>Online payments are temporarily unavailable</small>
              </span>
              <i>COMING SOON</i>
            </label>
            <label className="currency-option currency-option--disabled">
              <input type="radio" name="currency" disabled />
              <span>
                <b>USD</b>
                <small>International payment coming soon</small>
              </span>
              <i>SOON</i>
            </label>
          </div>
          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}
          {demoOnly ? (
            <button
              className="button checkout-whatsapp-button"
              type="button"
              disabled
            >
              Preview listing — not for sale
            </button>
          ) : (
            <a
              className="button checkout-whatsapp-button"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
                <path
                  d="M20.4 11.7a8.3 8.3 0 0 1-12.2 7.3L4 20l1.1-4.1a8.3 8.3 0 1 1 15.3-4.2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 8.1c.2-.4.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3-.1.5.3.6.9 1.2 1.5 1.6.5.3 1.1.6 1.5.7.2.1.4 0 .5-.2l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .5-.3 1.2-.7 1.5-.5.5-1.2.7-1.9.6-1.2-.2-2.6-.9-3.8-1.9-1-.8-2-2.1-2.5-3.3-.4-.9-.5-1.9 0-2.7.2-.3.4-.5.5-.6Z"
                  fill="currentColor"
                />
              </svg>
              <span>Ask about this template on WhatsApp</span>
              <span aria-hidden="true">↗</span>
            </a>
          )}
          <button
            className="button button-dark checkout-pay-button"
            type="button"
            onClick={checkout}
            disabled={!ESEWA_ENABLED || busy || demoOnly}
          >
            {demoOnly
              ? "Demo listing — not for sale"
              : ESEWA_ENABLED
                ? busy
                  ? "Connecting to eSewa…"
                  : "Continue with eSewa"
                : "eSewa — Coming soon"}
            <span>{ESEWA_ENABLED ? "↗" : "SOON"}</span>
          </button>
          <p className="checkout-terms">
            We’ll confirm availability and arrange the order with you on
            WhatsApp. Your private customization link is shared only after
            payment is confirmed.
          </p>
          <p className="checkout-secure">
            <span>✓</span> Product details included in your WhatsApp message ·
            NPR pricing
          </p>
        </section>
      </div>
    </main>
  );
}
