// InstrumentService.js

function getInstrumentById(instrumentId) {
  try {
    const result = findRowByKey(CONFIG.SHEETS.INSTRUMENTS, 'instrument_id', instrumentId);
    return result ? result.data : null;
  } catch (e) {
    return null;
  }
}

function getInstrumentByCode(code) {
  try {
    const result = findRowByKey(CONFIG.SHEETS.INSTRUMENTS, 'code', code.toUpperCase().trim());
    return result ? result.data : null;
  } catch (e) {
    return null;
  }
}

function listInstruments() {
  const sheet = getSheet(CONFIG.SHEETS.INSTRUMENTS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => rowToObject(headers, row));
}

function searchInstruments(payload) {
  const { query } = payload;
  const lowercaseQuery = query ? query.toLowerCase().trim() : '';
  const instruments = listInstruments();
  
  const filtered = instruments.filter(ins => {
    if (!ins.is_active) return false;
    return ins.code.toLowerCase().includes(lowercaseQuery) || 
           ins.name.toLowerCase().includes(lowercaseQuery);
  });
  
  return {
    status: 'success',
    data: filtered
  };
}

function addInstrument(payload) {
  const { code, name, category, exchange, currency, unit, price_source, last_price } = payload;
  
  if (!code || !name || !category || !currency || !unit || !price_source) {
    throw new Error('MISSING_FIELDS');
  }
  
  if (!['saham', 'emas', 'obligasi', 'deposito'].includes(category)) {
    throw new Error('INVALID_CATEGORY');
  }
  
  if (!['api_yahoo', 'api_gold', 'manual'].includes(price_source)) {
    throw new Error('INVALID_PRICE_SOURCE');
  }
  
  const upperCode = code.toUpperCase().trim();
  if (getInstrumentByCode(upperCode)) {
    throw new Error('INSTRUMENT_ALREADY_EXISTS');
  }
  
  const instrumentId = `ins_${upperCode}`;
  const now = new Date().toISOString();
  const initialPrice = parseFloat(last_price || '0');
  
  const sheet = getSheet(CONFIG.SHEETS.INSTRUMENTS);
  sheet.appendRow([
    instrumentId,
    upperCode,
    name.trim(),
    category,
    exchange || 'N/A',
    currency,
    unit,
    price_source,
    initialPrice,
    now,
    true,
    now
  ]);
  
  AuditService.log('system', 'add_instrument', instrumentId, { code: upperCode, name });
  
  return {
    status: 'success',
    data: { instrument_id: instrumentId }
  };
}

function editInstrument(payload) {
  const { instrument_id, name, category, exchange, currency, unit, price_source, last_price, is_active } = payload;
  
  if (!instrument_id) {
    throw new Error('MISSING_FIELDS');
  }
  
  const target = getInstrumentById(instrument_id);
  if (!target) {
    throw new Error('INSTRUMENT_NOT_FOUND');
  }
  
  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (category !== undefined) {
    if (!['saham', 'emas', 'obligasi', 'deposito'].includes(category)) throw new Error('INVALID_CATEGORY');
    updates.category = category;
  }
  if (exchange !== undefined) updates.exchange = exchange;
  if (currency !== undefined) updates.currency = currency;
  if (unit !== undefined) updates.unit = unit;
  if (price_source !== undefined) {
    if (!['api_yahoo', 'api_gold', 'manual'].includes(price_source)) throw new Error('INVALID_PRICE_SOURCE');
    updates.price_source = price_source;
  }
  if (last_price !== undefined) {
    updates.last_price = parseFloat(last_price);
    updates.last_price_updated = new Date().toISOString();
  }
  if (is_active !== undefined) updates.is_active = is_active;
  
  updateRowByKey(CONFIG.SHEETS.INSTRUMENTS, 'instrument_id', instrument_id, updates);
  
  AuditService.log('system', 'edit_instrument', instrument_id, updates);
  
  return {
    status: 'success',
    data: { success: true }
  };
}
