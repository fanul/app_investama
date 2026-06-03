// TransactionService.js

function listTransactions(userId) {
  const sheet = getSheet(CONFIG.SHEETS.TRANSACTIONS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const instrumentsMap = {};
  listInstruments().forEach(ins => {
    instrumentsMap[ins.instrument_id] = ins;
  });
  
  return rows
    .filter(row => row[1] === userId)
    .map(row => {
      const tx = rowToObject(headers, row);
      const ins = instrumentsMap[tx.instrument_id] || {};
      tx.instrument_code = ins.code || '';
      tx.instrument_name = ins.name || '';
      tx.category = ins.category || '';
      tx.currency = ins.currency || 'IDR';
      tx.unit = ins.unit || '';
      return tx;
    });
}

function getTransaction(userId, txId) {
  const result = findRowByKey(CONFIG.SHEETS.TRANSACTIONS, 'tx_id', txId);
  if (!result) throw new Error('TX_NOT_FOUND');
  if (result.data.user_id !== userId) throw new Error('UNAUTHORIZED_TX_ACCESS');
  
  const ins = getInstrumentById(result.data.instrument_id) || {};
  result.data.instrument_code = ins.code || '';
  result.data.instrument_name = ins.name || '';
  result.data.category = ins.category || '';
  result.data.currency = ins.currency || 'IDR';
  result.data.unit = ins.unit || '';
  
  return result.data;
}

function addTransaction(userId, payload) {
  const { instrument_id, tx_type, tx_date, quantity, price_per_unit, fee, notes, receipt_url } = payload;
  
  if (!instrument_id || !tx_type || !tx_date || quantity === undefined || price_per_unit === undefined) {
    throw new Error('MISSING_FIELDS');
  }
  
  if (!['buy', 'sell'].includes(tx_type)) {
    throw new Error('INVALID_TX_TYPE');
  }
  
  const qNum = parseFloat(quantity);
  const pNum = parseFloat(price_per_unit);
  const fNum = parseFloat(fee || 0);
  
  if (qNum <= 0) throw new Error('QUANTITY_MUST_BE_POSITIVE');
  if (pNum <= 0) throw new Error('PRICE_MUST_BE_POSITIVE');
  if (fNum < 0) throw new Error('FEE_CANNOT_BE_NEGATIVE');
  
  const instrument = getInstrumentById(instrument_id);
  if (!instrument) {
    throw new Error('INSTRUMENT_NOT_FOUND');
  }
  
  if (tx_type === 'sell') {
    const activeSummary = calculatePortfolioSummary(listTransactions(userId), getActivePricesMap());
    const matchedIns = activeSummary.instruments.find(i => i.instrument_id === instrument_id);
    const currentHolding = matchedIns ? matchedIns.net_quantity : 0;
    if (qNum > currentHolding) {
      throw new Error(`INSUFFICIENT_HOLDINGS: Kepemilikan Anda saat ini ${currentHolding} ${instrument.unit}, tidak cukup untuk menjual ${qNum}`);
    }
  }
  
  const txId = generateUUID('tx');
  const totalValue = qNum * pNum;
  const now = new Date().toISOString();
  
  const sheet = getSheet(CONFIG.SHEETS.TRANSACTIONS);
  sheet.appendRow([
    txId,
    userId,
    instrument_id,
    tx_type,
    tx_date,
    qNum,
    pNum,
    totalValue,
    fNum,
    notes ? notes.substring(0, 500) : '',
    receipt_url || '',
    now,
    now
  ]);
  
  AuditService.log(userId, 'add_tx', txId, { instrument_id, tx_type, quantity: qNum, price_per_unit: pNum });
  return {
    status: 'success',
    data: { tx_id: txId }
  };
}

function editTransaction(userId, payload) {
  const { tx_id, instrument_id, tx_type, tx_date, quantity, price_per_unit, fee, notes, receipt_url } = payload;
  
  if (!tx_id) throw new Error('MISSING_FIELDS');
  
  const target = getTransaction(userId, tx_id);
  
  const updates = {};
  if (instrument_id !== undefined) {
    if (!getInstrumentById(instrument_id)) throw new Error('INSTRUMENT_NOT_FOUND');
    updates.instrument_id = instrument_id;
  }
  if (tx_type !== undefined) {
    if (!['buy', 'sell'].includes(tx_type)) throw new Error('INVALID_TX_TYPE');
    updates.tx_type = tx_type;
  }
  if (tx_date !== undefined) updates.tx_date = tx_date;
  
  let finalQty = quantity !== undefined ? parseFloat(quantity) : target.quantity;
  let finalPrice = price_per_unit !== undefined ? parseFloat(price_per_unit) : target.price_per_unit;
  let finalFee = fee !== undefined ? parseFloat(fee) : target.fee;
  
  if (finalQty <= 0) throw new Error('QUANTITY_MUST_BE_POSITIVE');
  if (finalPrice <= 0) throw new Error('PRICE_MUST_BE_POSITIVE');
  if (finalFee < 0) throw new Error('FEE_CANNOT_BE_NEGATIVE');
  
  updates.quantity = finalQty;
  updates.price_per_unit = finalPrice;
  updates.fee = finalFee;
  updates.total_value = finalQty * finalPrice;
  
  if (notes !== undefined) updates.notes = notes.substring(0, 500);
  if (receipt_url !== undefined) updates.receipt_url = receipt_url;
  updates.updated_at = new Date().toISOString();
  
  if (updates.tx_type === 'sell' || (target.tx_type === 'sell' && updates.quantity > target.quantity) || (updates.instrument_id && updates.instrument_id !== target.instrument_id)) {
    const otherTxs = listTransactions(userId).filter(t => t.tx_id !== tx_id);
    const activeSummary = calculatePortfolioSummary(otherTxs, getActivePricesMap());
    const targetInsId = updates.instrument_id || target.instrument_id;
    const matchedIns = activeSummary.instruments.find(i => i.instrument_id === targetInsId);
    const currentHolding = matchedIns ? matchedIns.net_quantity : 0;
    
    const requestedSellQty = updates.tx_type === 'sell' ? updates.quantity : 0;
    if (requestedSellQty > currentHolding) {
      const ins = getInstrumentById(targetInsId);
      throw new Error(`INSUFFICIENT_HOLDINGS: Kepemilikan Anda saat ini (tidak termasuk tx ini) ${currentHolding} ${ins.unit}, tidak cukup untuk menjual ${requestedSellQty}`);
    }
  }
  
  updateRowByKey(CONFIG.SHEETS.TRANSACTIONS, 'tx_id', tx_id, updates);
  
  AuditService.log(userId, 'edit_tx', tx_id, updates);
  
  return {
    status: 'success',
    data: { success: true }
  };
}

function deleteTransaction(userId, payload) {
  const { tx_id } = payload;
  if (!tx_id) throw new Error('MISSING_FIELDS');
  
  const target = getTransaction(userId, tx_id);
  
  if (target.tx_type === 'buy') {
    const otherTxs = listTransactions(userId).filter(t => t.tx_id !== tx_id);
    const activeSummary = calculatePortfolioSummary(otherTxs, getActivePricesMap());
    const matchedIns = activeSummary.instruments.find(i => i.instrument_id === target.instrument_id);
    const netHoldingAfterDelete = matchedIns ? matchedIns.net_quantity : 0;
    if (netHoldingAfterDelete < 0) {
      throw new Error(`INSUFFICIENT_HOLDINGS: Menghapus transaksi pembelian ini akan menyebabkan total kepemilikan instrumen menjadi negatif (${netHoldingAfterDelete}). Hapus transaksi penjualan terlebih dahulu.`);
    }
  }
  
  deleteRowByKey(CONFIG.SHEETS.TRANSACTIONS, 'tx_id', tx_id);
  
  AuditService.log(userId, 'delete_tx', tx_id, { code: target.instrument_code, type: target.tx_type });
  
  return {
    status: 'success',
    data: { success: true }
  };
}

function getSummary(userId) {
  const txs = listTransactions(userId);
  const pricesMap = getActivePricesMap();
  const summary = calculatePortfolioSummary(txs, pricesMap);
  
  return {
    status: 'success',
    data: summary
  };
}

function getActivePricesMap() {
  const prices = {};
  listInstruments().forEach(ins => {
    if (ins.is_active) {
      prices[ins.instrument_id] = ins.last_price || 0;
    }
  });
  return prices;
}

function calculatePortfolioSummary(transactions, currentPrices) {
  const byInstrument = {};
  
  const sortedTxs = [...transactions].sort((a, b) => new Date(a.tx_date) - new Date(b.tx_date));
  
  sortedTxs.forEach(tx => {
    if (!byInstrument[tx.instrument_id]) {
      byInstrument[tx.instrument_id] = { buys: [], sells: [], details: null };
    }
    if (tx.tx_type === 'buy') {
      byInstrument[tx.instrument_id].buys.push(tx);
    } else {
      byInstrument[tx.instrument_id].sells.push(tx);
    }
  });
  
  let totalModal = 0;
  let totalCurrentValue = 0;
  const instrumentSummaries = [];
  
  const instrumentsMap = {};
  listInstruments().forEach(ins => {
    instrumentsMap[ins.instrument_id] = ins;
  });
  
  Object.entries(byInstrument).forEach(([instrumentId, { buys, sells }]) => {
    const insInfo = instrumentsMap[instrumentId] || {};
    
    const totalBuyQty = buys.reduce((s, t) => s + parseFloat(t.quantity), 0);
    const totalSellQty = sells.reduce((s, t) => s + parseFloat(t.quantity), 0);
    const netQty = totalBuyQty - totalSellQty;
    
    if (netQty <= 0) return;
    
    const totalBuyValueWithFee = buys.reduce((s, t) => s + parseFloat(t.total_value) + parseFloat(t.fee), 0);
    const avgBuyPrice = totalBuyQty > 0 ? totalBuyValueWithFee / totalBuyQty : 0;
    const modalNet = avgBuyPrice * netQty;
    
    const currentPrice = currentPrices[instrumentId] !== undefined ? currentPrices[instrumentId] : (insInfo.last_price || 0);
    const currentValue = currentPrice * netQty;
    
    const pnlAmount = currentValue - modalNet;
    const pnlPercent = modalNet > 0 ? (pnlAmount / modalNet) * 100 : 0;
    
    totalModal += modalNet;
    totalCurrentValue += currentValue;
    
    instrumentSummaries.push({
      instrument_id: instrumentId,
      code: insInfo.code || '',
      name: insInfo.name || '',
      category: insInfo.category || '',
      currency: insInfo.currency || 'IDR',
      unit: insInfo.unit || '',
      net_quantity: netQty,
      avg_buy_price: avgBuyPrice,
      current_price: currentPrice,
      modal: modalNet,
      current_value: currentValue,
      pnl_amount: pnlAmount,
      pnl_percent: pnlPercent
    });
  });
  
  const totalPnl = totalCurrentValue - totalModal;
  const totalPnlPercent = totalModal > 0 ? (totalPnl / totalModal) * 100 : 0;
  
  const byCategory = {};
  instrumentSummaries.forEach(ins => {
    if (!byCategory[ins.category]) {
      byCategory[ins.category] = {
        category: ins.category,
        modal: 0,
        current_value: 0,
        pnl_amount: 0,
        pnl_percent: 0,
        instruments: []
      };
    }
    const cat = byCategory[ins.category];
    cat.modal += ins.modal;
    cat.current_value += ins.current_value;
    cat.pnl_amount += ins.pnl_amount;
    cat.instruments.push(ins);
  });
  
  Object.values(byCategory).forEach(cat => {
    cat.pnl_percent = cat.modal > 0 ? (cat.pnl_amount / cat.modal) * 100 : 0;
  });
  
  return {
    total_modal: totalModal,
    total_current_value: totalCurrentValue,
    total_pnl: totalPnl,
    total_pnl_percent: totalPnlPercent,
    instruments: instrumentSummaries,
    by_category: byCategory
  };
}
