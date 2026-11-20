import { useEffect, useCallback, useRef } from 'react';

const calculateFitZoom = (containerWidth, containerHeight, baseWidth, baseHeight) => {
  const padding = window.innerWidth * 0.01;
  const arrowSpace = window.innerWidth * 0.08;

  const availWidth = Math.max(100, containerWidth - (padding * 2) - arrowSpace);
  const availHeight = Math.max(100, containerHeight - (padding * 2));

  const baseVhHeight = window.innerHeight * 0.78;
  const totalWidth = baseWidth || 210;
  const totalHeight = baseHeight || 297;

  const baseCanvasHeight = baseVhHeight;
  const baseCanvasWidth = baseCanvasHeight * (totalWidth / totalHeight);

  const scaleX = availWidth / baseCanvasWidth;
  const scaleY = availHeight / baseCanvasHeight;

  let autoZoom = Math.min(scaleX, scaleY) * 90;
  return Math.max(55, Math.min(250, Math.round(autoZoom)));
};

/**
 * Hook to manage smooth canvas zooming, panning, auto-fit to container,
 * mouse wheel zoom gestures, and window resize listeners.
 */
export const useCanvasZoomPan = ({
  zoom,
  setZoom,
  pan,
  setPan,
  baseWidth,
  baseHeight,
  activePageIndex,
  pagesCount = 1,
  editorContainerRef,
  zoomContainerRef,
  currentZoomRef,
  currentPanRef,
  wheelRafRef,
  lastWheelTimeRef,
  suppressClickRef
}) => {
  // Smooth wheel-zoom animation state
  const targetZoomRef = useRef(null);
  const zoomAnchorRef = useRef({ x: 0, y: 0 });

  const handleZoomIn = () => {
    const currentP = currentPanRef.current || pan || { x: 0, y: 0 };
    setZoom(prev => {
      const current = currentZoomRef.current || prev || 100;
      const nextZoom = Math.min(Math.round(current * 1.15), 500);
      currentZoomRef.current = nextZoom;
      if (zoomContainerRef.current) {
        zoomContainerRef.current.style.transition = 'transform 0.15s ease-out';
        zoomContainerRef.current.style.transform = `translate3d(${currentP.x}px, ${currentP.y}px, 0px) scale(${nextZoom / 100})`;
      }
      return nextZoom;
    });
  };

  const handleZoomOut = () => {
    const currentP = currentPanRef.current || pan || { x: 0, y: 0 };
    setZoom(prev => {
      const current = currentZoomRef.current || prev || 100;
      const nextZoom = Math.max(Math.round(current / 1.15), 10);
      currentZoomRef.current = nextZoom;
      if (zoomContainerRef.current) {
        zoomContainerRef.current.style.transition = 'transform 0.15s ease-out';
        zoomContainerRef.current.style.transform = `translate3d(${currentP.x}px, ${currentP.y}px, 0px) scale(${nextZoom / 100})`;
      }
      return nextZoom;
    });
  };

  const handleAutoFitZoom = useCallback(() => {
    if (!editorContainerRef.current) return;

    const container = editorContainerRef.current;
    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();

    if (containerWidth < 300 || containerHeight < 200) {
      setTimeout(() => {
        if (editorContainerRef.current) {
          const rect = editorContainerRef.current.getBoundingClientRect();
          if (rect.width >= 300 && rect.height >= 200) {
            setZoom(calculateFitZoom(rect.width, rect.height, baseWidth, baseHeight));
          }
        }
      }, 100);
      return;
    }

    setZoom(calculateFitZoom(containerWidth, containerHeight, baseWidth, baseHeight));
  }, [baseWidth, baseHeight, editorContainerRef, setZoom]);

  const handleResetZoom = () => {
    handleAutoFitZoom();
    setPan({ x: 0, y: 0 });
  };

  // Auto-fit zoom on mount and dimension/page change
  useEffect(() => {
    handleAutoFitZoom();
    const t1 = setTimeout(handleAutoFitZoom, 100);
    const t2 = setTimeout(handleAutoFitZoom, 350);
    const t3 = setTimeout(handleAutoFitZoom, 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activePageIndex, pagesCount, baseWidth, baseHeight, handleAutoFitZoom]);

  // Sync pan & zoom tracking refs
  // (skipped while a wheel-zoom animation runs: the refs are the live source of truth
  //  then, and syncing from a lagging render would snap the canvas backwards)
  useEffect(() => {
    if (wheelRafRef.current) return;
    currentPanRef.current = pan;
  }, [pan, currentPanRef, wheelRafRef]);

  useEffect(() => {
    if (wheelRafRef.current) return;
    currentZoomRef.current = zoom;
  }, [zoom, currentZoomRef, wheelRafRef]);

  // Maintain fit on window/container resize
  useEffect(() => {
    if (!editorContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      handleAutoFitZoom();
    });
    observer.observe(editorContainerRef.current);
    return () => observer.disconnect();
  }, [handleAutoFitZoom, editorContainerRef]);

  // Mouse wheel zoom gesture listener
  useEffect(() => {
    const el = editorContainerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (e.target.closest('.editor-ss-overlay') || e.target.closest('input')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
        e.stopPropagation();

        lastWheelTimeRef.current = Date.now();
        suppressClickRef.current = true;
        setTimeout(() => { suppressClickRef.current = false; }, 200);

        const containerEl = zoomContainerRef.current;
        if (!containerEl) return;

        const minZ = 10;
        const maxZ = 500;

        // Normalize delta (line/page modes) and convert to a continuous zoom factor
        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 16;
        else if (e.deltaMode === 2) delta *= 100;
        delta = Math.max(-100, Math.min(100, delta));
        const factor = Math.exp(-delta * 0.0035);

        // Accumulate on the animation target so rapid wheel ticks stack smoothly
        const baseZoom = targetZoomRef.current ?? (currentZoomRef.current || zoom || 100);
        const newTarget = Math.min(Math.max(baseZoom * factor, minZ), maxZ);
        targetZoomRef.current = newTarget;
        zoomAnchorRef.current = { x: e.clientX, y: e.clientY };

        containerEl.style.transition = 'none';

        if (wheelRafRef.current) return; // animation already running

        const step = () => {
          const target = targetZoomRef.current;
          const currentZoom = currentZoomRef.current || 100;
          const currentPan = currentPanRef.current || { x: 0, y: 0 };

          const diff = target - currentZoom;
          const done = Math.abs(diff) < 0.02;
          const nextZoom = done ? target : currentZoom + diff * 0.22;

          // Keep the point under the cursor fixed while scaling
          const editorRect = el.getBoundingClientRect();
          const centerX = editorRect.left + editorRect.width / 2 + currentPan.x;
          const centerY = editorRect.top + editorRect.height / 2 + currentPan.y;
          const ratio = nextZoom / currentZoom;
          const nextPan = {
            x: currentPan.x + (zoomAnchorRef.current.x - centerX) * (1 - ratio),
            y: currentPan.y + (zoomAnchorRef.current.y - centerY) * (1 - ratio),
          };

          currentZoomRef.current = nextZoom;
          currentPanRef.current = nextPan;
          if (zoomContainerRef.current) {
            zoomContainerRef.current.style.transform = `translate(${nextPan.x}px, ${nextPan.y}px) scale(${nextZoom / 100})`;
          }
          window.dispatchEvent(new CustomEvent('editor-pan-update', { detail: nextPan }));

          // Commit every frame so selection box / handles (which counter-scale by zoom)
          // stay a constant on-screen size throughout the animation
          setZoom(nextZoom); // unrounded so zoom & pan stay consistent (display rounds)
          setPan(nextPan);

          if (done) {
            wheelRafRef.current = null;
            targetZoomRef.current = null;
            return;
          }
          wheelRafRef.current = requestAnimationFrame(step);
        };
        wheelRafRef.current = requestAnimationFrame(step);
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => {
      el.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [currentPanRef, currentZoomRef, editorContainerRef, lastWheelTimeRef, pan, setPan, setZoom, suppressClickRef, wheelRafRef, zoom, zoomContainerRef]);

  // Cancel any running wheel-zoom animation on unmount
  useEffect(() => () => {
    if (wheelRafRef.current) cancelAnimationFrame(wheelRafRef.current);
    wheelRafRef.current = null;
  }, [wheelRafRef]);

  return {
    handleZoomIn,
    handleZoomOut,
    handleAutoFitZoom,
    handleResetZoom
  };
};
