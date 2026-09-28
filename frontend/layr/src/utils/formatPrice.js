export function formatPrice(amount, currency = 'NPR') {
  const value = Number(amount || 0);
  if (currency === 'NPR') return `NPR ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
