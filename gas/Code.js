// Code.js

/**
 * Entry point untuk request HTTP GET (Menyajikan halaman frontend Vue SPA secara aman)
 * Secara dinamis menginjeksikan URL Web App aktif saat ini ke dalam berkas HTML
 * agar bebas dari konfigurasi manual VITE_GAS_URL saat di-hosting di GAS.
 */
function doGet(e) {
  const html = HtmlService.createHtmlOutputFromFile('index');
  let content = html.getContent();
  
  // Ambil URL Web App aktif saat ini secara dinamis
  let webAppUrl = "";
  try {
    webAppUrl = ScriptApp.getService().getUrl();
  } catch (err) {
    Logger.log("Gagal mengambil Web App URL dinamis: " + err.message);
  }
  
  // Ganti placeholder di index.html dengan URL dinamis
  content = content.replace('window.GAS_WEB_APP_URL=""', 'window.GAS_WEB_APP_URL="' + webAppUrl + '"');
  
  return HtmlService.createHtmlOutput(content)
    .setTitle('Aplikasi Baru - Investment Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Entry point untuk request HTTP POST (CORS-friendly JSON Endpoint untuk API)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return buildResponse({
        status: "error",
        code: "SYS_001",
        message: "Bad Request: Request body kosong atau tidak valid."
      });
    }
    
    const body = JSON.parse(e.postData.contents);
    const { action, token, payload } = body;
    
    // Eksekusi routing aksi
    const result = Router.route(action, token, payload);
    return buildResponse(result);
    
  } catch (err) {
    // Log error internal ke database AuditLog
    AuditService.logError(err, 'Code.doPost');
    
    // Dapatkan kode error yang user-friendly
    const errorCode = getErrorCodeFromMessage(err.message);
    
    return buildResponse({
      status: "error",
      code: errorCode,
      message: cleanErrorMessage(err.message)
    });
  }
}

/**
 * Fungsi Handler Khusus untuk google.script.run (Komunikasi Asinkron Native GAS)
 * Sangat penting untuk meloloskan request dari blokir CORS & Proteksi OAuth di link /dev
 * @param {string} action - Nama aksi (misal: 'auth.login')
 * @param {string} token - Token sesi UUID
 * @param {Object} payload - Parameter aksi
 * @returns {string} Response JSON terformat string
 */
function executeAction(action, token, payload) {
  try {
    const result = Router.route(action, token, payload);
    return JSON.stringify(result);
  } catch (err) {
    // Log error internal ke database AuditLog
    AuditService.logError(err, `Code.executeAction: ${action}`);
    
    const errorCode = getErrorCodeFromMessage(err.message);
    return JSON.stringify({
      status: "error",
      code: errorCode,
      message: cleanErrorMessage(err.message)
    });
  }
}

/**
 * Helper untuk membangun response text/plain atau application/json
 */
function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Memetakan pesan error ke kode error standar PRD
 * @param {string} msg - Pesan error asli
 * @returns {string} Kode error terstandarisasi
 */
function getErrorCodeFromMessage(msg) {
  if (!msg) return 'SYS_001';
  
  if (msg.includes('EMAIL_ALREADY_EXISTS')) return 'AUTH_001';
  if (msg.includes('USER_NOT_FOUND')) return 'AUTH_002';
  if (msg.includes('INVALID_PASSWORD')) return 'AUTH_003';
  if (msg.includes('ACCOUNT_INACTIVE')) return 'AUTH_004';
  if (msg.includes('TOKEN_EXPIRED')) return 'AUTH_005';
  if (msg.includes('INVALID_TOKEN')) return 'AUTH_006';
  if (msg.includes('RATE_LIMIT_EXCEEDED')) return 'AUTH_007';
  if (msg.includes('PASSWORD_TOO_SHORT')) return 'AUTH_008';
  
  if (msg.includes('INSTRUMENT_NOT_FOUND')) return 'TX_001';
  if (msg.includes('INVALID_TX_TYPE')) return 'TX_002';
  if (msg.includes('QUANTITY_MUST_BE_POSITIVE')) return 'TX_003';
  if (msg.includes('UNAUTHORIZED_TX_ACCESS')) return 'TX_004';
  
  if (msg.includes('SHEET_NOT_FOUND')) return 'SYS_002';
  if (msg.includes('UNAUTHORIZED_ACCESS')) return 'SYS_003';
  
  return 'SYS_001';
}

/**
 * Membersihkan awalan kode internal agar pesan error ramah pengguna
 * @param {string} msg - Pesan error asli
 * @returns {string} Pesan error tersaring
 */
function cleanErrorMessage(msg) {
  if (!msg) return 'Terjadi kesalahan internal pada server.';
  
  // Jika pesan mengandung format kode error internal (misal: "COLUMN_NOT_FOUND: ...")
  if (msg.includes(': ')) {
    return msg.split(': ').slice(1).join(': ');
  }
  
  // Custom friendly mapping
  if (msg === 'EMAIL_ALREADY_EXISTS') return 'Email ini sudah terdaftar. Silakan gunakan email lain.';
  if (msg === 'USER_NOT_FOUND') return 'Akun tidak ditemukan. Silakan mendaftar.';
  if (msg === 'INVALID_PASSWORD') return 'Kata sandi salah. Silakan coba lagi.';
  if (msg === 'ACCOUNT_INACTIVE') return 'Akun Anda dinonaktifkan atau ditangguhkan. Hubungi Admin.';
  if (msg === 'TOKEN_EXPIRED') return 'Sesi Anda telah berakhir. Silakan login kembali.';
  if (msg === 'INVALID_TOKEN') return 'Sesi tidak valid. Silakan login kembali.';
  if (msg === 'PASSWORD_TOO_SHORT') return 'Kata sandi minimal harus terdiri dari 8 karakter.';
  if (msg === 'RATE_LIMIT_EXCEEDED') return 'Terlalu banyak permintaan dalam waktu singkat. Coba lagi nanti.';
  
  return msg;
}
