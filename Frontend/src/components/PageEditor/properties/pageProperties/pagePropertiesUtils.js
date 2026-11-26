import { generateGradientString } from '../../../Color';

export const getDocumentInfo = (w, h) => {
  const roundedW = Math.round(w || 210);
  const roundedH = Math.round(h || 297);
  const minDim = Math.min(roundedW, roundedH);
  const maxDim = Math.max(roundedW, roundedH);

  let formatName = 'Custom Sheet';
  if (Math.abs(minDim - 210) <= 3 && Math.abs(maxDim - 297) <= 3) {
    formatName = 'A4';
  } else if (Math.abs(minDim - 297) <= 3 && Math.abs(maxDim - 420) <= 3) {
    formatName = 'A3';
  } else if (Math.abs(minDim - 148) <= 3 && Math.abs(maxDim - 210) <= 3) {
    formatName = 'A5';
  } else if (Math.abs(minDim - 216) <= 3 && Math.abs(maxDim - 279) <= 3) {
    formatName = 'Letter';
  } else if (Math.abs(minDim - 216) <= 3 && Math.abs(maxDim - 356) <= 3) {
    formatName = 'Legal';
  } else if (Math.abs(minDim - 99) <= 3 && Math.abs(maxDim - 210) <= 3) {
    formatName = 'DL';
  } else if (Math.abs(roundedW - roundedH) <= 3) {
    formatName = 'Square';
  }

  let orientationName = 'Portrait';
  if (roundedW > roundedH) {
    orientationName = 'Landscape';
  } else if (roundedW === roundedH) {
    orientationName = 'Square';
  }

  return {
    format: formatName,
    orientation: orientationName,
    dimensions: `${roundedW} x ${roundedH} mm`
  };
};

export const resolveOverlayElement = (overlay, pages, activePageIndex) => {
  if (overlay) return overlay;
  if (!pages || !pages[activePageIndex]) return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(pages[activePageIndex]?.html || '', 'image/svg+xml');
    return doc.querySelector('[data-name="Overlay"]');
  } catch (e) {
    console.error('Error parsing overlay in PageProperties', e);
    return null;
  }
};

export const buildOverlayBackgroundString = (effectiveOverlay) => {
  const currentBg = effectiveOverlay?.getAttribute('fill') || '#FFFFFF';
  const fillType = effectiveOverlay?.getAttribute('fill-type') || 'solid';

  if (fillType === 'gradient' || currentBg.toLowerCase().includes('url(#')) {
    const stopsJson = effectiveOverlay?.getAttribute('fill-stops');
    try {
      const stops = stopsJson ? JSON.parse(stopsJson) : [];
      const gType = effectiveOverlay?.getAttribute('fill-gradient-type') || 'linear';
      if (stops.length > 0) {
        return generateGradientString(
          gType.charAt(0).toUpperCase() + gType.slice(1),
          stops.map((s) => ({ ...s, opacity: (s.opacity !== undefined ? s.opacity : 1) * 100 })),
          parseInt(effectiveOverlay?.getAttribute('fill-angle') || '0', 10),
          parseInt(effectiveOverlay?.getAttribute('fill-radius') || '100', 10)
        );
      }
    } catch (e) {
      console.error('Error parsing fill-stops in PageProperties', e);
    }
  }

  return currentBg;
};

export const extractPageColors = (pages, activePageIndex) => {
  const colors = new Set();
  const currentPage = pages?.[activePageIndex];
  if (currentPage?.html) {
    const hexMatches = currentPage.html.match(/#[0-9A-Fa-f]{6}\b/g) || [];
    hexMatches.forEach((c) => colors.add(c.toUpperCase()));
    const hex3Matches = currentPage.html.match(/#[0-9A-Fa-f]{3}\b/g) || [];
    hex3Matches.forEach((c) => colors.add(c.toUpperCase()));
  }
  if (typeof document !== 'undefined') {
    const pageEl =
      document.querySelector(`.page-svg-container[data-page-index="${activePageIndex}"]`) ||
      document.querySelector('.page-svg-container');
    if (pageEl) {
      pageEl.querySelectorAll('*').forEach((el) => {
        ['fill', 'stroke', 'color'].forEach((attr) => {
          const val = el.getAttribute(attr);
          if (val && val.startsWith('#')) colors.add(val.toUpperCase());
        });
        if (el.style) {
          ['fill', 'stroke', 'color', 'backgroundColor'].forEach((prop) => {
            const val = el.style[prop];
            if (val && val.startsWith('#')) colors.add(val.toUpperCase());
          });
        }
      });
    }
  }
  colors.add('#DADBE8');
  colors.add('#FFFFFF');
  colors.add('#000000');
  return Array.from(colors).slice(0, 12);
};
