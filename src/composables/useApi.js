import { useAuthStore } from '@/stores/authStore';

export function useApi() {
  // 1. Coba baca dari variabel yang diinjeksikan secara dinamis oleh doGet() di cloud
  // 2. Jika kosong (misal dijalankan lokal di localhost:5173), gunakan VITE_GAS_URL dari .env
  let GAS_URL = window.GAS_WEB_APP_URL || import.meta.env.VITE_GAS_URL;
  
  if (!GAS_URL || GAS_URL.includes('XXXXXXXXXX')) {
    // Fallback jika tidak ada konfigurasi sama sekali
    GAS_URL = 'https://script.google.com/macros/s/1sSnNAWCivtBKZfELcJ21ojzRA4380zWImGf8IWb6yF8ltyluAxbImRgY/exec';
  }

  /**
   * Mengirim request ke Google Apps Script Web App API
   * Mendukung komunikasi native `google.script.run` ketika dijalankan di dalam iframe Apps Script (/dev & /exec)
   * serta otomatis fallback ke `fetch` jika dijalankan di luar iframe (lokal dev server).
   * @param {string} action - Nama aksi (misal: 'auth.login')
   * @param {Object} payload - Parameter aksi
   * @param {string} [token] - Token sesi manual (opsional)
   * @returns {Promise<Object>} Response sukses
   */
  async function api(action, payload = {}, token = null) {
    const auth = useAuthStore();
    const t = token || auth.token;
    
    // DETEKSI IFRAME GAS: Jika berjalan di dalam container Apps Script, gunakan google.script.run (Native & Bebas CORS)
    if (window.google && window.google.script && window.google.script.run) {
      return new Promise((resolve, reject) => {
        window.google.script.run
          .withSuccessHandler((responseString) => {
            try {
              const res = JSON.parse(responseString);
              if (res.status === 'error') {
                if (['AUTH_005', 'AUTH_006'].includes(res.code) || 
                    res.message.includes('expired') || 
                    res.message.includes('valid')) {
                  auth.logout();
                  reject(new Error('Sesi berakhir. Silakan login kembali.'));
                } else {
                  reject(new Error(res.message || 'Terjadi kesalahan sistem.'));
                }
              } else {
                resolve(res);
              }
            } catch (err) {
              reject(new Error('Gagal mem-parsing response server: ' + err.message));
            }
          })
          .withFailureHandler((err) => {
            reject(new Error(err.message || 'Komunikasi native google.script.run terputus.'));
          })
          .executeAction(action, t, payload);
      });
    }

    // FALLBACK LOKAL: Jika dijalankan di luar iframe (dev server lokal), gunakan Fetch API POST ke URL deployment
    const body = { 
      action, 
      payload, 
      ...(t && { token: t }) 
    };
    
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'text/plain' },
      redirect: 'follow',
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Koneksi ke server gagal`);
    }
    
    const data = await res.json();
    
    if (data.status === 'error') {
      if (['AUTH_005', 'AUTH_006'].includes(data.code) || 
          data.message.includes('expired') || 
          data.message.includes('valid')) {
        auth.logout();
        throw new Error('Sesi berakhir. Silakan login kembali.');
      }
      throw new Error(data.message || 'Terjadi kesalahan sistem.');
    }
    
    return data;
  }

  return { api };
}
