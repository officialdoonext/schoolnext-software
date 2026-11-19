import { format, parseISO } from 'date-fns';

/**
 * Format currency in Indian Rupees with proper grouping (e.g. ₹ 1,25,000)
 */
export const formatCurrency = (amount: number | string | undefined): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format date in DD-MM-YYYY format
 */
export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-';
  try {
    const date = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr);
    return format(date, 'dd-MM-yyyy');
  } catch {
    return dateStr;
  }
};

/**
 * Format date and time
 */
export const formatDateTime = (dateStr: string | undefined): string => {
  if (!dateStr) return '-';
  try {
    const date = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr);
    return format(date, 'dd-MM-yyyy hh:mm a');
  } catch {
    return dateStr;
  }
};

