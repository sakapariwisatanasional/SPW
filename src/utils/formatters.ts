/**
 * SPWN Apps 2.0 - Formatting Utilities
 */

/**
 * Format numbers to Indonesian Rupiah (IDR) currency
 */
export function formatCurrencyIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date string to Indonesian format (e.g., 21 September 2026)
 */
export function formatDateID(dateInput: string | Date | number): string {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Format compact numbers (e.g. 1.2K, 3.4M)
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

/**
 * Sanitize plain string output
 */
export function sanitizeString(str: string): string {
  if (!str) return '';
  return str.replace(/[<>]/g, '');
}
