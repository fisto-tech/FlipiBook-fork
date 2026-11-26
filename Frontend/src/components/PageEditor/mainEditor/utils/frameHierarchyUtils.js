import { isElementCropped } from '../../properties/controls/Crop';
import { getVisualBBox } from './geometryUtils';

/**
 * Returns direct children of the SVG root that represent selectable top-level frames/layers.
 */
export const getTopLevelFrames = (svg) => {
  if (!svg || !svg.children) return [];
  return Array.from(svg.children).filter(el => {
    if (!el.id && el.getAttribute && (el.getAttribute('data-type') === 'embed-frame' || el.querySelector?.('[data-type="embed-frame"]'))) {
      el.id = `embed-${Date.now()}`;
    }
    return (
      el.id &&
      el.tagName.toLowerCase() !== 'style' &&
      el.tagName.toLowerCase() !== 'defs' &&
      el.getAttribute('data-hidden') !== 'true' &&
      el.getAttribute('data-locked') !== 'true'
    );
  });
};

/**
 * Checks if an element is a root page frame (the page container <g> directly under <svg>).
 */
export const isPageRootElement = (el, svg) => {
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  if (tag === 'svg') return true;
  const parent = el.parentElement;
  if (!parent) return false;
  const isDirectUnderSvg = (svg && parent === svg) || parent.tagName?.toLowerCase() === 'svg';
  if (!isDirectUnderSvg) return false;
  const dataType = el.getAttribute?.('data-type');
  const name = el.getAttribute?.('data-name');
  if (dataType === 'frame') return true;
  if (name && /^Page\s*\d+$/i.test(name)) return true;
  return false;
};

/**
 * Returns direct children of a given container element that have IDs and act as child frames.
 */
export const getDirectChildFrames = (el) => {
  if (!el || !el.children) return [];
  const tag = el.tagName?.toLowerCase();
  if (tag !== 'g' && tag !== 'svg' && tag !== 'multi') {
    return [];
  }

  // If this is a page root container or svg, never treat it as a compound leaf; always return its children
  const isPage = isPageRootElement(el);
  if (!isPage) {
    const dataType = el.getAttribute?.('data-type');
    if (
      el.getAttribute('data-is-image-group') ||
      el.getAttribute('data-is-video-group') ||
      el.getAttribute('data-is-gif-group') ||
      el.getAttribute('data-is-element-button') === 'true' ||
      dataType === 'button' ||
      (el.id && el.id.startsWith('button-')) ||
      el.getAttribute('data-is-element-shape') === 'true' ||
      el.getAttribute('data-shape-type') ||
      dataType === 'shape' ||
      (el.id && el.id.startsWith('shape-')) ||
      dataType === 'embed-frame' ||
      dataType === 'map' ||
      dataType === 'audio-frame' ||
      (el.id && el.id.startsWith('audio-')) ||
      dataType === 'table-frame' ||
      dataType === 'qrcode' ||
      dataType === 'slideshow' ||
      // Image frames are one element (slots are edited from the properties panel / double-click),
      // never a container to "enter" — otherwise they get an entered outline with no resize dots.
      dataType === 'image-frame' ||
      el.getAttribute('data-is-image-frame') === 'true' ||
      el.hasAttribute('data-frame-type') ||
      (el.id && el.id.startsWith('image-frame-')) ||
      (el.id && el.id.startsWith('embed-')) ||
      (el.id && el.id.startsWith('map-'))
    ) {
      return [];
    }
  }

  return Array.from(el.children).filter(child => {
    if (!child.id && child.getAttribute && (child.getAttribute('data-type') === 'embed-frame' || child.querySelector?.('[data-type="embed-frame"]'))) {
      child.id = `embed-${Date.now()}`;
    }
    return (
      child.id &&
      child.tagName.toLowerCase() !== 'style' &&
      child.tagName.toLowerCase() !== 'defs' &&
      child.getAttribute('data-hidden') !== 'true' &&
      child.getAttribute('data-locked') !== 'true' &&
      child.getAttribute('data-name') !== 'Overlay'
    );
  });
};

/**
 * Returns all selectable elements on a given page SVG (excluding backgrounds, shields, overlays, hidden/locked).
 */
