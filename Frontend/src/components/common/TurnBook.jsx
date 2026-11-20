import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

/**
 * TurnBook — soft page-curl flipbook powered by turn.js (loaded from /public/lib, no CDN).
 *
 * Drop-in replacement for the parts of `react-pageflip` used on the Home page:
 *   - ref.current.pageFlip().flipNext() / flipPrev() / flip(i) / turnToPage(i)
 *     / getCurrentPageIndex() / getPageCount() / update()
 *   - onFlip({ data: pageIndex })      (0-based, first visible page — same as react-pageflip)
 *   - startPage (0-based)
 * Every page (covers included) turns with a soft curl — no stiff "hard" pages.
 *
 * Pages are passed as image URLs (`pages`), because turn.js owns the book's DOM.
 */

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts).find((s) => s.src && s.src.includes(src.split('?')[0]));
    if (existing && existing.dataset.loaded === 'true') return resolve();
    const el = existing || document.createElement('script');
    el.addEventListener('load', () => { el.dataset.loaded = 'true'; resolve(); }, { once: true });
    el.addEventListener('error', reject, { once: true });
    if (!existing) {
      el.src = src;
      el.async = true;
      document.body.appendChild(el);
    }
  });

let turnReadyPromise = null;
const ensureTurnJs = () => {
  if (window.jQuery?.fn?.turn) return Promise.resolve();
  if (!turnReadyPromise) {
    turnReadyPromise = (async () => {
      if (!window.jQuery) await loadScript('/lib/jquery.min.js');
      if (!window.jQuery?.fn?.turn) await loadScript('/lib/turn.min.js?v=4.2-fbe');
    })().catch((err) => {
      turnReadyPromise = null;
      throw err;
    });
  }
  return turnReadyPromise;
};

