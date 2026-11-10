const SPREADSHEET_ID = '1b8Xo-13Y7-fdrkx_z8R2hTkxQUR8u1ADM6ER0Vy1uRc';
const TEACHER_PIN = '122333';

const SHEETS = {
  activity: 'Aktivitas Terakhir',
  activityLog: 'Log Aktivitas',
  quizzes: 'Hasil Kuis',
  progress: 'Progres Tugas',
};

const HEADERS = {
  activity: ['Kunci Siswa', 'Nama', 'Kelas', 'Aktivitas Terakhir', 'Rute', 'Ringkasan Progres', 'Terakhir Aktif'],
  activityLog: ['Waktu', 'Nama', 'Kelas', 'Aktivitas', 'Rute', 'Ringkasan Progres'],
  quizzes: ['Waktu', 'Nama', 'Kelas', 'Kuis', 'Skor', 'Skor Maksimum', 'Nilai (%)'],
  progress: ['Kunci Siswa', 'Nama', 'Kelas', 'Tahap Selesai (JSON)', 'Terakhir Diperbarui'],
};

function doPost(event) {
  try {
    const data = JSON.parse(event.postData.contents || '{}');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (data.action === 'activity') {
        saveActivity(data);
      } else if (data.action === 'quiz') {
        saveQuiz(data);
      } else if (data.action === 'task-progress') {
        saveTaskProgress(data);
      } else {
        throw new Error('Jenis data tidak dikenal.');
      }
    } finally {
      lock.releaseLock();
    }
    return jsonOutput({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonOutput({ ok: false, error: String(error.message || error) });
  }
}

function doGet(event) {
  const callback = String((event.parameter && event.parameter.callback) || '');
  if (!/^atomikaSheets_[A-Za-z0-9_]+$/.test(callback)) {
    return jsonOutput({ ok: false, error: 'Callback dashboard tidak valid.' });
  }
  if (String((event.parameter && event.parameter.pin) || '') !== TEACHER_PIN) {
    return jsonpOutput(callback, { ok: false, error: 'PIN Guru Tidak Valid', activities: [], quizzes: [], progress: [] });
  }

  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const activities = readRows(spreadsheet, SHEETS.activity, HEADERS.activity)
      .map(function (row) {
        return {
          name: row[1],
          className: row[2],
          activity: row[3],
          path: row[4],
          progressSummary: row[5],
          lastSeen: isoTimestamp(row[6]),
        };
      })
      .filter(function (row) { return row.name; })
      .sort(function (a, b) { return String(b.lastSeen).localeCompare(String(a.lastSeen)); });

    const quizzes = readRows(spreadsheet, SHEETS.quizzes, HEADERS.quizzes)
      .map(function (row, index) {
        return {
          id: String(index),
          submittedAt: isoTimestamp(row[0]),
          name: row[1],
          className: row[2],
          quizTitle: row[3],
          score: Number(row[4]),
          maxScore: Number(row[5]),
          percent: Number(row[6]),
        };
      })
      .filter(function (row) { return row.name; })
      .sort(function (a, b) { return String(b.submittedAt).localeCompare(String(a.submittedAt)); });

    const progress = readRows(spreadsheet, SHEETS.progress, HEADERS.progress)
      .map(function (row) {
        let completedStages = [];
        try {
          completedStages = JSON.parse(String(row[3] || '[]'));
        } catch (error) {
          console.error(error);
        }
        return {
          name: row[1],
          className: row[2],
          completedStages: completedStages,
          updatedAt: isoTimestamp(row[4]),
        };
      })
      .filter(function (row) { return row.name; });

    return jsonpOutput(callback, { ok: true, activities: activities, quizzes: quizzes, progress: progress });
  } catch (error) {
    console.error(error);
    return jsonpOutput(callback, { ok: false, error: String(error.message || error), activities: [], quizzes: [], progress: [] });
  }
}

function saveTaskProgress(data) {
  const name = cleanText(data.name, 80);
  const className = cleanText(data.className, 40);
  if (!name || !className || !Array.isArray(data.completedStages)) {
    throw new Error('Data progres tugas tidak valid.');
  }
  const completedStages = data.completedStages
    .map(Number)
    .filter(function (stage) { return Number.isInteger(stage) && stage >= 0 && stage < 4; });
  const updatedAt = validTimestamp(data.updatedAt);
  const key = normalize(name) + '|' + normalize(className);
  const sheet = getSheet(SpreadsheetApp.openById(SPREADSHEET_ID), SHEETS.progress, HEADERS.progress);
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(function (row, index) {
    return index > 0 && String(row[0]) === key;
  });
  const row = [key, name, className, JSON.stringify(completedStages), updatedAt];
  if (rowIndex < 0) sheet.appendRow(row);
  else sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
}

function saveActivity(data) {
  const name = cleanText(data.name, 80);
  const className = cleanText(data.className, 40);
  if (!name || !className) throw new Error('Nama dan kelas wajib diisi.');
  const lastSeen = validTimestamp(data.lastSeen);
  const activity = cleanText(data.activity, 160);
  const path = cleanText(data.path, 200);
  const progressSummary = cleanText(data.progressSummary, 200);
  const key = normalize(name) + '|' + normalize(className);

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const roster = getSheet(spreadsheet, SHEETS.activity, HEADERS.activity);
  const values = roster.getDataRange().getValues();
  let rowIndex = values.findIndex(function (row, index) {
    return index > 0 && String(row[0]) === key;
  });
  const row = [key, name, className, activity, path, progressSummary, lastSeen];
  if (rowIndex < 0) {
    roster.appendRow(row);
  } else {
    roster.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
  }
  getSheet(spreadsheet, SHEETS.activityLog, HEADERS.activityLog)
    .appendRow([lastSeen, name, className, activity, path, progressSummary]);
}

function saveQuiz(data) {
  const name = cleanText(data.name, 80);
  const className = cleanText(data.className, 40);
  const quizTitle = cleanText(data.quizTitle, 120);
  const score = Number(data.score);
  const maxScore = Number(data.maxScore);
  if (!name || !className || !quizTitle || !Number.isInteger(score) || !Number.isInteger(maxScore) || maxScore < 1 || score < 0 || score > maxScore) {
    throw new Error('Data hasil kuis tidak valid.');
  }
  const submittedAt = validTimestamp(data.submittedAt);
  const percent = Math.round((score / maxScore) * 100);
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  getSheet(spreadsheet, SHEETS.quizzes, HEADERS.quizzes)
    .appendRow([submittedAt, name, className, quizTitle, score, maxScore, percent]);

  const key = normalize(name) + '|' + normalize(className);
  const roster = getSheet(spreadsheet, SHEETS.activity, HEADERS.activity);
  const values = roster.getDataRange().getValues();
  const rowIndex = values.findIndex(function (row, index) {
    return index > 0 && String(row[0]) === key;
  });
  if (rowIndex >= 0) {
    roster.getRange(rowIndex + 1, 4, 1, 4).setValues([[
      'Selesai kuis · ' + quizTitle + ' · nilai ' + score + '/' + maxScore,
      '/kelas',
      String(values[rowIndex][5] || ''),
      submittedAt,
    ]]);
  }
}

function getSheet(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function readRows(spreadsheet, name, headers) {
  const sheet = getSheet(spreadsheet, name, headers);
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
}

function cleanText(value, maxLength) {
  const text = String(value || '').replace(/[<>\u0000-\u001f]/g, ' ').trim().slice(0, maxLength);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function normalize(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function validTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function isoTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '');
  return date.toISOString();
}

function jsonOutput(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonpOutput(callback, value) {
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(value) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
