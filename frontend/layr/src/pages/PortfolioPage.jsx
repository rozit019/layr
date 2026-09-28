import CategoryPageLayout from '../components/CategoryPageLayout.jsx';
import './PortfolioPage.css';

export default function PortfolioPage({ onAdd }) {
  return <CategoryPageLayout categoryKey="portfolio" onAdd={onAdd} />;
}
