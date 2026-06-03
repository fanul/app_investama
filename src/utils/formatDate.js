/**
 * Memformat tanggal string menjadi tanggal bahasa Indonesia yang rapi
 * @param {string} dateStr - Tanggal format ISO 8601 atau YYYY-MM-DD
 * @param {boolean} includeTime - Sertakan jam dan menit
 * @returns {string} Tanggal terformat Indonesia
 */
export function formatDate(dateStr, includeTime = false) {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = false;
    }
    
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch (e) {
    return dateStr;
  }
}
