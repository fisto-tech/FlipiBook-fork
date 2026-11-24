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

/** Applies one paint attribute to an icon's paint group / shapes. */
export const applyIconPaint = (icon, attr, val) => {
  if (!isIconElement(icon) || !PAINT_ATTRS.includes(attr)) return;
  neutralizeIconHitBox(icon);
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
      } else if (isPaintGroup || stroked) {
        if (attr === 'stroke-dasharray' && value === 'none') c.removeAttribute('stroke-dasharray');
        else c.setAttribute(attr, value);
      }
    });
};

/** Paint values shown in the properties panel (read from the paint group). */
export const readIconPaint = (icon) => {
  const paint = icon.querySelector('[data-icon-paint="true"]') ||
    Array.from(icon.querySelectorAll('g, path, circle, polygon, polyline, line, ellipse, rect'))
      .find((n) => !isIconHitBox(n) && (n.hasAttribute('stroke') || n.hasAttribute('fill')));
  if (!paint) return null;
  const stroke = paint.getAttribute('stroke');
  const hasStroke = stroke && stroke !== 'none';
  return {
    fill: paint.getAttribute('fill') || 'none',
    stroke: hasStroke ? stroke : 'none',
    strokeWidth: hasStroke ? (paint.getAttribute('stroke-width') || '1') : '0',
    strokeLinejoin: paint.getAttribute('stroke-linejoin') || null,
  };
};
