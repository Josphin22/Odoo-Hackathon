export const formatCurrency = (amount) => {
  const amt = Number(amount);
  if (isNaN(amt)) return '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amt);
};

export default formatCurrency;
