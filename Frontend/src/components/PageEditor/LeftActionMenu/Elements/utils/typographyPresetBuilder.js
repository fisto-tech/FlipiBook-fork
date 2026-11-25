/**
 * typographyPresetBuilder.js
 * Builds editable typography presets (poster-style text compositions) from a small spec,
 * using the fonts installed in the app. Every word is a normal editable text box
 * (foreignObject, same structure as the Text tool) and every highlight / label / backdrop
 * is a normal shape, all inside one user group — so users can retype, recolour, restyle
 * or ungroup anything.
 *
 * Spec:
 *   { id, name, w, h, bg?, bgRadius?, shapes?: [...], lines: [...] }
 *   shape: { x, y, w, h, fill, rx?, rotate?, name? }
 *   line:  { y, size, font, weight?, color?, align?: 'center'|'left'|'right', x?, gap?,
 *            ls?, rotate?, italic?, shadow?, lineHeight?, segs: [seg] }  (or `text` for one segment)
 *   seg:   { text, color?, size?, font?, weight?, ls?, bg?, padX?, padY?, bgRadius?, shadow?, effects?, bgEffects? }
 *   line.effects applies to every text box in the line; shape.effects to a shape.
 *
 * Effects use the editor's own data-effect-* attributes, so the Effects panel (Drop Shadow,
 * Inner Shadow, Blur) shows and edits them, and the editor re-renders them on page load:
 *   effects: { drop?: { x, y, blur, color, opacity }, inner?: { x, y, blur, color, opacity }, blur?: number }
 *   (opacity in %, offsets/blur in design units)
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const PT_PER_PX = 0.75;

let measureCtx = null;
const measureText = (text, { size, font, weight = 400, ls = 0, italic = false }) => {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  measureCtx.font = `${italic ? 'italic ' : ''}${weight} ${size}px "${font}", sans-serif`;
  return measureCtx.measureText(text).width + ls * Math.max(0, Array.from(text).length);
};

const fontStack = (font) => `'${font}', sans-serif`;
const round = (v) => Math.round(v * 100) / 100;

const hexToRgb = (hex) => {
  const h = String(hex || '#000000').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0');
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) || 0);
};

const setEffectAttributes = (el, fx) => {
  el.setAttribute('data-effect-drop-shadow', fx.drop ? 'true' : 'false');
  el.setAttribute('data-effect-inner-shadow', fx.inner ? 'true' : 'false');
  el.setAttribute('data-effect-blur', fx.blur ? 'true' : 'false');
  [['drop', 'drop-shadow'], ['inner', 'inner-shadow']].forEach(([key, attr]) => {
    const e = fx[key];
    if (!e) return;
    el.setAttribute(`data-effect-${attr}-color`, e.color || '#000000');
    el.setAttribute(`data-effect-${attr}-opacity`, String(e.opacity ?? 25));
    el.setAttribute(`data-effect-${attr}-x`, String(e.x ?? 0));
    el.setAttribute(`data-effect-${attr}-y`, String(e.y ?? 0));
    el.setAttribute(`data-effect-${attr}-blur`, String(e.blur ?? 4));
  });
  if (fx.blur) {
    el.setAttribute('data-effect-blur-value', String(fx.blur));
    el.setAttribute('data-effect-blur-clip', 'false');
  }
};

// SVG filter with the same primitive chain as the editor (inner shadow → drop shadow → layer blur)
const buildEffectFilter = (id, fx) => {
  const f = document.createElementNS(SVG_NS, 'filter');
  f.setAttribute('id', id);
  f.setAttribute('x', '-50%'); f.setAttribute('y', '-50%');
  f.setAttribute('width', '200%'); f.setAttribute('height', '200%');
  const prim = (tag, attrs) => {
    const n = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, String(v)));
    f.appendChild(n);
    return n;
  };
  let current = 'SourceGraphic';
  if (fx.inner) {
    const e = fx.inner;
    prim('feGaussianBlur', { stdDeviation: e.blur ?? 4, in: 'SourceAlpha', result: 'is_blur' });
    prim('feOffset', { dx: e.x ?? 0, dy: e.y ?? 0, in: 'is_blur', result: 'is_offset' });
    prim('feComposite', { operator: 'out', in: 'SourceAlpha', in2: 'is_offset', result: 'is_inverse' });
    prim('feFlood', { 'flood-color': e.color || '#000000', 'flood-opacity': (e.opacity ?? 25) / 100, result: 'is_flood' });
    prim('feComposite', { operator: 'in', in: 'is_flood', in2: 'is_inverse', result: 'is_final' });
    prim('feComposite', { operator: 'over', in: 'is_final', in2: current, result: 'inner_shadow_merged' });
    current = 'inner_shadow_merged';
  }
  if (fx.drop) {
    const e = fx.drop;
    prim('feGaussianBlur', { stdDeviation: e.blur ?? 4, in: 'SourceAlpha', result: 'ds_blur' });
    prim('feOffset', { dx: e.x ?? 0, dy: e.y ?? 0, in: 'ds_blur', result: 'ds_offset' });
    prim('feFlood', { 'flood-color': e.color || '#000000', 'flood-opacity': (e.opacity ?? 25) / 100, result: 'ds_flood' });
    prim('feComposite', { in: 'ds_flood', in2: 'ds_offset', operator: 'in', result: 'ds_final' });
    const merge = prim('feMerge', { result: 'drop_shadow_merged' });
    [['in', 'ds_final'], ['in', current]].forEach(([k, v]) => {
      const node = document.createElementNS(SVG_NS, 'feMergeNode');
      node.setAttribute(k, v);
      merge.appendChild(node);
    });
    current = 'drop_shadow_merged';
  }
  if (fx.blur) {
    prim('feGaussianBlur', { stdDeviation: fx.blur, in: current, result: 'blur_out_last' });
  }
  return f;
};

/**
 * Applies effects to a shape or text box. Text without inner shadow uses the editor's CSS
 * filter path (blur + drop-shadow on the inner div); everything else gets an SVG filter,
 * placed in the preset group's own <defs>.
 */
