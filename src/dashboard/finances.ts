// Reads the transactions (Google Sheet or CSV file) and works out the numbers for the dashboard.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createSign } from "node:crypto";
import {
  INCOME_CATEGORIES,
  SPENDING_CATEGORIES,
  DATA_FILE,
  SHEET_ID,
  GOOGLE_KEY_FILE,
  CURRENCY,
  LOCALE,
} from "./config";

export type Transaction = {
  row: number; // row number in the sheet or CSV, for error messages
  date: string; // YYYY-MM-DD
  type: "in" | "out";
  amount: number;
  category: string;
  description: string;
};

export type Problem = { row: number; message: string };

export type Month = {
  key: string; // YYYY-MM
  in: number;
  out: number;
  balance: number; // balance at the end of the month
};

export type CategoryTotal = { name: string; amount: number; share: number };

// ---------- CSV parsing ----------

// Splits CSV text into rows of fields. Handles quoted fields ("a, b"),
// escaped quotes ("") and both comma and semicolon separators
// (Excel uses semicolons in many European settings).
function parseCsv(text: string): string[][] {
  text = text.replace(/^﻿/, "");
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const sep =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === sep) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// Accepts 1234.50, 1234,50, 1.234,50, 1,234.50 and an optional € sign.
function parseAmount(raw: string): number | null {
  let s = raw.replace(/[€\s]/g, "");
  if (!s) return null;
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  if (lastComma > lastDot) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    s = s.replace(/,/g, "");
  }
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

