// Installer.js

function installApp() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  const schemas = {
    'Users': ['user_id', 'name', 'email', 'password_hash', 'role', 'status', 'created_at', 'updated_at', 'last_login', 'currency_pref', 'theme_pref'],
    'Transactions': ['tx_id', 'user_id', 'instrument_id', 'tx_type', 'tx_date', 'quantity', 'price_per_unit', 'total_value', 'fee', 'notes', 'receipt_url', 'created_at', 'updated_at'],
    'Instruments': ['instrument_id', 'code', 'name', 'category', 'exchange', 'currency', 'unit', 'price_source', 'last_price', 'last_price_updated', 'is_active', 'created_at'],
    'PriceHistory': ['history_id', 'instrument_id', 'price', 'price_date', 'source', 'fetched_at'],
    'AuditLog': ['log_id', 'user_id', 'action', 'target_id', 'details', 'ip_info', 'created_at'],
    'SystemConfig': ['config_key', 'config_value', 'description', 'updated_at', 'updated_by'],
    'Sessions': ['session_id', 'user_id', 'expires_at', 'created_at', 'is_valid']
  };
  
  Object.entries(schemas).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#1a5e3f')
        .setFontColor('#ffffff')
        .setFontWeight('bold')
        .setHorizontalAlignment('center');
      
      sheet.setFrozenRows(1);
    }
  });
  
  seedSystemConfig(ss);
  seedDefaultInstruments(ss);
  createDefaultAdmin();
  createBackupTrigger();
  
  Logger.log('✅ INSTALASI SELESAI: Aplikasi Baru berhasil di-deploy!');
}

function seedSystemConfig(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SYSTEM_CONFIG);
  if (sheet.getLastRow() > 1) return;
  
  const now = new Date().toISOString();
  const defaults = [
    ['GOLD_API_KEY', '', 'API key goldapi.io untuk live emas', now, 'system'],
    ['ALPHA_VANTAGE_KEY', '', 'API key Alpha Vantage', now, 'system'],
    ['GOLD_MANUAL_PRICE', '1320000', 'Harga emas manual per gram IDR (fallback)', now, 'system'],
    ['BI_RATE', '6.25', 'BI 7-Day Repo Rate (%)', now, 'system'],
    ['SESSION_TTL_HOURS', '24', 'Durasi sesi login (jam)', now, 'system'],
    ['MAX_UPLOAD_SIZE_MB', '5', 'Batas upload file (MB)', now, 'system']
  ];
  
  defaults.forEach(row => sheet.appendRow(row));
  Logger.log('✅ Seeding SystemConfig berhasil.');
}

function seedDefaultInstruments(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.INSTRUMENTS);
  if (sheet.getLastRow() > 1) return;
  
  const now = new Date().toISOString();
  const defaults = [
    ['ins_BBCA', 'BBCA', 'Bank Central Asia Tbk', 'saham', 'IDX', 'IDR', 'lot', 'api_yahoo', 10050, now, true, now],
    ['ins_BBRI', 'BBRI', 'Bank Rakyat Indonesia Tbk', 'saham', 'IDX', 'IDR', 'lot', 'api_yahoo', 4500, now, true, now],
    ['ins_TLKM', 'TLKM', 'Telkom Indonesia Tbk', 'saham', 'IDX', 'IDR', 'lot', 'api_yahoo', 2800, now, true, now],
    ['ins_EMAS', 'EMAS', 'Emas Antam Logam Mulia', 'emas', 'N/A', 'IDR', 'gram', 'api_gold', 1320000, now, true, now],
    ['ins_ORI026', 'ORI026', 'Obligasi Ritel Indonesia ORI026', 'obligasi', 'N/A', 'IDR', 'unit', 'manual', 1000000, now, true, now],
    ['ins_DEP_BCA', 'DEP_BCA', 'Deposito Rupiah BCA', 'deposito', 'N/A', 'IDR', 'unit', 'manual', 1, now, true, now]
  ];
  
  defaults.forEach(row => sheet.appendRow(row));
  Logger.log('✅ Seeding default instrumen berhasil.');
}

function createDefaultAdmin() {
  const email = 'admin@aplikasibaru.com';
  const existing = getUserByEmail(email);
  if (existing) return;
  
  const userId = generateUUID('usr');
  const hash = hashPassword('Admin@12345');
  const now = new Date().toISOString();
  
  const sheet = getSheet(CONFIG.SHEETS.USERS);
  sheet.appendRow([
    userId,
    'Super Admin',
    email,
    hash,
    'superadmin',
    'active',
    now,
    now,
    '',
    'IDR',
    'light'
  ]);
  
  Logger.log('✅ Pembuatan Admin default berhasil: admin@aplikasibaru.com / Admin@12345');
}

function backupSpreadsheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd_HHmmss');
  const backupName = `AplikasiBaru_Backup_${nowStr}`;
  
  const backup = ss.copy(backupName);
  const backupFolderId = PropertiesService.getScriptProperties().getProperty('BACKUP_FOLDER_ID');
  
  if (backupFolderId) {
    try {
      const file = DriveApp.getFileById(backup.getId());
      const folder = DriveApp.getFolderById(backupFolderId);
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
    } catch (e) {
      Logger.log('Warning: Folder backup tidak valid, file backup tersimpan di Root Drive: ' + e.message);
    }
  }
  
  AuditService.log('system', 'backup', backup.getId(), { name: backupName });
  return backup.getUrl();
}

function createBackupTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(tr => {
    if (tr.getHandlerFunction() === 'backupSpreadsheet') {
      ScriptApp.deleteTrigger(tr);
    }
  });
  
  ScriptApp.newTrigger('backupSpreadsheet')
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();
    
  Logger.log('✅ Trigger backup otomatis harian pukul 02:00 WIB berhasil didaftarkan.');
}
