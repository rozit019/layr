import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return <main className="not-found"><div className="container"><p className="eyebrow">PAGE NOT FOUND</p><h1>Wrong turn.<br /><em>Good ideas ahead.</em></h1><Link className="button button-dark" to="/">Back home <span>↗</span></Link></div></main>;
}
