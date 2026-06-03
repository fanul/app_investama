import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
  }),
  
  actions: {
    showToast(message, type = 'success', duration = 3000) {
      const id = Date.now() + Math.random().toString(36).substring(2, 7);
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    },
    
    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }
  }
});
