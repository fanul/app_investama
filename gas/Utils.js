// Utils.js

function generateUUID(prefix) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix ? `${prefix}_` : '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function hashPassword(password) {
  if (!password) return '';
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function verifyPassword(plain, hash) {
  return hashPassword(plain) === hash;
}

function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

function checkRateLimit(identifier, maxCalls, windowSeconds) {
  const cache = CacheService.getScriptCache();
  const key = `rl_${identifier}`;
  const current = parseInt(cache.get(key) || '0');
  if (current >= maxCalls) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
  cache.put(key, String(current + 1), windowSeconds);
}
