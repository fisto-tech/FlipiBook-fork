/**
 * slideDistance.js
 * "Distance" and "Fade" options for the Slide animations (Up / Down / Left / Right).
 *
 * distance:  '' (unset → legacy fixed 100px) | number (percent of the page height for Up/Down,
 *            of the page width for Left/Right) | 'edge' (start just outside the page edge)
 * fade:      'false' → slide in fully opaque; anything else → fade in (default)
 *
 * The distance is measured on screen against the page and converted into the element's own
 * units, so it looks the same at any zoom / screen size.
 */

// direction the element comes FROM (unit vector of the start offset)
export const SLIDE_DIRS = {
  'slide-up': [0, 1],     // from below
  'slide-down': [0, -1],  // from above
  'slide-left': [1, 0],   // from the right
  'slide-right': [-1, 0], // from the left
};

export const SLIDE_DISTANCE_PRESETS = [
  { id: 'short', label: 'Short', value: 8 },
  { id: 'medium', label: 'Medium', value: 20 },
  { id: 'long', label: 'Long', value: 45 },
  { id: 'edge', label: 'From Edge', value: 'edge' },
];

const outerSvg = (el) => {
  let svg = el.ownerSVGElement || (el.tagName?.toLowerCase() === 'svg' ? el : null);
  while (svg && svg.ownerSVGElement) svg = svg.ownerSVGElement;
  return svg;
};

/** Start offset (element-local units) for a slide, or null to keep the legacy keyframes. */
export const getSlideOffset = (el, type, settings = {}) => {
  const dir = SLIDE_DIRS[type];
  if (!dir || !el) return null;
  const rawDist = settings.distance;
  const hasDist = rawDist !== undefined && rawDist !== null && rawDist !== '';
  const fade = String(settings.fade) !== 'false';
  if (!hasDist && fade) return null; // untouched → legacy behaviour

  let local = 100; // legacy distance
  if (hasDist) {
    try {
      const root = outerSvg(el);
      const m = el.getScreenCTM?.();
      const k = m ? Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) : 0; // screen px per local unit
      if (root && k > 0) {
        const pr = root.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        let screen;
        if (String(rawDist) === 'edge') {
          if (type === 'slide-up') screen = pr.bottom - er.top;
          else if (type === 'slide-down') screen = er.bottom - pr.top;
          else if (type === 'slide-left') screen = pr.right - er.left;
          else screen = er.right - pr.left;
        } else {
          const pct = Math.max(0, Math.min(100, parseFloat(rawDist) || 0));
          screen = (pct / 100) * (dir[1] ? pr.height : pr.width);
        }
        local = Math.max(0, screen) / k;
      }
    } catch { /* keep legacy distance */ }
  }
  return { dx: dir[0] * local, dy: dir[1] * local, fade };
};

/** Keyframes in the editor's `translate` format, or null to use the default ones. */
export const getSlideKeyframes = (el, type, settings) => {
  const o = getSlideOffset(el, type, settings);
  if (!o) return null;
  const from = { translate: `${o.dx.toFixed(3)}px ${o.dy.toFixed(3)}px` };
  const to = { translate: '0px 0px' };
  if (o.fade) { from.opacity = 0; to.opacity = 1; }
  return [from, to];
};
