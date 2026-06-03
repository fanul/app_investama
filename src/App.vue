<template>
  <div :class="{ 'dark': theme === 'dark' }">
    <div class="min-h-screen bg-surface dark:bg-on-background text-on-surface dark:text-inverse-on-surface font-sans transition-colors duration-200 pb-20 lg:pb-0">
      
      <!-- Toast Container -->
      <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <transition-group name="toast">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="p-4 rounded-xl shadow-lg text-white pointer-events-auto flex items-center justify-between border animate-fade-in"
            :class="{
              'bg-primary border-primary-container': toast.type === 'success',
              'bg-error border-error-container': toast.type === 'error',
              'bg-tertiary border-tertiary-container': toast.type === 'warning',
              'bg-secondary border-secondary-container': toast.type === 'info'
            }"
          >
            <span class="text-sm font-medium">{{ toast.message }}</span>
            <button @click="uiStore.removeToast(toast.id)" class="ml-4 text-white/80 hover:text-white font-bold">&times;</button>
          </div>
        </transition-group>
      </div>

      <!-- App Layout based on Auth -->
      <div v-if="authStore.isAuthenticated" class="flex min-h-screen">
        
        <!-- Desktop Sidebar -->
        <aside class="hidden lg:flex flex-col w-sidebar_width bg-surface-container-lowest dark:bg-inverse-surface border-r border-surface-container dark:border-on-surface-variant/20">
          <div class="p-6 flex items-center gap-3 border-b border-surface-container dark:border-on-surface-variant/10">
            <span class="material-symbols-outlined text-primary text-3xl font-bold">trending_up</span>
            <span class="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed-dim">Investama</span>
          </div>
          
          <nav class="flex-1 px-4 space-y-1.5 py-6">
            <router-link 
              to="/dashboard" 
              class="flex items-center gap-3 px-4 py-3.5 rounded-xl text-label-md font-label-md transition-all duration-200 hover:bg-surface-container-low group"
              active-class="bg-primary-container/20 text-primary dark:bg-primary/20 dark:text-primary-fixed-dim font-bold"
            >
              <span class="material-symbols-outlined text-2xl group-hover:scale-105 transition-transform" style="font-variation-settings: 'FILL' 1;">home</span>
              Beranda
            </router-link>
            
            <router-link 
              to="/portfolio" 
              class="flex items-center gap-3 px-4 py-3.5 rounded-xl text-label-md font-label-md transition-all duration-200 hover:bg-surface-container-low group"
              active-class="bg-primary-container/20 text-primary dark:bg-primary/20 dark:text-primary-fixed-dim font-bold"
            >
              <span class="material-symbols-outlined text-2xl group-hover:scale-105 transition-transform">donut_large</span>
              Portofolio
            </router-link>
            
            <router-link 
              to="/prices" 
              class="flex items-center gap-3 px-4 py-3.5 rounded-xl text-label-md font-label-md transition-all duration-200 hover:bg-surface-container-low group"
              active-class="bg-primary-container/20 text-primary dark:bg-primary/20 dark:text-primary-fixed-dim font-bold"
            >
              <span class="material-symbols-outlined text-2xl group-hover:scale-105 transition-transform">payments</span>
              Harga Terkini
            </router-link>
            
            <router-link 
              to="/export" 
              class="flex items-center gap-3 px-4 py-3.5 rounded-xl text-label-md font-label-md transition-all duration-200 hover:bg-surface-container-low group"
              active-class="bg-primary-container/20 text-primary dark:bg-primary/20 dark:text-primary-fixed-dim font-bold"
            >
              <span class="material-symbols-outlined text-2xl group-hover:scale-105 transition-transform">export_notes</span>
              Ekspor CSV
            </router-link>
            
            <router-link 
              to="/settings" 
              class="flex items-center gap-3 px-4 py-3.5 rounded-xl text-label-md font-label-md transition-all duration-200 hover:bg-surface-container-low group"
              active-class="bg-primary-container/20 text-primary dark:bg-primary/20 dark:text-primary-fixed-dim font-bold"
            >
              <span class="material-symbols-outlined text-2xl group-hover:scale-105 transition-transform">settings</span>
              Pengaturan
            </router-link>
            
            <router-link 
              v-if="authStore.isAdmin" 
              to="/admin" 
              class="flex items-center gap-3 px-4 py-3.5 rounded-xl text-label-md font-label-md transition-all duration-200 hover:bg-surface-container-low group"
              active-class="bg-primary-container/20 text-primary dark:bg-primary/20 dark:text-primary-fixed-dim font-bold"
            >
              <span class="material-symbols-outlined text-2xl group-hover:scale-105 transition-transform">shield</span>
              Panel Admin
            </router-link>
          </nav>

          <!-- Sidebar Footer with Theme & Logout -->
          <div class="p-4 border-t border-surface-container dark:border-on-surface-variant/10 space-y-2">
            <!-- Theme Toggle -->
            <button 
              @click="toggleTheme" 
              class="flex items-center justify-between w-full px-4 py-3 rounded-xl text-label-md font-label-md hover:bg-surface-container-low transition-colors duration-150"
            >
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined">{{ theme === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
                Mode {{ theme === 'dark' ? 'Terang' : 'Gelap' }}
              </span>
            </button>
            
            <!-- Logout -->
            <button 
              @click="handleLogout" 
              class="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-label-md font-label-md text-error hover:bg-error-container/20 transition-colors duration-150"
            >
              <span class="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col min-h-screen overflow-hidden">
          
          <!-- Melayang Top AppBar -->
          <header class="bg-surface/90 dark:bg-on-background/95 backdrop-blur-md fixed top-0 right-0 left-0 lg:left-[280px] z-50 h-16 px-6 flex justify-between items-center border-b border-surface-container/50 dark:border-on-surface-variant/10">
            <div class="flex items-center gap-3">
              <!-- Mobile view Logo/Info -->
              <div class="flex lg:hidden items-center gap-2">
                <span class="material-symbols-outlined text-primary text-2xl font-bold">trending_up</span>
                <span class="text-headline-md font-headline-md font-bold text-primary">Investama</span>
              </div>
              <span class="hidden lg:inline text-label-sm font-label-sm text-on-surface-variant dark:text-outline-variant">Aplikasi Manajemen Kekayaan</span>
            </div>
            
            <div class="flex items-center gap-3">
              <!-- Quick Theme Toggle for Mobile -->
              <button 
                @click="toggleTheme" 
                class="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors duration-150"
              >
                <span class="material-symbols-outlined text-on-surface-variant dark:text-inverse-on-surface">{{ theme === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
              </button>

              <!-- Notifications -->
              <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low dark:hover:bg-inverse-surface transition-colors duration-150 relative">
                <span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim" data-icon="notifications">notifications</span>
                <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full"></span>
              </button>

              <!-- User Profile Info -->
              <div class="flex items-center gap-3 border-l border-surface-container dark:border-on-surface-variant/20 pl-3">
                <div class="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border-2 border-primary-fixed">
                  <img 
                    alt="User Profile" 
                    class="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7kga8efUIYEOB0qhlzLIptH2J2QqbJo8EoMsD2gItGD3ccog-97j5phVvzkLG09HBk9VrroIA4S1idw4MctWSmRWKaHyMPole97Q746VWC_caTNRHxHu-EpgG6hz8xQJkSlbm01va_h3izdGRy6uie_AvmkGvIyf3mCq-q8lX7xuOpuV8HH1vpLrzkliUwfjZ4GyuqZuqk-Z4EEuH59UvMMIW9rymdqBaCpp8ZrDv4x1DQYvZ0uwhaMzCEv8QIqgjoE_8IwS25eM"
                  />
                </div>
                <div class="hidden sm:block text-left">
                  <p class="text-xs font-bold leading-tight">{{ authStore.fullName }}</p>
                  <p class="text-[10px] text-on-surface-variant dark:text-outline-variant capitalize leading-tight">{{ authStore.user?.role || 'Pengguna' }}</p>
                </div>
              </div>
            </div>
          </header>

          <!-- Main Page Body -->
          <main class="flex-1 overflow-y-auto pt-24 pb-24 lg:pb-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
            <router-view />
          </main>

          <!-- Mobile Bottom Navigation Bar -->
          <nav class="lg:hidden fixed bottom-0 left-0 w-full z-50 bg-surface-container dark:bg-inverse-surface shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl flex justify-around items-center px-4 py-2 border-t border-surface-container-high/50 dark:border-on-surface-variant/10">
            <!-- Home -->
            <router-link 
              to="/dashboard" 
              class="flex flex-col items-center justify-center px-3 py-1.5 transition-all duration-200"
              active-class="bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary rounded-full px-5 scale-95"
              v-slot="{ isActive }"
            >
              <span class="material-symbols-outlined" :style="{ fontVariationSettings: isActive ? `'FILL' 1` : `'FILL' 0` }">home</span>
              <span class="text-[10px] font-bold mt-0.5" v-if="isActive">Beranda</span>
              <span class="text-[10px] text-on-surface-variant dark:text-outline-variant font-medium mt-0.5" v-else>Beranda</span>
            </router-link>

            <!-- Portfolio -->
            <router-link 
              to="/portfolio" 
              class="flex flex-col items-center justify-center px-3 py-1.5 transition-all duration-200"
              active-class="bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary rounded-full px-5 scale-95"
              v-slot="{ isActive }"
            >
              <span class="material-symbols-outlined" :style="{ fontVariationSettings: isActive ? `'FILL' 1` : `'FILL' 0` }">donut_large</span>
              <span class="text-[10px] font-bold mt-0.5" v-if="isActive">Portofolio</span>
              <span class="text-[10px] text-on-surface-variant dark:text-outline-variant font-medium mt-0.5" v-else>Portofolio</span>
            </router-link>

            <!-- Prices -->
            <router-link 
              to="/prices" 
              class="flex flex-col items-center justify-center px-3 py-1.5 transition-all duration-200"
              active-class="bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary rounded-full px-5 scale-95"
              v-slot="{ isActive }"
            >
              <span class="material-symbols-outlined" :style="{ fontVariationSettings: isActive ? `'FILL' 1` : `'FILL' 0` }">payments</span>
              <span class="text-[10px] font-bold mt-0.5" v-if="isActive">Harga</span>
              <span class="text-[10px] text-on-surface-variant dark:text-outline-variant font-medium mt-0.5" v-else>Harga</span>
            </router-link>

            <!-- Settings -->
            <router-link 
              to="/settings" 
              class="flex flex-col items-center justify-center px-3 py-1.5 transition-all duration-200"
              active-class="bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary rounded-full px-5 scale-95"
              v-slot="{ isActive }"
            >
              <span class="material-symbols-outlined" :style="{ fontVariationSettings: isActive ? `'FILL' 1` : `'FILL' 0` }">settings</span>
              <span class="text-[10px] font-bold mt-0.5" v-if="isActive">Setelan</span>
              <span class="text-[10px] text-on-surface-variant dark:text-outline-variant font-medium mt-0.5" v-else>Setelan</span>
            </router-link>

            <!-- Admin -->
            <router-link 
              v-if="authStore.isAdmin"
              to="/admin" 
              class="flex flex-col items-center justify-center px-3 py-1.5 transition-all duration-200"
              active-class="bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary rounded-full px-5 scale-95"
              v-slot="{ isActive }"
            >
              <span class="material-symbols-outlined" :style="{ fontVariationSettings: isActive ? `'FILL' 1` : `'FILL' 0` }">shield</span>
              <span class="text-[10px] font-bold mt-0.5" v-if="isActive">Admin</span>
              <span class="text-[10px] text-on-surface-variant dark:text-outline-variant font-medium mt-0.5" v-else>Admin</span>
            </router-link>
          </nav>
        </div>
      </div>

      <!-- Guest Layout -->
      <div v-else class="min-h-screen flex items-center justify-center p-4">
        <router-view />
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useTheme } from '@/composables/useTheme';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore();
const { theme, toggleTheme } = useTheme();

const toasts = computed(() => uiStore.toasts);

async function handleLogout() {
  await authStore.logout();
  uiStore.showToast('Logout berhasil', 'success');
  router.push('/login');
}
</script>

<style>
/* Transitions for toasts */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>
