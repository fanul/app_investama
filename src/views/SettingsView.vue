<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
    <!-- Header Section -->
    <div>
      <h2 class="text-headline-lg font-headline-lg font-bold text-on-surface">Pengaturan Akun</h2>
      <p class="text-body-md font-body-md text-on-surface-variant mt-1">Ubah preferensi antarmuka dan kelola tingkat keamanan sandi Anda.</p>
    </div>

    <!-- Preferensi Tampilan (Theme Switcher) -->
    <div class="p-6 bg-surface-container-lowest rounded-xl border border-surface-container vibrant-card-shadow space-y-6">
      <div>
        <h3 class="text-headline-md font-headline-md font-bold text-on-surface">Preferensi Tampilan</h3>
        <p class="text-xs text-on-surface-variant">Atur skema warna antarmuka aplikasi sesuai kenyamanan mata Anda</p>
      </div>

      <div class="flex items-center justify-between p-4 bg-surface rounded-xl border border-surface-container">
        <div class="space-y-0.5">
          <span class="text-sm font-bold text-on-surface">Mode Gelap (Dark Mode)</span>
          <p class="text-xs text-on-surface-variant">Aktifkan tema gelap untuk kenyamanan mata di lingkungan kurang cahaya.</p>
        </div>
        
        <button 
          @click="toggleTheme"
          class="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-md transition-colors duration-150 active:scale-95 flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-[16px]">{{ theme === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
          <span>{{ theme === 'dark' ? 'Mode Terang' : 'Mode Gelap' }}</span>
        </button>
      </div>
    </div>

    <!-- Ganti Password -->
    <div class="p-6 bg-surface-container-lowest rounded-xl border border-surface-container vibrant-card-shadow space-y-6">
      <div>
        <h3 class="text-headline-md font-headline-md font-bold text-on-surface">Keamanan & Ubah Sandi</h3>
        <p class="text-xs text-on-surface-variant">Ubah kata sandi secara berkala untuk menjaga keamanan akun Anda</p>
      </div>

      <form @submit.prevent="handleChangePassword" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Kata Sandi Lama</label>
          <input 
            v-model="oldPassword" 
            type="password" 
            required
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-xl border border-surface-container bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm transition-all"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Kata Sandi Baru</label>
          <input 
            v-model="newPassword" 
            type="password" 
            required
            placeholder="Minimal 8 karakter"
            class="w-full px-4 py-3 rounded-xl border border-surface-container bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm transition-all"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Konfirmasi Kata Sandi Baru</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            required
            placeholder="Ketik ulang sandi baru"
            class="w-full px-4 py-3 rounded-xl border border-surface-container bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm transition-all"
          />
        </div>

        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 bg-primary hover:bg-primary/95 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-colors duration-150 active:scale-95 flex items-center justify-center gap-2 text-xs"
        >
          <span v-if="isLoading" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          <span>Perbarui Kata Sandi</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUiStore } from '@/stores/uiStore';
import { useApi } from '@/composables/useApi';
import { useTheme } from '@/composables/useTheme';

const uiStore = useUiStore();
const { api } = useApi();
const { theme, toggleTheme } = useTheme();

const isLoading = ref(false);
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

async function handleChangePassword() {
  if (newPassword.value.length < 8) {
    uiStore.showToast('Sandi baru minimal harus 8 karakter', 'error');
    return;
  }
  
  if (newPassword.value !== confirmPassword.value) {
    uiStore.showToast('Konfirmasi sandi baru tidak cocok', 'error');
    return;
  }
  
  isLoading.value = true;
  try {
    await api('auth.changePassword', {
      old_password: oldPassword.value,
      new_password: newPassword.value
    });
    uiStore.showToast('Kata sandi berhasil diperbarui!', 'success');
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}
</script>
