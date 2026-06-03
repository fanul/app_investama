<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Header Section / Greetings -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <section class="space-y-1">
        <h1 class="text-headline-lg-mobile sm:text-headline-lg font-headline-lg font-bold text-on-surface">
          Selamat Datang, {{ firstName }}
        </h1>
        <p class="text-body-md font-body-md text-on-surface-variant">Berikut adalah ikhtisar kekayaan Anda</p>
      </section>

      <button 
        @click="handleRefresh" 
        :disabled="isLoading"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-lg transition-colors duration-150 active:scale-95 disabled:opacity-50 self-start"
      >
        <span v-if="isLoading" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
        <span class="material-symbols-outlined text-sm" v-else>sync</span>
        <span>{{ isLoading ? 'Menyegarkan...' : 'Refresh Data' }}</span>
      </button>
    </div>

    <!-- Loading Skeleton State -->
    <div v-if="isLoading && !portfolioStore.summary" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="i in 2" :key="i" class="p-6 bg-surface-container-lowest rounded-xl border border-surface-container shadow-card animate-pulse-soft space-y-4">
        <div class="h-4 bg-surface-container w-1/4 rounded-full"></div>
        <div class="h-8 bg-surface-container w-1/2 rounded-full"></div>
        <div class="h-16 bg-surface-container w-full rounded-xl"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!portfolioStore.hasHoldings" class="bg-surface-container-lowest rounded-xl p-12 text-center border border-surface-container vibrant-card-shadow flex flex-col items-center justify-center">
      <span class="material-symbols-outlined text-6xl text-primary animate-pulse mb-6">eco</span>
      <h3 class="text-headline-md font-headline-md font-bold text-on-surface">Portofolio Anda Masih Kosong</h3>
      <p class="text-body-md font-body-md text-on-surface-variant mt-2 max-w-sm">Mulai catat transaksi pertama Anda untuk melihat statistik, alokasi aset, dan performa portofolio Anda.</p>
      <router-link to="/portfolio" class="mt-6 px-6 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
        Tambah Transaksi Pertama
      </router-link>
    </div>

    <!-- Main Content Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- LEFT COLUMN: Summary & Distribution & Activities (7 cols on lg) -->
      <div class="lg:col-span-7 space-y-6">
        
        <!-- Total Wealth Card -->
        <div class="bg-surface-container-lowest rounded-xl overflow-hidden vibrant-card-shadow border border-surface-container">
          <div class="h-2 bg-gradient-to-r from-primary to-primary-container"></div>
          <div class="p-card_padding space-y-4">
            <div class="flex justify-between items-start">
              <span class="text-label-md font-label-md text-on-surface-variant">Total Kekayaan Bersih</span>
              <span 
                class="flex items-center gap-1 font-bold text-label-sm px-2.5 py-1 rounded-full"
                :class="portfolioStore.totalPnL >= 0 ? 'text-primary bg-primary-container/20' : 'text-error bg-error-container/20'"
              >
                <span class="material-symbols-outlined text-[16px] font-bold">
                  {{ portfolioStore.totalPnL >= 0 ? 'trending_up' : 'trending_down' }}
                </span>
                {{ portfolioStore.totalPnLPercent >= 0 ? '+' : '' }}{{ portfolioStore.totalPnLPercent.toFixed(1) }}%
              </span>
            </div>
            
            <div class="text-display-lg font-display-lg text-on-background tracking-tighter">
              {{ formatIDR(portfolioStore.totalValue) }}
            </div>
            
            <div class="flex justify-between items-center text-xs text-on-surface-variant pt-2">
              <span>Modal: {{ formatIDR(portfolioStore.totalModal) }}</span>
              <span :class="portfolioStore.totalPnL >= 0 ? 'text-primary' : 'text-error'" class="font-bold">
                P&L: {{ portfolioStore.totalPnL >= 0 ? '+' : '' }}{{ formatIDR(portfolioStore.totalPnL) }}
              </span>
            </div>

            <!-- Sparkline Chart Visual (SVG) -->
            <div class="h-20 w-full mt-4 flex items-end">
              <svg viewBox="0 0 400 100" class="w-full h-full text-primary" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--color-primary, #006c49)" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="var(--color-primary, #006c49)" stop-opacity="0.0" />
                  </linearGradient>
                </defs>
                <!-- Area -->
                <path 
                  :d="sparklineAreaPath" 
                  fill="url(#sparklineGrad)" 
                  stroke="none"
                />
                <!-- Line -->
                <path 
                  :d="sparklineLinePath" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="3" 
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Asset Distribution -->
        <section class="space-y-3">
          <h2 class="text-headline-md font-headline-md text-on-surface">Distribusi Aset</h2>
          <div class="bg-surface-container-lowest p-card_padding rounded-xl border border-surface-container vibrant-card-shadow space-y-5">
            
            <!-- Saham -->
            <div class="space-y-2">
              <div class="flex justify-between text-label-md font-label-md">
                <span class="text-on-surface flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[18px] text-primary">work</span>
                  Saham & Reksadana
                </span>
                <span class="text-primary font-bold">{{ catPercent('saham') }}%</span>
              </div>
              <div class="h-3 bg-surface-container rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full transition-all duration-500" :style="{ width: catPercent('saham') + '%' }"></div>
              </div>
            </div>

            <!-- Emas -->
            <div class="space-y-2">
              <div class="flex justify-between text-label-md font-label-md">
                <span class="text-on-surface flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[18px] text-secondary">database</span>
                  Emas Fisik
                </span>
                <span class="text-secondary font-bold">{{ catPercent('emas') }}%</span>
              </div>
              <div class="h-3 bg-surface-container rounded-full overflow-hidden">
                <div class="h-full bg-secondary rounded-full transition-all duration-500" :style="{ width: catPercent('emas') + '%' }"></div>
              </div>
            </div>

            <!-- Kas & Deposito -->
            <div class="space-y-2">
              <div class="flex justify-between text-label-md font-label-md">
                <span class="text-on-surface flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[18px] text-tertiary">account_balance_wallet</span>
                  Kas, Deposito & Obligasi
                </span>
                <span class="text-tertiary font-bold">{{ cashObligasiPercent }}%</span>
              </div>
              <div class="h-3 bg-surface-container rounded-full overflow-hidden">
                <div class="h-full bg-tertiary rounded-full transition-all duration-500" :style="{ width: cashObligasiPercent + '%' }"></div>
              </div>
            </div>
            
          </div>
        </section>

        <!-- Recent Transactions -->
        <section class="space-y-3">
          <div class="flex justify-between items-center">
            <h2 class="text-headline-md font-headline-md text-on-surface">Aktivitas Terbaru</h2>
            <router-link to="/portfolio" class="text-label-md font-label-md text-primary font-bold hover:underline">Lihat Semua</router-link>
          </div>

          <div class="space-y-3" v-if="recentTransactions.length > 0">
            <div 
              v-for="tx in recentTransactions" 
              :key="tx.tx_id"
              class="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between border border-surface-container vibrant-card-shadow hover:bg-surface-container-low transition-all duration-150"
            >
              <div class="flex items-center gap-3">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="txIconBg(tx.tx_type)"
                >
                  <span class="material-symbols-outlined" :class="txIconColor(tx.tx_type)">
                    {{ txIconName(tx.tx_type) }}
                  </span>
                </div>
                <div>
                  <p class="text-label-md font-label-md text-on-surface font-bold">
                    {{ txTitle(tx) }}
                  </p>
                  <p class="text-label-sm font-label-sm text-on-surface-variant">
                    {{ formatDateShort(tx.tx_date) }} • {{ tx.quantity }} unit
                  </p>
                </div>
              </div>
              
              <span 
                class="text-label-md font-label-md font-bold"
                :class="txAmountColor(tx.tx_type)"
              >
                {{ txAmountPrefix(tx.tx_type) }}{{ formatIDR(tx.total_value) }}
              </span>
            </div>
          </div>

          <div class="p-6 bg-surface-container-lowest border border-surface-container rounded-xl text-center text-on-surface-variant" v-else>
            Tidak ada aktivitas transaksi baru.
          </div>
        </section>

      </div>

      <!-- RIGHT COLUMN: Chart, Hold list, Quick settings (5 cols on lg) -->
      <div class="lg:col-span-5 space-y-6">

        <!-- Asset Allocation Pie Chart -->
        <div class="p-card_padding bg-surface-container-lowest rounded-xl border border-surface-container vibrant-card-shadow flex flex-col justify-between">
          <div>
            <h3 class="text-headline-md font-headline-md text-on-surface">Alokasi Kepemilikan</h3>
            <p class="text-label-sm font-label-sm text-on-surface-variant">Distribusi nilai aset berdasarkan instrumen aktif</p>
          </div>
          
          <div class="my-6 flex justify-center max-h-52">
            <Pie :data="chartData" :options="chartOptions" />
          </div>
          
          <div class="space-y-2 border-t border-surface-container pt-4">
            <div 
              v-for="(item, index) in summaryInstruments.slice(0, 4)" 
              :key="item.instrument_id"
              class="flex items-center justify-between text-xs font-medium"
            >
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: chartColors[index % chartColors.length] }"></span>
                <span class="text-on-surface font-semibold">{{ item.code }}</span>
              </div>
              <span class="text-on-surface-variant font-bold">
                {{ ((item.current_value / portfolioStore.totalValue) * 100).toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Access links styled as Mockup Cards -->
        <div class="space-y-4">
          
          <!-- Tampilan Quick access -->
          <div class="rounded-xl overflow-hidden border border-surface-container vibrant-card-shadow">
            <div class="bg-secondary px-4 py-2.5 flex items-center justify-between">
              <span class="text-label-md font-label-md text-on-secondary font-bold">Preferensi & Tampilan</span>
              <span class="material-symbols-outlined text-on-secondary text-sm">settings_brightness</span>
            </div>
            <div class="bg-surface-container-lowest">
              <button 
                @click="$router.push('/settings')"
                class="w-full p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors duration-150 group text-left"
              >
                <div class="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center">
                  <span class="material-symbols-outlined text-secondary">dark_mode</span>
                </div>
                <div class="flex-1">
                  <p class="text-label-md font-label-md text-on-surface font-bold">Pengaturan Tampilan</p>
                  <p class="text-label-sm font-label-sm text-on-surface-variant">Ubah mode gelap, font, dan keamanan akun</p>
                </div>
                <span class="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </div>

          <!-- Data & Utilitas Quick access -->
          <div class="rounded-xl overflow-hidden border border-surface-container vibrant-card-shadow">
            <div class="bg-primary-container px-4 py-2.5 flex items-center justify-between">
              <span class="text-label-md font-label-md text-on-primary-container font-bold">Data & Laporan</span>
              <span class="material-symbols-outlined text-on-primary-container text-sm">database</span>
            </div>
            <div class="bg-surface-container-lowest divide-y divide-surface-container">
              
              <!-- Ekspor -->
              <button 
                @click="$router.push('/export')"
                class="w-full p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors duration-150 group text-left"
              >
                <div class="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
                  <span class="material-symbols-outlined text-primary">download</span>
                </div>
                <div class="flex-1">
                  <p class="text-label-md font-label-md text-on-surface font-bold">Ekspor Portofolio</p>
                  <p class="text-label-sm font-label-sm text-on-surface-variant">Download semua catatan dalam bentuk CSV</p>
                </div>
                <span class="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>

              <!-- Prices -->
              <button 
                @click="$router.push('/prices')"
                class="w-full p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors duration-150 group text-left"
              >
                <div class="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center">
                  <span class="material-symbols-outlined text-tertiary">trending_up</span>
                </div>
                <div class="flex-1">
                  <p class="text-label-md font-label-md text-on-surface font-bold">Harga Terkini Aset</p>
                  <p class="text-label-sm font-label-sm text-on-surface-variant">Pantau harga pasar live instrumen investasi</p>
                </div>
                <span class="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </div>
          
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Pie } from 'vue-chartjs';
import { useAuthStore } from '@/stores/authStore';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useUiStore } from '@/stores/uiStore';
import { formatIDR } from '@/utils/formatCurrency';

