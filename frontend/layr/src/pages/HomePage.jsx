import { Link } from 'react-router-dom';
import { categories, templates } from '../data/catalog.js';
import { TemplateGrid } from '../components/TemplateCard.jsx';
import './HomePage.css';

function HomeArtwork() {
  return (
    <div className="home-art" aria-label="Preview of a birthday page and a creative portfolio">
      <div className="home-art-halo" />
      <div className="home-art-stamp"><span>✳</span><b>PERSONALIZE<br />THEN SHARE</b></div>
      <div className="hero-browser">
        <div className="browser-chrome"><span className="browser-lights"><i /><i /><i /></span><span>birthday-in-bloom.layr.page</span><span>↗</span></div>
        <div className="hero-birthday-site">
          <div className="hero-mock-nav"><b>MADE FOR YOU <i>♥</i></b><span>A NOTE&nbsp;&nbsp; MEMORIES&nbsp;&nbsp; SURPRISE</span></div>
          <div className="hero-birthday-body">
            <div className="hero-birthday-copy"><small>A LITTLE SURPRISE FOR MAYA</small><strong>Today is<br />all yours.</strong><span>OPEN YOUR BIRTHDAY NOTE&nbsp; ↗</span></div>
            <div className="hero-cake" aria-hidden="true"><i className="cake-flame" /><i className="cake-candle" /><i className="cake-layer cake-layer-top" /><i className="cake-layer cake-layer-bottom" /><i className="cake-plate" /><i className="cake-balloon cake-balloon-one" /><i className="cake-balloon cake-balloon-two" /><b>✳</b></div>
          </div>
          <div className="hero-mock-foot"><span>A PAGE FULL OF LITTLE THINGS</span><span>SCROLL FOR THE SURPRISE ↓</span></div>
        </div>
      </div>
      <div className="portfolio-float-card">
        <div className="portfolio-float-person"><span>NP</span><div><b>Nina Park</b><small>Designer &amp; art director</small></div><i>↗</i></div>
        <div className="portfolio-float-caption"><span>SELECTED WORK</span><b>04</b></div>
        <div className="portfolio-color-tiles"><i /><i /><i /></div>
      </div>
      <div className="share-pill"><span>↗</span><b>One link. Ready to share.</b></div>
      <span className="home-art-index">A PAGE FOR EVERY STORY&nbsp; · &nbsp;01 / 04</span>
    </div>
  );
}

function HomeHero() {
  return (
    <section className="home-hero" id="top">
      <div className="container home-hero-grid">
        <div className="home-hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> PERSONAL WEBSITES FOR WORK &amp; LIFE</p>
          <h1>A page for your work.<br /><em>A moment for someone.</em></h1>
          <p className="hero-description">Build a portfolio that feels like you, or make a birthday, proposal, or anniversary link they’ll never forget.</p>
          <div className="hero-actions"><a className="button button-dark" href="#featured">Explore templates <span aria-hidden="true">↗</span></a><a className="text-link" href="#categories">Find your kind <span aria-hidden="true">↓</span></a></div>
          <div className="hero-note"><span className="hero-note-icon">♡</span><span>Choose it. Make it personal. Send it with love.</span></div>
        </div>
        <HomeArtwork />
      </div>
    </section>
  );
}

function BenefitStrip() {
  const benefits = [['✳', 'Made to feel personal'], ['⌁', 'Easy to make your own'], ['↗', 'One link to share'], ['♡', 'For work & life’s moments']];
  return <div className="benefit-strip"><div className="container benefit-list">{benefits.map(([icon, text]) => <span key={text}><i>{icon}</i>{text}</span>)}</div></div>;
}

function HomeCategories() {
  return (
    <section className="home-categories section-space" id="categories">
      <div className="container">
        <div className="section-heading section-heading--split">
          <div><p className="eyebrow"><span className="eyebrow-dot" /> FIND YOUR FORMAT</p><h2>What are you<br /><em>making a page for?</em></h2></div>
          <p className="section-description">One thoughtful little site can show the work you do—or make an ordinary day feel like a milestone.</p>
        </div>
        <div className="home-category-grid">
          {categories.map((category, index) => (
            <Link className={`home-category-card home-category-card--${category.key}`} key={category.key} to={category.path}>
              <span className="category-card-top"><span>{String(index + 1).padStart(2, '0')} / 04</span><b>{category.icon}</b></span>
              <span className="category-card-bottom"><span><strong>{category.title}</strong><small>{category.cardCopy}</small></span><i aria-hidden="true">↗</i></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepsSection() {
  const steps = [
    ['01', 'Choose the kind of page', 'Portfolio, birthday surprise, proposal, or anniversary—start with what you’re making.', '⌕'],
    ['02', 'Make it feel like you', 'Add your own words, memories, photos, and the little details that matter.', '✳'],
    ['03', 'Share it with one link', 'Send your page to someone special, or put your portfolio out into the world.', '↗'],
  ];
  return (
    <section className="steps-section" id="how-it-works">
      <div className="container steps-grid">
        <div className="steps-intro"><p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> SIMPLE BY DESIGN</p><h2>From first idea<br />to <em>their inbox.</em></h2><p>Good-looking pages don’t need to start from scratch. Find a layout, make it personal, and share it when it feels right.</p><Link className="button button-light" to="/portfolios">Find your starting point <span>↗</span></Link></div>
        <div className="steps-list">{steps.map(([number, title, description, icon]) => <article className="step-row" key={number}><span className="step-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div><span className="step-symbol">{icon}</span></article>)}</div>
      </div>
    </section>
  );
}

export default function HomePage({ onAdd }) {
  const featured = templates.filter((template) => template.featured);
  return (
    <main>
      <HomeHero />
      <BenefitStrip />
      <section className="featured-section section-space" id="featured">
        <div className="container">
          <div className="section-heading section-heading--split"><div><p className="eyebrow"><span className="eyebrow-dot" /> THE STARTING LINE</p><h2>Templates with<br /><em>a little feeling.</em></h2></div><div className="section-aside"><p>Thoughtful starting points for your portfolio, or the message you want someone to keep.</p><Link className="text-link" to="/birthday-pages">See all moments <span>↗</span></Link></div></div>
          <TemplateGrid items={featured} onAdd={onAdd} className="featured-grid" />
        </div>
      </section>
      <HomeCategories />
      <StepsSection />
      <section className="home-last-call"><div className="container"><span>MAKE A PAGE THEY’LL REMEMBER</span><h2>Every story needs<br /><em>a place to land.</em></h2><Link to="/birthday-pages" className="button button-dark">Find your template <span>↗</span></Link></div></section>
    </main>
  );
}
