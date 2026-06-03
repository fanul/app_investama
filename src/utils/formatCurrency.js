/**
 * Memformat angka menjadi format mata uang Rupiah (IDR)
 * @param {number} value - Angka yang akan diformat
 * @returns {string} String terformat Rp
 */
export function formatIDR(value) {
  if (value === null || value === undefined || isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Memformat angka menjadi format persentase
 * @param {number} value - Persentase desimal
 * @param {number} decimals - Jumlah angka di belakang koma
 * @returns {string} String terformat dengan tanda + / -
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}
