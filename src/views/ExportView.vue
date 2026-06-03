<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header Section -->
    <div>
      <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Ekspor Laporan Keuangan</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Unduh data transaksi portofolio investasi Anda ke berbagai format file.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Form Rentang Tanggal -->
      <div class="lg:col-span-1 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-card space-y-6">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Filter Rentang Ekspor</h3>
          <p class="text-xs text-gray-400">Tentukan cakupan tanggal transaksi yang ingin dimasukkan dalam laporan</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tanggal Mulai</label>
            <input 
              v-model="dateFrom" 
              type="date" 
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tanggal Akhir</label>
            <input 
              v-model="dateTo" 
              type="date" 
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
            />
          </div>
        </div>

        <div class="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-start gap-3">
          <span class="text-lg">💡</span>
          <p class="text-xs text-emerald-800 dark:text-emerald-300 font-semibold leading-relaxed">
            Data yang diekspor akan diunduh secara lokal ke komputer Anda dan sepenuhnya aman.
          </p>
        </div>
      </div>

      <!-- Pilihan Format Unduhan -->
      <div class="lg:col-span-2 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-card space-y-6">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Pilih Format Laporan</h3>
          <p class="text-xs text-gray-400">Unduh data instan dengan mengklik salah satu format di bawah ini</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Opsi 1: CSV -->
          <div class="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 hover:border-emerald-500 transition-all flex flex-col justify-between h-44">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-2xl">📝</span>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">CSV (Raw)</span>
              </div>
              <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 mt-4">Ekspor CSV Tabular</h4>
              <p class="text-xs text-gray-400 mt-1">Ekspor mentah yang cocok di-import kembali ke Google Sheets / Excel.</p>
            </div>
            
            <button 
              @click="handleExportCSV"
              :disabled="isLoading"
              class="mt-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span v-if="isLoading" class="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Unduh CSV</span>
            </button>
          </div>

          <!-- Opsi 2: Excel (SheetJS) -->
          <div class="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 hover:border-emerald-500 transition-all flex flex-col justify-between h-44">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-2xl">📊</span>
                <span class="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full uppercase">Excel (XLSX)</span>
              </div>
              <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 mt-4">Ekspor Excel Lembar Kerja</h4>
              <p class="text-xs text-gray-400 mt-1">Ekspor format tabular rapi ke format XLSX standar Microsoft Excel.</p>
            </div>
            
            <button 
              @click="handleExportExcel"
              :disabled="isLoading"
              class="mt-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-green-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span v-if="isLoading" class="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Unduh Excel</span>
            </button>
          </div>

          <!-- Opsi 3: PDF (jsPDF) -->
          <div class="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 hover:border-emerald-500 transition-all flex flex-col justify-between h-44 md:col-span-2">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-2xl">📕</span>
                <span class="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full uppercase">Dokumen PDF</span>
              </div>
              <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 mt-4">Cetak PDF Portofolio</h4>
              <p class="text-xs text-gray-400 mt-1">Cetak berkas laporan resmi ringkasan portofolio investasi beserta data holding aktif untuk laporan perpajakan.</p>
            </div>
            
            <button 
              @click="handleExportPDF"
              :disabled="isLoading"
              class="mt-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span v-if="isLoading" class="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Cetak Laporan PDF Resmi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useUiStore } from '@/stores/uiStore';
import { useApi } from '@/composables/useApi';
import { formatIDR, formatPercent } from '@/utils/formatCurrency';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const authStore = useAuthStore();
const portfolioStore = usePortfolioStore();
const uiStore = useUiStore();
const { api } = useApi();

const isLoading = ref(false);

const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

const dateFrom = ref(oneMonthAgo.toISOString().split('T')[0]);
const dateTo = ref(new Date().toISOString().split('T')[0]);

