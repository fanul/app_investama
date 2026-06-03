// ExportService.js

function exportCSV(userId, payload) {
  const { date_from, date_to } = payload;
  
  if (!date_from || !date_to) {
    throw new Error('MISSING_FIELDS');
  }
  
  const transactions = listTransactions(userId);
  const fromDate = new Date(date_from);
  const toDate = new Date(date_to);
  
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);
  
  const filtered = transactions.filter(tx => {
    const txDate = new Date(tx.tx_date);
    return txDate >= fromDate && txDate <= toDate;
  });
  
  const headers = [
    'Tanggal Transaksi',
    'Kode Ticker',
    'Nama Instrumen',
    'Kategori',
    'Tipe Transaksi',
    'Kuantitas (Lot/Gram/Unit)',
    'Harga per Unit',
    'Nilai Bersih',
    'Biaya Transaksi',
    'Catatan'
  ];
  
  const escapeCSVCell = (val) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    }
    return str;
  };
  
  const rows = filtered.map(tx => {
    return [
      escapeCSVCell(tx.tx_date),
      escapeCSVCell(tx.instrument_code),
      escapeCSVCell(tx.instrument_name),
      escapeCSVCell(tx.category),
      escapeCSVCell(tx.tx_type === 'buy' ? 'Beli' : 'Jual'),
      escapeCSVCell(tx.quantity),
      escapeCSVCell(tx.price_per_unit),
      escapeCSVCell(tx.total_value),
      escapeCSVCell(tx.fee),
      escapeCSVCell(tx.notes)
    ].join(',');
  });
  
  const csvContent = [headers.join(','), ...rows].join('\r\n');
  
  AuditService.log(userId, 'export', 'csv', { count: filtered.length, date_from, date_to });
  
  return {
    status: 'success',
    data: {
      csv_data: csvContent
    }
  };
}
