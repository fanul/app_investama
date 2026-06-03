// NewsService.js

function getOrCreateNewsSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEETS.NEWS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.NEWS);
    const headers = ['news_id', 'title', 'link', 'published_at', 'source', 'is_active', 'created_at'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#1a5e3f')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function syncNewsFromRSS() {
  try {
    const url = 'https://www.cnbcindonesia.com/investment/rss';
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) {
      throw new Error(`CNBC RSS returned status code ${response.getResponseCode()}`);
    }
    const xml = response.getContentText();
    const document = XmlService.parse(xml);
    const root = document.getRootElement();
    const channel = root.getChild('channel');
    if (!channel) throw new Error('NO_CHANNEL_FOUND');
    const items = channel.getChildren('item');
    
    const sheet = getOrCreateNewsSheet();
    const now = new Date().toISOString();
    
    // Ambil daftar link yang sudah ada agar tidak duplikat
    const lastRow = sheet.getLastRow();
    const existingLinks = new Set();
    if (lastRow > 1) {
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const linkIdx = headers.indexOf('link');
      for (let i = 1; i < data.length; i++) {
        existingLinks.add(data[i][linkIdx]);
      }
    }
    
    let addedCount = 0;
    // Lakukan perulangan terbalik (dari terlama) agar berita baru berada paling bawah
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const title = item.getChildText('title').trim();
      const link = item.getChildText('link').trim();
      const pubDateStr = item.getChildText('pubDate');
      
      let publishedAt = now;
      if (pubDateStr) {
        try {
          publishedAt = new Date(pubDateStr).toISOString();
        } catch (e) {
          // Jika gagal parsing, gunakan waktu saat ini
        }
      }
      
      if (!existingLinks.has(link)) {
        const newsId = generateUUID('news');
        sheet.appendRow([
          newsId,
          title,
          link,
          publishedAt,
          'CNBC Indonesia',
          true,
          now
        ]);
        existingLinks.add(link);
        addedCount++;
      }
    }
    
    // Perbarui waktu sinkronisasi terakhir di SystemConfig
    updateNewsSyncTime(now);
    
    return {
      status: 'success',
      data: {
        added_count: addedCount,
        message: `Berhasil sinkronisasi. ${addedCount} berita baru ditambahkan.`
      }
    };
  } catch (e) {
    Logger.log('Gagal sinkronisasi berita RSS CNBC: ' + e.message);
    return {
      status: 'error',
      message: 'Gagal mengambil berita RSS: ' + e.message
    };
  }
}

function updateNewsSyncTime(timeStr) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SYSTEM_CONFIG);
  if (!sheet) return;
  
  try {
    updateRowByKey(CONFIG.SHEETS.SYSTEM_CONFIG, 'config_key', 'LAST_NEWS_SYNC_TIME', {
      config_value: timeStr,
      updated_at: timeStr,
      updated_by: 'system'
    });
  } catch (e) {
    // Jika key belum terdaftar, append row baru
    sheet.appendRow([
      'LAST_NEWS_SYNC_TIME',
      timeStr,
      'Waktu terakhir sinkronisasi berita dari RSS',
      timeStr,
      'system'
    ]);
  }
}

function getNewsForTicker() {
  // Cek apakah perlu auto-sync (hanya jika belum sinkronisasi HARI INI)
  const lastSyncStr = getConfigValue('LAST_NEWS_SYNC_TIME');
  let needsSync = !lastSyncStr;
  
  if (lastSyncStr) {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const lastSyncDate = lastSyncStr.split('T')[0];
      if (todayDate !== lastSyncDate) {
        needsSync = true;
      }
    } catch (e) {
      needsSync = true;
    }
  }
  
  if (needsSync) {
    try {
      syncNewsFromRSS();
    } catch (e) {
      Logger.log('Auto-sync gagal: ' + e.message);
    }
  }
  
  const sheet = getOrCreateNewsSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { status: 'success', data: [] };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  const news = rows.map(r => rowToObject(headers, r));
  
  // Ambil parameter konfigurasi limit & hari
  const maxDisplayedStr = getConfigValue('NEWS_MAX_DISPLAYED') || '10';
  const daysLimitStr = getConfigValue('NEWS_DAYS_LIMIT') || '3';
  
  const maxDisplayed = parseInt(maxDisplayedStr) || 10;
  const daysLimit = parseInt(daysLimitStr) || 3;
  
  // Filter hanya berita aktif dan berumur kurang dari daysLimit hari
  const cutoffMs = Date.now() - (daysLimit * 24 * 60 * 60 * 1000);
  
  const activeNews = news.filter(n => {
    const isActive = String(n.is_active) === 'true' || n.is_active === true;
    if (!isActive) return false;
    
    try {
      const pubTime = new Date(n.published_at).getTime();
      return pubTime >= cutoffMs;
    } catch (e) {
      return true;
    }
  });
  
  // Urutkan descending berdasarkan tanggal publikasi
  activeNews.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  
  return {
    status: 'success',
    data: activeNews.slice(0, maxDisplayed)
  };
}

function listAllNews() {
  const sheet = getOrCreateNewsSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { status: 'success', data: [] };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  const news = rows.map(r => rowToObject(headers, r));
  
  // Urutkan berita terbaru di atas untuk keperluan manajemen admin
  news.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  
  return {
    status: 'success',
    data: news
  };
}

function toggleNewsActive(payload) {
  const { news_id, is_active } = payload;
  if (!news_id || is_active === undefined) {
    throw new Error('MISSING_FIELDS');
  }
  
  const sheetName = CONFIG.SHEETS.NEWS;
  updateRowByKey(sheetName, 'news_id', news_id, {
    is_active: is_active
  });
  
  AuditService.log('system', 'toggle_news_active', news_id, { is_active });
  
  return {
    status: 'success',
    data: { success: true }
  };
}
