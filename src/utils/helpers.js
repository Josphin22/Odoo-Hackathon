// Status badge color resolver helper
export const getStatusVariant = (status) => {
  const s = String(status || '').toLowerCase().trim();
  if (['available', 'active', 'completed', 'success'].includes(s)) return 'success';
  if (['suspended', 'retired', 'cancelled', 'danger'].includes(s)) return 'danger';
  if (['in shop', 'warning', 'pending', 'draft'].includes(s)) return 'warning';
  if (['on trip', 'dispatched'].includes(s)) return 'secondary';
  return 'slate';
};

// Standard number formatting
export const formatNumber = (num) => {
  if (isNaN(Number(num))) return '0';
  return Number(num).toLocaleString();
};
