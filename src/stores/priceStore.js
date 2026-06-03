import { defineStore } from 'pinia';
import { useApi } from '@/composables/useApi';

export const usePriceStore = defineStore('price', {
  state: () => ({
    prices: null,
    isLoading: false,
    error: null,
  }),
  
  actions: {
    async fetchPrices() {
      this.isLoading = true;
      this.error = null;
      try {
        const { api } = useApi();
        const res = await api('price.getAll');
        this.prices = res.data;
      } catch (e) {
        this.error = e.message;
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    
    async refreshPrice(instrument_id) {
      try {
        const { api } = useApi();
        const res = await api('price.refresh', { instrument_id });
        await this.fetchPrices();
        return res.data;
      } catch (e) {
        throw e;
      }
    },
    
    async manualUpdatePrice(instrument_id, price) {
      this.isLoading = true;
      try {
        const { api } = useApi();
        const res = await api('price.manualUpdate', { instrument_id, price });
        await this.fetchPrices();
        return res;
      } catch (e) {
        throw e;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
