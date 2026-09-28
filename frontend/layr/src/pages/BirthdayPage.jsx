import CategoryPageLayout from '../components/CategoryPageLayout.jsx';
import './BirthdayPage.css';

export default function BirthdayPage({ onAdd }) {
  return <CategoryPageLayout categoryKey="birthday" onAdd={onAdd} />;
}
