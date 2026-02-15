/**
 * GroupLead → Mitlabtim Auto-Sync
 *
 * Google Apps Script for the GroupLead spreadsheet.
 * Syncs new Facebook group members to the Mitlabtim import API.
 *
 * SETUP:
 * 1. Open your GroupLead spreadsheet
 * 2. Extensions → Apps Script
 * 3. Paste this entire file
 * 4. Set your API token in Script Properties:
 *    - Click ⚙️ Project Settings → Script Properties
 *    - Add: MITLABTIM_API_TOKEN = (your ADMIN_API_TOKEN value)
 *    - Add: MITLABTIM_API_URL = https://mitlabtim.co.il
 * 5. Run → syncNewLeads (first time: authorize permissions)
 * 6. Set up a trigger: Triggers → Add → syncNewLeads → Time-driven → Every hour
 *
 * HOW IT WORKS:
 * - Adds a "Synced" column (U) to track which rows were already sent
 * - Only sends rows where "Synced" is empty
 * - Marks rows with timestamp after successful sync
 * - Dedup happens both here (skip already synced) and server-side (skip existing emails)
 * - Parses Q&A columns to extract interests
 */

// === CONFIG ===
const CONFIG = {
  SHEET_NAME: 'Sheet1',        // Change if your sheet tab has a different name
  SYNCED_COL: 21,              // Column U (21st) — "Synced" status
  SYNCED_HEADER: 'Synced',
  BATCH_SIZE: 100,             // Send max 100 rows per API call
  // Column indices (1-based)
  COL: {
    GROUP_NAME: 1,
    USER_ID: 2,                // FB profile URL
    FULL_NAME: 3,
    FIRST_NAME: 4,
    LAST_NAME: 5,
    JOINED_FB: 6,
    Q1: 7, A1: 8,
    Q2: 9, A2: 10,
    Q3: 11, A3: 12,
    DATE_ADDED: 13,
    LOCATION: 14,
    PLACE_OF_WORK: 15,
    INVITED_BY: 16,
    DATE_INVITED: 17,
    GROUPS_IN_COMMON: 18,
    ACCEPTED_BY: 19,
  }
};

/**
 * Main sync function — call this manually or via trigger.
 */
function syncNewLeads() {
  const props = PropertiesService.getScriptProperties();
  const apiToken = props.getProperty('MITLABTIM_API_TOKEN');
  const apiUrl = props.getProperty('MITLABTIM_API_URL') || 'https://mitlabtim.co.il';

  if (!apiToken) {
    throw new Error('Missing MITLABTIM_API_TOKEN in Script Properties. Go to ⚙️ Project Settings → Script Properties.');
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    // Try first sheet if name doesn't match
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    var activeSheet = ss.getSheets()[0];
  } else {
    var activeSheet = sheet;
  }

  // Ensure "Synced" header exists
  ensureSyncedColumn(activeSheet);

  const data = activeSheet.getDataRange().getValues();
  const headers = data[0];

  // Find unsynced rows
  const unsyncedRows = [];
  const unsyncedIndices = []; // spreadsheet row numbers (1-based)

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const syncedValue = row[CONFIG.SYNCED_COL - 1]; // 0-based

    // Skip if already synced or empty row
    if (syncedValue) continue;
    if (!row[CONFIG.COL.FULL_NAME - 1] && !row[CONFIG.COL.USER_ID - 1]) continue;

    const lead = parseRow(row);
    if (lead) {
      unsyncedRows.push(lead);
      unsyncedIndices.push(i + 1); // 1-based row number
    }
  }

  if (unsyncedRows.length === 0) {
    Logger.log('No new leads to sync.');
    return;
  }

  Logger.log(`Found ${unsyncedRows.length} new leads to sync.`);

  // Send in batches
  let totalImported = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (let batchStart = 0; batchStart < unsyncedRows.length; batchStart += CONFIG.BATCH_SIZE) {
    const batch = unsyncedRows.slice(batchStart, batchStart + CONFIG.BATCH_SIZE);
    const batchIndices = unsyncedIndices.slice(batchStart, batchStart + CONFIG.BATCH_SIZE);
    const batchId = `grouplead_${Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyyMMdd_HHmm')}_${batchStart}`;

    try {
      const response = UrlFetchApp.fetch(`${apiUrl}/api/import-leads`, {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
        payload: JSON.stringify({
          leads: batch,
          batch_id: batchId,
          source: 'grouplead_facebook',
        }),
        muteHttpExceptions: true,
      });

      const status = response.getResponseCode();
      const result = JSON.parse(response.getContentText());

      if (status === 200) {
        Logger.log(`Batch synced: ${result.imported} imported, ${result.skipped} skipped, ${result.linked} linked`);
        totalImported += result.imported;
        totalSkipped += result.skipped;
        totalErrors += result.errors;

        // Mark all rows in this batch as synced
        const timestamp = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'dd/MM/yyyy HH:mm');
        batchIndices.forEach(rowNum => {
          activeSheet.getRange(rowNum, CONFIG.SYNCED_COL).setValue(timestamp);
        });
      } else {
        Logger.log(`API error (${status}): ${result.error || 'Unknown error'}`);
        totalErrors += batch.length;
      }
    } catch (e) {
      Logger.log(`Network error: ${e.message}`);
      totalErrors += batch.length;
    }

    // Small delay between batches to avoid rate limiting
    if (batchStart + CONFIG.BATCH_SIZE < unsyncedRows.length) {
      Utilities.sleep(1000);
    }
  }

  // Summary
  const summary = `Sync complete: ${totalImported} imported, ${totalSkipped} skipped, ${totalErrors} errors (out of ${unsyncedRows.length} total)`;
  Logger.log(summary);

  // Optional: Send summary to sheet owner
  SpreadsheetApp.getActiveSpreadsheet().toast(summary, 'GroupLead Sync', 10);
}

