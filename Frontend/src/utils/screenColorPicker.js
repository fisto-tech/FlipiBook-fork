/**
 * screenColorPicker.js
 * In-app eyedropper for the page editor. Unlike the browser's EyeDropper (which grabs the whole
 * screen and blocks scrolling/zooming), this keeps the canvas fully interactive: scroll,
 * shift+scroll and ctrl/⌘+scroll still work while picking.
 *
 * The visible pages are rendered with the exact export renderer into snapshots; a loupe follows
 * the pointer showing the magnified pixels and the colour. Click = pick, Esc / right-click = cancel.
 *
 * API mirrors the native EyeDropper:  createScreenEyeDropper().open() → Promise<{ sRGBHex }>
 * (rejects on cancel). Falls back to the native EyeDropper when no editor page is on screen.
 */

import { prepareExportSvg } from '../components/PageEditor/utils/exportPageRenderer';

const SNAP_LONG_SIDE = 2400;

const toHex = (r, g, b) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();

const findPageSvgs = () => Array.from(document.querySelectorAll('.page-svg-container'))
  .map((c) => c.querySelector('[id^="canvas-content-"] svg') || c.querySelector('svg:not([id^="highlight-overlay-"])'))
  .filter(Boolean);

// Render one live page SVG into a canvas (same pipeline as export → identical colours)
const snapshotPage = async (svgEl) => {
  const vb = svgEl.viewBox?.baseVal;
  const vbW = vb && vb.width ? vb.width : svgEl.getBoundingClientRect().width;
  const vbH = vb && vb.height ? vb.height : svgEl.getBoundingClientRect().height;
  const scale = SNAP_LONG_SIDE / Math.max(vbW, vbH);
  const W = Math.max(1, Math.round(vbW * scale));
  const H = Math.max(1, Math.round(vbH * scale));
  const clone = svgEl.cloneNode(true);
  clone.querySelectorAll('[data-highlight-id], #ghost-layer, .frame-boundary, [data-name="Free Frame"], [data-type="free-frame"]').forEach((n) => n.remove());
  clone.setAttribute('width', String(W));
  clone.setAttribute('height', String(H));
  if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  let markup = new XMLSerializer().serializeToString(clone);
  markup = await prepareExportSvg(markup);
  const img = new Image();
  await new Promise((ok, fail) => {
    img.onload = ok;
    img.onerror = fail;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  });
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);
  return { svgEl, canvas, ctx, W, H };
};

let active = null;

// ── Colour of whatever is under a screen point outside the pages (panels, buttons, icons, images) ──
const convCtx = (() => {
  const c = document.createElement('canvas');
  c.width = 1; c.height = 1;
  return c.getContext('2d', { willReadFrequently: true });
})();
const cssToRgba = (color) => {
  if (!color) return null;
  convCtx.clearRect(0, 0, 1, 1);
  convCtx.fillStyle = '#000';
  convCtx.fillStyle = color; // browser parses any CSS colour (rgb, hex, oklch…)
  convCtx.fillRect(0, 0, 1, 1);
  const d = convCtx.getImageData(0, 0, 1, 1).data;
  return d[3] === 0 ? null : [d[0], d[1], d[2], d[3] / 255];
};
const imgCanvasCache = new WeakMap();
const sampleImageElement = (img, x, y) => {
  try {
    let c = imgCanvasCache.get(img);
    if (!c) {
      c = document.createElement('canvas');
      c.width = img.naturalWidth || img.width;
      c.height = img.naturalHeight || img.height;
      c.getContext('2d', { willReadFrequently: true }).drawImage(img, 0, 0);
      imgCanvasCache.set(img, c);
    }
    const r = img.getBoundingClientRect();
    const px = Math.floor(((x - r.left) / r.width) * c.width);
    const py = Math.floor(((y - r.top) / r.height) * c.height);
    const d = c.getContext('2d').getImageData(px, py, 1, 1).data; // throws if cross-origin
    return d[3] === 0 ? null : [d[0], d[1], d[2]];
  } catch { return null; }
};
// Flatten a stack of translucent backgrounds onto white
const domColorAt = (x, y, ignore) => {
  const stack = document.elementsFromPoint(x, y).filter((n) => !ignore.contains(n));
  const layers = [];
  for (const el of stack) {
    const tag = el.tagName?.toLowerCase();
    if (tag === 'img') {
      const px = sampleImageElement(el, x, y);
      if (px) { layers.push([...px, 1]); break; }
    }
    if (el instanceof SVGElement && ['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line', 'text'].includes(tag)) {
      const cs = getComputedStyle(el);
      const paint = cs.fill && cs.fill !== 'none' && !cs.fill.startsWith('url') ? cs.fill : (cs.stroke !== 'none' ? cs.stroke : null);
      const c = cssToRgba(paint);
      if (c) { layers.push([c[0], c[1], c[2], c[3] * (parseFloat(cs.opacity) || 1)]); if (layers[layers.length - 1][3] >= 0.99) break; }
      continue;
    }
    if (el instanceof HTMLElement) {
      const c = cssToRgba(getComputedStyle(el).backgroundColor);
      if (c) { layers.push(c); if (c[3] >= 0.99) break; }
    }
  }
  let rgb = [255, 255, 255];
  for (let i = layers.length - 1; i >= 0; i--) {
    const [r, g, b, a] = layers[i];
    rgb = [r * a + rgb[0] * (1 - a), g * a + rgb[1] * (1 - a), b * a + rgb[2] * (1 - a)];
  }
  return rgb.map((v) => Math.round(v));
};