export const getAllSelectablePageElements = (svg) => {
  if (!svg) return [];
  const topFrames = getTopLevelFrames(svg);
  const candidates = [];
  topFrames.forEach(el => {
    if (isPageRootElement(el, svg)) {
      candidates.push(...getDirectChildFrames(el));
    } else {
      candidates.push(el);
    }
  });

  return candidates.filter(el => {
    if (!el || !el.id) return false;
    if (isPageRootElement(el, svg)) return false;
    const isOverlay = el.getAttribute('data-name') === 'Overlay' || el.id === 'ghost-layer' || el.classList?.contains('selection-overlay-layer');
    const isPageBackground = el.getAttribute('data-page-background') === 'true' || el.getAttribute('data-is-background') === 'true';
    const isPdfBg = el.getAttribute('data-name')?.includes('PDF Background') || el.getAttribute('data-type') === 'pdf-vector-layer';
    const isShield = el.getAttribute('data-name') === 'Document Shield' || el.getAttribute('data-type') === 'shield';
    const isHiddenOrLocked = el.getAttribute('data-hidden') === 'true' || el.getAttribute('data-locked') === 'true';
    return !isHiddenOrLocked && !isOverlay && !isPageBackground && !isPdfBg && !isShield;
  });
};

// Cached elementsFromPoint to avoid redundant layout recalculations across successive hitTest calls
let lastHitCache = { x: null, y: null, elements: null, timestamp: 0 };
const getCachedElementsFromPoint = (x, y) => {
  const now = performance.now();
  if (lastHitCache.elements && lastHitCache.x === x && lastHitCache.y === y && (now - lastHitCache.timestamp < 16)) {
    return lastHitCache.elements;
  }
  const elements = (typeof document !== 'undefined' && typeof document.elementsFromPoint === 'function')
    ? document.elementsFromPoint(x, y)
    : [];
  lastHitCache = { x, y, elements, timestamp: now };
  return elements;
};

/**
 * Checks if a point (clientX, clientY) hits an element's bounding box or visual boundaries.
 */
export const hitTest = (el, clientX, clientY, buffer = 0, selectedLayerId = null, multiSelectedIds = null) => {
  if (!el) return false;

  const isCroppedEl = isElementCropped(el);

  // 1. Native browser hit testing (with coordinate-level caching)
  const hitElements = getCachedElementsFromPoint(clientX, clientY);
  const isHit = hitElements.includes(el) || (typeof el.contains === 'function' && hitElements.some(he => el.contains(he)));
  if (isHit) {
    if (!isCroppedEl) return true;
  }

  // 2. Extrapolated local Bounding Box hit testing with generous buffer for effortless targeting
  const effectiveBuffer = Math.max(buffer, 6);
  if (typeof el.getScreenCTM === 'function') {
    const svg = el.ownerSVGElement || (el.tagName && el.tagName.toLowerCase() === 'svg' ? el : null);
    if (svg && typeof svg.createSVGPoint === 'function') {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      try {
        const ctm = el.getScreenCTM();
        if (ctm) {
          const localPt = pt.matrixTransform(ctm.inverse());
          const scale = Math.sqrt(ctm.a * ctm.a + ctm.b * ctm.b) || 1;
          const localBuffer = effectiveBuffer / scale;

          let bbox = getVisualBBox(el);
          if (!bbox || (bbox.width === 0 && bbox.height === 0)) {
            try { bbox = el.getBBox(); } catch { /* ignored */ }
          }

          if (bbox) {
            return (
              localPt.x >= bbox.x - localBuffer &&
              localPt.x <= bbox.x + bbox.width + localBuffer &&
              localPt.y >= bbox.y - localBuffer &&
              localPt.y <= bbox.y + bbox.height + localBuffer
            );
          }
        }
      } catch {
        /* fallback to visual bounds */
      }
    }
  }

  // 3. Fallback check using visual bbox mapped to screen coordinates if getScreenCTM fails
  try {
    const bbox = getVisualBBox(el);
    const ctm = el.getScreenCTM ? el.getScreenCTM() : null;
    if (ctm && bbox && bbox.width > 0 && bbox.height > 0) {
      const pt1 = new DOMPoint(bbox.x, bbox.y).matrixTransform(ctm);
      const pt2 = new DOMPoint(bbox.x + bbox.width, bbox.y).matrixTransform(ctm);
      const pt3 = new DOMPoint(bbox.x + bbox.width, bbox.y + bbox.height).matrixTransform(ctm);
      const pt4 = new DOMPoint(bbox.x, bbox.y + bbox.height).matrixTransform(ctm);
      const minX = Math.min(pt1.x, pt2.x, pt3.x, pt4.x);
      const maxX = Math.max(pt1.x, pt2.x, pt3.x, pt4.x);
      const minY = Math.min(pt1.y, pt2.y, pt3.y, pt4.y);
      const maxY = Math.max(pt1.y, pt2.y, pt3.y, pt4.y);

      return clientX >= minX - buffer && clientX <= maxX + buffer &&
        clientY >= minY - buffer && clientY <= maxY + buffer;
    }
  } catch { /* ignored */ }

  const rect = el.getBoundingClientRect();
  return clientX >= rect.left - buffer && clientX <= rect.right + buffer &&
    clientY >= rect.top - buffer && clientY <= rect.bottom + buffer;
};