const TurnBook = forwardRef(function TurnBook(
  {
    pages = [],
    width = 595, // single page aspect (width : height)
    height = 842,
    startPage = 0,
    duration = 900,
    onFlip,
    className = '',
    pageClassName = '',
  },
  ref
) {
  const wrapRef = useRef(null);
  const bookRef = useRef(null);
  const shiftRef = useRef(null);
  const onFlipRef = useRef(onFlip);
  const [ready, setReady] = useState(false);
  onFlipRef.current = onFlip;

  const $book = () => (window.jQuery && bookRef.current ? window.jQuery(bookRef.current) : null);
  const isInit = () => {
    const $b = $book();
    try { return Boolean($b && $b.turn('is')); } catch { return false; }
  };

  // First visible page of the current view, 0-based (matches react-pageflip's index)
  const currentIndex = () => {
    const $b = $book();
    if (!$b || !isInit()) return 0;
    try {
      const view = $b.turn('view') || [];
      const first = view.find((p) => p > 0) || $b.turn('page') || 1;
      return first - 1;
    } catch { return 0; }
  };

  // Centre a lone cover: front cover sits on the right half, back cover on the left half.
  // Driven from turn.js's `turning` event so it starts the moment a turn begins (no lag on fast flips).
  const applyCenter = (view, animate = true) => {
    const el = shiftRef.current;
    if (!el || !Array.isArray(view)) return;
    const shift = view[0] === 0 ? -25 : view[1] === 0 ? 25 : 0;
    el.style.transition = animate ? `transform ${Math.round(duration * 0.7)}ms cubic-bezier(0.22, 0.61, 0.36, 1)` : 'none';
    el.style.transform = `translate3d(${shift}%, 0, 0)`;
  };

  // Fit two pages side by side inside the wrapper, keeping the page aspect ratio
  const fitSize = () => {
    const wrap = wrapRef.current;
    const $b = $book();
    if (!wrap || !$b || !isInit()) return;
    const cw = wrap.clientWidth;
    const ch = wrap.clientHeight || (cw / 2) * (height / width);
    if (!cw || !ch) return;
    const pageAspect = width / height;
    let bookH = ch;
    let bookW = bookH * pageAspect * 2;
    if (bookW > cw) {
      bookW = cw;
      bookH = bookW / (pageAspect * 2);
    }
    $b.turn('size', Math.floor(bookW), Math.floor(bookH));
  };

  useImperativeHandle(ref, () => ({
    pageFlip: () => ({
      flipNext: () => { if (isInit()) $book().turn('next'); },
      flipPrev: () => { if (isInit()) $book().turn('previous'); },
      flip: (index) => { if (isInit()) $book().turn('page', Math.max(1, (index | 0) + 1)); },
      turnToPage: (index) => { if (isInit()) $book().turn('page', Math.max(1, (index | 0) + 1)); },
      getCurrentPageIndex: () => currentIndex(),
      getPageCount: () => (isInit() ? $book().turn('pages') : pages.length),
      update: () => fitSize(),
    }),
  }));

  // Build / rebuild the book whenever the page list changes
  useEffect(() => {
    let cancelled = false;
    const bookEl = bookRef.current;

    ensureTurnJs()
      .then(() => {
        if (cancelled || !bookEl) return;
        const $ = window.jQuery;

        // turn.js owns this DOM: build the pages imperatively
        bookEl.innerHTML = '';
        pages.forEach((src, i) => {
          const page = document.createElement('div');
          page.className = `turnbook-page ${pageClassName}`.trim();
          const img = document.createElement('img');
          img.src = src;
          img.alt = `Page ${i + 1}`;
          img.draggable = false;
          img.className = 'turnbook-img';
          page.appendChild(img);
          bookEl.appendChild(page);
        });

        const wrap = wrapRef.current;
        const pageAspect = width / height;
        const cw = wrap?.clientWidth || 800;
        const ch = wrap?.clientHeight || (cw / 2) / pageAspect;
        let bookH = ch;
        let bookW = bookH * pageAspect * 2;
        if (bookW > cw) { bookW = cw; bookH = bookW / (pageAspect * 2); }

        $(bookEl).turn({
          width: Math.floor(bookW),
          height: Math.floor(bookH),
          display: 'double',
          page: Math.min(Math.max(1, (startPage | 0) + 1), Math.max(1, pages.length)),
          autoCenter: false, // centring handled by applyCenter (starts on `turning`, not after the turn)
          acceleration: true,
          gradients: true,
          elevation: 50,
          duration,
          when: {
            turning: (e, page, view) => {
              applyCenter(view || $(bookEl).turn('view', page));
            },
            turned: (e, page, view) => {
              applyCenter(view || $(bookEl).turn('view'));
              onFlipRef.current?.({ data: currentIndex() });
            },
          },
        });
        try { applyCenter($(bookEl).turn('view'), false); } catch { /* noop */ }
        setReady(true);
      })
      .catch((err) => console.error('[TurnBook] failed to load turn.js', err));

    return () => {
      cancelled = true;
      setReady(false);
      try {
        const $b = window.jQuery && bookEl ? window.jQuery(bookEl) : null;
        if ($b && $b.turn('is')) $b.turn('destroy');
      } catch { /* already gone */ }
      if (bookEl) bookEl.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.join('|'), width, height]);

  // Keep the book fitted to its container
  useEffect(() => {
    if (!ready || !wrapRef.current) return undefined;
    const ro = new ResizeObserver(() => fitSize());
    ro.observe(wrapRef.current);
    fitSize();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div ref={wrapRef} className={`relative w-full h-full flex items-center justify-center ${className}`.trim()}>
      <style>{`
        .turnbook-page { background: #fff; overflow: hidden; }
        .turnbook-img { width: 100%; height: 100%; display: block; object-fit: cover; user-select: none; -webkit-user-drag: none; pointer-events: none; }
      `}</style>
      <div ref={shiftRef} style={{ willChange: 'transform' }}>
        <div ref={bookRef} className="turnbook select-none" />
      </div>
    </div>
  );
});

export default TurnBook;
