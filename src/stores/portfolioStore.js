import { defineStore } from 'pinia';
import { useApi } from '@/composables/useApi';

export const usePortfolioStore = defineStore('portfolio', {
  state: () => ({
    transactions: [],
    summary: null,
    isLoading: false,
    error: null,
  }),
  
  getters: {
    hasHoldings: (state) => state.summary && state.summary.instruments && state.summary.instruments.length > 0,
    totalValue: (state) => state.summary?.total_current_value || 0,
    totalModal: (state) => state.summary?.total_modal || 0,
    totalPnL: (state) => state.summary?.total_pnl || 0,
    totalPnLPercent: (state) => state.summary?.total_pnl_percent || 0,
  },
  
  actions: {
    async fetchSummary() {
      this.isLoading = true;
      this.error = null;
      try {
        const { api } = useApi();
        const res = await api('tx.summary');
        this.summary = res.data;
      } catch (e) {
        this.error = e.message;
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchTransactions() {
      this.isLoading = true;
      this.error = null;
      try {
        const { api } = useApi();
        const res = await api('tx.list');
        this.transactions = res.data;
      } catch (e) {
        this.error = e.message;
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    
    async addTransaction(payload) {
      this.isLoading = true;
      try {
        const { api } = useApi();
        const res = await api('tx.add', payload);
        await this.fetchSummary();
        await this.fetchTransactions();
        return res;
      } catch (e) {
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    
    async editTransaction(payload) {
      this.isLoading = true;
      try {
        const { api } = useApi();
        const res = await api('tx.edit', payload);
        await this.fetchSummary();
        await this.fetchTransactions();
        return res;
      } catch (e) {
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteTransaction(tx_id) {
      this.isLoading = true;
      try {
        const { api } = useApi();
        const res = await api('tx.delete', { tx_id });
        await this.fetchSummary();
        await this.fetchTransactions();
        return res;
      } catch (e) {
        throw e;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
