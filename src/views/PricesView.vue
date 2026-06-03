<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-headline-lg font-headline-lg font-bold text-on-surface">Harga Terkini Aset</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Pantau harga pasar live untuk seluruh instrumen investasi aktif.</p>
      </div>
      
      <div class="flex gap-2 self-start">
        <button 
          v-if="authStore.isAdmin"
          @click="$router.push('/admin?tab=instruments')"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container border border-surface-container-high hover:bg-surface-container-high text-primary font-bold rounded-xl transition-colors duration-150 active:scale-95 text-xs"
        >
          <span class="material-symbols-outlined text-[16px]">edit_note</span>
          <span>Kelola Instrumen</span>
        </button>

        <button 
          @click="handleRefreshAll" 
          :disabled="isLoading"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-lg transition-colors duration-150 active:scale-95 disabled:opacity-50 text-xs"
        >
          <span v-if="isLoading" class="animate-spin inline-block w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full"></span>
          <span class="material-symbols-outlined text-[16px]" v-else>sync</span>
          <span>Muat Ulang Semua</span>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton State -->
    <div v-if="isLoading && !priceStore.prices" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="p-6 bg-surface-container-lowest rounded-xl border border-surface-container shadow-card animate-pulse-soft space-y-4">
        <div class="h-4 bg-surface-container w-1/4 rounded-full"></div>
        <div class="h-8 bg-surface-container w-1/2 rounded-full"></div>
        <div class="h-4 bg-surface-container w-2/3 rounded-full"></div>
      </div>
    </div>

    <!-- Prices Layout -->
    <div v-else-if="priceStore.prices" class="space-y-6">
      
      <!-- Section 1: Emas Mulia -->
      <div 
        v-if="priceStore.prices.emas && priceStore.prices.emas.instrument_id"
        class="p-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl border border-amber-400/20 shadow-lg text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-[28px] text-amber-100" style="font-variation-settings: 'FILL' 1;">database</span>
          </div>
          <div>
            <span class="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-1">🪙 Logam Mulia</span>
            <h3 class="text-headline-md font-headline-md font-bold">{{ priceStore.prices.emas.name }}</h3>
            <p class="text-[10px] text-amber-100 mt-0.5">Terakhir diperbarui: {{ formatDate(priceStore.prices.emas.last_price_updated, true) }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-white/10 md:border-0 pt-4 md:pt-0">
          <div class="text-left md:text-right">
            <p class="text-xs font-semibold text-amber-100 uppercase tracking-wider">Harga per Gram (IDR)</p>
            <p class="text-display-lg font-display-lg font-black tracking-tight mt-0.5">{{ formatIDR(priceStore.prices.emas.current_price) }}</p>
          </div>
          <button 
            @click="handleSingleRefresh(priceStore.prices.emas.instrument_id)"
            class="p-3 bg-white/15 hover:bg-white/25 rounded-xl transition-all duration-150 active:scale-90"
            title="Refresh Emas"
          >
            <span class="material-symbols-outlined">sync</span>
          </button>
        </div>
      </div>

      <!-- Section 2: Saham IDX -->
      <div class="space-y-3" v-if="priceStore.prices.saham && priceStore.prices.saham.length > 0">
        <h3 class="text-headline-md font-headline-md font-bold text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[24px]">work</span>
          <span>Saham Indonesia (IDX)</span>
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="saham in priceStore.prices.saham" 
            :key="saham.instrument_id"
            class="p-5 bg-surface-container-lowest rounded-xl border border-surface-container vibrant-card-shadow hover:bg-surface-container-low transition-all duration-150 flex flex-col justify-between"
          >
            <div>
              <div class="flex justify-between items-start">
                <span class="text-headline-md font-headline-md font-black text-on-surface tracking-tight">{{ saham.code }}</span>
                <button 
                  @click="handleSingleRefresh(saham.instrument_id)"
                  class="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container transition-colors duration-150"
                  title="Update Harga"
                >
                  <span class="material-symbols-outlined text-md">sync</span>
                </button>
              </div>
              <h4 class="text-label-sm font-label-sm text-on-surface-variant mt-0.5 leading-tight">{{ saham.name }}</h4>
            </div>

            <div class="mt-6 flex justify-between items-end border-t border-surface-container pt-4">
              <div>
                <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Harga Pasar (Lot)</p>
                <p class="text-headline-md font-headline-md font-extrabold text-on-surface mt-0.5">{{ formatIDR(saham.current_price) }}</p>
              </div>
              <span class="text-[10px] text-on-surface-variant font-semibold">
                {{ formatDate(saham.last_price_updated) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Obligasi & Deposito -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Obligasi -->
        <div 
          v-if="priceStore.prices.obligasi && priceStore.prices.obligasi.length > 0"
          class="p-6 bg-surface-container-lowest rounded-xl border border-surface-container vibrant-card-shadow space-y-4"
        >
          <h3 class="text-headline-md font-headline-md font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary">database</span>
            <span>Obligasi Negara (Yield)</span>
          </h3>
          
          <div class="divide-y divide-surface-container">
            <div 
              v-for="ob in priceStore.prices.obligasi" 
              :key="ob.instrument_id"
              class="py-3 flex items-center justify-between text-xs hover:bg-surface-container-low/40 px-2 rounded-lg transition-colors"
            >
              <div>
                <p class="font-bold text-on-surface text-sm">{{ ob.code }}</p>
                <p class="text-on-surface-variant text-[11px] leading-tight">{{ ob.name }}</p>
              </div>
              <div class="text-right flex items-center gap-3">
                <div>
                  <p class="font-extrabold text-on-surface text-sm">{{ formatIDR(ob.current_price) }}</p>
                  <p class="text-[9px] text-on-surface-variant">Sumber: {{ ob.price_source }}</p>
                </div>
                <button 
                  @click="handleSingleRefresh(ob.instrument_id)"
                  class="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span class="material-symbols-outlined text-[18px]">sync</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Deposito -->
        <div 
          v-if="priceStore.prices.deposito && priceStore.prices.deposito.length > 0"
          class="p-6 bg-surface-container-lowest rounded-xl border border-surface-container vibrant-card-shadow space-y-4"
        >
          <h3 class="text-headline-md font-headline-md font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-tertiary">account_balance</span>
            <span>Deposito Bank</span>
          </h3>
          
          <div class="divide-y divide-surface-container">
            <div 
              v-for="dep in priceStore.prices.deposito" 
              :key="dep.instrument_id"
              class="py-3 flex items-center justify-between text-xs hover:bg-surface-container-low/40 px-2 rounded-lg transition-colors"
            >
              <div>
                <p class="font-bold text-on-surface text-sm">{{ dep.code }}</p>
                <p class="text-on-surface-variant text-[11px] leading-tight">{{ dep.name }}</p>
              </div>
              <div class="text-right flex items-center gap-3">
                <div>
                  <p class="font-extrabold text-on-surface text-sm">{{ formatIDR(dep.current_price) }}</p>
                  <p class="text-[9px] text-on-surface-variant">Sumber: {{ dep.price_source }}</p>
                </div>
                <button 
                  @click="handleSingleRefresh(dep.instrument_id)"
                  class="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span class="material-symbols-outlined text-[18px]">sync</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Empty State -->
    <div class="p-12 text-center bg-surface-container-lowest border border-surface-container rounded-xl vibrant-card-shadow" v-else>
      <span class="material-symbols-outlined text-5xl text-on-surface-variant">info</span>
      <p class="text-body-md text-on-surface-variant mt-2">Tidak ada data instrumen harga yang aktif.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePriceStore } from '@/stores/priceStore';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { formatIDR } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

const priceStore = usePriceStore();
const uiStore = useUiStore();
const authStore = useAuthStore();

const isLoading = ref(false);

async function handleRefreshAll() {
  isLoading.value = true;
  try {
    await priceStore.fetchPrices();
    uiStore.showToast('Seluruh harga berhasil disinkronkan', 'success');
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

async function handleSingleRefresh(instrument_id) {
  try {
    const data = await priceStore.refreshPrice(instrument_id);
    uiStore.showToast(`Harga diperbarui: ${formatIDR(data.price)}`, 'success');
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  }
}

onMounted(() => {
  if (!priceStore.prices) {
    handleRefreshAll();
  }
});
</script>
