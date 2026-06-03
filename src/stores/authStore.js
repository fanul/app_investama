import { defineStore } from 'pinia';
import { useApi } from '@/composables/useApi';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('app_token') || null,
    user: JSON.parse(localStorage.getItem('app_user') || 'null'),
    role: localStorage.getItem('app_role') || null,
    isLoading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => ['admin', 'superadmin'].includes(state.role),
    isSuperadmin: (state) => state.role === 'superadmin',
    fullName: (state) => state.user?.name || 'User',
  },
  
  actions: {
    async login(email, password) {
      this.isLoading = true;
      this.error = null;
      try {
        const { api } = useApi();
        const res = await api('auth.login', { email, password });
        this.token = res.data.token;
        this.user = res.data.user;
        this.role = res.data.role;
        
        localStorage.setItem('app_token', this.token);
        localStorage.setItem('app_user', JSON.stringify(this.user));
        localStorage.setItem('app_role', this.role);
        return res;
      } catch(e) {
        this.error = e.message;
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    
    async register(name, email, password) {
      this.isLoading = true;
      this.error = null;
      try {
        const { api } = useApi();
        const res = await api('auth.register', { name, email, password });
        this.token = res.data.token;
        this.user = { name, email, user_id: res.data.user_id };
        this.role = 'user';
        
        localStorage.setItem('app_token', this.token);
        localStorage.setItem('app_user', JSON.stringify(this.user));
        localStorage.setItem('app_role', this.role);
        return res;
      } catch(e) {
        this.error = e.message;
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    
    async logout() {
      const { api } = useApi();
      try { 
        if (this.token) {
          await api('auth.logout', {}); 
        }
      } catch(e) {}
      
      this.token = null;
      this.user = null;
      this.role = null;
      
      localStorage.removeItem('app_token');
      localStorage.removeItem('app_user');
      localStorage.removeItem('app_role');
    },

    async fetchProfile() {
      const { api } = useApi();
      try {
        const res = await api('auth.me');
        this.user = res.data.user;
        localStorage.setItem('app_user', JSON.stringify(this.user));
      } catch(e) {
        this.logout();
      }
    }
  }
});
