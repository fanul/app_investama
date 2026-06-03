import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Menggunakan Hash History agar berfungsi sempurna di Google Apps Script (GAS) 
// karena GAS tidak mendukung routing History API server-side fallback
const routes = [
  { path: '/', redirect: '/dashboard' },
  { 
    path: '/login', 
    component: () => import('@/views/auth/LoginView.vue'), 
    meta: { guest: true } 
  },
  { 
    path: '/register', 
    component: () => import('@/views/auth/RegisterView.vue'), 
    meta: { guest: true } 
  },
  { 
    path: '/forgot-password', 
    component: () => import('@/views/auth/ForgotPasswordView.vue'), 
    meta: { guest: true } 
  },
  { 
    path: '/dashboard', 
    component: () => import('@/views/DashboardView.vue'), 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/portfolio', 
    component: () => import('@/views/PortfolioView.vue'), 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/prices', 
    component: () => import('@/views/PricesView.vue'), 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/export', 
    component: () => import('@/views/ExportView.vue'), 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/settings', 
    component: () => import('@/views/SettingsView.vue'), 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin', 
    component: () => import('@/views/admin/AdminDashboardView.vue'), 
    meta: { requiresAuth: true, requiresAdmin: true } 
  },
  { 
    path: '/:pathMatch(.*)*', 
    component: () => import('@/views/NotFoundView.vue') 
  }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login');
  }
  
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next('/dashboard');
  }
  
  if (to.meta.guest && auth.isAuthenticated) {
    return next('/dashboard');
  }
  
  next();
});