// Helper Download File
function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. Ekspor CSV (via Apps Script)
async function handleExportCSV() {
  isLoading.value = true;
  try {
    const res = await api('export.csv', {
      date_from: dateFrom.value,
      date_to: dateTo.value
    });
    
    downloadFile(
      res.data.csv_data,
      `Investama_Transaksi_${dateFrom.value}_to_${dateTo.value}.csv`,
      'text/csv;charset=utf-8;'
    );
    uiStore.showToast('Laporan CSV berhasil diunduh!', 'success');
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

// 2. Ekspor Excel (Local via SheetJS)
async function handleExportExcel() {
  isLoading.value = true;
  try {
    await portfolioStore.fetchTransactions();
    
    // Filter lokal berdasarkan tanggal
    const from = new Date(dateFrom.value).setHours(0,0,0,0);
    const to = new Date(dateTo.value).setHours(23,59,59,999);
    
    const filteredTxs = portfolioStore.transactions.filter(tx => {
      const d = new Date(tx.tx_date);
      return d >= from && d <= to;
    });
    
    if (filteredTxs.length === 0) {
      throw new Error('Tidak ada data transaksi pada rentang tanggal tersebut.');
    }
    
    const ws = XLSX.utils.json_to_sheet(filteredTxs.map(tx => ({
      'ID Transaksi': tx.tx_id,
      'Tanggal': tx.tx_date,
      'Ticker': tx.instrument_code,
      'Nama Instrumen': tx.instrument_name,
      'Kategori': tx.category,
      'Tipe': tx.tx_type === 'buy' ? 'Beli' : 'Jual',
      'Jumlah': tx.quantity,
      'Harga per Unit': tx.price_per_unit,
      'Nilai Bersih': tx.total_value,
      'Fee / Biaya': tx.fee,
      'Catatan': tx.notes
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
    
    // Generate buffer & trigger download
    XLSX.writeFile(wb, `Investama_Laporan_${dateFrom.value}_to_${dateTo.value}.xlsx`);
    uiStore.showToast('Laporan Excel berhasil diunduh!', 'success');
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

// 3. Ekspor PDF (Local via jsPDF)
async function handleExportPDF() {
  isLoading.value = true;
  try {
    await portfolioStore.fetchSummary();
    await portfolioStore.fetchTransactions();
    
    const summary = portfolioStore.summary;
    if (!summary || !summary.instruments || summary.instruments.length === 0) {
      throw new Error('Belum ada holding aktif untuk dicetak.');
    }
    
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    // Header Banner
    doc.setFillColor(16, 185, 129); // Emerald 500
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('LAPORAN PORTOFOLIO INVESTASI', 15, 22);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(230, 250, 240);
    doc.text(`Cakupan Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 15, 28);
    
    // Metadata User
    doc.setTextColor(50, 50, 50);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Informasi Investor:', 15, 48);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nama Pengguna : ${authStore.fullName}`, 15, 54);
    doc.text(`Email Terdaftar : ${authStore.user.email}`, 15, 60);
    
    // Rangkuman Portofolio
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Rangkuman Nilai Aset:', 115, 48);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Estimasi Nilai Pasar : ${formatIDR(summary.total_current_value)}`, 115, 54);
    doc.text(`Total Modal Ditanam  : ${formatIDR(summary.total_modal)}`, 115, 60);
    
    const sign = summary.total_pnl >= 0 ? '+' : '';
    doc.text(`Total Laba / Rugi     : ${sign}${formatIDR(summary.total_pnl)} (${formatPercent(summary.total_pnl_percent)})`, 115, 66);
    
    // Line separator
    doc.setDrawColor(220, 220, 220);
    doc.line(15, 74, 195, 74);
    
    // Tabel Daftar Holding Aktif
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Daftar Kepemilikan Aset Aktif:', 15, 82);
    
    const tableBody = summary.instruments.map(i => [
      i.code,
      i.category.toUpperCase(),
      `${i.net_quantity} ${i.unit}`,
      formatIDR(i.avg_buy_price),
      formatIDR(i.current_price),
      formatIDR(i.current_value),
      `${i.pnl_amount >= 0 ? '+' : ''}${i.pnl_percent.toFixed(1)}%`
    ]);
    
    doc.autoTable({
      startY: 88,
      head: [['Ticker', 'Kategori', 'Kuantitas', 'Rata-Rata Beli', 'Harga Pasar', 'Estimasi Nilai', 'Return']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], halign: 'center' },
      styles: { fontSize: 8.5 },
      columnStyles: {
        6: { halign: 'right', fontStyle: 'bold' }
      }
    });
    
    doc.save(`Investama_Laporan_${authStore.fullName}_${new Date().toISOString().split('T')[0]}.pdf`);
    uiStore.showToast('Laporan PDF berhasil dicetak!', 'success');
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}
</script>
