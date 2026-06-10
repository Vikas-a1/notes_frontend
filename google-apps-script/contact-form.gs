/**
 * Google Apps Script — Contact Form → Google Sheet
 *
 * Setup (sign in as vv763083@gmail.com):
 * 1. Create a new Google Sheet and add header row:
 *    Timestamp | Name | Email | Phone | Subject | Message
 * 2. Extensions → Apps Script → paste this file → Save
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Set GOOGLE_SCRIPT_URL as a Cloudflare Worker secret (runtime, not build)
 */

const SHEET_NAME = "Contacts";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getContactSheet_();
    sheet.appendRow([
      new Date(),
      data.name || "",
      data.email || "",
      data.phone || "",
      data.subject || "",
      data.message || "",
    ]);

    return jsonResponse_({ success: true });
  } catch (err) {
    return jsonResponse_({ success: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const params = e.parameter || {};
    if (params.name || params.email || params.message) {
      const sheet = getContactSheet_();
      sheet.appendRow([
        new Date(),
        params.name || "",
        params.email || "",
        params.phone || "",
        params.subject || "",
        params.message || "",
      ]);
      return jsonResponse_({ success: true });
    }

    return jsonResponse_({ success: true, message: "Contact form endpoint is active." });
  } catch (err) {
    return jsonResponse_({ success: false, error: err.message });
  }
}

function getContactSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "Subject", "Message"]);
    sheet.getRange("1:1").setFontWeight("bold");
  }
  return sheet;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
