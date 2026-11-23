/**
 * clipboardTable.js
 * Reads spreadsheet data (Excel / Google Sheets / Numbers) from a paste event's clipboard.
 * Returns a 2D array of cell strings, or null when the clipboard does not hold tabular data.
 *
 * Excel copies the cells as an HTML <table>, as tab-separated text AND as a picture — so this must
 * be checked before image handling, otherwise a copied range is pasted as an image.
 */

const MAX_ROWS = 500;
const MAX_COLS = 60;

const trimGrid = (rows) => {
  // drop fully-empty trailing rows and columns
  let grid = rows.map((r) => r.map((v) => (v == null ? '' : String(v))));
  while (grid.length && grid[grid.length - 1].every((v) => !v.trim())) grid.pop();
  const width = grid.reduce((m, r) => {
    let last = -1;
    r.forEach((v, i) => { if (v.trim()) last = i; });
    return Math.max(m, last + 1);
  }, 0);
  grid = grid.map((r) => {
    const out = r.slice(0, width);
    while (out.length < width) out.push('');
    return out;
  });
  return grid.slice(0, MAX_ROWS).map((r) => r.slice(0, MAX_COLS));
};

const fromHtml = (html) => {
  if (!html || !/<table[\s>]/i.test(html)) return null;
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (!table) return null;
    const rows = [];
    const pending = []; // rowspan carry-over: pending[r] = { col: true }
    Array.from(table.querySelectorAll('tr')).forEach((tr, r) => {
      const row = [];
      let c = 0;
      Array.from(tr.children).forEach((cell) => {
        const tag = cell.tagName.toLowerCase();
        if (tag !== 'td' && tag !== 'th') return;
        while (pending[r]?.[c]) { row[c] = ''; c++; }
        const cs = Math.max(1, parseInt(cell.getAttribute('colspan') || '1', 10));
        const rs = Math.max(1, parseInt(cell.getAttribute('rowspan') || '1', 10));
        const text = (cell.innerText || cell.textContent || '').replace(/ /g, ' ').trim();
        row[c] = text;
        for (let k = 1; k < cs; k++) row[c + k] = '';
        for (let dr = 1; dr < rs; dr++) {
          pending[r + dr] = pending[r + dr] || {};
          for (let k = 0; k < cs; k++) pending[r + dr][c + k] = true;
        }
        c += cs;
      });
      for (let i = 0; i < row.length; i++) if (row[i] === undefined) row[i] = '';
      rows.push(row);
    });
    return rows.length ? rows : null;
  } catch {
    return null;
  }
};

// Tab-separated text, honouring Excel's quoting ("a ""b""" / cells containing line breaks)
const fromTsv = (text) => {
  if (!text || !text.includes('\t')) return null;
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else { inQuotes = false; }
      } else {
        cell += ch;
      }
    } else if (ch === '"' && cell === '') {
      inQuotes = true;
    } else if (ch === '\t') {
      row.push(cell); cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.length ? rows : null;
};

export const parseClipboardTable = (clipboardData) => {
  if (!clipboardData) return null;
  let rows = null;
  try { rows = fromHtml(clipboardData.getData('text/html')); } catch { rows = null; }
  if (!rows) {
    try { rows = fromTsv(clipboardData.getData('text/plain')); } catch { rows = null; }
  }
  if (!rows) return null;
  const grid = trimGrid(rows);
  if (!grid.length || !grid[0].length) return null;
  // a single value is plain text, not a table
  if (grid.length === 1 && grid[0].length === 1) return null;
  return grid;
};

export const escapeTableCell = (str) => String(str ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
