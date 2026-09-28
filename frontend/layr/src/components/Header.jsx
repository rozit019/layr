import { useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { categories as defaultCategories } from "../data/catalog.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import BagIcon from "./BagIcon.jsx";
import Brand from "./Brand.jsx";
import "./Header.css";

export default function Header({
  cartCount,
  onOpenCart,
  categories = defaultCategories,
}) {
  const mobileNavRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const closeMobileNav = () => {
    if (mobileNavRef.current) mobileNavRef.current.open = false;
  };

  function handleLogout() {
    logout();
    closeMobileNav();
    navigate("/", { replace: true });
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          {categories.map((category) => (
            <NavLink key={category.key} to={category.path}>
              {category.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="header-text-link" to="/#how-it-works">
            How it works
          </Link>
          {user ? (
            <>
              <Link className="header-text-link account-link" to="/account">
                Account
              </Link>
              {user.role === "admin" && (
                <Link className="header-text-link admin-link" to="/admin">
                  Admin
                </Link>
              )}
              <button
                className="header-text-link header-logout-link"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="header-text-link" to="/login">
                Log in
              </Link>
              <Link className="header-text-link" to="/signup">
                Sign up
              </Link>
            </>
          )}
          <button
            className="cart-trigger"
            type="button"
            onClick={onOpenCart}
            aria-label={`Open bag, ${cartCount} items`}
          >
            <BagIcon />
            <span>My bag</span>
            <b>{cartCount}</b>
          </button>
        </div>
        <details className="mobile-nav" ref={mobileNavRef}>
          <summary>
            Menu <span aria-hidden="true">＋</span>
          </summary>
          <nav className="mobile-nav-panel" aria-label="Mobile navigation">
            <NavLink to="/" end onClick={closeMobileNav}>
              Home
            </NavLink>
            {categories.map((category) => (
              <NavLink
                key={category.key}
                to={category.path}
                onClick={closeMobileNav}
              >
                {category.label}
                <span aria-hidden="true">↗</span>
              </NavLink>
            ))}
            <Link to="/#how-it-works" onClick={closeMobileNav}>
              How it works<span aria-hidden="true">↗</span>
            </Link>
            {user ? (
              <>
                <Link to="/account" onClick={closeMobileNav}>
                  My account<span aria-hidden="true">↗</span>
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" onClick={closeMobileNav}>
                    Admin panel<span aria-hidden="true">↗</span>
                  </Link>
                )}
                <button type="button" onClick={handleLogout}>
                  Log out<span aria-hidden="true">↗</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMobileNav}>
                  Log in<span aria-hidden="true">↗</span>
                </Link>
                <Link to="/signup" onClick={closeMobileNav}>
                  Create account<span aria-hidden="true">↗</span>
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                closeMobileNav();
                onOpenCart();
              }}
            >
              <BagIcon /> Your bag ({cartCount})
            </button>
          </nav>
        </details>
      </div>
    </header>
  );
}
