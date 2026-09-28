import CategoryPageLayout from '../components/CategoryPageLayout.jsx';
import './ProposalPage.css';

export default function ProposalPage({ onAdd }) {
  return <CategoryPageLayout categoryKey="proposal" onAdd={onAdd} />;
}
