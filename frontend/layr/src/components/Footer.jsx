import { Link } from "react-router-dom";
import { categories } from "../data/catalog.js";
import Brand from "./Brand.jsx";
import "./Footer.css";

export default function Footer({
  categories: availableCategories = categories,
}) {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand-block">
          <Brand />
          <p>
            A page for your work.
            <br />A moment for someone.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <span className="footer-label">EXPLORE</span>
            {availableCategories.map((category) => (
              <Link key={category.key} to={category.path}>
                {category.label}
              </Link>
            ))}
          </div>
          <div>
            <span className="footer-label">LAYR</span>
            <Link to="/#featured">Templates</Link>
            <Link to="/#how-it-works">How it works</Link>
            <a href="mailto:hello@layr.example">Get in touch</a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} Elvi. Made for work &amp; life’s moments.
        </span>
        <span>Thoughtful templates, made to feel like you.</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