// Accepts 2026-10-24, 24-10-2026 and 24/10/2026. Returns YYYY-MM-DD.
function parseDate(raw: string): string | null {
  const s = raw.trim();
  let y: number, m: number, d: number;
  let match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else if ((match = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/))) {
    [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else {
    return null;
  }
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

function findCategory(raw: string, list: string[]): string | null {
  const wanted = raw.trim().toLowerCase();
  return list.find((c) => c.toLowerCase() === wanted) ?? null;
}

// ---------- Google Sheet ----------

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url");

// Logs in as the service account and returns an access token (read-only).
async function googleToken(key: { client_email: string; private_key: string }) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signature = createSign("RSA-SHA256")
    .update(`${head}.${claims}`)
    .sign(key.private_key)
    .toString("base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${head}.${claims}.${signature}`,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google login failed: ${data.error_description ?? data.error}`);
  return data.access_token as string;
}

// Google stores dates as days since 30 Dec 1899.
const serialToDate = (n: number) =>
  new Date(Date.UTC(1899, 11, 30) + Math.round(n) * 86400000).toISOString().slice(0, 10);

async function rowsFromSheet(): Promise<string[][]> {
  const keyPath = resolve(process.cwd(), GOOGLE_KEY_FILE);
  if (!existsSync(keyPath)) {
    throw new Error(
      `Key file not found: ${GOOGLE_KEY_FILE}. Put the service account key in the project folder (see README).`,
    );
  }
  const key = JSON.parse(readFileSync(keyPath, "utf8"));
  const token = await googleToken(key);

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:Z` +
    `?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) {
    const hint =
      res.status === 403 && !/API has not been used|disabled/i.test(data.error?.message ?? "")
        ? ` Share the sheet with ${key.client_email} (Viewer).`
        : "";
    throw new Error(`Could not read the Google Sheet: ${data.error?.message ?? res.status}.${hint}`);
  }

  const values: unknown[][] = data.values ?? [];
  const dateCol = (values[0] ?? []).findIndex((h) => String(h).trim().toLowerCase() === "date");
  return values.map((row, r) =>
    row.map((cell, c) =>
      r > 0 && c === dateCol && typeof cell === "number" ? serialToDate(cell) : String(cell ?? ""),
    ),
  );
}

// ---------- Loading ----------

export const source = SHEET_ID
  ? { name: "Google Sheet", url: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit` }
  : { name: DATA_FILE, url: null };

export async function loadFinances() {
  const transactions: Transaction[] = [];
  const problems: Problem[] = [];
  let error: string | null = null;

  let rows: string[][] = [];
  try {
    if (SHEET_ID) {
      rows = await rowsFromSheet();
    } else {
      const path = resolve(process.cwd(), DATA_FILE);
      if (!existsSync(path)) throw new Error(`File not found: ${DATA_FILE}`);
      rows = parseCsv(readFileSync(path, "utf8"));
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    return { transactions, problems, error };
  }

  const header = (rows[0] ?? []).map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const needed = ["date", "type", "amount", "category", "description"];
  const missing = needed.filter((n) => col(n) === -1);
  if (missing.length) {
    error = `Missing column(s) in the first row: ${missing.join(", ")}`;
    return { transactions, problems, error };
  }

  rows.slice(1).forEach((cells, i) => {
    const row = i + 2;
    if (cells.every((c) => c.trim() === "")) return; // skip blank lines
    if ((cells[col("amount")] ?? "").trim() === "") return; // not filled in yet
    const get = (name: string) => (cells[col(name)] ?? "").trim();

    const date = parseDate(get("date"));
    const typeRaw = get("type").toLowerCase();
    const type = typeRaw === "in" || typeRaw === "out" ? typeRaw : null;
    const amount = parseAmount(get("amount"));
    const list = type === "in" ? INCOME_CATEGORIES : SPENDING_CATEGORIES;
    const category = type ? findCategory(get("category"), list) : null;

    const errors: string[] = [];
    if (!date) errors.push(`date "${get("date")}" is not a valid date (use 2026-10-24)`);
    if (!type) errors.push(`type "${get("type")}" should be "in" or "out"`);
    if (amount === null) errors.push(`amount "${get("amount")}" is not a number`);
    else if (amount <= 0) errors.push(`amount should be more than 0 (use type "out" for spending)`);
    if (type && !category)
      errors.push(`category "${get("category")}" is not one of: ${list.join(", ")}`);

    if (errors.length) {
      problems.push({ row, message: errors.join("; ") });
      return;
    }
    transactions.push({
      row,
      date: date!,
      type: type!,
      amount: amount!,
      category: category!,
      description: get("description"),
    });
  });

  transactions.sort((a, b) => a.date.localeCompare(b.date) || a.row - b.row);
  return { transactions, problems, error };
}

// ---------- Numbers ----------

export function totals(list: Transaction[]) {
  const moneyIn = sum(list.filter((t) => t.type === "in"));
  const moneyOut = sum(list.filter((t) => t.type === "out"));
  return {
    moneyIn,
    moneyOut,
    balance: moneyIn - moneyOut,
    donations: list.filter((t) => t.type === "in" && t.category === INCOME_CATEGORIES[0]).length,
  };
}

function sum(list: Transaction[]) {
  return Math.round(list.reduce((n, t) => n + t.amount, 0) * 100) / 100;
}

// One entry per month from the first to the last transaction, empty months included.
export function byMonth(list: Transaction[]): Month[] {
  if (!list.length) return [];
  const months: Month[] = [];
  let [y, m] = list[0].date.split("-").map(Number);
  const last = list[list.length - 1].date.slice(0, 7);
  let balance = 0;
  while (true) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    const inMonth = list.filter((t) => t.date.startsWith(key));
    const moneyIn = sum(inMonth.filter((t) => t.type === "in"));
    const moneyOut = sum(inMonth.filter((t) => t.type === "out"));
    balance = Math.round((balance + moneyIn - moneyOut) * 100) / 100;
    months.push({ key, in: moneyIn, out: moneyOut, balance });
    if (key >= last) break;
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return months;
}

export function byCategory(list: Transaction[], type: "in" | "out"): CategoryTotal[] {
  const names = type === "in" ? INCOME_CATEGORIES : SPENDING_CATEGORIES;
  const ofType = list.filter((t) => t.type === type);
  const total = sum(ofType);
  return names
    .map((name) => {
      const amount = sum(ofType.filter((t) => t.category === name));
      return { name, amount, share: total ? amount / total : 0 };
    })
    .sort((a, b) => b.amount - a.amount);
}

// ---------- Formatting ----------

export function money(n: number, cents = false) {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(n);
}

export function moneyCompact(n: number) {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function monthLabel(key: string, withYear = false) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(LOCALE, {
    month: withYear ? "long" : "short",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

export function dayLabel(date: string) {
  return new Date(date + "T00:00:00Z").toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Clean axis ticks (0, 250, 500 …) covering min..max.
export function niceTicks(min: number, max: number, count = 4) {
  if (max === min) max = min + 1;
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw)!;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}
