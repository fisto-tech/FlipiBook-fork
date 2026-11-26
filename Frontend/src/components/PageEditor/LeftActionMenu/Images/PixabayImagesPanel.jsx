import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export const FILTER_OPTIONS = [
  { id: 'all', label: 'All', icon: 'lucide:layout-grid' },
  { id: 'horizontal', label: 'Landscape', icon: 'lucide:rectangle-horizontal' },
  { id: 'vertical', label: 'Portrait', icon: 'lucide:rectangle-vertical' },
  { id: 'square', label: 'Square', icon: 'lucide:square' },
];

/**
 * Downloads a Pixabay image and inserts it through the editor's normal upload path,
 * so the picture is stored with the book's assets (Pixabay asks not to hot-link images).
 */
export const insertPixabayImage = async ({ url, name, pageIndex, dropPoint, targetShapeId }) => {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`Image download failed (${res.status})`);
  const blob = await res.blob();
  const ext = blob.type.includes('png') ? '.png' : '.jpg';
  const file = new File([blob], `${(name || 'pixabay').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 40)}${ext}`, { type: blob.type || 'image/jpeg' });
  const dataUrl = URL.createObjectURL(blob);
  window.dispatchEvent(new CustomEvent('upload-image-to-editor', {
    detail: { pageIndex, dataUrl, dataType: 'image', file, dropPoint: dropPoint || null, targetShapeId: targetShapeId || null },
  }));
};

