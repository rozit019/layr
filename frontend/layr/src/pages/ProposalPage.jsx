import CategoryPageLayout from '../components/CategoryPageLayout.jsx';
import './ProposalPage.css';

export default function ProposalPage({ onAdd, products, availableCategories }) {
  return <CategoryPageLayout categoryKey="proposal" onAdd={onAdd} products={products} availableCategories={availableCategories} />;
}
