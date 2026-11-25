/**
 * iconPaint.js
 * Icons are <g data-type="icon"> wrappers holding a transparent hit-box <rect> plus an inner
 * paint group (stroke/fill live there) with the icon paths. Fill / stroke edits must paint the
 * icon itself — never the hit-box, which would otherwise inherit the stroke and draw a box.
 */

const PAINT_ATTRS = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-opacity', 'stroke-linejoin', 'stroke-linecap'];

export const isIconElement = (el) => el?.getAttribute?.('data-type') === 'icon';

// The hit-box is the icon group's direct <rect> child with pointer-events="all" (its fill/stroke
// may already have been changed by older edits, so don't rely on fill="transparent").
export const isIconHitBox = (n) => n.getAttribute('data-icon-hit') === 'true' ||
  (n.tagName.toLowerCase() === 'rect' && n.getAttribute('pointer-events') === 'all' &&
    (n.parentElement?.getAttribute('data-type') === 'icon' || n.getAttribute('fill') === 'transparent'));

/** Forces the hit-box to stay invisible (no stroke, transparent fill). */
export const neutralizeIconHitBox = (icon) => {
  icon.querySelectorAll('rect').forEach((r) => {
    if (!isIconHitBox(r)) return;
    r.setAttribute('data-icon-hit', 'true');
    r.setAttribute('stroke', 'none');
    r.setAttribute('fill', 'transparent');
    ['stroke-width', 'stroke-dasharray', 'stroke-opacity', 'paint-order', 'vector-effect', 'rx', 'ry', 'filter',
      'data-stroke-color', 'data-stroke-width', 'data-stroke-position'].forEach((a) => r.removeAttribute(a));
    r.style?.removeProperty?.('stroke');
    r.style?.removeProperty?.('fill');
  });
};


const DRAWABLE = 'path, circle, rect, polygon, polyline, line, ellipse';
const getPaintGroup = (icon) => icon.querySelector('[data-icon-paint="true"]') ||
  Array.from(icon.querySelectorAll('g, ' + DRAWABLE))
    .find((n) => !isIconHitBox(n) && (n.hasAttribute('stroke') || n.hasAttribute('fill')));

const round = (v) => Math.round(v * 2) / 2;

// Screen px per local unit of the icon's paint group (1 when not rendered).
const screenScale = (el) => {
  try {
    const m = el.getScreenCTM?.();
    const k = m ? Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) : 0;
    return k > 0 ? k : 1;
  } catch { return 1; }
};

/**
 * Icons use the same stroke model as shapes: `non-scaling-stroke`, so the panel's Stroke Width is
 * the real on-screen width (not the icon's 24-unit grid width scaled by its size). Older icons are
 * converted once, keeping their current look.
 */
export const ensureIconNonScalingStroke = (icon) => {
  if (!isIconElement(icon)) return;
  const paint = getPaintGroup(icon);
  if (!paint) return;
  if (icon.getAttribute('data-icon-nss') !== 'true') {
    const sw = parseFloat(paint.getAttribute('stroke-width'));
    if (sw > 0) paint.setAttribute('stroke-width', String(Math.max(0.5, round(sw * screenScale(paint)))));
    icon.setAttribute('data-icon-nss', 'true');
  }
  icon.querySelectorAll(DRAWABLE).forEach((n) => {
    if (!isIconHitBox(n)) n.setAttribute('vector-effect', 'non-scaling-stroke');
  });
};

/** Applies one paint attribute to an icon's paint group / shapes. */
export const applyIconPaint = (icon, attr, val) => {
  if (!isIconElement(icon) || !PAINT_ATTRS.includes(attr)) return;
  neutralizeIconHitBox(icon);
  if (attr.startsWith('stroke')) ensureIconNonScalingStroke(icon);
  const value = val === null || val === undefined || val === '#' ? 'none' : String(val);
  Array.from(icon.querySelectorAll('g, path, rect, circle, polygon, ellipse, line, polyline'))
    .filter((n) => !isIconHitBox(n))
    .forEach((c) => {
      const tag = c.tagName.toLowerCase();
      const isPaintGroup = tag === 'g' && (c.getAttribute('data-icon-paint') === 'true' || c.hasAttribute('stroke') || c.hasAttribute('fill'));
      if (tag === 'g' && !isPaintGroup) return;
      const stroked = c.hasAttribute('stroke') && c.getAttribute('stroke') !== 'none';
      if (attr === 'fill') {
        if (isPaintGroup || (c.hasAttribute('fill') && c.getAttribute('fill') !== 'none')) c.setAttribute('fill', value);
      } else if (attr === 'stroke') {
        if (isPaintGroup || stroked || c.hasAttribute('data-icon-stroked')) {
          if (stroked) c.setAttribute('data-icon-stroked', 'true');
          c.setAttribute('stroke', value);
        }
      } else if (attr === 'stroke-width') {
        if (isPaintGroup) c.setAttribute(attr, value);
        else if (c.hasAttribute('stroke-width')) c.removeAttribute('stroke-width');
      } else if (isPaintGroup || stroked) {
        if (attr === 'stroke-dasharray' && value === 'none') c.removeAttribute('stroke-dasharray');
        else c.setAttribute(attr, value);
      }
    });
};

/** Paint values shown in the properties panel (read from the paint group). */
export const readIconPaint = (icon) => {
  const paint = getPaintGroup(icon);
  if (!paint) return null;
  const stroke = paint.getAttribute('stroke');
  const hasStroke = stroke && stroke !== 'none';
  let sw = parseFloat(paint.getAttribute('stroke-width'));
  if (!(sw >= 0)) sw = 1;
  // older icons: show the width as it looks on screen (same model as shapes)
  if (icon.getAttribute('data-icon-nss') !== 'true') sw = Math.max(0.5, round(sw * screenScale(paint)));
  return {
    fill: paint.getAttribute('fill') || 'none',
    stroke: hasStroke ? stroke : 'none',
    strokeWidth: hasStroke ? String(sw) : '0',
    strokeLinejoin: paint.getAttribute('stroke-linejoin') || null,
  };
};