const PixabayImagesPanel = ({ query = '', orientation = 'all', pageIndex }) => {
  const [hits, setHits] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [insertingId, setInsertingId] = useState(null);
  const reqSeq = useRef(0);
  const sentinelRef = useRef(null);

  const hitsRef = useRef(hits);
  hitsRef.current = hits;

  const load = useCallback(async (q, p, orient, append) => {
    const seq = ++reqSeq.current;
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${BACKEND_URL}/api/page-editor/pixabay?q=${encodeURIComponent(q)}&page=${p}&per_page=30&orientation=${orient}`);
      const j = await r.json().catch(() => ({}));
      if (seq !== reqSeq.current) return;

      if (r.status === 429 || j.rateLimited) {
        setIsRateLimited(true);
        if (Array.isArray(j.hits) && j.hits.length > 0) {
          setTotal(j.total || j.hits.length);
          setHits((prev) => (append ? [...prev, ...j.hits.filter((h) => !prev.some((x) => x.id === h.id))] : j.hits));
          setPage(p);
        } else if (!append && hitsRef.current.length === 0) {
          setError('Pixabay is busy right now (rate limit reached). Please wait a moment and try again.');
        }
        return;
      }

      setIsRateLimited(false);
      if (!j.success) throw new Error(j.message || 'Search failed');
      setTotal(j.total || 0);
      setHits((prev) => (append ? [...prev, ...j.hits.filter((h) => !prev.some((x) => x.id === h.id))] : j.hits));
      setPage(p);
    } catch (e) {
      if (seq === reqSeq.current) setError(e.message || 'Could not load images');
    } finally {
      if (seq === reqSeq.current) setLoading(false);
    }
  }, []);

  // New search or orientation change (debounced for query)
  useEffect(() => {
    const t = setTimeout(() => load(query.trim(), 1, orientation, false), 500);
    return () => clearTimeout(t);
  }, [query, orientation, load]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hits.length < total && hits.length > 0) {
        load(query.trim(), page + 1, orientation, true);
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hits.length, total, loading, page, query, orientation, load]);

  const handleInsert = async (h) => {
    if (insertingId) return;
    setInsertingId(h.id);
    try {
      const name = h.tags?.split(',')[0] || 'Image';
      try {
        await insertPixabayImage({ url: h.large || h.preview, name, pageIndex });
      } catch {
        await insertPixabayImage({ url: h.preview, name, pageIndex });
      }
    } catch (e) {
      setError(e.message || 'Could not insert image');
    } finally {
      setInsertingId(null);
    }
  };

  const handleDragStart = (e, h) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'pixabay',
      url: h.large || h.preview,
      name: h.tags?.split(',')[0] || 'Image',
    }));
    window.__isDraggingImageFromModal = true;
    window.dispatchEvent(new CustomEvent('image-drag-start'));
  };

  const handleDragEnd = () => {
    window.__isDraggingImageFromModal = false;
    window.dispatchEvent(new CustomEvent('image-drag-end'));
  };

  // Two-column Masonry: distribute images into two columns by tracking height to eliminate empty gaps
  const [col1, col2] = useMemo(() => {
    const c1 = [];
    const c2 = [];
    let h1 = 0;
    let h2 = 0;
    hits.forEach((h) => {
      const ratio = (h.width && h.height) ? Math.max(0.55, Math.min(1.8, h.height / h.width)) : 0.75;
      const effectiveRatio = orientation === 'square' ? 1 : ratio;
      if (h1 <= h2) {
        c1.push(h);
        h1 += effectiveRatio;
      } else {
        c2.push(h);
        h2 += effectiveRatio;
      }
    });
    return [c1, c2];
  }, [hits, orientation]);

  const renderCard = (h) => {
    const aspectRatio = orientation === 'square'
      ? '1 / 1'
      : (h.width && h.height ? `${Math.max(0.55, Math.min(1.8, h.width / h.height))}` : '4 / 3');

    return (
      <button
        key={h.id}
        type="button"
        draggable
        onDragStart={(e) => handleDragStart(e, h)}
        onDragEnd={handleDragEnd}
        onClick={() => handleInsert(h)}
        title={`${h.tags} — click to add or drag onto the page`}
        className="w-full relative group rounded-[0.45vw] overflow-hidden border border-gray-100 bg-gray-100 cursor-grab active:cursor-grabbing hover:shadow-xs transition-shadow"
        style={{ aspectRatio }}
      >
        <img
          src={h.preview}
          alt=""
          loading="lazy"
          draggable={false}
          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
          className="w-full h-full object-cover pointer-events-none select-none group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute inset-x-0 bottom-0 px-[0.35vw] py-[0.25vh] text-[0.55vw] text-white bg-gradient-to-t from-black/60 to-transparent truncate text-left opacity-0 group-hover:opacity-100 transition-opacity">
          {h.user}
        </span>
        {insertingId === h.id && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/60">
            <Icon icon="lucide:loader-2" className="w-[1.2vw] h-[1.2vw] text-gray-600 animate-spin" />
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col">
      {isRateLimited && (
        <div className="mb-[0.8vh] flex items-center gap-[0.35vw] text-[0.65vw] text-amber-700 bg-amber-50 border border-amber-200 rounded-[0.4vw] px-[0.6vw] py-[0.5vh]">
          <Icon icon="lucide:clock" className="w-[0.85vw] h-[0.85vw] text-amber-600 shrink-0" />
          <span>Pixabay rate limit reached. Showing cached images; please wait a moment.</span>
        </div>
      )}

      {error && !isRateLimited && (
        <div className="mb-[0.8vh] text-[0.68vw] text-red-500 bg-red-50 border border-red-100 rounded-[0.4vw] px-[0.6vw] py-[0.5vh]">{error}</div>
      )}

      {/* 2-Column Seamless Masonry Layout */}
      <div className="grid grid-cols-2 gap-[0.45vw] items-start">
        <div className="flex flex-col gap-[0.45vw]">
          {col1.map(renderCard)}
          {loading && Array.from({ length: col1.length ? 1 : 4 }).map((_, i) => (
            <div key={`sk-1-${i}`} className="w-full rounded-[0.45vw] bg-gray-100 animate-pulse" style={{ aspectRatio: orientation === 'square' ? '1 / 1' : '4 / 3' }} />
          ))}
        </div>
        <div className="flex flex-col gap-[0.45vw]">
          {col2.map(renderCard)}
          {loading && Array.from({ length: col2.length ? 1 : 4 }).map((_, i) => (
            <div key={`sk-2-${i}`} className="w-full rounded-[0.45vw] bg-gray-100 animate-pulse" style={{ aspectRatio: orientation === 'square' ? '1 / 1' : '4 / 3' }} />
          ))}
        </div>
      </div>

      {!loading && !error && hits.length === 0 && (
        <div className="py-[4vh] text-center text-[0.75vw] text-gray-400">No images found</div>
      )}
      <div ref={sentinelRef} className="h-[1px]" />

      <a
        href="https://pixabay.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-[1vh] mb-[0.5vh] self-center text-[0.6vw] text-gray-400 hover:text-gray-600 flex items-center gap-[0.25vw]"
      >
        Images by <span className="font-semibold">Pixabay</span>
      </a>
    </div>
  );
};

export default PixabayImagesPanel;
