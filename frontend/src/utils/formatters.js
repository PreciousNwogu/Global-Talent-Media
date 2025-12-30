import { format, parseISO } from 'date-fns';

export const formatDate = (dateString, formatStr = 'PPP') => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch (error) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  return formatDate(dateString, 'PPP p');
};

export const formatCurrency = (amount, currency = 'GBP') => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatTime = (dateString) => {
  return formatDate(dateString, 'p');
};

