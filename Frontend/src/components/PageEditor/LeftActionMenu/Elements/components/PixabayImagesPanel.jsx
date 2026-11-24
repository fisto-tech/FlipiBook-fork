import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Icon } from '@iconify/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

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

const PixabayImagesPanel = ({ query = '', pageIndex }) => {
  const [hits, setHits] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [insertingId, setInsertingId] = useState(null);
  const reqSeq = useRef(0);
  const sentinelRef = useRef(null);

  const load = useCallback(async (q, p, append) => {
    const seq = ++reqSeq.current;
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${BACKEND_URL}/api/page-editor/pixabay?q=${encodeURIComponent(q)}&page=${p}&per_page=30`);
      const j = await r.json();
      if (seq !== reqSeq.current) return;
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

  // New search (debounced)
  useEffect(() => {
    const t = setTimeout(() => load(query.trim(), 1, false), 350);
    return () => clearTimeout(t);
  }, [query, load]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hits.length < total && hits.length > 0) {
        load(query.trim(), page + 1, true);
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hits.length, total, loading, page, query, load]);

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
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-[0.6vh]">
        <span className="text-[0.74vw] font-bold text-gray-800 tracking-tight">
          {query.trim() ? `Images for “${query.trim()}”` : 'Images'}
        </span>
        <span className="text-[0.58vw] text-gray-400 font-semibold bg-gray-100 px-[0.35vw] py-[0.1vh] rounded-[0.25vw]">
          {total.toLocaleString()}
        </span>
      </div>

      {error && (
        <div className="mb-[0.8vh] text-[0.68vw] text-red-500 bg-red-50 border border-red-100 rounded-[0.4vw] px-[0.6vw] py-[0.5vh]">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-[0.45vw]">
        {hits.map((h) => (
          <button
            key={h.id}
            type="button"
            draggable
            onDragStart={(e) => handleDragStart(e, h)}
            onClick={() => handleInsert(h)}
            title={`${h.tags} — click to add or drag onto the page`}
            className="relative group rounded-[0.45vw] overflow-hidden border border-gray-100 bg-gray-100 cursor-grab active:cursor-grabbing"
            style={{ aspectRatio: h.width && h.height ? `${Math.max(0.6, Math.min(1.8, h.width / h.height))}` : '4 / 3' }}
          >
            <img src={h.preview} alt="" loading="lazy" draggable={false} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} className="w-full h-full object-cover pointer-events-none select-none" />
            <span className="absolute inset-x-0 bottom-0 px-[0.35vw] py-[0.25vh] text-[0.55vw] text-white bg-gradient-to-t from-black/60 to-transparent truncate text-left opacity-0 group-hover:opacity-100 transition-opacity">
              {h.user}
            </span>
            {insertingId === h.id && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/60">
                <Icon icon="lucide:loader-2" className="w-[1.2vw] h-[1.2vw] text-gray-600 animate-spin" />
              </span>
            )}
          </button>
        ))}
        {loading && Array.from({ length: hits.length ? 2 : 8 }).map((_, i) => (
          <div key={`sk-${i}`} className="rounded-[0.45vw] bg-gray-100 animate-pulse" style={{ aspectRatio: '4 / 3' }} />
        ))}
      </div>

      {!loading && !error && hits.length === 0 && (
        <div className="py-[4vh] text-center text-[0.75vw] text-gray-400">No images found</div>
      )}
      <div ref={sentinelRef} className="h-[1px]" />

      <a
        href="https://pixabay.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-[1vh] self-center text-[0.6vw] text-gray-400 hover:text-gray-600 flex items-center gap-[0.25vw]"
      >
        Images by <span className="font-semibold">Pixabay</span>
      </a>
    </div>
  );
};

export default PixabayImagesPanel;
