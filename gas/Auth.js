// Auth.js

function getUserByEmail(email) {
  try {
    const result = findRowByKey(CONFIG.SHEETS.USERS, 'email', email.toLowerCase().trim());
    return result ? result.data : null;
  } catch (e) {
    return null;
  }
}

function getUserById(userId) {
  try {
    const result = findRowByKey(CONFIG.SHEETS.USERS, 'user_id', userId);
    return result ? result.data : null;
  } catch (e) {
    return null;
  }
}

function getSessionByToken(token) {
  try {
    const result = findRowByKey(CONFIG.SHEETS.SESSIONS, 'session_id', token);
    return result ? result.data : null;
  } catch (e) {
    return null;
  }
}

function invalidateSession(token) {
  try {
    updateRowByKey(CONFIG.SHEETS.SESSIONS, 'session_id', token, { is_valid: false });
  } catch (e) {
    Logger.log('Gagal invalidate session: ' + e.message);
  }
}

function updateLastLogin(userId) {
  try {
    const now = new Date().toISOString();
    updateRowByKey(CONFIG.SHEETS.USERS, 'user_id', userId, { last_login: now });
  } catch (e) {
    Logger.log('Gagal update last login: ' + e.message);
  }
}

function register(payload) {
  const { name, email, password } = payload;
  
  if (!name || !email || !password) {
    throw new Error('MISSING_FIELDS');
  }
  
  const trimmedEmail = email.toLowerCase().trim();
  if (!isValidEmail(trimmedEmail)) {
    throw new Error('EMAIL_INVALID');
  }
  
  if (password.length < 8) {
    throw new Error('PASSWORD_TOO_SHORT');
  }
  
  if (getUserByEmail(trimmedEmail)) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }
  
  const userId = generateUUID('usr');
  const hash = hashPassword(password);
  const now = new Date().toISOString();
  
  const sheet = getSheet(CONFIG.SHEETS.USERS);
  sheet.appendRow([
    userId,
    name.trim(),
    trimmedEmail,
    hash,
    'user',
    'active',
    now,
    now,
    '',
    'IDR',
    'light'
  ]);
  
  const token = createSession(userId);
  AuditService.log(userId, 'register', userId, { name, email: trimmedEmail });
  
  return {
    status: 'success',
    data: { user_id: userId, token }
  };
}

function login(payload) {
  const { email, password } = payload;
  
  if (!email || !password) {
    throw new Error('MISSING_FIELDS');
  }
  
  const user = getUserByEmail(email);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }
  
  if (user.status !== 'active') {
    throw new Error('ACCOUNT_INACTIVE');
  }
  
  if (!verifyPassword(password, user.password_hash)) {
    throw new Error('INVALID_PASSWORD');
  }
  
  const token = createSession(user.user_id);
  updateLastLogin(user.user_id);
  
  AuditService.log(user.user_id, 'login', user.user_id, {});
  
  return {
    status: 'success',
    data: {
      token,
      user: sanitizeUser(user),
      role: user.role
    }
  };
}

function logout(token) {
  if (!token) throw new Error('INVALID_TOKEN');
  
  const session = getSessionByToken(token);
  if (session && session.is_valid) {
    invalidateSession(token);
    AuditService.log(session.user_id, 'logout', session.user_id, {});
  }
  
  return {
    status: 'success',
    data: { success: true }
  };
}

function getActiveUser(token) {
  const userId = validateToken(token);
  const user = getUserById(userId);
  if (!user) throw new Error('USER_NOT_FOUND');
  return {
    status: 'success',
    data: { user: sanitizeUser(user) }
  };
}

function validateToken(token) {
  if (!token) throw new Error('INVALID_TOKEN');
  
  const session = getSessionByToken(token);
  if (!session || !session.is_valid) {
    throw new Error('INVALID_TOKEN');
  }
  
  const expiresAt = new Date(session.expires_at);
  if (expiresAt < new Date()) {
    invalidateSession(token);
    throw new Error('TOKEN_EXPIRED');
  }
  
  return session.user_id;
}

function createSession(userId) {
  const token = generateUUID('tok');
  const expiresAt = new Date(Date.now() + CONFIG.SESSION_TTL).toISOString();
  const now = new Date().toISOString();
  
  const sheet = getSheet(CONFIG.SHEETS.SESSIONS);
  sheet.appendRow([
    token,
    userId,
    expiresAt,
    now,
    true
  ]);
  
  return token;
}

function changePassword(token, payload) {
  const { old_password, new_password } = payload;
  
  if (!old_password || !new_password) {
    throw new Error('MISSING_FIELDS');
  }
  
  if (new_password.length < 8) {
    throw new Error('PASSWORD_TOO_SHORT');
  }
  
  const userId = validateToken(token);
  const user = getUserById(userId);
  if (!user) throw new Error('USER_NOT_FOUND');
  
  if (!verifyPassword(old_password, user.password_hash)) {
    throw new Error('INVALID_PASSWORD');
  }
  
  const newHash = hashPassword(new_password);
  const now = new Date().toISOString();
  
  updateRowByKey(CONFIG.SHEETS.USERS, 'user_id', userId, {
    password_hash: newHash,
    updated_at: now
  });
  
  AuditService.log(userId, 'change_password', userId, {});
  
  return {
    status: 'success',
    data: { success: true }
  };
}

function forgotPassword(payload) {
  const { email } = payload;
  if (!email) throw new Error('MISSING_FIELDS');
  
  const user = getUserByEmail(email);
  if (!user) {
    return {
      status: 'success',
      data: { success: true },
      message: 'Instruksi pemulihan telah dikirim jika email terdaftar'
    };
  }
  
  const tempPassword = generateUUID('tmp').substring(4, 12);
  const newHash = hashPassword(tempPassword);
  const now = new Date().toISOString();
  
  updateRowByKey(CONFIG.SHEETS.USERS, 'user_id', user.user_id, {
    password_hash: newHash,
    updated_at: now
  });
  
  try {
    MailApp.sendEmail({
      to: user.email,
      subject: `Reset Password — Aplikasi Baru Investment Dashboard`,
      body: `Halo ${user.name},\n\nKami telah menerima permintaan reset password untuk akun Anda.\n\nBerikut adalah password sementara Anda:\n${tempPassword}\n\nSilakan masuk menggunakan password ini lalu segera ganti password Anda melalui menu Pengaturan.\n\nHormat kami,\nTim Aplikasi Baru`
    });
  } catch (mailErr) {
    AuditService.logError(mailErr, 'Auth.forgotPassword.sendEmail');
    throw new Error('Gagal mengirim email reset password. Hubungi Admin.');
  }
  
  AuditService.log(user.user_id, 'forgot_password', user.user_id, { email: user.email });
  
  return {
    status: 'success',
    data: { success: true },
    message: 'Password sementara telah berhasil dikirim ke email Anda.'
  };
}
