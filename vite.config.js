import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'gas',
    assetsDir: '',
    cssCodeSplit: false,
    emptyOutDir: false, // PENTING: Jangan hapus file .js GAS di folder gas/
  },
});
