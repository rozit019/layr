import { useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { categories } from '../data/catalog.js';
import BagIcon from './BagIcon.jsx';
import Brand from './Brand.jsx';
import './Header.css';

export default function Header({ cartCount, onOpenCart }) {
  const mobileNavRef = useRef(null);
  const closeMobileNav = () => { if (mobileNavRef.current) mobileNavRef.current.open = false; };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          {categories.map((category) => <NavLink key={category.key} to={category.path}>{category.label}</NavLink>)}
        </nav>
        <div className="header-actions">
          <Link className="header-text-link" to="/#how-it-works">How it works</Link>
          <button className="cart-trigger" type="button" onClick={onOpenCart} aria-label={`Open bag, ${cartCount} items`}>
            <BagIcon />
            <span>My bag</span>
            <b>{cartCount}</b>
          </button>
        </div>
        <details className="mobile-nav" ref={mobileNavRef}>
          <summary>Menu <span aria-hidden="true">＋</span></summary>
          <nav className="mobile-nav-panel" aria-label="Mobile navigation">
            <NavLink to="/" end onClick={closeMobileNav}>Home</NavLink>
            {categories.map((category) => <NavLink key={category.key} to={category.path} onClick={closeMobileNav}>{category.label}<span aria-hidden="true">↗</span></NavLink>)}
            <Link to="/#how-it-works" onClick={closeMobileNav}>How it works<span aria-hidden="true">↗</span></Link>
            <button type="button" onClick={() => { closeMobileNav(); onOpenCart(); }}><BagIcon /> Your bag ({cartCount})</button>
          </nav>
        </details>
      </div>
    </header>
  );
}
