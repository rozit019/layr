import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import { apiRequest } from "../lib/api.js";
import "./PaymentResultPage.css";

export default function PaymentResultPage() {
  const location = useLocation();
  const { token } = useAuth();
  const success = location.pathname.endsWith("/success");
  const orderId = new URLSearchParams(location.search).get("order");
  const [customizeUrl, setCustomizeUrl] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let active = true;
    if (!success || !orderId || !token) {
      setLinkLoading(false);
      return () => {
        active = false;
      };
    }
    setLinkLoading(true);
    setLinkError("");
    apiRequest(`/orders/${encodeURIComponent(orderId)}/customize-link`, {
      token,
    })
      .then((payload) => {
        if (!active) return;
        const link = payload?.customizeUrl || payload?.url || "";
        if (link) setCustomizeUrl(link);
        else
          setLinkError(
            "Payment was verified, but the customization link is not available yet. Check your account in a moment.",
          );
      })
      .catch((error) => {
        if (active)
          setLinkError(
            error.message || "Could not load your customization link.",
          );
      })
      .finally(() => {
        if (active) setLinkLoading(false);
      });
    return () => {
      active = false;
    };
  }, [success, orderId, token]);

  useEffect(() => {
    if (!success || !customizeUrl) return undefined;
    setRedirecting(true);
    // Leave the result and purchased link visible before opening the customizer.
    const timer = window.setTimeout(
      () => window.location.assign(customizeUrl),
      5000,
    );
    return () => window.clearTimeout(timer);
  }, [success, customizeUrl]);

  const loginState = {
    from: { pathname: location.pathname, search: location.search },
  };
  return (
    <main
      className={`payment-result-page${success ? " payment-result-page--success" : ""}`}
    >
      <section className="payment-result-card">
        <span className="payment-result-mark">{success ? "✓" : "↺"}</span>
        <p className="eyebrow">
          <span className="eyebrow-dot" /> ESEWA PAYMENT
        </p>
        <h1>
          {success ? (
            <>
              Payment
              <br />
              <em>confirmed.</em>
            </>
          ) : (
            <>
              Payment
              <br />
              <em>not completed.</em>
            </>
          )}
        </h1>
        <p>
          {success
            ? customizeUrl
              ? "Your purchase is ready. The result link is below and will open automatically in a few seconds."
              : "The backend is verifying your payment and preparing your private customization link."
            : "Your payment was not completed. If you were charged, check your account orders or contact support before trying again."}
        </p>
        {orderId && (
          <small className="payment-order-id">
            Order reference · {orderId}
          </small>
        )}
        {success && linkLoading && (
          <p className="customize-link-status" role="status">
            Preparing your purchased link…
          </p>
        )}
        {success && linkError && (
          <p className="customize-link-error" role="alert">
            {linkError}
          </p>
        )}
        {success && customizeUrl && (
          <div className="customize-link-result">
            <span className="customize-link-label">YOUR PURCHASE LINK</span>
            <a className="customize-link-url" href={customizeUrl}>
              {customizeUrl}
            </a>
            {redirecting && (
              <small className="customize-link-countdown">
                Opening automatically shortly…
              </small>
            )}
          </div>
        )}
        <div className="payment-result-actions">
          {success && customizeUrl ? (
            <a className="button button-dark" href={customizeUrl}>
              Open my customization link now <span>↗</span>
            </a>
          ) : success && !token ? (
            <Link className="button button-dark" to="/login" state={loginState}>
              Sign in to get your link <span>↗</span>
            </Link>
          ) : (
            <Link
              className="button button-dark"
              to={success ? "/account" : "/"}
            >
              {success ? "Open my account" : "Back to storefront"}{" "}
              <span>↗</span>
            </Link>
          )}
          <Link className="payment-secondary-link" to="/">
            Continue browsing
          </Link>
        </div>
      </section>
    </main>
  );
}
