function doGet() {
  return disabledResponse();
}

function doPost() {
  return disabledResponse();
}

function disabledResponse() {
  return ContentService.createTextOutput(JSON.stringify({
    ok: false,
    error: 'Integrasi Google Sheets dinonaktifkan. Gunakan Firebase dengan aturan akses server.',
  })).setMimeType(ContentService.MimeType.JSON);
}
