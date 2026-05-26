/**
 * B2B Survey Tool — Google Apps Script backend.
 *
 * Setup (see docs/SETUP.md):
 *  1. Create a Google Sheet, then Extensions > Apps Script, and paste this file.
 *  2. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 *  3. Copy the /exec URL into the frontend (VITE_APPS_SCRIPT_URL or src/config.ts).
 *  4. Project Settings > Script Properties, add a passcode per form:
 *       key:   passcode_<formId>      e.g.  passcode_b2bcab_vendor
 *       value: <your secret passcode>
 *
 * One Sheet tab per formId. Header row is created/extended automatically.
 */

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var formId = String(body.formId || '').trim();
    if (!formId) return textOut('error: missing formId');

    var answers = body.answers || {};
    var columns = body.columns && body.columns.length ? body.columns : Object.keys(answers);

    var sheet = getOrCreateSheet(formId);
    var header = ensureHeader_(sheet, columns);

    var row = header.map(function (col) {
      if (col === 'timestamp') return new Date();
      var v = answers[col];
      if (Array.isArray(v)) return v.join(' | ');
      return v === undefined || v === null ? '' : v;
    });
    sheet.appendRow(row);
    return textOut('ok');
  } catch (err) {
    return textOut('error: ' + err);
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var callback = String(p.callback || '').replace(/[^\w$.]/g, '');
  var mode = p.mode || 'aggregate';
  var formId = String(p.formId || '').trim();

  var expected = PropertiesService.getScriptProperties().getProperty('passcode_' + formId);
  if (!expected || String(p.passcode) !== String(expected)) {
    if (mode === 'export') return textOut('unauthorized');
    return reply_({ error: 'unauthorized' }, callback);
  }

  if (mode === 'export') return csvOut_(formId);
  return reply_(aggregate_(formId, p.fields || ''), callback);
}

function getOrCreateSheet(formId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(formId);
  if (!sheet) sheet = ss.insertSheet(formId);
  return sheet;
}

function ensureHeader_(sheet, columns) {
  var lastCol = sheet.getLastColumn();
  var header = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

  if (!header.length) {
    header = ['timestamp'].concat(columns);
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    sheet.setFrozenRows(1);
    return header;
  }

  var added = [];
  columns.forEach(function (c) {
    if (header.indexOf(c) === -1) added.push(c);
  });
  if (added.length) {
    header = header.concat(added);
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  }
  return header;
}

function aggregate_(formId, fieldsStr) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(formId);
  if (!sheet || sheet.getLastRow() < 2) {
    return { total: 0, lastResponse: null, questions: {} };
  }

  var values = sheet.getDataRange().getValues();
  var header = values[0];
  var rows = values.slice(1);

  var colIndex = {};
  header.forEach(function (h, i) {
    colIndex[h] = i;
  });

  var lastResponse = null;
  var tsIdx = colIndex['timestamp'];
  if (rows.length && tsIdx !== undefined) {
    var last = rows[rows.length - 1][tsIdx];
    lastResponse = last ? new Date(last).toISOString() : null;
  }

  var kinds = parseFields_(fieldsStr);
  var questions = {};

  Object.keys(kinds).forEach(function (id) {
    var idx = colIndex[id];
    if (idx === undefined) {
      questions[id] = { type: 'skip' };
      return;
    }
    var cells = rows.map(function (r) {
      return r[idx];
    });
    var kind = kinds[id];

    if (kind === 'x') {
      questions[id] = { type: 'skip' };
    } else if (kind === 'c') {
      var counts = {};
      cells.forEach(function (cell) {
        if (cell === '' || cell === null || cell === undefined) return;
        String(cell)
          .split('|')
          .forEach(function (part) {
            var v = part.trim();
            if (v) counts[v] = (counts[v] || 0) + 1;
          });
      });
      questions[id] = { type: 'choice', counts: counts };
    } else if (kind === 'n') {
      var nums = [];
      cells.forEach(function (cell) {
        if (cell === '' || cell === null || cell === undefined) return;
        var n = Number(String(cell).replace(/[, ]/g, ''));
        if (isFinite(n)) nums.push(n);
      });
      questions[id] = numberStats_(nums);
    } else {
      var responses = [];
      cells.forEach(function (cell) {
        if (cell === '' || cell === null || cell === undefined) return;
        responses.push(String(cell));
      });
      questions[id] = { type: 'text', count: responses.length, responses: responses };
    }
  });

  return { total: rows.length, lastResponse: lastResponse, questions: questions };
}

function numberStats_(nums) {
  if (!nums.length) return { type: 'number', count: 0, avg: 0, median: 0, min: 0, max: 0 };
  var sorted = nums.slice().sort(function (a, b) {
    return a - b;
  });
  var sum = nums.reduce(function (a, b) {
    return a + b;
  }, 0);
  var mid = Math.floor(sorted.length / 2);
  var median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return {
    type: 'number',
    count: nums.length,
    avg: Math.round((sum / nums.length) * 100) / 100,
    median: median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

function parseFields_(str) {
  var out = {};
  if (!str) return out;
  str.split(',').forEach(function (pair) {
    var idx = pair.lastIndexOf(':');
    if (idx === -1) return;
    var id = pair.slice(0, idx);
    if (id) out[id] = pair.slice(idx + 1);
  });
  return out;
}

function csvOut_(formId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(formId);
  var csv = '';
  if (sheet && sheet.getLastRow() > 0) {
    csv = sheet
      .getDataRange()
      .getValues()
      .map(function (row) {
        return row.map(csvCell_).join(',');
      })
      .join('\n');
  }
  return ContentService.createTextOutput(csv)
    .setMimeType(ContentService.MimeType.CSV)
    .downloadAsFile(formId + '-responses.csv');
}

function csvCell_(v) {
  if (v === null || v === undefined) return '';
  var s = v instanceof Date ? v.toISOString() : String(v);
  if (/[",\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function reply_(obj, callback) {
  var json = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ')').setMimeType(
      ContentService.MimeType.JAVASCRIPT,
    );
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function textOut(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT);
}
