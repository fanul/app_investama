<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Transaksi Investasi</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola pencatatan transaksi pembelian dan penjualan aset keuangan Anda.</p>
      </div>
      <button 
        @click="openAddModal"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/10 transition-colors self-start sm:self-auto"
      >
        ➕ Tambah Transaksi
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="p-4 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-card flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="w-full md:w-1/3 relative">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari kode ticker..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
        />
        <span class="absolute left-3.5 top-3 text-gray-400">🔍</span>
      </div>

      <div class="flex w-full md:w-auto gap-2 overflow-x-auto no-scrollbar">
        <button 
          v-for="cat in categories" 
          :key="cat.value"
          @click="selectedCategory = cat.value"
          class="px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
          :class="selectedCategory === cat.value 
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-card animate-pulse-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-300 dark:bg-gray-600 w-24 rounded-full"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 w-36 rounded-full"></div>
          </div>
        </div>
        <div class="h-6 bg-gray-200 dark:bg-gray-700 w-20 rounded-full"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTxs.length === 0" class="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700/50 shadow-card flex flex-col items-center justify-center">
      <span class="text-5xl mb-4">📂</span>
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">Tidak Ada Transaksi</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
        {{ searchQuery || selectedCategory !== 'all' 
          ? 'Tidak ada transaksi yang cocok dengan filter saat ini.' 
          : 'Belum ada catatan transaksi. Klik tombol di atas untuk menambahkan.' }}
      </p>
    </div>

    <!-- Transaction List Grid -->
    <div v-else class="space-y-4">
      <div 
        v-for="tx in filteredTxs" 
        :key="tx.tx_id"
        class="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-card hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4">
          <div 
            class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
            :class="tx.tx_type === 'buy' 
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'"
          >
            {{ tx.tx_type === 'buy' ? 'B' : 'J' }}
          </div>
          
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-gray-900 dark:text-white text-base">{{ tx.instrument_code }}</span>
              <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                {{ tx.category }}
              </span>
            </div>
            <p class="text-[11px] text-gray-400 font-medium mt-1">
              {{ formatDate(tx.tx_date) }} • {{ tx.quantity }} {{ tx.unit }} @ {{ formatIDR(tx.price_per_unit) }}
            </p>
          </div>
        </div>

        <div class="flex sm:items-center justify-between sm:justify-end gap-6">
          <div class="sm:text-right">
            <p class="text-sm font-black text-gray-900 dark:text-white">
              {{ formatIDR(tx.total_value) }}
            </p>
            <p v-if="tx.fee > 0" class="text-[10px] text-gray-400 font-semibold mt-0.5">
              Fee: {{ formatIDR(tx.fee) }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button 
              @click="openEditModal(tx)"
              class="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors text-sm"
              title="Edit Transaksi"
            >
              ✏️
            </button>
            <button 
              @click="handleDelete(tx)"
              class="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors text-sm"
              title="Hapus Transaksi"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form (Tambah / Edit Transaksi) -->
    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div 
        class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700/50 space-y-6 animate-scale-up"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ isEditMode ? 'Ubah Catatan Transaksi' : 'Catat Transaksi Baru' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-extrabold text-lg">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Pilih Tipe Transaksi -->
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipe Transaksi</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                type="button" 
                @click="form.tx_type = 'buy'"
                class="py-2.5 font-bold rounded-xl text-sm transition-all border"
                :class="form.tx_type === 'buy' 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10' 
                  : 'bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100'"
              >
                Beli (Buy)
              </button>
              <button 
                type="button" 
                @click="form.tx_type = 'sell'"
                class="py-2.5 font-bold rounded-xl text-sm transition-all border"
                :class="form.tx_type === 'sell' 
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/10' 
                  : 'bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100'"
              >
                Jual (Sell)
              </button>
            </div>
          </div>

          <!-- Pilih Instrumen -->
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pilih Instrumen</label>
            <select 
              v-model="form.instrument_id" 
              required
              :disabled="isEditMode"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all disabled:opacity-50"
            >
              <option value="" disabled>Pilih ticker investasi...</option>
              <option 
                v-for="ins in instruments" 
                :key="ins.instrument_id" 
                :value="ins.instrument_id"
              >
                {{ ins.code }} — {{ ins.name }} ({{ ins.unit }})
              </option>
            </select>
          </div>

          <!-- Grid: Tanggal & Kuantitas -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tanggal</label>
              <input 
                v-model="form.tx_date" 
                type="date" 
                required
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Jumlah ({{ selectedInstrumentUnit }})
              </label>
              <input 
                v-model.number="form.quantity" 
                type="number" 
                step="any"
                min="0.00001"
                required
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <!-- Grid: Harga & Biaya -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Harga per Unit (IDR)</label>
              <input 
                v-model.number="form.price_per_unit" 
                type="number" 
                min="0.01"
                required
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Biaya Transaksi / Fee (IDR)</label>
              <input 
                v-model.number="form.fee" 
                type="number" 
                min="0"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <!-- Catatan -->
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Catatan Tambahan (Opsional)</label>
            <textarea 
              v-model="form.notes" 
              placeholder="Detail tambahan..."
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all h-20 resize-none"
            ></textarea>
          </div>

          <!-- Total Estimasi -->
          <div class="p-4 bg-gray-50 dark:bg-gray-950/30 border border-gray-200/50 dark:border-gray-800 rounded-2xl flex justify-between items-center text-sm font-semibold">
            <span class="text-gray-400">Total Transaksi:</span>
            <span class="text-base font-black text-gray-900 dark:text-white">
              {{ formatIDR((form.quantity || 0) * (form.price_per_unit || 0) + (form.fee || 0)) }}
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              @click="closeModal"
              class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all"
            >
              Batal
            </button>
            <button 
              type="submit"
              :disabled="isLoading"
              class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center gap-2"
            >
              <span v-if="isLoading" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { usePriceStore } from '@/stores/priceStore';
import { useUiStore } from '@/stores/uiStore';
import { useApi } from '@/composables/useApi';
import { formatIDR } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

const portfolioStore = usePortfolioStore();
const priceStore = usePriceStore();
const uiStore = useUiStore();
const { api } = useApi();

const isLoading = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('all');

const isModalOpen = ref(false);
const isEditMode = ref(false);
const instruments = ref([]);

const categories = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'saham', label: 'Saham IDX' },
  { value: 'emas', label: 'Emas LM' },
  { value: 'obligasi', label: 'Obligasi Negara' },
  { value: 'deposito', label: 'Deposito' }
];

