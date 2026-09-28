import { useEffect, useMemo, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import CartDrawer from './components/CartDrawer.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import AnniversaryPage from './pages/AnniversaryPage.jsx';
import BirthdayPage from './pages/BirthdayPage.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import ProposalPage from './pages/ProposalPage.jsx';

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

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

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

  return (
    <>
      <ScrollToTop />
      <Header cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />
      <Routes>
        <Route path="/" element={<HomePage onAdd={addToBag} />} />
        <Route path="/portfolios" element={<PortfolioPage onAdd={addToBag} />} />
        <Route path="/birthday-pages" element={<BirthdayPage onAdd={addToBag} />} />
        <Route path="/proposals" element={<ProposalPage onAdd={addToBag} />} />
        <Route path="/anniversary-pages" element={<AnniversaryPage onAdd={addToBag} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      {cartOpen && <CartDrawer items={cartItems} onClose={() => setCartOpen(false)} onRemove={removeFromBag} />}
    </>
  );
}