const authStore = useAuthStore();
const portfolioStore = usePortfolioStore();
const uiStore = useUiStore();

const isLoading = ref(false);

const firstName = computed(() => {
  if (!authStore.fullName) return 'Pengguna';
  return authStore.fullName.split(' ')[0];
});

// Urutkan instrumen berdasarkan nominal terbesar
const summaryInstruments = computed(() => {
  if (!portfolioStore.summary || !portfolioStore.summary.instruments) return [];
  return [...portfolioStore.summary.instruments].sort((a, b) => b.current_value - a.current_value);
});

// Ambil 3 transaksi terbaru
const recentTransactions = computed(() => {
  if (!portfolioStore.transactions) return [];
  return [...portfolioStore.transactions]
    .sort((a, b) => new Date(b.tx_date) - new Date(a.tx_date))
    .slice(0, 3);
});

// Hitung persentase per kategori
function catPercent(category) {
  if (!portfolioStore.summary || !portfolioStore.summary.by_category) return 0;
  const cat = portfolioStore.summary.by_category[category];
  if (!cat || !portfolioStore.totalValue) return 0;
  return Math.round((cat.current_value / portfolioStore.totalValue) * 100);
}

// Gabungkan Kas, Deposito & Obligasi untuk progress bar ke-3
const cashObligasiPercent = computed(() => {
  if (!portfolioStore.summary || !portfolioStore.summary.by_category) return 0;
  const depVal = portfolioStore.summary.by_category['deposito']?.current_value || 0;
  const obVal = portfolioStore.summary.by_category['obligasi']?.current_value || 0;
  if (!portfolioStore.totalValue) return 0;
  return Math.round(((depVal + obVal) / portfolioStore.totalValue) * 100);
});

