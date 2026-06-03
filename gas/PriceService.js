// PriceService.js

function getAllPrices() {
  const instruments = listInstruments().filter(i => i.is_active);
  const result = { saham: [], emas: {}, obligasi: [], deposito: [] };
  
  instruments.forEach(ins => {
    const currentPrice = getCachedPrice(ins.instrument_id) || fetchFreshPrice(ins);
    
    const enriched = {
      ...ins,
      current_price: currentPrice
    };
    
    switch(ins.category) {
      case 'saham':    result.saham.push(enriched); break;
      case 'emas':     result.emas = enriched; break;
      case 'obligasi': result.obligasi.push(enriched); break;
      case 'deposito': result.deposito.push(enriched); break;
    }
  });
  
  // Batasi jumlah yang ditampilkan berdasarkan konfigurasi jika ada
  const maxDisplayedStr = getConfigValue('MAX_PRICES_DISPLAYED');
  if (maxDisplayedStr) {
    const maxDisplayed = parseInt(maxDisplayedStr);
    if (!isNaN(maxDisplayed) && maxDisplayed > 0) {
      result.saham = result.saham.slice(0, maxDisplayed);
      result.obligasi = result.obligasi.slice(0, maxDisplayed);
      result.deposito = result.deposito.slice(0, maxDisplayed);
    }
  }
  
  return {
    status: 'success',
    data: result
  };
}

function fetchFreshPrice(instrument) {
  try {
    switch(instrument.price_source) {
      case 'api_yahoo':
        return fetchYahooPrice(instrument.code);
      case 'api_gold':
        return fetchGoldPrice();
      case 'manual':
      default:
        return parseFloat(instrument.last_price || 0);
    }
  } catch(e) {
    AuditService.logError(e, `PriceService.fetchFreshPrice: Gagal mengambil harga untuk ${instrument.code}. Fallback ke last_price.`);
    return parseFloat(instrument.last_price || 0);
  }
}

function fetchYahooPrice(code) {
  const ticker = code.toUpperCase().endsWith('.JK') || code.includes('^') || code.length > 5
    ? code.toUpperCase() 
    : `${code.toUpperCase()}.JK`;
    
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
  
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const responseCode = response.getResponseCode();
  
  if (responseCode !== 200) {
    throw new Error(`Yahoo Finance API returned status code ${responseCode}`);
  }
  
  const json = JSON.parse(response.getContentText());
  if (!json.chart || !json.chart.result || json.chart.result.length === 0) {
    throw new Error(`Invalid response format from Yahoo Finance for ticker ${ticker}`);
  }
  
  const price = json.chart.result[0].meta.regularMarketPrice;
  if (price === undefined || price === null) {
    throw new Error(`Market price not found in Yahoo Finance response for ticker ${ticker}`);
  }
  
  CacheService.getScriptCache().put(`price_ins_${code.toUpperCase()}`, String(price), 900);
  updateInstrumentLastPrice(code, price);
  return price;
}

function fetchGoldPrice() {
  let apiKey = PropertiesService.getScriptProperties().getProperty('GOLD_API_KEY') || getConfigValue('GOLD_API_KEY');
  
  if (!apiKey) {
    return parseFloat(getConfigValue('GOLD_MANUAL_PRICE') || 1320000);
  }
  
  const url = 'https://www.goldapi.io/api/XAU/IDR';
  const response = UrlFetchApp.fetch(url, {
    headers: { 'x-access-token': apiKey },
    muteHttpExceptions: true
  });
  
  if (response.getResponseCode() !== 200) {
    Logger.log('Gold API failed. Fallback to manual price config.');
    return parseFloat(getConfigValue('GOLD_MANUAL_PRICE') || 1320000);
  }
  
  const json = JSON.parse(response.getContentText());
  const troyOzToGram = 31.1034768;
  const pricePerGram = json.price / troyOzToGram;
  
  CacheService.getScriptCache().put('price_ins_EMAS', String(pricePerGram), 900);
  updateInstrumentLastPrice('EMAS', pricePerGram);
  recordPriceHistory('ins_EMAS', pricePerGram, 'goldapi');
  return pricePerGram;
}

function getCachedPrice(instrumentId) {
  const cached = CacheService.getScriptCache().get(`price_${instrumentId}`);
  return cached ? parseFloat(cached) : null;
}

function updateInstrumentLastPrice(code, price) {
  try {
    const now = new Date().toISOString();
    const instId = code.toUpperCase() === 'EMAS' ? 'ins_EMAS' : `ins_${code.toUpperCase()}`;
    
    updateRowByKey(CONFIG.SHEETS.INSTRUMENTS, 'instrument_id', instId, {
      last_price: price,
      last_price_updated: now
    });
  } catch (e) {
    Logger.log(`Gagal update last_price untuk ${code}: ${e.message}`);
  }
}

function recordPriceHistory(instrumentId, price, source) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.PRICE_HISTORY);
    const historyId = generateUUID('hist');
    const now = new Date().toISOString();
    const todayDate = now.split('T')[0];
    
    sheet.appendRow([
      historyId,
      instrumentId,
      price,
      todayDate,
      source,
      now
    ]);
  } catch (e) {
    Logger.log(`Gagal mencatat PriceHistory untuk ${instrumentId}: ${e.message}`);
  }
}

function manualUpdatePrice(payload) {
  const { instrument_id, price } = payload;
  
  if (!instrument_id || price === undefined) {
    throw new Error('MISSING_FIELDS');
  }
  
  const ins = getInstrumentById(instrument_id);
  if (!ins) {
    throw new Error('INSTRUMENT_NOT_FOUND');
  }
  
  const priceNum = parseFloat(price);
  if (priceNum < 0) {
    throw new Error('PRICE_CANNOT_BE_NEGATIVE');
  }
  
  const now = new Date().toISOString();
  
  updateRowByKey(CONFIG.SHEETS.INSTRUMENTS, 'instrument_id', instrument_id, {
    last_price: priceNum,
    last_price_updated: now
  });
  
  CacheService.getScriptCache().remove(`price_${instrument_id}`);
  recordPriceHistory(instrument_id, priceNum, 'manual');
  AuditService.log('system', 'manual_update_price', instrument_id, { price: priceNum });
  
  return {
    status: 'success',
    data: { success: true }
  };
}

function refreshPrice(payload) {
  const { instrument_id } = payload;
  if (!instrument_id) throw new Error('MISSING_FIELDS');
  
  const ins = getInstrumentById(instrument_id);
  if (!ins) throw new Error('INSTRUMENT_NOT_FOUND');
  
  CacheService.getScriptCache().remove(`price_${instrument_id}`);
  const freshPrice = fetchFreshPrice(ins);
  
  return {
    status: 'success',
    data: {
      price: freshPrice,
      updated_at: new Date().toISOString()
    }
  };
}
