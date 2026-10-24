// Finance dashboard settings. Add or rename categories here.
// The category names must match the "category" column in the sheet
// (upper/lower case does not matter).

export const INCOME_CATEGORIES = ["Individual donation", "Fundraising event"];
export const SPENDING_CATEGORIES = ["Training", "Gear"];

// Where the transactions live.
// SHEET_ID is the long code in the Google Sheet's link (…/spreadsheets/d/<SHEET_ID>/edit).
// The dashboard logs in with the service account key in GOOGLE_KEY_FILE (never share that file).
// Leave SHEET_ID empty ("") to use the CSV file in DATA_FILE instead.
export const SHEET_ID = "1jW_o8oaL0nrQw0lfJrCPp-zSpwBL1B76VVl7PGaWoM4";
export const GOOGLE_KEY_FILE = "google-service-account.json";
export const DATA_FILE = "data/finances.csv";

export const CURRENCY = "EUR";
export const LOCALE = "en-IE";

// Chart colors: green for money in, amber for money out.
// Checked for colour-blind safety on the page background.
export const COLOR_IN = "#0a7d55";
export const COLOR_OUT = "#d9a000";
