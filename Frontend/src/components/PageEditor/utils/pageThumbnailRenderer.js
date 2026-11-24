/**
 * pageThumbnailRenderer.js
 * Exact page thumbnails for the editor's Pages panel.
 *
 * Uses the same self-contained pipeline as Export (fonts, images, text, tables, effects,
 * frozen animations) and renders at the page's real aspect ratio. Results are cached by
 * page content, so a thumbnail refreshes whenever the page changes. Renders run one at a
 * time to keep the editor responsive.
 */

import { prepareExportSvg } from './exportPageRenderer';

const cache = new Map();        // contentKey -> objectURL
const pending = new Map();      // contentKey -> Promise
let queue = Promise.resolve();
const MAX_CACHE = 120;

// Fast content hash (FNV-1a over the string) — the key changes whenever the page changes
export const hashPageHtml = (str = '') => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `${str.length.toString(36)}-${(h >>> 0).toString(36)}`;
};

export const getPageViewBox = (html = '') => {
  const m = html.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  if (m) {
    const p = m[1].trim().split(/[\s,]+/).map(parseFloat);
    if (p.length === 4 && p[2] > 0 && p[3] > 0) return { x: p[0], y: p[1], w: p[2], h: p[3] };
  }
  const w = parseFloat(html.match(/<svg\b[^>]*\swidth\s*=\s*["']?([\d.]+)/i)?.[1]);
  const h = parseFloat(html.match(/<svg\b[^>]*\sheight\s*=\s*["']?([\d.]+)/i)?.[1]);
  return { x: 0, y: 0, w: w || 210, h: h || 297 };
};

const stripEditorOnly = (svg) => svg
  .replace(/<rect\b[^>]*?(?:data-name=["']Document Shield["']|data-type=["']shield["'])[^>]*\/?>/gi, '')
  .replace(/<(rect|g)\b[^>]*?(?:data-name=["']Free Frame["']|data-type=["']free-frame["'])[^>]*\/>/gi, '')
  .replace(/<g\b[^>]*?(?:data-name=["']Free Frame["']|data-type=["']free-frame["'])[^>]*>[\s\S]*?<\/g>/gi, '')
  .replace(/<(?:rect|circle|path|line)\b[^>]*?id=["']custom-ctrl-[^"']*["'][^>]*\/?>/gi, '');

const render = async (html, longSide) => {
  const vb = getPageViewBox(html);
  const scale = longSide / Math.max(vb.w, vb.h);
  const w = Math.max(1, Math.round(vb.w * scale));
  const h = Math.max(1, Math.round(vb.h * scale));

  let svg = stripEditorOnly(html);
  svg = svg.replace(/<svg\b([^>]*)>/i, (m, attrs) => {
    let a = attrs
      .replace(/\s(width|height|preserveAspectRatio|viewBox|viewbox)\s*=\s*["'][^"']*["']/gi, '');
    if (!/xmlns=/.test(a)) a += ' xmlns="http://www.w3.org/2000/svg"';
    if (!/xmlns:xlink=/.test(a)) a += ' xmlns:xlink="http://www.w3.org/1999/xlink"';
    return `<svg${a} viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet">`;
  });
  svg = svg.replace(/<\/svg>\s*$/i, '<style>foreignObject *{outline:none!important}[contenteditable]{caret-color:transparent!important}</style></svg>');
  svg = await prepareExportSvg(svg);

  const img = new Image();
  await new Promise((ok, fail) => {
    img.onload = ok;
    img.onerror = fail;
    // data: URL — a blob: URL taints the canvas for SVGs with <foreignObject>
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/webp', 0.92));
  return blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png');
};

export const getCachedPageThumbnail = (html) => (html ? cache.get(hashPageHtml(html)) || null : null);

/** Exact thumbnail for this page content (cached; queued so only one renders at a time). */
export const renderPageThumbnail = (html, longSide = 360) => {
  if (!html) return Promise.resolve(null);
  const key = hashPageHtml(html);
  if (cache.has(key)) return Promise.resolve(cache.get(key));
  if (pending.has(key)) return pending.get(key);

  const job = queue.then(() => render(html, longSide)).then((url) => {
    pending.delete(key);
    if (url) {
      if (cache.size >= MAX_CACHE) {
        const [oldKey, oldUrl] = cache.entries().next().value;
        cache.delete(oldKey);
        if (String(oldUrl).startsWith('blob:')) URL.revokeObjectURL(oldUrl);
      }
      cache.set(key, url);
    }
    return url;
  }).catch((err) => {
    pending.delete(key);
    console.warn('[pageThumbnail] render failed:', err?.message || err?.type || err);
    return null;
  });
  queue = job.then(() => undefined, () => undefined);
  pending.set(key, job);
  return job;
};
