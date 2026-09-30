import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import "./AuthPageBase.css";
import "./LoginPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const from = location.state?.from;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(form);
      navigate(from || (user.role === "admin" ? "/admin" : "/account"), {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page auth-page--login">
      <div className="auth-card">
        <p className="eyebrow">
          <span className="eyebrow-dot" /> WELCOME BACK
        </p>
        <h1>
          Good to see
          <br />
          <em>you again.</em>
        </h1>
        <p className="auth-intro">
          Sign in to pick up where your story left off.
        </p>
        {from && (
          <p className="auth-hint">Sign in first to continue to checkout.</p>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              required
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button button-dark auth-submit"
            type="submit"
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign in"} <span>↗</span>
          </button>
        </form>
        <p className="auth-switch">
          New to LAYR?{" "}
          <Link to="/signup" state={location.state}>
            Create an account
          </Link>
        </p>
        <p className="auth-footnote">Elvi welcomes you back!</p>
      </div>
    </main>
  );
}
