import { format } from 'date-fns';

const amountFormat = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const formatAmount = (value) => amountFormat.format(value);

export const formatWhole = (value) => wholeFormat.format(value);

export const formatDate = (value, pattern = 'MMM dd, yyyy') => format(new Date(value), pattern);
