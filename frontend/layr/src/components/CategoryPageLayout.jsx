import { Link } from 'react-router-dom';
import { categories, getCategory, getTemplatesByCategory } from '../data/catalog.js';
import CategoryScene from './CategoryScene.jsx';
import { TemplateGrid } from './TemplateCard.jsx';
import './CategoryPageLayout.css';

function RelatedCategories({ currentKey }) {
  const related = categories.filter((category) => category.key !== currentKey).slice(0, 3);
  return (
    <section className="related-section"><div className="container"><div className="related-heading"><p className="eyebrow"><span className="eyebrow-dot" /> KEEP EXPLORING</p><h2>Another kind of page?</h2></div><div className="related-links">{related.map((category) => <Link to={category.path} key={category.key}><span>{category.label}</span><i>↗</i></Link>)}</div></div></section>
  );
}

export default function CategoryPageLayout({ categoryKey, onAdd }) {
  const category = getCategory(categoryKey);
  const categoryTemplates = getTemplatesByCategory(categoryKey);
  if (!category) return null;

  return (
    <main className={`category-page category-page--${category.key}`}>
      <section className="category-hero" id="top">
        <div className="container category-hero-grid">
          <div className="category-hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> {category.eyebrow}</p>
            <h1>{category.headline}<br /><em>{category.headlineEmphasis}</em></h1>
            <p className="category-lede">{category.description}</p>
            <div className="category-hero-actions"><a className="button button-dark" href="#category-templates">Browse {category.label.toLowerCase()} <span>↓</span></a><Link className="text-link" to="/#categories">All categories <span>↗</span></Link></div>
            <div className="category-count"><span>{String(categoryTemplates.length).padStart(2, '0')}</span> designs to make your own</div>
          </div>
          <CategoryScene category={category} />
        </div>
      </section>
      <section className="category-collection section-space" id="category-templates">
        <div className="container">
          <div className="section-heading category-list-heading"><div><p className="eyebrow"><span className="eyebrow-dot" /> MADE FOR THIS MOMENT</p><h2>{category.title},<br /><em>your way.</em></h2></div><p className="section-description">Pick the design that feels right, add your own story, and make it yours.</p></div>
          <TemplateGrid items={categoryTemplates} onAdd={onAdd} className="category-product-grid" />
        </div>
      </section>
      <section className="personalize-band">
        <div className="container personalize-inner"><span className="personalize-icon">{category.icon}</span><div><p className="eyebrow">A TEMPLATE IS JUST THE BEGINNING</p><h2>Keep the layout.<br /><em>Make it your story.</em></h2></div><p>{category.cardCopy} Personalize the words, colors, and photos so every detail feels like you.</p><a href="#category-templates" className="round-link" aria-label="Back to templates">↗</a></div>
      </section>
      <RelatedCategories currentKey={category.key} />
    </main>
  );
}