const applyEffects = (el, fx, defs) => {
  if (!fx || !(fx.drop || fx.inner || fx.blur)) return;
  setEffectAttributes(el, fx);
  const isText = el.tagName.toLowerCase() === 'foreignobject';
  const inner = isText ? el.firstElementChild : null;
  if (isText && !fx.inner && inner) {
    let css = '';
    if (fx.blur) css += `blur(${fx.blur}px) `;
    if (fx.drop) {
      const [r, g, b] = hexToRgb(fx.drop.color);
      css += `drop-shadow(${fx.drop.x ?? 0}px ${fx.drop.y ?? 0}px ${fx.drop.blur ?? 4}px rgba(${r},${g},${b},${(fx.drop.opacity ?? 25) / 100}))`;
    }
    inner.style.setProperty('filter', css.trim(), 'important');
    return;
  }
  const filterId = `filter-${el.id}-fx`;
  defs.appendChild(buildEffectFilter(filterId, fx));
  if (inner) inner.style.setProperty('filter', `url(#${filterId})`, 'important');
  else el.setAttribute('filter', `url(#${filterId})`);
};

let uidCounter = 0;
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${(uidCounter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const makeRect = ({ x, y, w, h, fill, rx = 0, rotate, cx, cy, name = 'Shape' }) => {
  const r = document.createElementNS(SVG_NS, 'rect');
  r.setAttribute('id', uid('rect'));
  r.setAttribute('x', String(round(x)));
  r.setAttribute('y', String(round(y)));
  r.setAttribute('width', String(round(w)));
  r.setAttribute('height', String(round(h)));
  if (rx) { r.setAttribute('rx', String(rx)); r.setAttribute('ry', String(rx)); }
  r.setAttribute('fill', fill);
  r.setAttribute('stroke', 'none');
  r.setAttribute('data-type', 'shape');
  r.setAttribute('data-name', name);
  if (rotate) r.setAttribute('transform', `rotate(${rotate} ${round(cx ?? x + w / 2)} ${round(cy ?? y + h / 2)})`);
  return r;
};

// Editable text box — mirrors the Text tool's foreignObject structure
const makeText = ({ text, x, y, w, h, size, font, weight = 400, color = '#000000', ls = 0, italic = false, shadow, lineHeight = 1, rotate, cx, cy }) => {
  const fo = document.createElementNS(SVG_NS, 'foreignObject');
  const pt = round(size * PT_PER_PX);
  fo.setAttribute('id', uid('text'));
  fo.setAttribute('x', String(round(x)));
  fo.setAttribute('y', String(round(y)));
  fo.setAttribute('width', String(Math.ceil(w)));
  fo.setAttribute('height', String(Math.ceil(h)));
  if (rotate) fo.setAttribute('transform', `rotate(${rotate} ${round(cx)} ${round(cy)})`);
  fo.setAttribute('fill', color);
  fo.setAttribute('stroke', 'none');
  fo.setAttribute('stroke-width', '0');
  fo.setAttribute('font-family', fontStack(font));
  fo.setAttribute('font-size', `${pt}pt`);
  fo.setAttribute('font-weight', String(weight));
  fo.setAttribute('data-font-weight', String(weight));
  fo.setAttribute('letter-spacing', String(ls));
  fo.setAttribute('data-auto-wrap', 'false');
  fo.setAttribute('data-sizing-mode', 'auto-width');
  fo.setAttribute('data-type', 'text');
  fo.setAttribute('data-name', `Text - ${text.slice(0, 24)}`);
  fo.setAttribute('style', 'overflow: visible;');

  const div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
  Object.assign(div.style, {
    width: 'max-content',
    height: '100%',
    minHeight: '100%',
    display: 'block',
    color,
    fontFamily: fontStack(font),
    fontSize: `${pt}pt`,
    fontWeight: String(weight),
    fontStyle: italic ? 'italic' : 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    lineHeight: String(lineHeight),
    letterSpacing: `${ls}px`,
    wordBreak: 'normal',
    overflowWrap: 'normal',
    whiteSpace: 'pre',
    padding: '0px',
    margin: '0',
    boxSizing: 'border-box',
    outline: 'none',
    background: 'transparent',
    userSelect: 'none',
    pointerEvents: 'none',
  });
  if (shadow) div.style.textShadow = shadow;
  div.setAttribute('data-font-weight', String(weight));
  div.textContent = text;
  fo.appendChild(div);
  return fo;
};

/** Builds the preset as a <g> (content in design units, origin 0,0). */
export const buildTypographyGroup = (spec) => {
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('id', uid('group-typography'));
  g.setAttribute('data-type', 'group');
  g.setAttribute('data-is-element-typography', 'true');
  g.setAttribute('data-subtopic', 'Typography');
  g.setAttribute('data-name', spec.name);
  g.setAttribute('data-preset-id', spec.id);

  const defs = document.createElementNS(SVG_NS, 'defs');
  g.appendChild(defs);

  if (spec.bg) {
    g.appendChild(makeRect({ x: 0, y: 0, w: spec.w, h: spec.h, fill: spec.bg, rx: spec.bgRadius || 0, name: 'Background' }));
  }
  (spec.shapes || []).forEach((s) => {
    const rect = makeRect(s);
    g.appendChild(rect);
    applyEffects(rect, s.effects, defs);
  });

  (spec.lines || []).forEach((line) => {
    const segs = line.segs || [{ text: line.text }];
    const gap = line.gap ?? 0;
    const lineSize = Math.max(...segs.map((s) => s.size || line.size));
    const lh = line.lineHeight ?? 1;

    const measured = segs.map((s) => {
      const st = {
        size: s.size || line.size,
        font: s.font || line.font,
        weight: s.weight ?? line.weight ?? 400,
        ls: s.ls ?? line.ls ?? 0,
        italic: s.italic ?? line.italic ?? false,
      };
      const padX = s.bg ? (s.padX ?? st.size * 0.18) : 0;
      const textW = measureText(s.text, st);
      return { s, st, padX, textW, boxW: textW + padX * 2 };
    });
    const totalW = measured.reduce((sum, m) => sum + m.boxW, 0) + gap * (measured.length - 1);

    const align = line.align || 'center';
    let cursor;
    if (align === 'left') cursor = line.x ?? 0;
    else if (align === 'right') cursor = (line.x ?? spec.w) - totalW;
    else cursor = (line.x ?? spec.w / 2) - totalW / 2;

    const lineCx = cursor + totalW / 2;
    const lineCy = line.y + (lineSize * lh) / 2;
    const rot = line.rotate || 0;

    measured.forEach(({ s, st, padX, textW, boxW }) => {
      const boxH = st.size * lh;
      // smaller segments sit on the line's baseline
      const top = line.y + (lineSize - st.size) * lh * 0.82;
      if (s.bg) {
        const padY = s.padY ?? st.size * 0.06;
        const hl = makeRect({
          x: cursor, y: top - padY, w: boxW, h: boxH + padY * 2,
          fill: s.bg, rx: s.bgRadius ?? 0, rotate: rot, cx: lineCx, cy: lineCy, name: 'Highlight',
        });
        g.appendChild(hl);
        applyEffects(hl, s.bgEffects, defs);
      }
      const textNode = makeText({
        text: s.text,
        x: cursor + padX,
        y: top,
        w: textW + 2,
        h: boxH,
        size: st.size,
        font: st.font,
        weight: st.weight,
        ls: st.ls,
        italic: st.italic,
        color: s.color || line.color || '#000000',
        shadow: s.shadow || line.shadow,
        lineHeight: lh,
        rotate: rot,
        cx: lineCx,
        cy: lineCy,
      });
      g.appendChild(textNode);
      applyEffects(textNode, s.effects || line.effects, defs);
      cursor += boxW + gap;
    });
  });

  if (!defs.firstChild) defs.remove();
  return g;
};

/** Node for canvas insertion: scaled to targetWidth (page units) and centred on cx, cy. */
export const createTypographyPresetNode = (spec, cx, cy, targetWidth = 90) => {
  const g = buildTypographyGroup(spec);
  const scale = targetWidth / spec.w;
  const posX = round(cx - (spec.w * scale) / 2);
  const posY = round(cy - (spec.h * scale) / 2);
  g.setAttribute('transform', `translate(${posX}, ${posY}) scale(${scale.toFixed(4)})`);
  return g;
};

/** Markup for the sidebar thumbnail (same builder => preview matches the inserted result). */
export const buildTypographyPreviewMarkup = (spec) => {
  const g = buildTypographyGroup(spec);
  return `<svg xmlns="${SVG_NS}" viewBox="0 0 ${spec.w} ${spec.h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${g.outerHTML}</svg>`;
};

/** Resolves once every font used by the given specs is loaded (so measurements are right). */
export const loadPresetFonts = (specs) => {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  const faces = new Set();
  specs.forEach((spec) => (spec.lines || []).forEach((line) => {
    (line.segs || [{}]).forEach((s) => {
      faces.add(`${s.weight ?? line.weight ?? 400} 20px "${s.font || line.font}"`);
    });
  }));
  return Promise.all([...faces].map((f) => document.fonts.load(f).catch(() => null)));
};
