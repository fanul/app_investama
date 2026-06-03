// Config.js
const CONFIG = {
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '1FfOQEJ91vc6aM-IaGmyvEqO48XkV9SDPmQIhhSQYf88',
  SHEETS: {
    USERS: 'Users',
    TRANSACTIONS: 'Transactions',
    INSTRUMENTS: 'Instruments',
    PRICE_HISTORY: 'PriceHistory',
    AUDIT_LOG: 'AuditLog',
    SYSTEM_CONFIG: 'SystemConfig',
    SESSIONS: 'Sessions',
    NEWS: 'News'
  },
  SESSION_TTL: 24 * 60 * 60 * 1000, // 24 jam dalam milidetik
  MAX_ROWS_PER_FETCH: 1000
};

function getConfigValue(key) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.SYSTEM_CONFIG);
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        return data[i][1];
      }
    }
  } catch (e) {
    Logger.log('Error in getConfigValue for ' + key + ': ' + e.message);
  }
  return null;
}
