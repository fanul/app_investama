// SheetHelper.js

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`SHEET_NOT_FOUND: Sheet "${sheetName}" tidak ditemukan`);
  }
  return sheet;
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = row[i];
  });
  return obj;
}

function findRowByKey(sheetName, keyColumn, keyValue) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIdx = headers.indexOf(keyColumn);
  if (keyIdx === -1) {
    throw new Error(`COLUMN_NOT_FOUND: Kolom "${keyColumn}" tidak ditemukan di sheet "${sheetName}"`);
  }
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyIdx] === keyValue) {
      return {
        rowIndex: i + 1,
        data: rowToObject(headers, data[i])
      };
    }
  }
  return null;
}

function updateRowByKey(sheetName, keyColumn, keyValue, updates) {
  const result = findRowByKey(sheetName, keyColumn, keyValue);
  if (!result) {
    throw new Error(`ROW_NOT_FOUND: Row dengan ${keyColumn} = "${keyValue}" tidak ditemukan di sheet "${sheetName}"`);
  }
  
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  Object.entries(updates).forEach(([key, val]) => {
    const colIdx = headers.indexOf(key);
    if (colIdx >= 0) {
      sheet.getRange(result.rowIndex, colIdx + 1).setValue(val);
    }
  });
}

function deleteRowByKey(sheetName, keyColumn, keyValue) {
  const result = findRowByKey(sheetName, keyColumn, keyValue);
  if (!result) {
    throw new Error(`ROW_NOT_FOUND: Row dengan ${keyColumn} = "${keyValue}" tidak ditemukan di sheet "${sheetName}"`);
  }
  getSheet(sheetName).deleteRow(result.rowIndex);
}