/**
 * Parse a spreadsheet row into a lead object for the API.
 */
function parseRow(row) {
  const fullName = String(row[CONFIG.COL.FULL_NAME - 1] || '').trim();
  if (!fullName) return null;

  // Extract interests from Q&A
  const interests = [];
  const answers = [
    String(row[CONFIG.COL.A1 - 1] || ''),
    String(row[CONFIG.COL.A2 - 1] || ''),
    String(row[CONFIG.COL.A3 - 1] || ''),
  ].filter(a => a.trim());

  // Parse Hebrew interest keywords from answers
  answers.forEach(answer => {
    const lower = answer.toLowerCase();
    if (lower.includes('פסיכולוגיה') || lower.includes('psychology')) interests.push('psychology');
    if (lower.includes('מדעי המחשב') || lower.includes('הנדסת תוכנה') || lower.includes('computer') || lower.includes('cs')) interests.push('cs');
    if (lower.includes('משפטים') || lower.includes('law')) interests.push('law');
    if (lower.includes('הנדס') || lower.includes('engineering')) interests.push('engineering');
    if (lower.includes('עסקים') || lower.includes('מנהל') || lower.includes('business')) interests.push('business');
    if (lower.includes('רפואה') || lower.includes('medicine') || lower.includes('med')) interests.push('medicine');
    if (lower.includes('לא יודע') || lower.includes('מתלבט') || lower.includes('don\'t know')) interests.push('undecided');
    if (lower.includes('חינוך') || lower.includes('education') || lower.includes('הוראה')) interests.push('education');
    if (lower.includes('תקשורת') || lower.includes('communication')) interests.push('communication');
    if (lower.includes('עיצוב') || lower.includes('design') || lower.includes('אדריכלות')) interests.push('design');
  });

  return {
    name: fullName,
    interests: [...new Set(interests)], // dedupe
    source_group: String(row[CONFIG.COL.GROUP_NAME - 1] || 'מתלבטים בלימודים'),
    raw: {
      fb_user_id: String(row[CONFIG.COL.USER_ID - 1] || ''),
      first_name: String(row[CONFIG.COL.FIRST_NAME - 1] || ''),
      last_name: String(row[CONFIG.COL.LAST_NAME - 1] || ''),
      date_added: String(row[CONFIG.COL.DATE_ADDED - 1] || ''),
      location: String(row[CONFIG.COL.LOCATION - 1] || ''),
      place_of_work: String(row[CONFIG.COL.PLACE_OF_WORK - 1] || ''),
      groups_in_common: String(row[CONFIG.COL.GROUPS_IN_COMMON - 1] || ''),
      accepted_by: String(row[CONFIG.COL.ACCEPTED_BY - 1] || ''),
      q1: String(row[CONFIG.COL.Q1 - 1] || ''),
      a1: String(row[CONFIG.COL.A1 - 1] || ''),
      q2: String(row[CONFIG.COL.Q2 - 1] || ''),
      a2: String(row[CONFIG.COL.A2 - 1] || ''),
      q3: String(row[CONFIG.COL.Q3 - 1] || ''),
      a3: String(row[CONFIG.COL.A3 - 1] || ''),
    },
  };
}

/**
 * Ensure the "Synced" column header exists.
 */
function ensureSyncedColumn(sheet) {
  const headerRow = sheet.getRange(1, 1, 1, CONFIG.SYNCED_COL).getValues()[0];
  if (!headerRow[CONFIG.SYNCED_COL - 1]) {
    sheet.getRange(1, CONFIG.SYNCED_COL).setValue(CONFIG.SYNCED_HEADER);
  }
}

/**
 * Menu item — adds a "Mitlabtim" menu to the spreadsheet.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Mitlabtim')
    .addItem('Sync New Leads', 'syncNewLeads')
    .addItem('Reset Sync Status (All)', 'resetSyncStatus')
    .addItem('Show Sync Stats', 'showSyncStats')
    .addToUi();
}

/**
 * Reset all sync markers — use if you want to re-sync everything.
 */
function resetSyncStatus() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Reset Sync Status',
    'This will clear ALL sync markers, allowing all rows to be re-synced. The server will still skip duplicates by email. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME)
    || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, CONFIG.SYNCED_COL, lastRow - 1, 1).clearContent();
  }
  ui.alert('All sync markers cleared. Run "Sync New Leads" to re-sync.');
}

/**
 * Show sync statistics.
 */
function showSyncStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME)
    || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = sheet.getDataRange().getValues();

  let total = 0;
  let synced = 0;
  let unsynced = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[CONFIG.COL.FULL_NAME - 1] && !row[CONFIG.COL.USER_ID - 1]) continue;
    total++;
    if (row[CONFIG.SYNCED_COL - 1]) {
      synced++;
    } else {
      unsynced++;
    }
  }

  SpreadsheetApp.getUi().alert(
    'Sync Stats',
    `Total members: ${total}\nSynced: ${synced}\nPending: ${unsynced}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
