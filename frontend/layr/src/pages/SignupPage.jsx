import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import './AuthPageBase.css';
import './SignupPage.css';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signup(form);
      navigate(location.state?.from || '/account', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page auth-page--signup">
      <div className="auth-card">
        <p className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CHAPTER</p>
        <h1>Make a little<br /><em>room for you.</em></h1>
        <p className="auth-intro">Create an account to save purchases and download templates you own.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Your name<input type="text" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label>Email address<input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label>Password<input type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-dark auth-submit" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <span>↗</span></button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login" state={location.state}>Sign in</Link></p>
        <p className="auth-footnote">Your account is created as a customer. Admin access is assigned on the backend.</p>
      </div>
    </main>
  );
}
