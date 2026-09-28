import { getCategory } from '../data/catalog.js';
import { formatPrice } from '../utils/formatPrice.js';
import BagIcon from './BagIcon.jsx';
import './TemplateCard.css';

function BuyIconButton({ template, onAdd, compact = false }) {
  return (
    <button className={`buy-icon${compact ? ' buy-icon--compact' : ''}`} type="button" onClick={() => onAdd(template)} aria-label={`Add ${template.title} to your bag`} title="Add to bag">
      <BagIcon />
      {!compact && <span>Buy template</span>}
    </button>
  );
}

function MiniSite({ template }) {
  const style = template.previewStyle || template.category;
  const category = template.category;
  return (
    <div className={`mini-site mini-site--${category} mini-site--${style}`}>
      <div className="mini-site-nav">
        <b>{category === 'portfolio' ? 'NORTH®' : category === 'birthday' ? 'FOR YOU, ALWAYS ♥' : category === 'proposal' ? 'TO MY FAVORITE PERSON' : 'US, ALWAYS ∞'}</b>
        <span>{category === 'portfolio' ? 'WORK&nbsp;&nbsp; ABOUT&nbsp;&nbsp; CONTACT' : 'OUR STORY&nbsp;&nbsp; A NOTE&nbsp;&nbsp; ♡'}</span>
      </div>
      <div className={`mini-site-body mini-site-body--${category}`}>
        {category === 'portfolio' && <><small>{style === 'portfolio-editorial' ? 'INDEPENDENT DESIGNER · SELECTED WORK' : 'INDEPENDENT CREATIVE STUDIO'}</small><strong>{style === 'portfolio-editorial' ? <>Thoughtfully<br />made things.</> : <>Make a<br />little noise.</>}</strong><i className="mini-deco mini-deco--portfolio" /><span>SELECTED WORK ↗</span></>}
        {category === 'birthday' && <><small>{style === 'birthday-party' ? 'IT’S YOUR DAY — LET’S CELEBRATE' : 'A LITTLE SURPRISE FOR YOU'}</small><strong>{style === 'birthday-party' ? <>Let’s make<br />a wish.</> : <>Today is<br />all yours.</>}</strong><i className="mini-deco mini-deco--birthday" /><span>OPEN YOUR NOTE ↗</span></>}
        {category === 'proposal' && <><small>{style === 'proposal-night' ? 'UNDER A MILLION LITTLE STARS' : 'EVERY LITTLE THING LED HERE'}</small><strong>{style === 'proposal-night' ? <>Out of every<br />possibility…</> : <>All roads<br />led to you.</>}</strong><i className="mini-deco mini-deco--proposal">♡</i><span>ONE QUESTION FOR YOU…</span></>}
        {category === 'anniversary' && <><small>{style === 'anniversary-timeline' ? 'CHAPTER ONE, AND EVERY ONE AFTER' : 'ANOTHER YEAR, STILL MY FAVORITE'}</small><strong>{style === 'anniversary-timeline' ? <>The little<br />things add up.</> : <>Look how far<br />we’ve come.</>}</strong><i className="mini-deco mini-deco--anniversary" /><span>OUR LITTLE TIMELINE ↗</span></>}
      </div>
    </div>
  );
}

export default function TemplateCard({ template, onAdd, index = 0 }) {
  const category = getCategory(template.category);
  return (
    <article className={`template-card template-card--${template.category}`}>
      <div className={`template-art template-art--${template.category}`}>
        <div className="template-art-browser"><span>{template.slug.replaceAll('-', '')}.layr.page</span><span>↗</span></div>
        <span className="template-badge">{template.badge || category?.label}</span>
        <BuyIconButton template={template} onAdd={onAdd} compact />
        <MiniSite template={template} />
      </div>
      <div className="template-info">
        <div className="template-category-label">{category?.label} <span>·</span> Digital template</div>
        <div className="template-title-row"><h3>{template.title}</h3><strong className="template-price">{formatPrice(template.price, template.currency)}</strong></div>
        <p className="template-tagline">{template.tagline}</p>
        <div className="template-card-footer"><span className="template-number">{String(index + 1).padStart(2, '0')}</span><BuyIconButton template={template} onAdd={onAdd} /></div>
      </div>
    </article>
  );
}

export function TemplateGrid({ items, onAdd, className = '' }) {
  return <div className={`template-grid ${className}`}>{items.map((template, index) => <TemplateCard key={template.slug} template={template} onAdd={onAdd} index={index} />)}</div>;
}