// Sparkline SVG Path Generator (Dynamic curve based on transactions or dummy path if no transactions)
const sparklineLinePath = computed(() => {
  if (!portfolioStore.transactions || portfolioStore.transactions.length < 2) {
    // Fallback: gelombang stabil naik jika data kosong/kurang
    return "M 0 60 C 80 40, 120 70, 200 40 S 300 20, 400 30";
  }
  
  // Ambil data transaksi diurutkan ascending untuk kalkulasi tren
  const sorted = [...portfolioStore.transactions].sort((a, b) => new Date(a.tx_date) - new Date(b.tx_date));
  let runningSum = 0;
  const coordinates = [];
  
  sorted.forEach((tx) => {
    const factor = tx.tx_type === 'buy' ? 1 : -1;
    runningSum += tx.total_value * factor;
    coordinates.push(runningSum);
  });

  const min = Math.min(...coordinates);
  const max = Math.max(...coordinates);
  const range = max - min || 1;

  const points = coordinates.map((val, index) => {
    const x = (index / (coordinates.length - 1)) * 400;
    // balik sumbu y (0 di atas, 100 di bawah)
    const y = 90 - ((val - min) / range) * 70; // gap atas 20px, bawah 10px
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return `M ${points.join(' L ')}`;
});

const sparklineAreaPath = computed(() => {
  const linePath = sparklineLinePath.value;
  if (!linePath) return "";
  return `${linePath} L 400 100 L 0 100 Z`;
});

// Transaction helper classes & icons
function txIconBg(type) {
  switch (type) {
    case 'buy': return 'bg-error-container/40';
    case 'sell': return 'bg-primary-container/20';
    case 'dividend': return 'bg-secondary-container/20';
    case 'interest': return 'bg-tertiary-fixed/20';
    default: return 'bg-surface-container';
  }
}

function txIconColor(type) {
  switch (type) {
    case 'buy': return 'text-error';
    case 'sell': return 'text-primary';
    case 'dividend': return 'text-secondary';
    case 'interest': return 'text-tertiary';
    default: return 'text-on-surface-variant';
  }
}

function txIconName(type) {
  switch (type) {
    case 'buy': return 'shopping_cart';
    case 'sell': return 'monetization_on';
    case 'dividend': return 'payments';
    case 'interest': return 'account_balance';
    default: return 'help';
  }
}

function txTitle(tx) {
  const code = tx.instrument_code || 'Aset';
  switch (tx.tx_type) {
    case 'buy': return `Beli ${code}`;
    case 'sell': return `Jual ${code}`;
    case 'dividend': return `Dividen ${code}`;
    case 'interest': return `Bunga ${code}`;
    default: return `Transaksi ${code}`;
  }
}

function txAmountColor(type) {
  if (type === 'buy') return 'text-error';
  return 'text-primary';
}

function txAmountPrefix(type) {
  if (type === 'buy') return '- ';
  return '+ ';
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const options = { day: 'numeric', month: 'short' };
  return date.toLocaleDateString('id-ID', options);
}

// Pie Chart Config
const chartColors = ['#006c49', '#0058be', '#494bd6', '#10b981', '#fbbf24', '#f97316'];
const chartData = computed(() => {
  const instruments = summaryInstruments.value;
  return {
    labels: instruments.map(i => i.code),
    datasets: [{
      data: instruments.map(i => i.current_value),
      backgroundColor: chartColors.slice(0, instruments.length),
      borderWidth: 0,
      hoverOffset: 4
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const val = context.raw;
          return ` Nilai: ${formatIDR(val)}`;
        }
      }
    }
  }
};

async function handleRefresh() {
  isLoading.value = true;
  try {
    await portfolioStore.fetchSummary();
    await portfolioStore.fetchTransactions();
    uiStore.showToast('Data berhasil diperbarui', 'success');
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  if (!portfolioStore.summary || portfolioStore.transactions.length === 0) {
    await handleRefresh();
  }
});
</script>
