/**
 * Trim View utilities for template canvas.
 *
 * In Trim View:
 * - Elements partially outside the page boundary render with 50% opacity in the outside area
 *   via the Trim View backdrop mat overlay with a page boundary dashed line, while the inside
 *   portion remains at 100% opacity.
 * - Elements completely outside the page boundary render with 0% opacity (invisible).
 * - Selection box (bounding polygon, 8 resize handles, rotate handle) remains at 100% opacity
 *   with all functions (resize, rotate, move) fully operational everywhere.
 * - If an element is completely outside and selected in the layers panel, only its selection box
 *   is shown at 100% opacity so the user can drag it back onto the canvas, while the element itself stays at 0% opacity.
 */

export const isExcludedFromTrim = (el) => {
  if (!el || !el.getAttribute) return true;
  const dn = el.getAttribute('data-name');
  const dt = el.getAttribute('data-type');
  const id = el.id || '';
  const tag = el.tagName?.toLowerCase() || '';
  return (
    tag === 'defs' ||
    tag === 'style' ||
    dn === 'Overlay' ||
    dt === 'background' ||
    dn === 'Document Shield' ||
    id.startsWith('shield-') ||
    id.startsWith('trim-view-')
  );
};

export const isElementCompletelyOutside = (el, svg) => {
  if (!el) return false;
  const svgEl = svg || el.ownerSVGElement || el.closest?.('svg');
  if (!svgEl) return false;

  const pageRect = svgEl.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();

  if (!pageRect || pageRect.width === 0 || pageRect.height === 0) return false;
  if (!elRect || (elRect.width === 0 && elRect.height === 0)) return false;

  // Return true if the element has zero overlap with the page rectangle (1px tolerance)
  return (
    elRect.right <= pageRect.left + 1 ||
    elRect.left >= pageRect.right - 1 ||
    elRect.bottom <= pageRect.top + 1 ||
    elRect.top >= pageRect.bottom - 1
  );
};

export const applyTrimViewToSvg = (svg, isTrimView, baseWidth, baseHeight) => {
  if (!svg) return;

  const maskId = `trim-view-mask-${svg.id || 'page'}`;

  if (!isTrimView) {
    cleanTrimViewFromHtml(svg);
    return;
  }

  // Get viewBox or dimensions of the page
  const vb = svg.viewBox?.baseVal;
  let w = (vb && vb.width > 0) ? vb.width : (baseWidth || 1000);
  let h = (vb && vb.height > 0) ? vb.height : (baseHeight || 1414);
  let x = (vb) ? vb.x : 0;
  let y = (vb) ? vb.y : 0;

  if ((!vb || vb.width === 0) && typeof svg.getAttribute === 'function') {
    const vbAttr = svg.getAttribute('viewBox');
    if (vbAttr) {
      const parts = vbAttr.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        x = parts[0];
        y = parts[1];
        w = parts[2];
        h = parts[3];
      }
    }
  }

  const bgRect = svg.querySelector('rect[data-name="Overlay"], rect[data-type="background"]');
  if (bgRect) {
    const rw = parseFloat(bgRect.getAttribute('width'));
    const rh = parseFloat(bgRect.getAttribute('height'));
    if (rw > 0 && rh > 0) {
      w = rw;
      h = rh;
    }
  }

  // Ensure <defs> exists
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }

  // Ensure mask element exists in defs
  let mask = defs.querySelector(`#${maskId}`);
  if (!mask) {
    mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
    mask.setAttribute('id', maskId);
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    mask.setAttribute('x', '-100000');
    mask.setAttribute('y', '-100000');
    mask.setAttribute('width', '200000');
    mask.setAttribute('height', '200000');

    // 1. Outside rectangle: white with 0.2 opacity -> yields exactly 0.2 opacity outside page
    const outsideRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    outsideRect.setAttribute('x', '-100000');
    outsideRect.setAttribute('y', '-100000');
    outsideRect.setAttribute('width', '200000');
    outsideRect.setAttribute('height', '200000');
    outsideRect.setAttribute('fill', 'white');
    outsideRect.setAttribute('fill-opacity', '0.2');
    mask.appendChild(outsideRect);

    // 2. Inside page rectangle: white with 1.0 opacity -> yields 100% full opacity inside page
    const insideRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    insideRect.setAttribute('x', String(x));
    insideRect.setAttribute('y', String(y));
    insideRect.setAttribute('width', String(w));
    insideRect.setAttribute('height', String(h));
    insideRect.setAttribute('fill', 'white');
    insideRect.setAttribute('fill-opacity', '1');
    mask.appendChild(insideRect);

    defs.appendChild(mask);
  } else {
    // Update dimensions in case of resize or viewBox change
    const insideRect = mask.children[1];
    if (insideRect) {
      insideRect.setAttribute('x', String(x));
      insideRect.setAttribute('y', String(y));
      insideRect.setAttribute('width', String(w));
      insideRect.setAttribute('height', String(h));
    }
  }

  // Apply mask to all top-level content children (except defs, style, mask, shield)
  Array.from(svg.children).forEach(child => {
    if (isExcludedFromTrim(child)) return;
    const tag = child.tagName?.toLowerCase();
    if (tag === 'defs' || tag === 'style' || tag === 'mask') return;
    child.setAttribute('mask', `url(#${maskId})`);
  });

  // Tag elements outside for semantic tracking
  const elements = svg.querySelectorAll('[data-type="shape"], [data-type="text"], [data-type="image"], [data-type="free-frame"], [data-type="icon"], [data-type="table-frame"], [data-type="embed-frame"]');
  elements.forEach(el => {
    if (isElementCompletelyOutside(el, svg)) {
      el.setAttribute('data-trim-outside', 'true');
    } else {
      el.removeAttribute('data-trim-outside');
    }
  });
};

export const cleanTrimViewFromHtml = (containerOrSvg) => {
  if (!containerOrSvg) return;
  containerOrSvg.querySelectorAll('[data-trim-outside]').forEach(el => {
    el.removeAttribute('data-trim-outside');
  });
  containerOrSvg.querySelectorAll('[mask*="trim-view"]').forEach(el => {
    el.removeAttribute('mask');
  });
  containerOrSvg.querySelectorAll('mask[id*="trim-view"]').forEach(el => {
    el.remove();
  });
};
