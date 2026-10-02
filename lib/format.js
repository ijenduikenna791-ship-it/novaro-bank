export const money = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(Number(n || 0));

export const compactMoney = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(Number(n || 0));

export const dateTime = (d) =>
  new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const dateOnly = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const maskAccount = (n = '') => (n ? `${n.slice(0, 4)} •••• ${n.slice(-2)}` : '');

export const groupCard = (n = '') => n.replace(/(\d{4})(?=\d)/g, '$1 ');

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'U';

export const txLabel = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  transfer_in: 'Received',
  transfer_out: 'Sent',
  card_funding: 'Card top-up',
  card_refund: 'Card refund',
};

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
