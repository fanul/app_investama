// AuditService.js

const AuditService = {
  log: function(userId, action, targetId, details, ipInfo) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.AUDIT_LOG);
      const logId = generateUUID('log');
      const now = new Date().toISOString();
      const detailsStr = details ? JSON.stringify(details) : '{}';
      
      sheet.appendRow([
        logId,
        userId || 'system',
        action,
        targetId || '',
        detailsStr,
        ipInfo || '',
        now
      ]);
    } catch (e) {
      Logger.log('FATAL: Gagal mencatat audit log: ' + e.message);
    }
  },

  logError: function(error, contextInfo) {
    try {
      const details = {
        message: error.message,
        stack: error.stack || '',
        context: contextInfo || 'general'
      };
      
      this.log('system', 'error', 'system_error', details);
      Logger.log(`[ERROR] ${contextInfo || ''}: ${error.message}\nStack: ${error.stack}`);
    } catch (e) {
      Logger.log('FATAL: Gagal mencatat error log: ' + e.message);
    }
  }
};
