/**
 * customFonts.js
 * Single registry for the local display fonts in /public/lib/Fonts.
 * Every font picker, the @font-face injector, the vector-text converter and the
 * saved-page font block read from here — add a new font once, in CUSTOM_FONTS.
 */

const F = '/lib/Fonts/';

export const CUSTOM_FONTS = [
  { family: 'Alinsa', file: 'alinsa.ttf' },
  { family: 'Anaconda Wildstyle', file: 'AnacondaWildstyle_PERSONAL_USE_ONLY.otf' },
  { family: 'Arina', file: 'arina.ttf' },
  { family: 'Atop', file: 'Atop 400.ttf' },
  { family: 'Chillink', file: 'Chillink.ttf' },
  { family: 'Chuner', file: 'ChunerDemo-BF69e73d11e80b2.otf' },
  { family: 'Cowra', file: 'CowraFreeRegular-R9316.ttf' },
  { family: 'Duskfall', file: 'Duskfall.ttf' },
  { family: 'Fragor', file: 'Fragor-DemoVersion-Regular.ttf' },
  { family: 'Gendy', file: 'Gendy.otf' },
  { family: 'Gleeful Bubble', file: 'Gleeful-Bubble-Regular.ttf' },
  { family: 'Handrich', file: 'handrichregular-1j2pv.ttf' },
  { family: 'Hepab', file: 'HepabDemoVersion-Regular.ttf' },
  { family: 'Highrise', file: 'highrisedemo-400.otf', weight: 400 },
  { family: 'Highrise', file: 'highrisedemo-bold-700.otf', weight: 700 },
  { family: 'Highrise Condensed', file: 'highrisedemo-condensed-400.otf' },
  { family: 'Jagot', file: 'Jagot-Regular.ttf' },
  { family: 'Ketchup Manis', file: 'KetchupManisDemoRegular-xRn1q.ttf' },
  { family: 'Margin', file: 'Margin DEMO.otf' },
  { family: 'Maxwell', file: 'maxwell/MAXWELL LIGHT.ttf', weight: 300 },
  { family: 'Maxwell', file: 'maxwell/MAXWELL REGULAR.ttf', weight: 400 },
  { family: 'Maxwell', file: 'maxwell/MAXWELL BOLD.ttf', weight: 700 },
  { family: 'Melrank', file: 'melrank.otf' },
  { family: 'Micksu', file: 'Micksu.ttf' },
  { family: 'Moldin', file: 'Moldin Demo.otf' },
  { family: 'Neoza', file: 'neoza.otf' },
  { family: 'Norveza', file: 'NorvezaDEMO-BF6a96d44d3be2a.ttf' },
  { family: 'Patty Press', file: 'Patty Press.ttf' },
  { family: 'Picturama', file: 'picturamafounderpersonalregular-x3xzd.otf' },
  { family: 'Qizzle Floof', file: 'QizzlefloofdemoRegular-m23Wj.otf' },
  { family: 'Rilvan', file: 'Rilvan-Regular-Exfont0cca.otf' },
  { family: 'Roba', file: 'Roba-Regular.ttf' },
  { family: 'Rotten', file: 'Rotten.ttf' },
  { family: 'Splatink', file: 'Splatink.otf' },
  { family: 'Yang Bagus', file: 'Yang Bagus.ttf' },
].map((f) => ({ ...f, url: encodeURI(F + f.file), format: f.file.toLowerCase().endsWith('.otf') ? 'opentype' : 'truetype' }));

/** Unique family names, alphabetical — append these to font dropdowns. */
export const CUSTOM_FONT_FAMILIES = Array.from(new Set(CUSTOM_FONTS.map((f) => f.family)));

/** @font-face rules; pass window.location.origin for absolute URLs (saved/exported pages). */
export const buildCustomFontFaceCss = (origin = '') => CUSTOM_FONTS.map((f) => (
  `@font-face { font-family: '${f.family}'; src: url('${origin}${f.url}') format('${f.format}');${f.weight ? ` font-weight: ${f.weight};` : ''} font-display: swap; }`
)).join('\n');

/** Registers all custom fonts in the current document (idempotent). */
export const injectCustomFonts = (doc = typeof document !== 'undefined' ? document : null) => {
  if (!doc || doc.getElementById('custom-fonts-style')) return;
  const style = doc.createElement('style');
  style.id = 'custom-fonts-style';
  style.textContent = buildCustomFontFaceCss();
  doc.head.appendChild(style);
};

/** Font file URL for a family/weight, or null when it isn't a custom font. */
export const getCustomFontUrl = (fontFamily, fontWeight = 'normal') => {
  const fam = String(fontFamily || '').split(',')[0].replace(/['"]/g, '').trim().toLowerCase();
  const faces = CUSTOM_FONTS.filter((f) => f.family.toLowerCase() === fam);
  if (!faces.length) return null;
  const w = fontWeight === 'bold' ? 700 : (parseInt(fontWeight, 10) || 400);
  const best = faces.reduce((a, b) => (Math.abs((b.weight || 400) - w) < Math.abs((a.weight || 400) - w) ? b : a));
  return best.url;
};

export default CUSTOM_FONT_FAMILIES;