const GRID_CELLS = 9;   // pixels shown in the magnifier (odd → centre pixel)
const GRID_PX = 44;     // magnifier size on screen

const pickInApp = (pages) => new Promise((resolve, reject) => {
  // ── Panel: [magnified pixel grid] [swatch + hex] ──
  const panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;display:none;'
    + 'align-items:center;gap:8px;padding:5px 10px 5px 5px;border-radius:9px;background:#2c2c2c;'
    + 'box-shadow:0 6px 18px rgba(0,0,0,0.3),0 0 0 1px rgba(255,255,255,0.06);'
    + 'font:500 11px/1 system-ui,-apple-system,"Segoe UI",sans-serif;color:#e5e5e5;';
  const grid = document.createElement('canvas');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  grid.width = GRID_PX * dpr;
  grid.height = GRID_PX * dpr;
  grid.style.cssText = `width:${GRID_PX}px;height:${GRID_PX}px;border-radius:5px;display:block;background:#555;`;
  const info = document.createElement('div');
  info.style.cssText = 'display:flex;align-items:center;gap:6px;';
  const swatch = document.createElement('span');
  swatch.style.cssText = 'width:16px;height:16px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);display:inline-block;flex-shrink:0;';
  const hex = document.createElement('span');
  hex.style.cssText = 'font-variant-numeric:tabular-nums;letter-spacing:0.2px;font-size:11px;color:#d4d4d4;';
  info.append(swatch, hex);
  panel.append(grid, info);
  document.body.appendChild(panel);
  const gctx = grid.getContext('2d');
  gctx.imageSmoothingEnabled = false;

  const cursorStyle = document.createElement('style');
  cursorStyle.id = 'screen-color-picker-cursor-style';
  cursorStyle.textContent = `
    [data-editor-canvas="true"],
    [data-editor-canvas="true"] *:not(.color-picker-container):not(.color-picker-container *):not([data-modal]):not([data-modal] *):not(#stroke-settings-popup):not(#stroke-settings-popup *):not(.z-50):not(.z-50 *):not([data-picker-ui]):not([data-picker-ui] *),
    .page-svg-container,
    .page-svg-container * {
      cursor: crosshair !important;
    }
    .color-picker-container,
    .color-picker-container *,
    [data-modal],
    [data-modal] *,
    #stroke-settings-popup,
    #stroke-settings-popup *,
    header,
    header *,
    nav,
    nav *,
    aside,
    aside *,
    .left-action-menu,
    .left-action-menu *,
    [data-picker-ui],
    [data-picker-ui] *,
    .top-toolbar,
    .top-toolbar *,
    [data-top-toolbar],
    [data-top-toolbar] *,
    .properties-panel,
    .properties-panel *,
    [data-properties-panel],
    [data-properties-panel] *,
    .z-50,
    .z-50 * {
      cursor: default !important;
    }
    button, button *, a, a *, input, input * {
      cursor: revert !important;
    }
  `;
  document.head.appendChild(cursorStyle);

  let current = null;
  let pointer = null; // last pointer position (client coords)
  let raf = 0;

  const isUiElement = (el) => {
    if (!el) return false;
    if (el.closest('button, input, select, textarea, a') && !el.closest('.page-svg-container')) {
      return true;
    }
    return Boolean(el.closest(
      '.color-picker-container, [data-color-picker-trigger], .color-box-trigger, ' +
      '[data-modal="true"], [data-modal], #stroke-settings-popup, [role="dialog"], ' +
      'header, nav, aside, .left-action-menu, .top-toolbar, [data-top-toolbar], ' +
      '[data-floating-toolbar], .floating-toolbar, .canvas-bottom-bar, [data-bottom-bar], ' +
      '[data-ignore-canvas="true"], [data-picker-ui], .properties-panel, [data-properties-panel], .z-50'
    ));
  };

  const isOverCanvas = (x, y) => {
    if (typeof x !== 'number' || typeof y !== 'number') return false;
    const elements = document.elementsFromPoint(x, y);
    if (!elements || elements.length === 0) return false;
    const top = elements.find((n) => !panel.contains(n));
    if (!top) return false;
    if (isUiElement(top)) return false;
    return Boolean(top.closest('.page-svg-container, [data-editor-canvas="true"], [id^="canvas-content-"]'));
  };

  const sampleAt = (x, y) => {
    // Only when the page is really the topmost thing at this point (panels/toolbars may cover it)
    const top = document.elementsFromPoint(x, y).find((n) => !panel.contains(n));
    for (const p of pages) {
      if (!p.svgEl.isConnected) continue;
      const container = p.svgEl.closest('.page-svg-container') || p.svgEl;
      if (!top || !container.contains(top)) continue;
      const r = p.svgEl.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom || !r.width || !r.height) continue;
      const px = Math.min(p.W - 1, Math.max(0, Math.floor(((x - r.left) / r.width) * p.W)));
      const py = Math.min(p.H - 1, Math.max(0, Math.floor(((y - r.top) / r.height) * p.H)));
      // how many snapshot pixels one screen pixel covers (so the grid shows real screen pixels)
      const step = Math.max(1, Math.round(p.W / r.width));
      return { p, px, py, step };
    }
    return null;
  };

  // Re-sample every frame at the pointer — the canvas can scroll / glide / zoom under a still mouse
  let dirty = true;
  let liveUntil = 0; // keep re-sampling while the canvas may still be gliding after a wheel/scroll
  const render = () => {
    raf = requestAnimationFrame(render);
    if (!pointer) return;

    // Only pick and show loupe on canvas area. Outside canvas: hide loupe and show normal mouse.
    const inCanvas = isOverCanvas(pointer.x, pointer.y);
    if (!inCanvas) {
      panel.style.display = 'none';
      return;
    }

    if (!dirty && performance.now() > liveUntil) return;
    dirty = false;
    const cell = grid.width / GRID_CELLS;
    const half = Math.floor(GRID_CELLS / 2);
    // Each grid cell is one screen pixel around the pointer: page snapshot where a page is,
    // otherwise the colour of the canvas under that point.
    const colorAtScreen = (sx, sy) => {
      const h = sampleAt(sx, sy);
      if (h) {
        const c = h.p.ctx.getImageData(h.px, h.py, 1, 1).data;
        return [c[0], c[1], c[2]];
      }
      return domColorAt(sx, sy, panel);
    };
    const centre = colorAtScreen(pointer.x, pointer.y);
    current = toHex(centre[0], centre[1], centre[2]);
    for (let gy = 0; gy < GRID_CELLS; gy++) {
      for (let gx = 0; gx < GRID_CELLS; gx++) {
        const c = (gx === half && gy === half) ? centre : colorAtScreen(pointer.x + (gx - half), pointer.y + (gy - half));
        gctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        gctx.fillRect(Math.floor(gx * cell), Math.floor(gy * cell), Math.ceil(cell), Math.ceil(cell));
      }
    }
    // faint pixel grid
    gctx.strokeStyle = 'rgba(255,255,255,0.10)';
    gctx.lineWidth = 1;
    for (let i = 1; i < GRID_CELLS; i++) {
      const v = Math.round(i * cell) + 0.5;
      gctx.beginPath(); gctx.moveTo(v, 0); gctx.lineTo(v, grid.height); gctx.stroke();
      gctx.beginPath(); gctx.moveTo(0, v); gctx.lineTo(grid.width, v); gctx.stroke();
    }
    // centre pixel: white + dark ring
    const c0 = half * cell;
    gctx.lineWidth = 2 * dpr;
    gctx.strokeStyle = '#ffffff';
    gctx.strokeRect(c0 - 1 * dpr, c0 - 1 * dpr, cell + 2 * dpr, cell + 2 * dpr);
    gctx.lineWidth = 1 * dpr;
    gctx.strokeStyle = '#111111';
    gctx.strokeRect(c0 + 0.75 * dpr, c0 + 0.75 * dpr, cell - 1.5 * dpr, cell - 1.5 * dpr);

    swatch.style.background = current;
    hex.textContent = current;
    panel.style.display = 'flex';
    const pw = panel.offsetWidth || 220;
    const ph = panel.offsetHeight || 100;
    // Sit bottom-right of the cursor; flip to the left / above when it would run off-screen,
    // so the box never covers the spot being picked.
    const GAP_X = 16;
    const GAP_Y = 18;
    let left = pointer.x + GAP_X;
    if (left + pw > window.innerWidth - 8) left = pointer.x - GAP_X - pw;
    let top = pointer.y + GAP_Y;
    if (top + ph > window.innerHeight - 8) top = pointer.y - GAP_Y - ph;
    left = Math.max(8, Math.min(window.innerWidth - pw - 8, left));
    top = Math.max(8, Math.min(window.innerHeight - ph - 8, top));
    panel.style.transform = `translate(${left}px, ${top}px)`;
  };
  raf = requestAnimationFrame(render);

  const onMove = (e) => { pointer = { x: e.clientX, y: e.clientY }; dirty = true; };
  const onScrollish = () => { liveUntil = performance.now() + 600; };
  const swallowClick = (e) => { e.preventDefault(); e.stopPropagation(); };
  const cleanup = (swallowNextClick = true) => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove, true);
    window.removeEventListener('wheel', onScrollish, { capture: true });
    window.removeEventListener('scroll', onScrollish, true);
    window.removeEventListener('pointerdown', onDown, true);
    window.removeEventListener('mousedown', swallowClick, true);
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('contextmenu', onContext, true);
    panel.remove();
    cursorStyle.remove();
    if (swallowNextClick) {
      // swallow the click that follows the picking pointerdown (keeps the colour popup open)
      window.addEventListener('click', swallowClick, true);
      setTimeout(() => window.removeEventListener('click', swallowClick, true), 300);
    }
    active = null;
  };
  const onDown = (e) => {
    if (e.button !== 0) return;
    pointer = { x: e.clientX, y: e.clientY };
    const inCanvas = isOverCanvas(pointer.x, pointer.y);
    if (!inCanvas) {
      // Clicked outside canvas: cancel eyedropper and allow normal click interaction
      cleanup(false);
      reject(new DOMException('Picking cancelled', 'AbortError'));
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const hit = sampleAt(pointer.x, pointer.y);
    let rgb;
    if (hit) {
      const d = hit.p.ctx.getImageData(hit.px, hit.py, 1, 1).data;
      rgb = [d[0], d[1], d[2]];
    } else {
      rgb = domColorAt(pointer.x, pointer.y, panel);
    }
    cleanup(true);
    resolve({ sRGBHex: toHex(rgb[0], rgb[1], rgb[2]) });
  };
  const onKey = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cleanup(false);
      reject(new DOMException('Picking cancelled', 'AbortError'));
    }
  };
  const onContext = (e) => {
    e.preventDefault();
    cleanup(false);
    reject(new DOMException('Picking cancelled', 'AbortError'));
  };

  window.addEventListener('pointermove', onMove, true);
  window.addEventListener('wheel', onScrollish, { capture: true, passive: true });
  window.addEventListener('scroll', onScrollish, true);
  window.addEventListener('pointerdown', onDown, true);
  window.addEventListener('mousedown', swallowClick, true);
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('contextmenu', onContext, true);
  active = { cancel: () => { cleanup(false); reject(new DOMException('Picking cancelled', 'AbortError')); } };
});

export const canPickScreenColor = () => true;

/** Drop-in replacement for `new window.EyeDropper()` */
export const createScreenEyeDropper = () => ({
  open: async () => {
    if (active) active.cancel();
    const svgs = findPageSvgs();
    if (svgs.length === 0) return pickInApp([]);
    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = '*{cursor:progress !important;}';
    document.head.appendChild(cursorStyle);
    let pages;
    try {
      pages = (await Promise.all(svgs.map((s) => snapshotPage(s).catch(() => null)))).filter(Boolean);
    } finally {
      cursorStyle.remove();
    }
    return pickInApp(pages);
  },
});
