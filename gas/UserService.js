// UserService.js

function listUsers() {
  const sheet = getSheet(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: 'success', data: [] };
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const users = rows.map(row => {
    const userObj = rowToObject(headers, row);
    return sanitizeUser(userObj);
  });
  
  return {
    status: 'success',
    data: users
  };
}

function updateUserStatus(payload) {
  const { user_id, status } = payload;
  
  if (!user_id || !status) {
    throw new Error('MISSING_FIELDS');
  }
  
  if (!['active', 'inactive', 'suspended'].includes(status)) {
    throw new Error('INVALID_STATUS');
  }
  
  const targetUser = findRowByKey(CONFIG.SHEETS.USERS, 'user_id', user_id);
  if (!targetUser) {
    throw new Error('USER_NOT_FOUND');
  }
  
  if (targetUser.data.role === 'superadmin' && status !== 'active') {
    throw new Error('SUPERADMIN_PROTECTED');
  }
  
  const now = new Date().toISOString();
  updateRowByKey(CONFIG.SHEETS.USERS, 'user_id', user_id, {
    status: status,
    updated_at: now
  });
  
  if (status !== 'active') {
    invalidateAllSessionsForUser(user_id);
  }
  
  return {
    status: 'success',
    data: { success: true }
  };
}

function resetUserPassword(payload) {
  const { user_id } = payload;
  
  if (!user_id) throw new Error('MISSING_FIELDS');
  
  const targetUser = findRowByKey(CONFIG.SHEETS.USERS, 'user_id', user_id);
  if (!targetUser) throw new Error('USER_NOT_FOUND');
  
  const tempPassword = generateUUID('pwd').substring(4, 12);
  const hash = hashPassword(tempPassword);
  const now = new Date().toISOString();
  
  updateRowByKey(CONFIG.SHEETS.USERS, 'user_id', user_id, {
    password_hash: hash,
    updated_at: now
  });
  
  invalidateAllSessionsForUser(user_id);
  
  return {
    status: 'success',
    data: { temp_password: tempPassword }
  };
}

function invalidateAllSessionsForUser(userId) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.SESSIONS);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const userIdx = headers.indexOf('user_id');
    const validIdx = headers.indexOf('is_valid');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][userIdx] === userId && data[i][validIdx] === true) {
        sheet.getRange(i + 1, validIdx + 1).setValue(false);
      }
    }
  } catch (e) {
    Logger.log('Gagal invalidate all sessions for user: ' + e.message);
  }
}

function listSystemConfigs() {
  const sheet = getSheet(CONFIG.SHEETS.SYSTEM_CONFIG);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => rowToObject(headers, row));
}

function updateSystemConfig(userId, payload) {
  const { key, value } = payload;
  
  if (!key || value === undefined) {
    throw new Error('MISSING_FIELDS');
  }
  
  const sheet = getSheet(CONFIG.SHEETS.SYSTEM_CONFIG);
  const existing = findRowByKey(CONFIG.SHEETS.SYSTEM_CONFIG, 'config_key', key);
  const now = new Date().toISOString();
  
  if (!existing) {
    sheet.appendRow([
      key,
      String(value),
      payload.description || `Konfigurasi ${key}`,
      now,
      userId
    ]);
  } else {
    updateRowByKey(CONFIG.SHEETS.SYSTEM_CONFIG, 'config_key', key, {
      config_value: String(value),
      updated_at: now,
      updated_by: userId
    });
  }
  
  if (['GOLD_API_KEY', 'ALPHA_VANTAGE_KEY', 'SPREADSHEET_ID', 'BACKUP_FOLDER_ID'].includes(key)) {
    PropertiesService.getScriptProperties().setProperty(key, String(value));
  }
  
  AuditService.log(userId, 'update_config', key, { value: String(value) });
  
  return {
    status: 'success',
    data: { success: true }
  };
}

function listAuditLogs(payload) {
  const limit = parseInt(payload.limit || '100');
  const offset = parseInt(payload.offset || '0');
  
  const sheet = getSheet(CONFIG.SHEETS.AUDIT_LOG);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: 'success', data: [] };
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const sortedRows = rows.sort((a, b) => new Date(b[6]) - new Date(a[6]));
  const paginatedRows = sortedRows.slice(offset, offset + limit);
  const logs = paginatedRows.map(row => rowToObject(headers, row));
  
  return {
    status: 'success',
    data: logs
  };
}
