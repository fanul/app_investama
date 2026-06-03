<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-headline-lg font-headline-lg font-bold text-on-surface">Panel Pengelola (Admin Panel)</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Kelola data pengguna, instrumen investasi, konfigurasi sistem, dan logs audit.</p>
      </div>
      
      <button 
        @click="handleBackup" 
        :disabled="isLoading"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-lg transition-colors duration-150 active:scale-95 disabled:opacity-50 self-start text-xs"
      >
        <span class="material-symbols-outlined text-[16px]">database</span>
        <span>Backup Database</span>
      </button>
    </div>

    <!-- Tab Sub Navigasi Panel -->
    <div class="flex border-b border-surface-container overflow-x-auto no-scrollbar gap-2">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        @click="activeTab = tab.value"
        class="px-5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-colors duration-150 flex items-center gap-2"
        :class="activeTab === tab.value 
          ? 'border-primary text-primary dark:text-primary-fixed-dim' 
          : 'border-transparent text-on-surface-variant hover:text-on-surface'"
      >
        <span class="material-symbols-outlined text-sm">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- TAB CONTENT 1: USER MANAGEMENT -->
    <div v-if="activeTab === 'users'" class="p-6 bg-surface-container-lowest rounded-xl border border-surface-container vibrant-card-shadow space-y-6">
      <div class="flex justify-between items-center">
        <h3 class="text-headline-md font-headline-md font-bold text-on-surface">Kelola Pengguna</h3>
        <span class="text-label-sm font-label-sm text-on-surface-variant">Total: {{ users.length }}</span>
      </div>

      <div class="overflow-x-auto border border-surface-container rounded-xl">
        <table class="w-full border-collapse text-left text-xs text-on-surface-variant">
          <thead class="bg-surface-container text-on-surface font-bold">
            <tr>
              <th class="px-4 py-3">Nama</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Peran</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Login Terakhir</th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container">
            <tr v-for="u in users" :key="u.user_id" class="hover:bg-surface-container-low transition-colors duration-150">
              <td class="px-4 py-3 font-bold text-on-surface">{{ u.name }}</td>
              <td class="px-4 py-3 font-semibold">{{ u.email }}</td>
              <td class="px-4 py-3 capitalize">
                <span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold text-[10px]">
                  {{ u.role }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span 
                  class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  :class="u.status === 'active' 
                    ? 'bg-primary-container/20 text-primary' 
                    : 'bg-error-container text-error'"
                >
                  {{ u.status }}
                </span>
              </td>
              <td class="px-4 py-3">{{ formatDate(u.last_login, true) }}</td>
              <td class="px-4 py-3 text-right space-x-2">
                <button 
                  @click="toggleUserStatus(u)"
                  class="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors duration-150"
                  :class="u.status === 'active' 
                    ? 'border-error/30 hover:bg-error-container/20 text-error' 
                    : 'border-primary/30 hover:bg-primary-container/20 text-primary'"
                >
                  {{ u.status === 'active' ? 'Suspend' : 'Aktifkan' }}
                </button>
                <button 
                  @click="handleResetPassword(u)"
                  class="px-2.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-[10px] font-bold transition-colors duration-150"
                >
                  Reset Sandi
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Generated Temporary Password Card -->
      <div v-if="tempPasswordCard" class="p-4 bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-container rounded-xl space-y-2">
        <h4 class="text-sm font-bold flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">key</span>
          <span>Kata Sandi Sementara Dibuat!</span>
        </h4>
        <p class="text-xs">Salin sandi sementara di bawah ini dan berikan kepada pengguna <strong>{{ tempPasswordCard.name }}</strong>:</p>
        <div class="flex items-center gap-4 bg-surface-container-lowest border border-surface-container p-3 rounded-lg max-w-sm">
          <code class="text-sm font-bold text-error flex-1">{{ tempPasswordCard.password }}</code>
          <button @click="closeTempPasswordCard" class="text-xs text-on-surface-variant hover:text-on-surface font-bold">Tutup</button>
        </div>
      </div>
    </div>

    <!-- TAB CONTENT 2: INSTRUMENT & PRICE FEED MANAGEMENT -->
    <div v-if="activeTab === 'instruments'" class="space-y-6">
      <div class="p-6 bg-surface-container-lowest rounded-xl border border-surface-container vibrant-card-shadow space-y-6">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 class="text-headline-md font-headline-md font-bold text-on-surface">Manajemen Instrumen Investasi</h3>
            <p class="text-xs text-on-surface-variant">Tambahkan ticker baru atau konfigurasi parameter harga untuk feed harga terkini.</p>
          </div>
          
          <button 
            @click="openAddInstrumentModal"
            class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-md transition-colors text-xs active:scale-95 self-start"
          >
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Tambah Ticker</span>
          </button>
        </div>

        <!-- Filter & Tampilan Bar -->
        <div class="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-surface-container">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-on-surface-variant">Filter Kategori:</span>
            <select 
              v-model="instrumentFilter" 
              class="px-3 py-1.5 rounded-lg border border-surface-container-high bg-surface-container-lowest text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              <option value="saham">Saham</option>
              <option value="emas">Emas</option>
              <option value="obligasi">Obligasi</option>
              <option value="deposito">Deposito</option>
            </select>
          </div>

          <!-- Quick Display Limit Config -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-on-surface-variant">Batas Feed Tampilan:</span>
            <div class="flex items-center gap-2">
              <input 
                v-model.number="limitConfigVal" 
                type="number"
                min="0"
                placeholder="0 = Tanpa batas"
                class="w-20 px-2 py-1.5 rounded-lg border border-surface-container-high bg-surface-container-lowest text-xs text-center focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <button 
                @click="saveLimitConfig" 
                class="px-3 py-1.5 bg-secondary text-white text-[11px] font-bold rounded-lg hover:bg-secondary/95 transition-colors"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        <!-- Table Instruments -->
        <div class="overflow-x-auto border border-surface-container rounded-xl">
          <table class="w-full border-collapse text-left text-xs text-on-surface-variant">
            <thead class="bg-surface-container text-on-surface font-bold">
              <tr>
                <th class="px-4 py-3">Kode Ticker</th>
                <th class="px-4 py-3">Nama Instrumen</th>
                <th class="px-4 py-3">Kategori</th>
                <th class="px-4 py-3">Sumber Harga</th>
                <th class="px-4 py-3 text-right">Harga Terakhir</th>
                <th class="px-4 py-3">Pembaruan Terakhir</th>
                <th class="px-4 py-3 text-center">Status</th>
                <th class="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container">
              <tr 
                v-for="ins in filteredInstruments" 
                :key="ins.instrument_id" 
                class="hover:bg-surface-container-low transition-colors duration-150"
              >
                <td class="px-4 py-3 font-bold text-on-surface text-sm uppercase">{{ ins.code }}</td>
                <td class="px-4 py-3 font-semibold">{{ ins.name }}</td>
                <td class="px-4 py-3 capitalize">
                  <span 
                    class="px-2 py-0.5 rounded-full font-bold text-[10px]"
                    :class="catBadgeClass(ins.category)"
                  >
                    {{ ins.category }}
                  </span>
                </td>
                <td class="px-4 py-3 uppercase font-mono text-[10px]">{{ ins.price_source }}</td>
                <td class="px-4 py-3 text-right font-bold text-on-surface">{{ formatIDR(ins.last_price) }}</td>
                <td class="px-4 py-3">{{ formatDate(ins.last_price_updated, true) }}</td>
                <td class="px-4 py-3 text-center">
                  <button 
                    @click="toggleInstrumentActive(ins)"
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors duration-150 uppercase"
                    :class="ins.is_active 
                      ? 'bg-primary-container/20 text-primary border-primary/20' 
                      : 'bg-surface-container text-on-surface-variant border-surface-container-high'"
                  >
                    {{ ins.is_active ? 'Aktif' : 'Nonaktif' }}
                  </button>
                </td>
                <td class="px-4 py-3 text-right space-x-2">
                  <button 
                    @click="openEditInstrumentModal(ins)"
                    class="p-1 hover:bg-surface-container text-primary rounded-lg transition-colors"
                    title="Edit Properties"
                  >
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button 
                    @click="triggerManualSync(ins)"
                    class="p-1 hover:bg-surface-container text-secondary rounded-lg transition-colors"
                    title="Paksa Sinkronisasi"
                  >
                    <span class="material-symbols-outlined text-[18px]">sync</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB CONTENT 3: SYSTEM CONFIG -->
    <div v-if="activeTab === 'config'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Variabel Global Konfigurasi -->
      <div class="p-6 bg-surface-container-lowest rounded-xl border border-surface-container vibrant-card-shadow space-y-6">
        <div>
          <h3 class="text-headline-md font-headline-md font-bold text-on-surface">Variabel Konfigurasi Sistem</h3>
          <p class="text-xs text-on-surface-variant">Edit value global untuk variabel operasional aplikasi</p>
        </div>

        <form @submit.prevent="handleSaveConfig" class="space-y-4">
          <div v-for="cfg in configs" :key="cfg.config_key" class="space-y-1.5">
            <label class="block text-xs font-bold text-on-surface uppercase tracking-wider">{{ cfg.config_key }}</label>
            <p class="text-[10px] text-on-surface-variant">{{ cfg.description }}</p>
            <input 
              v-model="cfg.config_value"
              type="text"
              class="w-full px-4 py-2.5 rounded-xl border border-surface-container bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm transition-all font-semibold"
            />
          </div>

          <button 
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 bg-primary hover:bg-primary/95 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <span>Simpan Seluruh Konfigurasi</span>
          </button>
        </form>
      </div>

      <!-- Update Harga Manual (Manual Price Suite) -->
      <div class="p-6 bg-surface-container-lowest rounded-xl border border-surface-container vibrant-card-shadow space-y-6 self-start">
        <div>
          <h3 class="text-headline-md font-headline-md font-bold text-on-surface">Penyelarasan Harga Manual</h3>
          <p class="text-xs text-on-surface-variant">Perbarui harga secara paksa untuk Obligasi, Deposito, atau Emas (fallback)</p>
        </div>

        <form @submit.prevent="handleUpdatePrice" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Pilih Ticker</label>
            <select 
              v-model="manualPriceForm.instrument_id"
              required
              class="w-full px-4 py-3 rounded-xl border border-surface-container bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm transition-all"
            >
              <option value="" disabled>Pilih ticker...</option>
              <option 
                v-for="ins in activeInstruments" 
                :key="ins.instrument_id" 
                :value="ins.instrument_id"
              >
                {{ ins.code }} — {{ ins.name }} ({{ ins.category }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Nilai Harga Baru (IDR)</label>
            <input 
              v-model.number="manualPriceForm.price"
              type="number"
              min="0"
              step="any"
              required
              class="w-full px-4 py-3 rounded-xl border border-surface-container bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm transition-all font-semibold"
            />
          </div>

          <button 
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 bg-primary hover:bg-primary/95 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <span>Perbarui Harga Instrumen</span>
          </button>
        </form>
      </div>
    </div>

    <!-- TAB CONTENT 4: AUDIT LOGS -->
    <div v-if="activeTab === 'logs'" class="p-6 bg-surface-container-lowest rounded-xl border border-surface-container vibrant-card-shadow space-y-6">
      <div class="flex justify-between items-center">
        <h3 class="text-headline-md font-headline-md font-bold text-on-surface">Audit Log Sistem</h3>
        <button 
          @click="loadLogs"
          class="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl font-bold text-xs transition-colors duration-150"
        >
          Refresh Log
        </button>
      </div>

      <div class="overflow-x-auto border border-surface-container rounded-xl">
        <table class="w-full border-collapse text-left text-xs text-on-surface-variant">
          <thead class="bg-surface-container text-on-surface font-bold">
            <tr>
              <th class="px-4 py-3">ID Log</th>
              <th class="px-4 py-3">Waktu</th>
              <th class="px-4 py-3">User ID</th>
              <th class="px-4 py-3">Aksi</th>
              <th class="px-4 py-3">Target ID</th>
              <th class="px-4 py-3">Detail Parameter</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container font-mono text-[10px]">
            <tr v-for="l in logs" :key="l.log_id" class="hover:bg-surface-container-low transition-colors duration-150">
              <td class="px-4 py-3 text-on-surface-variant">{{ l.log_id.substring(0, 10) }}...</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(l.created_at, true) }}</td>
              <td class="px-4 py-3 text-primary">{{ l.user_id }}</td>
              <td class="px-4 py-3 uppercase font-bold text-on-surface">{{ l.action }}</td>
              <td class="px-4 py-3">{{ l.target_id }}</td>
              <td class="px-4 py-3 truncate max-w-xs" :title="l.details">{{ l.details }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL POPUP FOR ADDING/EDITING INSTRUMENT -->
    <div 
      v-if="showInstrumentModal"
      class="fixed inset-0 bg-on-background/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <div 
        class="bg-surface-container-lowest border border-surface-container p-6 rounded-xl w-full max-w-md vibrant-card-shadow space-y-4"
      >
        <div class="flex justify-between items-center border-b border-surface-container pb-3">
          <h3 class="text-headline-md font-headline-md font-bold text-on-surface">
            {{ isEditingInstrument ? 'Edit Instrumen' : 'Tambah Instrumen Baru' }}
          </h3>
          <button 
            @click="closeInstrumentModal"
            class="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="saveInstrument" class="space-y-4 text-xs">
          <!-- Code / Ticker -->
          <div>
            <label class="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Kode Ticker</label>
            <input 
              v-model="instrumentForm.code"
              type="text"
              required
              placeholder="Contoh: BBCA, ANTAM"
              :disabled="isEditingInstrument"
              class="w-full px-3 py-2 rounded-lg border border-surface-container bg-surface focus:ring-1 focus:ring-primary focus:outline-none font-bold uppercase disabled:opacity-50"
            />
          </div>

          <!-- Name -->
          <div>
            <label class="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Nama Instrumen</label>
            <input 
              v-model="instrumentForm.name"
              type="text"
              required
              placeholder="Contoh: Bank Central Asia Tbk"
              class="w-full px-3 py-2 rounded-lg border border-surface-container bg-surface focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <!-- Category & Exchange -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Kategori</label>
              <select 
                v-model="instrumentForm.category"
                required
                class="w-full px-3 py-2 rounded-lg border border-surface-container bg-surface focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="saham">Saham</option>
                <option value="emas">Emas</option>
                <option value="obligasi">Obligasi</option>
                <option value="deposito">Deposito</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Bursa / Pasar</label>
              <input 
                v-model="instrumentForm.exchange"
                type="text"
                placeholder="IDX, N/A"
                class="w-full px-3 py-2 rounded-lg border border-surface-container bg-surface focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <!-- Currency & Unit -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Mata Uang</label>
              <input 
                v-model="instrumentForm.currency"
                type="text"
                required
                placeholder="IDR, USD"
                class="w-full px-3 py-2 rounded-lg border border-surface-container bg-surface focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Satuan Unit</label>
              <input 
                v-model="instrumentForm.unit"
                type="text"
                required
                placeholder="lot, gram, unit"
                class="w-full px-3 py-2 rounded-lg border border-surface-container bg-surface focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <!-- Price Source & Last Price -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Sumber Harga</label>
              <select 
                v-model="instrumentForm.price_source"
                required
                class="w-full px-3 py-2 rounded-lg border border-surface-container bg-surface focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="api_yahoo">Yahoo Finance API</option>
                <option value="api_gold">Gold API</option>
                <option value="manual">Manual Update</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Harga Awal / Terakhir</label>
              <input 
                v-model.number="instrumentForm.last_price"
                type="number"
                min="0"
                step="any"
                required
                class="w-full px-3 py-2 rounded-lg border border-surface-container bg-surface focus:ring-1 focus:ring-primary focus:outline-none font-semibold"
              />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-surface-container">
            <button 
              type="button"
              @click="closeInstrumentModal"
              class="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl font-bold"
            >
              Batal
            </button>
            <button 
              type="submit"
              :disabled="isLoading"
              class="px-5 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              Simpan Ticker
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '@/stores/uiStore';
import { useApi } from '@/composables/useApi';
import { formatIDR } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

const uiStore = useUiStore();
const route = useRoute();
const { api } = useApi();

const isLoading = ref(false);
const activeTab = ref('users');

const tabs = [
  { value: 'users', label: 'Kelola Pengguna', icon: 'group' },
  { value: 'instruments', label: 'Manajemen Instrumen', icon: 'edit_note' },
  { value: 'config', label: 'Konfigurasi & Harga', icon: 'settings' },
  { value: 'logs', label: 'Log Aktivitas', icon: 'history' }
];

const users = ref([]);
const configs = ref([]);
const activeInstruments = ref([]);
const logs = ref([]);
const tempPasswordCard = ref(null);

const manualPriceForm = ref({
  instrument_id: '',
  price: 0
});

// Instrument Management state
const instrumentFilter = ref('all');
const limitConfigVal = ref(0);
const showInstrumentModal = ref(false);
const isEditingInstrument = ref(false);
const instrumentForm = ref({
  instrument_id: '',
  code: '',
  name: '',
  category: 'saham',
  exchange: 'IDX',
  currency: 'IDR',
  unit: 'lot',
  price_source: 'api_yahoo',
  last_price: 0
});

// Computed list of filtered instruments
const filteredInstruments = computed(() => {
  if (instrumentFilter.value === 'all') return activeInstruments.value;
  return activeInstruments.value.filter(ins => ins.category === instrumentFilter.value);
});

async function loadUsers() {
  isLoading.value = true;
  try {
    const res = await api('admin.users.list');
    users.value = res.data;
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

async function loadConfigs() {
  isLoading.value = true;
  try {
    const res = await api('admin.config.get');
    configs.value = res.data;
    
    // Tarik limits config
    const limitConfig = configs.value.find(c => c.config_key === 'MAX_PRICES_DISPLAYED');
    if (limitConfig) {
      limitConfigVal.value = parseInt(limitConfig.config_value) || 0;
    } else {
      // Masukkan limit default secara virtual agar tampil di list
      configs.value.push({
        config_key: 'MAX_PRICES_DISPLAYED',
        config_value: '0',
        description: 'Batas maksimum instrumen per kategori yang ditampilkan di feed Harga Terkini (0 = semua)',
        updated_at: new Date().toISOString(),
        updated_by: 'system'
      });
      limitConfigVal.value = 0;
    }
    
    // Tarik list instrumen
    const insRes = await api('instrument.list');
    activeInstruments.value = insRes.data;
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

async function loadLogs() {
  isLoading.value = true;
  try {
    const res = await api('admin.logs.list', { limit: 100, offset: 0 });
    logs.value = res.data;
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

async function toggleUserStatus(user) {
  const nextStatus = user.status === 'active' ? 'suspended' : 'active';
  if (!confirm(`Ubah status akun ${user.name} menjadi ${nextStatus.toUpperCase()}?`)) {
    return;
  }
  
  isLoading.value = true;
  try {
    await api('admin.users.updateStatus', {
      user_id: user.user_id,
      status: nextStatus
    });
    uiStore.showToast(`Status akun ${user.name} berhasil diubah!`, 'success');
    await loadUsers();
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

async function handleResetPassword(user) {
  if (!confirm(`RESET PASSWORD untuk user ${user.name}? Tindakan ini akan meng-generate password acak baru.`)) {
    return;
  }
  
  isLoading.value = true;
  try {
    const res = await api('admin.users.resetPassword', { user_id: user.user_id });
    tempPasswordCard.value = {
      name: user.name,
      password: res.data.temp_password
    };
    uiStore.showToast('Kata sandi berhasil di-reset!', 'success');
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

function closeTempPasswordCard() {
  tempPasswordCard.value = null;
}

// Config actions
async function handleSaveConfig() {
  isLoading.value = true;
  try {
    for (const cfg of configs.value) {
      await api('admin.config.set', {
        key: cfg.config_key,
        value: cfg.config_value
      });
    }
    uiStore.showToast('Konfigurasi sistem berhasil disimpan!', 'success');
    await loadConfigs();
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

// Save limit configuration independently from sidebar input
async function saveLimitConfig() {
  if (limitConfigVal.value < 0) {
    uiStore.showToast('Batas limit harus bernilai positif', 'error');
    return;
  }
  isLoading.value = true;
  try {
    await api('admin.config.set', {
      key: 'MAX_PRICES_DISPLAYED',
      value: String(limitConfigVal.value)
    });
    uiStore.showToast('Batas Tampilan Feed berhasil diperbarui!', 'success');
    await loadConfigs();
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

// Manual Price Updates
async function handleUpdatePrice() {
  if (manualPriceForm.value.price < 0) {
    uiStore.showToast('Harga harus bernilai positif', 'error');
    return;
  }
  
  isLoading.value = true;
  try {
    await api('price.manualUpdate', {
      instrument_id: manualPriceForm.value.instrument_id,
      price: manualPriceForm.value.price
    });
    uiStore.showToast('Harga instrumen berhasil diupdate!', 'success');
    manualPriceForm.value = { instrument_id: '', price: 0 };
    await loadConfigs();
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

// Single Instrument Manual sync/refresh
async function triggerManualSync(ins) {
  isLoading.value = true;
  try {
    const res = await api('price.refresh', { instrument_id: ins.instrument_id });
    uiStore.showToast(`Sinkronisasi ${ins.code} berhasil! Harga baru: ${formatIDR(res.data.price)}`, 'success');
    await loadConfigs();
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

// Instrument Active/Inactive Toggle
async function toggleInstrumentActive(ins) {
  isLoading.value = true;
  try {
    await api('instrument.edit', {
      instrument_id: ins.instrument_id,
      is_active: !ins.is_active
    });
    uiStore.showToast(`Status instrumen ${ins.code} diubah!`, 'success');
    await loadConfigs();
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

// Instrument Modals Triggering
function openAddInstrumentModal() {
  isEditingInstrument.value = false;
  instrumentForm.value = {
    instrument_id: '',
    code: '',
    name: '',
    category: 'saham',
    exchange: 'IDX',
    currency: 'IDR',
    unit: 'lot',
    price_source: 'api_yahoo',
    last_price: 0
  };
  showInstrumentModal.value = true;
}

function openEditInstrumentModal(ins) {
  isEditingInstrument.value = true;
  instrumentForm.value = {
    instrument_id: ins.instrument_id,
    code: ins.code,
    name: ins.name,
    category: ins.category,
    exchange: ins.exchange || 'N/A',
    currency: ins.currency || 'IDR',
    unit: ins.unit || 'lot',
    price_source: ins.price_source,
    last_price: ins.last_price
  };
  showInstrumentModal.value = true;
}

function closeInstrumentModal() {
  showInstrumentModal.value = false;
}

async function saveInstrument() {
  isLoading.value = true;
  try {
    if (isEditingInstrument.value) {
      // Edit mode
      await api('instrument.edit', instrumentForm.value);
      uiStore.showToast(`Berhasil menyimpan perubahan instrumen ${instrumentForm.value.code}`, 'success');
    } else {
      // Add mode
      await api('instrument.add', instrumentForm.value);
      uiStore.showToast(`Berhasil mendaftarkan instrumen baru: ${instrumentForm.value.code}`, 'success');
    }
    showInstrumentModal.value = false;
    await loadConfigs();
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

async function handleBackup() {
  isLoading.value = true;
  try {
    const res = await api('admin.backup');
    uiStore.showToast('Spreadsheet berhasil dibackup ke Google Drive!', 'success');
    window.open(res.data.backup_url, '_blank');
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

// Category Badge styles
function catBadgeClass(cat) {
  switch (cat) {
    case 'saham': return 'bg-primary-container/20 text-primary';
    case 'emas': return 'bg-secondary-fixed text-secondary';
    case 'obligasi': return 'bg-tertiary-fixed text-tertiary';
    case 'deposito': return 'bg-surface-container-high text-on-surface-variant';
    default: return 'bg-surface text-on-surface-variant';
  }
}

onMounted(() => {
  // Atur tab aktif dari query parameter jika ada
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  }
  loadUsers();
  loadConfigs();
  loadLogs();
});
</script>
