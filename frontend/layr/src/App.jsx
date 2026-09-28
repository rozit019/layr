import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import CartDrawer from './components/CartDrawer.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import { useAuth } from './auth/AuthProvider.jsx';
import { apiRequest, normalizeTemplate } from './lib/api.js';
import { categories, templates as demoTemplates } from './data/catalog.js';
import AccountPage from './pages/AccountPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AnniversaryPage from './pages/AnniversaryPage.jsx';
import BirthdayPage from './pages/BirthdayPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PaymentResultPage from './pages/PaymentResultPage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import ProposalPage from './pages/ProposalPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

const CATEGORY_STORAGE_KEY = 'layr_category_visibility';
const DEFAULT_CATEGORY_SETTINGS = Object.fromEntries(categories.map((category) => [category.key, true]));

function readSavedCategorySettings() {
  try { return { ...DEFAULT_CATEGORY_SETTINGS, ...JSON.parse(window.localStorage.getItem(CATEGORY_STORAGE_KEY) || '{}') }; }
  catch { return DEFAULT_CATEGORY_SETTINGS; }
}

function mergeTemplates(remoteTemplates = []) {
  const merged = new Map();
  remoteTemplates.forEach((template) => {
    if (!template?.slug || template.isActive === false) return;
    merged.set(template.slug, normalizeTemplate({ ...template, demoOnly: false }));
  });
  demoTemplates.forEach((template) => {
    if (!merged.has(template.slug)) merged.set(template.slug, normalizeTemplate(template));
  });
  return [...merged.values()];
}

function parseCategorySettings(payload) {
  const rows = payload?.categories || payload?.settings || [];
  if (Array.isArray(rows)) {
    return Object.fromEntries(rows.map((item) => [item.key || item.category || item.slug, item.isEnabled ?? item.enabled ?? true]).filter(([key]) => key));
  }
  if (rows && typeof rows === 'object') {
    return Object.fromEntries(Object.entries(rows).map(([key, value]) => [key, typeof value === 'boolean' ? value : value?.isEnabled ?? value?.enabled ?? true]));
  }
  return {};
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);
  return null;
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();
  if (authLoading) return <main className="route-loading"><p>Checking your account…</p></main>;
  if (!user) return <Navigate to="/login" replace state={{ from: { pathname: location.pathname, search: location.search, hash: location.hash } }} />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/account" replace />;
  return children;
}

export default function App() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [productCatalogue, setProductCatalogue] = useState(() => mergeTemplates());
  const [categorySettings, setCategorySettings] = useState(readSavedCategorySettings);
  const [categoryMode, setCategoryMode] = useState('local');
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  const refreshCatalogue = useCallback(async () => {
    try {
      const payload = await apiRequest('/templates');
      setProductCatalogue(mergeTemplates(payload?.templates || []));
    } catch {
      setProductCatalogue(mergeTemplates());
    }
  }, []);

  const refreshCategorySettings = useCallback(async () => {
    try {
      const payload = await apiRequest('/categories');
      const settings = { ...DEFAULT_CATEGORY_SETTINGS, ...parseCategorySettings(payload) };
      setCategorySettings(settings);
      setCategoryMode('api');
      window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      setCategorySettings(readSavedCategorySettings());
      setCategoryMode('local');
    }
  }, []);

  useEffect(() => {
    refreshCatalogue();
    refreshCategorySettings();
  }, [refreshCatalogue, refreshCategorySettings]);

  const visibleCategories = useMemo(() => categories.filter((category) => categorySettings[category.key] !== false), [categorySettings]);
  const visibleCategoryKeys = useMemo(() => new Set(visibleCategories.map((category) => category.key)), [visibleCategories]);
  const visibleProducts = useMemo(() => productCatalogue.filter((product) => visibleCategoryKeys.has(product.category)), [productCatalogue, visibleCategoryKeys]);

  function addToBag(template) {
    setCartItems((current) => {
      const match = current.find((item) => item.template.slug === template.slug);
      if (match) return current.map((item) => item.template.slug === template.slug ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { template, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function removeFromBag(slug) {
    setCartItems((current) => current.filter((item) => item.template.slug !== slug));
  }

  function beginCheckout(template) {
    setCartOpen(false);
    navigate(`/checkout/${encodeURIComponent(template.slug)}`);
  }

  async function toggleCategory(categoryKey, isEnabled) {
    try {
      await apiRequest(`/categories/${encodeURIComponent(categoryKey)}`, { method: 'PATCH', token, body: { isEnabled } });
      setCategorySettings((current) => {
        const next = { ...current, [categoryKey]: isEnabled };
        window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setCategoryMode('api');
      return { persisted: true };
    } catch (err) {
      if (err.status && err.status !== 404) throw err;
      setCategorySettings((current) => {
        const next = { ...current, [categoryKey]: isEnabled };
        window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setCategoryMode('local');
      return { persisted: false };
    }
  }

  return (
    <>
      <ScrollToTop />
      <Header cartCount={cartCount} onOpenCart={() => setCartOpen(true)} categories={visibleCategories} />
      <Routes>
        <Route path="/" element={<HomePage onAdd={addToBag} products={visibleProducts} availableCategories={visibleCategories} />} />
        <Route path="/portfolios" element={visibleCategoryKeys.has('portfolio') ? <PortfolioPage onAdd={addToBag} products={visibleProducts} availableCategories={visibleCategories} /> : <NotFoundPage />} />
        <Route path="/birthday-pages" element={visibleCategoryKeys.has('birthday') ? <BirthdayPage onAdd={addToBag} products={visibleProducts} availableCategories={visibleCategories} /> : <NotFoundPage />} />
        <Route path="/proposals" element={visibleCategoryKeys.has('proposal') ? <ProposalPage onAdd={addToBag} products={visibleProducts} availableCategories={visibleCategories} /> : <NotFoundPage />} />
        <Route path="/anniversary-pages" element={visibleCategoryKeys.has('anniversary') ? <AnniversaryPage onAdd={addToBag} products={visibleProducts} availableCategories={visibleCategories} /> : <NotFoundPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage categorySettings={categorySettings} categoryMode={categoryMode} onToggleCategory={toggleCategory} onCategoriesChanged={() => { refreshCatalogue(); refreshCategorySettings(); }} /></ProtectedRoute>} />
        <Route path="/checkout/:slug" element={<ProtectedRoute><CheckoutPage products={productCatalogue} visibleCategoryKeys={visibleCategoryKeys} /></ProtectedRoute>} />
        <Route path="/payment/success" element={<PaymentResultPage />} />
        <Route path="/payment/failed" element={<PaymentResultPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer categories={visibleCategories} />
      {cartOpen && <CartDrawer items={cartItems} onClose={() => setCartOpen(false)} onRemove={removeFromBag} onCheckout={beginCheckout} />}
    </>
  );
}
