import CategoryPageLayout from '../components/CategoryPageLayout.jsx';
import './AnniversaryPage.css';

export default function AnniversaryPage({ onAdd }) {
  return <CategoryPageLayout categoryKey="anniversary" onAdd={onAdd} />;
}