const form = ref({
  tx_id: '',
  instrument_id: '',
  tx_type: 'buy',
  tx_date: new Date().toISOString().split('T')[0],
  quantity: 0,
  price_per_unit: 0,
  fee: 0,
  notes: ''
});

// Pilih Unit Ticker Aktif
const selectedInstrumentUnit = computed(() => {
  const matched = instruments.value.find(i => i.instrument_id === form.value.instrument_id);
  return matched ? matched.unit : 'Unit';
});

// Filter Transaksi
const filteredTxs = computed(() => {
  let list = portfolioStore.transactions || [];
  
  if (selectedCategory.value !== 'all') {
    list = list.filter(t => t.category === selectedCategory.value);
  }
  
  if (searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(t => t.instrument_code.toLowerCase().includes(q));
  }
  
  // Urutkan transaksi terbaru di atas
  return [...list].sort((a, b) => new Date(b.tx_date) - new Date(a.tx_date));
});

// Fetch data awal
async function loadData() {
  isLoading.value = true;
  try {
    await portfolioStore.fetchTransactions();
    // Ambil list instrument master untuk form dropdown
    const res = await api('instrument.list');
    instruments.value = res.data.filter(i => i.is_active);
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

// Handler Aksi Modal
function openAddModal() {
  form.value = {
    tx_id: '',
    instrument_id: '',
    tx_type: 'buy',
    tx_date: new Date().toISOString().split('T')[0],
    quantity: 1,
    price_per_unit: 0,
    fee: 0,
    notes: ''
  };
  isEditMode.value = false;
  isModalOpen.value = true;
}

function openEditModal(tx) {
  form.value = {
    tx_id: tx.tx_id,
    instrument_id: tx.instrument_id,
    tx_type: tx.tx_type,
    tx_date: tx.tx_date.split('T')[0],
    quantity: parseFloat(tx.quantity),
    price_per_unit: parseFloat(tx.price_per_unit),
    fee: parseFloat(tx.fee || 0),
    notes: tx.notes || ''
  };
  isEditMode.value = true;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

async function handleSubmit() {
  if (form.value.quantity <= 0 || form.value.price_per_unit <= 0) {
    uiStore.showToast('Jumlah dan harga harus bernilai positif', 'error');
    return;
  }
  
  isLoading.value = true;
  try {
    if (isEditMode.value) {
      await portfolioStore.editTransaction(form.value);
      uiStore.showToast('Transaksi berhasil diubah!', 'success');
    } else {
      await portfolioStore.addTransaction(form.value);
      uiStore.showToast('Transaksi berhasil ditambahkan!', 'success');
    }
    closeModal();
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

async function handleDelete(tx) {
  if (!confirm(`Apakah Anda yakin ingin menghapus catatan transaksi ${tx.instrument_code} senilai ${formatIDR(tx.total_value)}?`)) {
    return;
  }
  
  isLoading.value = true;
  try {
    await portfolioStore.deleteTransaction(tx.tx_id);
    uiStore.showToast('Transaksi berhasil dihapus!', 'success');
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style>
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
.animate-scale-up {
  animation: scaleUp 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}
</style>
