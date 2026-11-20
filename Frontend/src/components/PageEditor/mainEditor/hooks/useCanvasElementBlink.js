import { useEffect, useRef } from 'react';

/**
 * useCanvasElementBlink.js
 * Dedicated hook handling non-destructive fill-only blinking of existing frames
 * (Free Frames, Hotspots, and Selection Overlays) when an interaction is clicked in the sidebar.
 * Does not create new DOM boxes, does not alter stroke, and does not mutate SVG document contents.
 */
let globalBlinkAnimationId = null;

export const useCanvasElementBlink = ({ drawOverlayHighlight }) => {
  const drawOverlayRef = useRef(drawOverlayHighlight);
  drawOverlayRef.current = drawOverlayHighlight;

  useEffect(() => {
    const handleBlinkElement = (e) => {
      const { elementId, pageIndex } = e.detail || {};
      if (!elementId) return;

      // Cancel any running blink animation before starting fresh
      if (globalBlinkAnimationId) {
        cancelAnimationFrame(globalBlinkAnimationId);
        globalBlinkAnimationId = null;
      }

      const editorDoc = document.getElementById('main-flipbook-editor')?.contentDocument || document;
      const targetPageSelector = typeof pageIndex === 'number'
        ? `.page-svg-container[data-page-index="${pageIndex}"]`
        : '.page-svg-container';
      const pageContainer = editorDoc.querySelector(targetPageSelector) || document.querySelector(targetPageSelector);

      const el = pageContainer?.querySelector(`[id="${CSS.escape(elementId)}"]`)
              || pageContainer?.querySelector(`[data-name="${CSS.escape(elementId)}"]`)
              || editorDoc.getElementById(elementId)
              || document.getElementById(elementId)
              || editorDoc.querySelector(`[id="${CSS.escape(elementId)}"]`)
              || editorDoc.querySelector(`[data-name="${CSS.escape(elementId)}"]`);

      if (!el) return;

      // Ensure the selection overlay is drawn on canvas
      if (typeof drawOverlayRef.current === 'function') {
        try { drawOverlayRef.current(el, 'selected'); } catch {}
      }

      const isFreeFrame = el.getAttribute('data-name')?.toLowerCase() === 'free frame' ||
                          el.getAttribute('data-type') === 'free-frame' ||
                          el.id?.startsWith('free-frame');

      const isHotspot = el.getAttribute('data-is-hotspot') === 'true' ||
                        el.getAttribute('data-type') === 'hotspot';

      // Dynamic collection of all target frame elements to pulse
      const getTargetFrames = () => {
        const targets = new Set();

        // 1. Free Frame element directly on canvas
        if (isFreeFrame) {
          targets.add(el);
        }

        // 2. Hotspot inner element
        if (isHotspot) {
          const innerRect = el.querySelector('rect');
          if (innerRect) targets.add(innerRect);
        }

        // 3. Selection overlay polygon/path in highlight-overlay
        const findOverlays = (selector) => {
          try {
            document.querySelectorAll(selector).forEach(node => targets.add(node));
            if (editorDoc !== document) {
              editorDoc.querySelectorAll(selector).forEach(node => targets.add(node));
            }
          } catch {}
        };

        findOverlays(`[id="overlay-poly-selected-${CSS.escape(elementId)}"]`);
        findOverlays(`[id="overlay-path-selected-${CSS.escape(elementId)}"]`);
        findOverlays(`[id^="overlay-poly-"][id$="-${CSS.escape(elementId)}"]`);
        findOverlays(`[id^="overlay-path-"][id$="-${CSS.escape(elementId)}"]`);

        if (el.id && el.id !== elementId) {
          findOverlays(`[id="overlay-poly-selected-${CSS.escape(el.id)}"]`);
          findOverlays(`[id^="overlay-poly-"][id$="-${CSS.escape(el.id)}"]`);
        }

        // If target overlay on active page is currently visible, also include its polygon
        if (typeof pageIndex === 'number') {
          const pageOverlay = document.getElementById(`highlight-overlay-${pageIndex}`);
          if (pageOverlay) {
            pageOverlay.querySelectorAll('polygon[id^="overlay-poly-"]').forEach(poly => {
              if (poly.id?.includes(elementId) || (el.id && poly.id?.includes(el.id))) {
                targets.add(poly);
              }
            });
          }
        }

        return Array.from(targets);
      };

      // 3 silky-smooth, gentle breathing pulses over 1350ms
      const duration = 1350;
      const startTime = performance.now();

      const animateLoop = (currentTime) => {
        const elapsed = currentTime - startTime;

        if (elapsed >= duration) {
          // Finished: Clean up all styled targets
          const finalTargets = getTargetFrames();
          finalTargets.forEach(target => {
            target.removeAttribute('data-blinking');
            target.classList.remove('interaction-frame-blinking');
            target.style.removeProperty('fill');
            if (target === el && isFreeFrame) {
              target.setAttribute('fill', 'transparent');
            } else {
              target.setAttribute('fill', 'none');
            }
          });
          globalBlinkAnimationId = null;
          return;
        }

        // Smooth squared-sine breathing wave: peaks at 0.14 (subtle indigo, reduced from 0.28)
        const progress = Math.min(1, Math.max(0, elapsed / duration));
        const sinVal = Math.sin(progress * Math.PI * 3);
        const smoothPulse = sinVal * sinVal; // Smooth zero-tangent transitions at both top and bottom
        const alpha = smoothPulse * 0.14;
        const fillColor = `rgba(77, 71, 255, ${alpha.toFixed(3)})`;

        const targets = getTargetFrames();
        targets.forEach(target => {
          target.setAttribute('data-blinking', 'true');
          target.classList.add('interaction-frame-blinking');
          target.style.setProperty('fill', fillColor, 'important');
          target.setAttribute('fill', fillColor);
        });

        globalBlinkAnimationId = requestAnimationFrame(animateLoop);
      };

      globalBlinkAnimationId = requestAnimationFrame(animateLoop);
    };

    window.addEventListener('blink-canvas-element', handleBlinkElement);
    return () => {
      window.removeEventListener('blink-canvas-element', handleBlinkElement);
    };
  }, []);
};

export default useCanvasElementBlink;
