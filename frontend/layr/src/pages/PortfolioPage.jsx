import CategoryPageLayout from '../components/CategoryPageLayout.jsx';
import './PortfolioPage.css';

export default function PortfolioPage({ onAdd, products, availableCategories }) {
  return <CategoryPageLayout categoryKey="portfolio" onAdd={onAdd} products={products} availableCategories={availableCategories} />;
}
