<template>
  <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-card dark:shadow-card-dark p-8 border border-gray-100 dark:border-gray-700/50 animate-fade-in">
    <div class="text-center mb-8">
      <span class="text-4xl">📈</span>
      <h2 class="text-2xl font-bold mt-4 text-gray-900 dark:text-white">Selamat Datang Kembali</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Masuk untuk memantau portofolio investasi Anda</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
        <input 
          v-model="email" 
          type="email" 
          required 
          placeholder="nama@email.com"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Kata Sandi</label>
          <router-link to="/forgot-password" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Lupa Password?</router-link>
        </div>
        <input 
          v-model="password" 
          type="password" 
          required 
          placeholder="••••••••"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
      </div>

      <button 
        type="submit" 
        :disabled="isLoading"
        class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span v-if="isLoading" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
        <span>{{ isLoading ? 'Memproses...' : 'Masuk' }}</span>
      </button>
    </form>

    <div class="mt-6 text-center text-sm">
      <span class="text-gray-500 dark:text-gray-400">Belum punya akun? </span>
      <router-link to="/register" class="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Daftar Sekarang</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);

async function handleSubmit() {
  isLoading.value = true;
  try {
    await authStore.login(email.value, password.value);
    uiStore.showToast('Login berhasil! Selamat datang.', 'success');
    router.push('/dashboard');
  } catch (err) {
    uiStore.showToast(err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}
</script>
