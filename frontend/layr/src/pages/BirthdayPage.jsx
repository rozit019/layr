import CategoryPageLayout from '../components/CategoryPageLayout.jsx';
import './BirthdayPage.css';

export default function BirthdayPage({ onAdd, products, availableCategories }) {
  return <CategoryPageLayout categoryKey="birthday" onAdd={onAdd} products={products} availableCategories={availableCategories} />;
}
