import CategoryPageLayout from '../components/CategoryPageLayout.jsx';
import './AnniversaryPage.css';

export default function AnniversaryPage({ onAdd, products, availableCategories }) {
  return <CategoryPageLayout categoryKey="anniversary" onAdd={onAdd} products={products} availableCategories={availableCategories} />;
}
