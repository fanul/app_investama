<template>
  <div class="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-card max-w-sm w-full animate-fade-in flex flex-col items-center justify-center">
    <span class="text-6xl mb-6">🔍</span>
    <h2 class="text-2xl font-black text-gray-900 dark:text-white">404 — Tidak Ditemukan</h2>
    <p class="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">
      Halaman yang Anda cari tidak ada atau telah dipindahkan ke alamat lain.
    </p>
    <router-link 
      to="/dashboard" 
      class="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
    >
      Kembali ke Beranda
    </router-link>
  </div>
</template>

<script setup>
</script>
